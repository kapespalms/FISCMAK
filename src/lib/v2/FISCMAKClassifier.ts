/**
 * FISCMAK Classification Engine
 * Detects signals → Maps to ontology → Creates structured activity entries
 *
 * Usage:
 *   const classifier = new FISCMAKClassifier(supabaseClient);
 *   const result = await classifier.classifyActivity({
 *     userId: user.id,
 *     rawText: "I helped an intern process a difficult case and gave feedback",
 *     userSpecialty: "psychiatry",
 *     userRole: "faculty"
 *   });
 *
 * Result includes:
 *   - detected signals with confidence scores
 *   - inferred activity + ontology mappings
 *   - mak_coaching_prompt for next conversation turn
 *   - full activity_entries row for storage
 */

import { SupabaseClient } from "@supabase/supabase-js";

interface ClassificationRequest {
  userId: string;
  rawText: string;
  userSpecialty?: string;
  userSubspecialty?: string;
  userRole?: string;
  userCareerTrack?: string;
  inputSource?: "chat" | "voice_note" | "form" | "api";
  additionalContext?: Record<string, any>;
}

interface DetectedSignal {
  indicator_id: string;
  indicator_key: string;
  indicator_name: string;
  category_id: string;
  category_key: string;
  confidence: number;
  matched_keywords: string[];
  regex_match_positions?: [number, number];
  followup_route?: string;
}

interface OntologyMapping {
  activity_id: string;
  activity_key: string;
  activity_name: string;
  subcompetencies: Array<{
    id: string;
    key: string;
    name: string;
  }>;
  career_tracks: Array<{
    id: string;
    key: string;
    name: string;
  }>;
  development_level: number;
  confidence: number;
}

interface ClassificationResult {
  id?: string;
  detected_signals: DetectedSignal[];
  primary_activity?: OntologyMapping;
  related_activities?: OntologyMapping[];
  overall_confidence: number;
  mak_primary_response: string;
  mak_coaching_prompt: string;
  routing_category: string;
  activity_entry?: Record<string, any>;
}

export class FISCMAKClassifier {
  private supabase: SupabaseClient;
  private signalIndicators: Map<string, any> = new Map();
  private activityMappings: Map<string, any> = new Map();
  private cached_signals_at: Date = new Date(0);
  private cached_mappings_at: Date = new Date(0);

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Main entry point: classify a user activity
   */
  async classifyActivity(
    req: ClassificationRequest
  ): Promise<ClassificationResult> {
    // Load reference data
    await this.loadSignalIndicators();
    await this.loadActivityMappings();

    // Step 1: Detect signals in text
    const detectedSignals = this.detectSignals(req.rawText);

    // Step 2: Map signals → activities → ontology
    const primaryActivity = this.mapSignalsToActivity(
      detectedSignals,
      req.userCareerTrack
    );
    const relatedActivities = this.findRelatedActivities(
      detectedSignals,
      primaryActivity
    );

    // Step 3: Infer context (energy, setting, scope)
    const inferredContext = this.inferContext(req.rawText);

    // Step 4: Generate development level
    const devLevel = this.inferDevelopmentLevel(
      inferredContext,
      detectedSignals
    );

    // Step 5: Generate coaching response
    const { primaryResponse, coachingPrompt, routingCategory } =
      this.generateCoachingResponse(
        detectedSignals,
        primaryActivity,
        inferredContext
      );

    // Step 6: Generate output templates (CV, annual review, etc.)
    const outputs = this.generateOutputTemplates(
      primaryActivity,
      req.rawText,
      inferredContext
    );

    // Step 7: Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(
      detectedSignals,
      primaryActivity
    );

    // Step 8: Build activity entry record
    const activityEntry = await this.buildActivityEntry(
      req,
      detectedSignals,
      primaryActivity,
      relatedActivities,
      inferredContext,
      devLevel,
      outputs,
      overallConfidence,
      primaryResponse,
      coachingPrompt,
      routingCategory
    );

    return {
      detected_signals: detectedSignals,
      primary_activity: primaryActivity,
      related_activities: relatedActivities,
      overall_confidence: overallConfidence,
      mak_primary_response: primaryResponse,
      mak_coaching_prompt: coachingPrompt,
      routing_category: routingCategory,
      activity_entry: activityEntry,
    };
  }

  /**
   * Detect signals: match keywords/patterns against user text
   */
  private detectSignals(rawText: string): DetectedSignal[] {
    const signals: DetectedSignal[] = [];
    const textLower = rawText.toLowerCase();

    for (const [_, indicator] of this.signalIndicators) {
      // Try keyword matching first
      if (indicator.keywords && Array.isArray(indicator.keywords)) {
        for (const keyword of indicator.keywords) {
          if (
            textLower.includes(keyword.toLowerCase()) ||
            this.fuzzyMatch(textLower, keyword, 0.85)
          ) {
            signals.push({
              indicator_id: indicator.indicator_id,
              indicator_key: indicator.indicator_key,
              indicator_name: indicator.indicator_name,
              category_id: indicator.category_id,
              category_key: indicator.category_key,
              confidence: indicator.confidence_default * 0.95,
              matched_keywords: [keyword],
            });
            break; // One match per indicator
          }
        }
      }

      // Try regex matching if present
      if (indicator.regex_pattern) {
        try {
          const regex = new RegExp(indicator.regex_pattern, "gi");
          const match = regex.exec(rawText);
          if (match) {
            signals.push({
              indicator_id: indicator.indicator_id,
              indicator_key: indicator.indicator_key,
              indicator_name: indicator.indicator_name,
              category_id: indicator.category_id,
              category_key: indicator.category_key,
              confidence: indicator.confidence_default,
              matched_keywords: [match[0]],
              regex_match_positions: [match.index, match.index + match[0].length],
            });
          }
        } catch (e) {
          console.warn(
            `Invalid regex for ${indicator.indicator_key}:`,
            e
          );
        }
      }
    }

    // Sort by priority and confidence, remove duplicates
    return Array.from(
      new Map(
        signals
          .sort(
            (a, b) =>
              b.confidence - a.confidence || a.category_id.localeCompare(b.category_id)
          )
          .map((s) => [s.indicator_key, s])
      ).values()
    ).slice(0, 10); // Top 10 signals
  }

  /**
   * Map detected signals → primary activity via ontology
   */
  private mapSignalsToActivity(
    signals: DetectedSignal[],
    userCareerTrack?: string
  ): OntologyMapping | undefined {
    if (signals.length === 0) return undefined;

    // Build a scoring system:
    // - Each signal maps to multiple activities (from ontology_activity_mappings)
    // - Score each activity by: sum of signal confidences + track alignment
    const activityScores = new Map<string, number>();
    const activityDetails = new Map<string, OntologyMapping>();

    for (const signal of signals) {
      // Find all mappings for this signal
      const mappingsForSignal = Array.from(this.activityMappings.values()).filter(
        (m) =>
          m.related_activities &&
          m.related_activities.includes(signal.indicator_key)
      );

      for (const mapping of mappingsForSignal) {
        const key = `${mapping.activity_id}-${mapping.track_key}`;
        const signalScore = signal.confidence * 0.9;

        // Bonus if user career track matches
        const trackBonus =
          userCareerTrack === mapping.track_key ? 0.2 : 0;

        const totalScore = signalScore + trackBonus;
        activityScores.set(key, (activityScores.get(key) || 0) + totalScore);

        if (!activityDetails.has(key)) {
          activityDetails.set(key, mapping);
        }
      }
    }

    if (activityScores.size === 0) return undefined;

    // Get the highest-scoring activity
    const topActivityKey = Array.from(activityScores.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    return activityDetails.get(topActivityKey);
  }

  /**
   * Find related (secondary) activities
   */
  private findRelatedActivities(
    signals: DetectedSignal[],
    primary?: OntologyMapping
  ): OntologyMapping[] {
    if (!primary || signals.length < 2) return [];

    const related = new Set<OntologyMapping>();
    const seen = new Set<string>();

    seen.add(primary.activity_id);

    for (const signal of signals.slice(1, 4)) {
      // Check next 3 signals
      const mappings = Array.from(this.activityMappings.values()).filter(
        (m) =>
          m.related_activities &&
          m.related_activities.includes(signal.indicator_key) &&
          !seen.has(m.activity_id)
      );

      for (const mapping of mappings.slice(0, 1)) {
        // Take top 1 per signal
        related.add(mapping);
        seen.add(mapping.activity_id);
      }
    }

    return Array.from(related);
  }

  /**
   * Infer context: energy, setting, scope, people involved
   */
  private inferContext(rawText: string): Record<string, any> {
    const text = rawText.toLowerCase();

    const energyKeywords = {
      draining: [
        "exhausted",
        "drained",
        "frustrating",
        "difficult",
        "hard",
        "struggle",
      ],
      fulfilling: [
        "meaningful",
        "energizing",
        "grateful",
        "proud",
        "satisfied",
        "growth",
      ],
      neutral: ["done", "completed", "handled", "managed"],
    };

    let energy = "neutral";
    for (const [level, keywords] of Object.entries(energyKeywords)) {
      if (keywords.some((k) => text.includes(k))) {
        energy = level;
        break;
      }
    }

    const settingKeywords = {
      clinical: [
        "patient",
        "rounds",
        "clinical",
        "bedside",
        "case",
        "hospital",
      ],
      educational: ["teaching", "learning", "lecture", "seminar", "training"],
      administrative: ["meeting", "admin", "committee", "decision", "policy"],
      leadership: ["led", "led", "managing", "directing", "delegated"],
      research: ["research", "data", "study", "analysis", "paper"],
    };

    let setting = "mixed";
    for (const [s, keywords] of Object.entries(settingKeywords)) {
      if (keywords.some((k) => text.includes(k))) {
        setting = s;
        break;
      }
    }

    const scopeKeywords = {
      local: [
        "intern",
        "one person",
        "individual",
        "colleague",
        "learner",
      ],
      team: ["team", "group", "department", "faculty", "residents"],
      program: ["program", "initiative", "system", "organization"],
    };

    let scope = "local";
    for (const [s, keywords] of Object.entries(scopeKeywords)) {
      if (keywords.some((k) => text.includes(k))) {
        scope = s;
        break;
      }
    }

    const peopleKeywords = {
      intern: ["intern", "medical student", "junior"],
      resident: ["resident", "trainee", "fellow"],
      colleague: ["colleague", "peer", "faculty", "attending"],
      team: ["team", "group", "multiple people"],
    };

    const peopleInvolved: string[] = [];
    for (const [person, keywords] of Object.entries(peopleKeywords)) {
      if (keywords.some((k) => text.includes(k))) {
        peopleInvolved.push(person);
      }
    }

    return {
      energy,
      setting,
      scope,
      people_involved: peopleInvolved,
    };
  }

  /**
   * Infer development level (1-5)
   */
  private inferDevelopmentLevel(
    context: Record<string, any>,
    signals: DetectedSignal[]
  ): number {
    const text = context._raw_text || "";
    const textLower = text.toLowerCase();

    const levelIndicators: Record<number, string[]> = {
      5: [
        "created system",
        "built",
        "systematized",
        "changed",
        "program",
        "scaled",
        "taught others",
      ],
      4: [
        "led",
        "managed",
        "directed",
        "organized",
        "influenced",
        "mentor",
      ],
      3: [
        "independently",
        "routinely",
        "regularly",
        "typically",
        "usually",
      ],
      2: [
        "helped",
        "assisted",
        "supported",
        "participated",
        "with guidance",
      ],
      1: [
        "recognize",
        "aware",
        "noticed",
        "identified",
        "learned",
      ],
    };

    for (let level = 5; level >= 1; level--) {
      if (levelIndicators[level].some((keyword) =>
        textLower.includes(keyword)
      )) {
        return level;
      }
    }

    // Default to level 3 if scope is large
    return context.scope === "program" ? 3 : 2;
  }

  /**
   * Generate coaching response based on signals + activity
   */
  private generateCoachingResponse(
    signals: DetectedSignal[],
    activity?: OntologyMapping,
    context?: Record<string, any>
  ): {
    primaryResponse: string;
    coachingPrompt: string;
    routingCategory: string;
  } {
    let primaryResponse =
      "I hear you. That's meaningful work, and I want to honor what you did.";
    let coachingPrompt = "Tell me more—what was most challenging about this?";
    let routingCategory = "general_coaching";

    if (!signals.length) {
      return {
        primaryResponse: "I'd like to understand this better. Walk me through what happened.",
        coachingPrompt: "What was the context and who was involved?",
        routingCategory: "clarification_needed",
      };
    }

    const topSignal = signals[0];

    // Route by primary signal
    if (
      topSignal.category_key === "mentorship" ||
      topSignal.category_key === "leadership"
    ) {
      primaryResponse =
        "You're doing real developmental work here. That takes intention and presence.";
      coachingPrompt =
        "Is this part of a longer relationship or coaching arc you're building?";
      routingCategory = "mentorship_development";
    } else if (topSignal.category_key === "emotional_labor") {
      primaryResponse =
        "Holding space for someone's struggle is real work and it matters. How are you doing?";
      coachingPrompt = "What support do you have for your own well-being?";
      routingCategory = "wellbeing_support";
    } else if (topSignal.category_key === "systems_thinking") {
      primaryResponse =
        "You identified something broken and took action to improve it.";
      coachingPrompt = "Do you see yourself moving toward a systems-leader role?";
      routingCategory = "systems_leadership";
    } else if (topSignal.category_key === "advocacy") {
      primaryResponse =
        "Speaking up for what's right takes courage. I want to honor that.";
      coachingPrompt = "What made you feel like you needed to speak up?";
      routingCategory = "advocacy_growth";
    }

    // Adjust based on energy
    if (context?.energy === "draining") {
      coachingPrompt +=
        " And I'm noticing this feels draining—let's think about sustainability.";
      routingCategory = "burnout_awareness";
    } else if (context?.energy === "fulfilling") {
      coachingPrompt +=
        " This seems to light you up—how does it fit your broader vision?";
    }

    return {
      primaryResponse,
      coachingPrompt,
      routingCategory,
    };
  }

  /**
   * Generate output templates (CV, annual review, etc.)
   */
  private generateOutputTemplates(
    activity: OntologyMapping | undefined,
    rawText: string,
    context: Record<string, any>
  ): Record<string, string> {
    const outputs: Record<string, string> = {};

    if (!activity) {
      return {
        cv_bullet: rawText,
        annual_review: `Engaged in meaningful work: ${rawText}`,
      };
    }

    const scope =
      context.scope === "program" || context.scope === "team"
        ? "across the team"
        : "in local interactions";

    // CV format
    outputs.cv_bullet = `${activity.activity_name} ${scope} to support ${
      activity.career_tracks[0]?.name || "professional development"
    }.`;

    // Annual review
    outputs.annual_review = `Demonstrated commitment to ${
      activity.subcompetencies[0]?.name || "professional development"
    } through ${activity.activity_name.toLowerCase()}.`;

    // Promotion packet
    outputs.promotion_language = `${activity.activity_name} in support of institutional mission and learner development.`;

    // Teaching portfolio
    if (activity.activity_key.includes("teach")) {
      outputs.teaching_portfolio = `Created and facilitated learning opportunities resulting in demonstrable learner growth.`;
    }

    return outputs;
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    signals: DetectedSignal[],
    activity?: OntologyMapping
  ): number {
    if (!signals.length) return 0.4;
    if (!activity) return Math.max(...signals.map((s) => s.confidence)) * 0.7;

    const signalConfidence =
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const activityConfidence = activity.confidence || 0.8;

    return Math.round(
      ((signalConfidence * 0.6 + activityConfidence * 0.4) * 100) / 5
    ) / 20; // Round to nearest 0.05
  }

  /**
   * Build the complete activity_entries row for storage
   */
  private async buildActivityEntry(
    req: ClassificationRequest,
    signals: DetectedSignal[],
    primary: OntologyMapping | undefined,
    related: OntologyMapping[],
    context: Record<string, any>,
    devLevel: number,
    outputs: Record<string, string>,
    confidence: number,
    primaryResponse: string,
    coachingPrompt: string,
    routingCategory: string
  ): Promise<Record<string, any>> {
    // Fetch user's specialty info if not provided
    let userSpecialtyId = null;
    if (req.userSpecialty) {
      const { data: specialty } = await this.supabase
        .from("ontology_specialties")
        .select("specialty_id")
        .eq("specialty_key", req.userSpecialty)
        .single();
      userSpecialtyId = specialty?.specialty_id;
    }

    return {
      user_id: req.userId,
      raw_text: req.rawText,
      raw_text_tokens: req.rawText.split(/\s+/).length,
      input_source: req.inputSource || "chat",
      input_timestamp: new Date().toISOString(),
      detected_signals: signals.map((s) => s.indicator_id),
      detected_signal_keys: signals.map((s) => s.indicator_key),
      detected_signal_confidence:
        signals.length > 0
          ? Math.round(
              (signals.reduce((sum, s) => sum + s.confidence, 0) /
                signals.length) *
                100
            ) / 100
          : 0,
      signal_detection_metadata: {
        signals: signals.map((s) => ({
          key: s.indicator_key,
          confidence: s.confidence,
          keywords: s.matched_keywords,
        })),
      },
      user_specialty_id: userSpecialtyId,
      user_role: req.userRole,
      entry_setting: context.setting || "mixed",
      entry_energy: context.energy || "neutral",
      activity_category: primary?.activity_key?.split("_")[0] || "unknown",
      people_involved: context.people_involved || [],
      scope: context.scope || "local",
      evidence_artifacts: [],
      additional_context: req.additionalContext || {},
      inferred_activity_id: primary?.activity_id,
      inferred_activity_key: primary?.activity_key,
      related_activity_ids: related.map((r) => r.activity_id),
      related_activity_keys: related.map((r) => r.activity_key),
      inferred_competency_domain_ids: primary?.career_tracks?.map(
        (t) => t.id
      ) || [],
      inferred_subcompetency_ids:
        primary?.subcompetencies?.map((s) => s.id) || [],
      inferred_subcompetency_keys:
        primary?.subcompetencies?.map((s) => s.key) || [],
      inferred_career_track_ids: primary?.career_tracks?.map((t) => t.id) || [],
      inferred_career_track_keys:
        primary?.career_tracks?.map((t) => t.key) || [],
      inferred_development_level_id: null, // Would fetch from ontology_development_levels
      inferred_development_level: devLevel,
      development_level_reasoning:
        devLevel === 5
          ? "Created or systematized approach"
          : devLevel === 4
          ? "Led or influenced others"
          : devLevel === 3
          ? "Performed independently"
          : devLevel === 2
          ? "Participated with guidance"
          : "Recognized or identified",
      overall_confidence: confidence,
      classification_source: "ai",
      mak_detected_at: new Date().toISOString(),
      mak_primary_response: primaryResponse,
      mak_suggested_followup: coachingPrompt,
      mak_routing_category: routingCategory,
      mak_coaching_prompt: coachingPrompt,
      output_cv_bullet: outputs.cv_bullet,
      output_annual_review: outputs.annual_review,
      output_promotion_language: outputs.promotion_language,
      output_teaching_portfolio: outputs.teaching_portfolio,
      processed_at: new Date().toISOString(),
    };
  }

  private joinOne<T>(value: T | T[] | null | undefined): T | undefined {
    if (value == null) return undefined;
    return Array.isArray(value) ? value[0] : value;
  }

  /**
   * Load signal indicators from Supabase (with caching)
   */
  private async loadSignalIndicators(): Promise<void> {
    // Cache for 1 hour
    if (
      this.signalIndicators.size > 0 &&
      Date.now() - this.cached_signals_at.getTime() < 3600000
    ) {
      return;
    }

    const { data, error } = await this.supabase
      .from("signal_indicators")
      .select(
        `
        indicator_id,
        indicator_key,
        indicator_name,
        indicator_type,
        keywords,
        regex_pattern,
        confidence_default,
        related_activities,
        signal_categories!inner(category_id, category_key)
      `
      )
      .eq("active", true);

    if (error) {
      console.error("Error loading signal indicators:", error);
      return;
    }

    this.signalIndicators.clear();
    for (const indicator of data || []) {
      const cat = this.joinOne(
        indicator.signal_categories as
          | { category_id: string; category_key: string }
          | { category_id: string; category_key: string }[]
          | null,
      );
      if (!cat) continue;
      const enriched = {
        ...indicator,
        category_id: cat.category_id,
        category_key: cat.category_key,
      };
      this.signalIndicators.set(indicator.indicator_key, enriched);
    }

    this.cached_signals_at = new Date();
  }

  /**
   * Load activity mappings from Supabase (with caching)
   */
  private async loadActivityMappings(): Promise<void> {
    // Cache for 1 hour
    if (
      this.activityMappings.size > 0 &&
      Date.now() - this.cached_mappings_at.getTime() < 3600000
    ) {
      return;
    }

    const { data: activities, error: actError } = await this.supabase
      .from("ontology_invisible_work_activities")
      .select(
        `
        activity_id,
        activity_key,
        activity_name
      `
      )
      .eq("active", true);

    if (actError) {
      console.error("Error loading activities:", actError);
      return;
    }

    const { data: mappings, error: mapError } = await this.supabase
      .from("ontology_activity_mappings")
      .select(
        `
        mapping_id,
        activity_id,
        subcompetency_id,
        track_id,
        default_level_id,
        ontology_invisible_work_activities!inner(activity_id, activity_key, activity_name),
        ontology_subcompetencies!inner(subcompetency_id, subcompetency_key, name),
        ontology_career_tracks!inner(track_id, track_key, name),
        confidence_default
      `
      )
      .eq("active", true);

    if (mapError) {
      console.error("Error loading mappings:", mapError);
      return;
    }

    this.activityMappings.clear();
    for (const mapping of mappings || []) {
      const key = `${mapping.activity_id}-${mapping.track_id}`;
      const activity = this.joinOne(mapping.ontology_invisible_work_activities);
      const subcompetency = this.joinOne(mapping.ontology_subcompetencies);
      const track = this.joinOne(mapping.ontology_career_tracks);
      this.activityMappings.set(key, {
        activity_id: mapping.activity_id,
        activity_key: activity?.activity_key,
        activity_name: activity?.activity_name,
        subcompetencies: subcompetency
          ? [
              {
                id: subcompetency.subcompetency_id,
                key: subcompetency.subcompetency_key,
                name: subcompetency.name,
              },
            ]
          : [],
        career_tracks: track
          ? [
              {
                id: track.track_id,
                key: track.track_key,
                name: track.name,
              },
            ]
          : [],
        confidence: mapping.confidence_default,
        related_activities: [],
      });
    }

    this.cached_mappings_at = new Date();
  }

  /**
   * Fuzzy string matching for keyword detection
   */
  private fuzzyMatch(haystack: string, needle: string, threshold = 0.8): boolean {
    if (haystack.includes(needle)) return true;

    const words = haystack.split(/\s+/);
    for (const word of words) {
      const similarity = this.levenshteinSimilarity(word, needle);
      if (similarity >= threshold) return true;
    }

    return false;
  }

  /**
   * Levenshtein distance for fuzzy matching
   */
  private levenshteinSimilarity(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLength = Math.max(a.length, b.length);
    const distance = matrix[b.length][a.length];
    return 1 - distance / maxLength;
  }
}
