/**
 * Free tier classifier — keyword-based signal detection, no API cost.
 */
import { makCategorySummary } from "@/lib/v2/category-summary";

export type FreeClassificationRequest = {
  userId: string;
  rawText: string;
  userSpecialty?: string;
  userRole?: string;
};

export type FreeClassificationResult = {
  rawText: string;
  detected_signals: string[];
  activity_key: string;
  development_level: number;
  mak_response: string;
  output_cv_bullet: string;
  output_annual_review: string;
  activity_entry: Record<string, unknown>;
};

export class FreeClassifier {
  async classifyActivity(
    request: FreeClassificationRequest,
  ): Promise<FreeClassificationResult> {
    const text = request.rawText.toLowerCase();
    const signals = this.detectSignals(text);
    const activity = this.inferActivity(signals);
    const level = this.estimateDevelopmentLevel(signals, text);
    const response = this.generateTemplateResponse(signals, activity, request.userRole);
    const outputs = this.generateOutputs(signals);

    return {
      rawText: request.rawText,
      detected_signals: signals,
      activity_key: activity.key,
      development_level: level,
      mak_response: response,
      output_cv_bullet: outputs.cv_bullet,
      output_annual_review: outputs.annual_review,
      activity_entry: this.createActivityEntry(request, signals, activity, level),
    };
  }

  private detectSignals(text: string): string[] {
    const signals: string[] = [];
    if (this.hasKeywords(text, ["led", "managed", "directed", "organized", "team", "project"])) {
      signals.push("leadership");
    }
    if (this.hasKeywords(text, ["mentored", "taught", "trained", "guided", "junior", "resident"])) {
      signals.push("mentorship");
    }
    if (this.hasKeywords(text, ["teaching", "taught", "lecture", "student", "education", "rounds"])) {
      signals.push("teaching");
    }
    if (this.hasKeywords(text, ["exhausted", "drained", "difficult patient", "support", "empathy", "struggled"])) {
      signals.push("emotional_labor");
    }
    if (this.hasKeywords(text, ["process", "improvement", "workflow", "efficiency", "system", "protocol"])) {
      signals.push("systems_thinking");
    }
    if (this.hasKeywords(text, ["advocated", "pushed", "changed", "policy", "voice", "stood up"])) {
      signals.push("advocacy");
    }
    if (this.hasKeywords(text, ["research", "published", "presented", "data", "study", "paper"])) {
      signals.push("scholarship");
    }
    if (this.hasKeywords(text, ["new", "innovative", "novel", "created", "developed", "first"])) {
      signals.push("innovation");
    }
    if (this.hasKeywords(text, ["self-care", "exercise", "meditation", "wellness", "balance", "took care"])) {
      signals.push("wellbeing");
    }
    if (this.hasKeywords(text, ["feedback", "reviewed", "critiqued", "evaluated", "assessed"])) {
      signals.push("feedback");
    }
    return signals.length > 0 ? signals : ["general_activity"];
  }

  private hasKeywords(text: string, keywords: string[]): boolean {
    return keywords.some((kw) => text.includes(kw));
  }

  private inferActivity(signals: string[]): { key: string; label: string } {
    if (signals.includes("leadership")) return { key: "led_team_project", label: "Led a Team Project" };
    if (signals.includes("mentorship")) return { key: "mentored_junior", label: "Mentored Junior Physician" };
    if (signals.includes("teaching")) return { key: "taught_medical_students", label: "Taught Medical Students" };
    if (signals.includes("scholarship")) return { key: "presented_research", label: "Presented Research" };
    if (signals.includes("emotional_labor")) return { key: "emotional_labor", label: "Provided Emotional Support" };
    if (signals.includes("advocacy")) return { key: "advocated_change", label: "Advocated for Change" };
    if (signals.includes("systems_thinking")) return { key: "improved_process", label: "Improved a Process" };
    return { key: "general_activity", label: "Professional Activity" };
  }

  private estimateDevelopmentLevel(signals: string[], text: string): number {
    let level = 1;
    if (this.hasKeywords(text, ["participated", "involved", "helped", "assisted"])) level = 2;
    if (
      signals.includes("teaching") ||
      signals.includes("mentorship") ||
      this.hasKeywords(text, ["led", "managed", "conducted"])
    ) {
      level = 3;
    }
    if (signals.includes("leadership") && this.hasKeywords(text, ["team", "project", "organized"])) {
      level = 4;
    }
    if (signals.includes("systems_thinking") && this.hasKeywords(text, ["improvement", "new process", "change"])) {
      level = 5;
    }
    return Math.min(5, Math.max(1, level));
  }

  private generateTemplateResponse(
    signals: string[],
    activity: { key: string; label: string },
    userRole?: string,
  ): string {
    void activity;
    void userRole;
    const templates: Record<string, string> = {
      leadership:
        "That's excellent leadership work. Managing projects and teams is a critical skill for advancement. How did you approach building consensus with your team?",
      mentorship:
        "Mentoring junior physicians is invaluable work and a strong signal of readiness for leadership roles. What did you learn from the mentoring experience?",
      teaching:
        "Teaching is one of the most impactful invisible work you can do. How many learners did you reach?",
      emotional_labor:
        "Thank you for sharing that. Emotional support for patients and colleagues is real work that deserves recognition. How are you taking care of yourself?",
      systems_thinking:
        "Process improvement shows strategic thinking beyond clinical practice. What was the impact of the change you implemented?",
      advocacy: "Advocating for change takes courage. What was the outcome of your efforts?",
      scholarship:
        "Presenting research demonstrates commitment to advancing the field. What was the response to your work?",
      innovation: "Creating something new is impressive. How might this scale or benefit others?",
      general_activity:
        "That sounds like meaningful work. Tell me more about what made this experience significant for you.",
    };
    return templates[signals[0] ?? "general_activity"] ?? templates.general_activity;
  }

  private generateOutputs(signals: string[]): { cv_bullet: string; annual_review: string } {
    const outputTemplates: Record<string, { cv: string; review: string }> = {
      leadership: {
        cv: "Led interdisciplinary team project, demonstrating initiative and collaborative management skills",
        review: "Shows growing leadership capability through successful team management and project delivery",
      },
      mentorship: {
        cv: "Mentored junior physicians in clinical decision-making and professional development",
        review: "Actively engaged in physician development and knowledge transfer to trainees",
      },
      teaching: {
        cv: "Designed and delivered medical education to students and trainees",
        review: "Committed to medical education and training the next generation of physicians",
      },
      emotional_labor: {
        cv: "Provided compassionate patient and colleague support in high-stress situations",
        review: "Demonstrates empathy and emotional intelligence in patient care",
      },
      systems_thinking: {
        cv: "Identified and implemented process improvements to enhance clinical efficiency",
        review: "Shows initiative in systems thinking and quality improvement efforts",
      },
      advocacy: {
        cv: "Advocated for policy or practice changes aligned with evidence-based medicine",
        review: "Willing to speak up and drive meaningful organizational change",
      },
      scholarship: {
        cv: "Presented clinical or research findings to advance medical knowledge",
        review: "Engaged in scholarly activities and knowledge dissemination",
      },
      innovation: {
        cv: "Developed novel approach to clinical or administrative challenge",
        review: "Demonstrates creativity and innovation in problem-solving",
      },
      general_activity: {
        cv: "Engaged in professional development and high-quality clinical work",
        review: "Continues to grow professionally and contribute meaningfully to patient care",
      },
    };
    const template = outputTemplates[signals[0] ?? "general_activity"] ?? outputTemplates.general_activity;
    return { cv_bullet: template.cv, annual_review: template.review };
  }

  private createActivityEntry(
    request: FreeClassificationRequest,
    signals: string[],
    activity: { key: string; label: string },
    level: number,
  ): Record<string, unknown> {
    const now = new Date().toISOString();
    return {
      user_id: request.userId,
      // raw_text now holds the category summary (controlled vocabulary), never the verbatim input.
      // The verbatim user text is read in-memory to classify, then discarded — never persisted.
      raw_text: makCategorySummary(activity.key, signals),
      raw_text_tokens: 0, // not meaningful for category string; keep column populated
      input_source: "chat",
      input_timestamp: now,
      detected_signal_keys: signals,
      signal_detection_metadata: { classifier: "free_tier", confidence: 0.7 },
      user_role: request.userRole ?? null,
      inferred_activity_key: activity.key,
      activity_category: activity.key.split("_")[0],
      inferred_development_level: level,
      development_level_reasoning: `Inferred from signals: ${signals.join(", ")}`,
      overall_confidence: 0.7,
      classification_source: "free_tier",
      mak_primary_response: this.generateTemplateResponse(signals, activity, request.userRole),
      processed_at: now,
      created_at: now,
      updated_at: now,
    };
  }
}

export default FreeClassifier;
