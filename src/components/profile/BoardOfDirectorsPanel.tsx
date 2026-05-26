"use client";

import { Users } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { PROFILE_MAK } from "@/lib/card-mak-prompts";
import type {
  BoardProfileView,
  BoardRoleCardView,
  CoachSlotView,
} from "@/lib/v2/career-board-models";
import { BOARD_ROLE_LABELS } from "@/lib/v2/career-board-models";

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
      <span className="text-cx-forest-dark/60">{label}</span>
      <span className="font-medium text-cx-forest-dark">{value}</span>
    </div>
  );
}

function RoleCard({
  role,
  card,
  emptyLabel,
}: {
  role: "mentor" | "sponsor" | "connector";
  card: BoardRoleCardView | null;
  emptyLabel: string;
}) {
  const title = BOARD_ROLE_LABELS[role].toUpperCase();

  if (!card) {
    return (
      <div className="rounded-xl border border-dashed border-cx-forest-dark/20 bg-cx-forest-dark/[0.02] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/70">
          {title}
        </p>
        <p className="mt-2 text-sm text-cx-forest-dark/60">{emptyLabel}</p>
        <MakDiscussLink
          mak={PROFILE_MAK.boardBuilding}
          className="mt-3 inline-block text-sm font-medium text-cx-forest-dark hover:text-cx-forest-dark/80"
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cx-forest-dark/12 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/70">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        <DetailRow label="Name" value={card.name} />
        {role === "mentor" && <DetailRow label="Specialty" value={card.specialty} />}
        {role === "sponsor" && <DetailRow label="Role" value={card.title} />}
        <DetailRow label="Relationship" value={card.relationship} />
        {role === "mentor" && (
          <>
            <DetailRow label="Last contact" value={card.lastContact} />
            <DetailRow
              label="Next meeting"
              value={
                card.nextMeeting === null
                  ? "Not scheduled"
                  : card.nextMeeting ?? undefined
              }
            />
          </>
        )}
        {role === "sponsor" && (
          <DetailRow label="Recent advocacy" value={card.recentAdvocacy} />
        )}
        {role === "connector" && (
          <>
            <DetailRow label="Network" value={card.network} />
            <DetailRow
              label="Connections facilitated"
              value={
                card.connectionsFacilitated != null
                  ? String(card.connectionsFacilitated)
                  : undefined
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

function CoachSlotRow({ slot }: { slot: CoachSlotView }) {
  let value: string;
  if (slot.status === "searching") {
    value = "Searching";
  } else if (slot.status === "self_taught") {
    value = "Self-taught";
  } else {
    value = slot.name ?? "—";
  }

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
      <span className="text-cx-forest-dark/60">{slot.domain} Coach</span>
      <span
        className={
          slot.status === "searching"
            ? "italic text-cx-forest-dark/50"
            : "font-medium text-cx-forest-dark"
        }
      >
        {value}
      </span>
    </div>
  );
}

function CoachesBlock({ coaches }: { coaches: CoachSlotView[] }) {
  return (
    <div className="rounded-xl border border-cx-forest-dark/12 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/70">
        Coaches (multiple)
      </p>
      <div className="mt-3 space-y-2">
        {coaches.map((slot) => (
          <CoachSlotRow key={slot.domain} slot={slot} />
        ))}
      </div>
      {coaches.some((s) => s.status === "searching") && (
        <MakDiscussLink
          mak={PROFILE_MAK.boardBuilding}
          className="mt-3 inline-block text-sm font-medium text-cx-forest-dark hover:text-cx-forest-dark/80"
        />
      )}
    </div>
  );
}

type BoardOfDirectorsPanelProps = {
  board: BoardProfileView | null;
  loading?: boolean;
};

export function BoardOfDirectorsPanel({ board, loading }: BoardOfDirectorsPanelProps) {
  return (
    <CardSection
      eyebrow="Relational capital"
      title="Board of Directors"
      description="Mentor, sponsor, coaches, and connector — four distinct roles. Mak supports you while you build real relationships."
      icon={Users}
      mak={PROFILE_MAK.board}
      footer={
        board ? (
          <MakDiscussLink
            mak={PROFILE_MAK.boardBuilding}
            className="text-sm font-medium text-cx-forest-dark hover:text-cx-forest-dark/80"
          />
        ) : undefined
      }
    >
      {loading && (
        <p className="text-sm text-cx-forest-dark/70">Loading your Board…</p>
      )}

      {!loading && !board && (
        <div className="space-y-3">
          <p className="text-sm text-cx-forest-dark/70">
            Map who fills each role — or where you have gaps. Most physicians have mentors but
            lack sponsors.
          </p>
          <MakDiscussLink
            mak={PROFILE_MAK.board}
            className="inline-block text-sm font-semibold text-cx-forest-dark hover:text-cx-forest-dark/80"
          />
        </div>
      )}

      {!loading && board && (
        <div className="space-y-4">
          <RoleCard
            role="mentor"
            card={board.mentor}
            emptyLabel="No mentor mapped yet — who helps you think through career direction?"
          />
          <RoleCard
            role="sponsor"
            card={board.sponsor}
            emptyLabel="No sponsor mapped yet — who advocates for you when you're not in the room?"
          />
          <CoachesBlock coaches={board.coaches} />
          <RoleCard
            role="connector"
            card={board.connector}
            emptyLabel="No connector mapped yet — who opens doors across networks?"
          />
        </div>
      )}
    </CardSection>
  );
}
