import type { ScheduleBlock } from "@/lib/v2/schedule-calendar/types";

/** Rotation/call schedule only — never includes patient information. */
export function buildRotationIcs(input: {
  blocks: ScheduleBlock[];
  calendarName: string;
  prodId?: string;
}): string {
  const prodId = input.prodId ?? "-//FISCMAK//Rotation Schedule//EN";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:" + prodId,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(input.calendarName)}`,
    "X-WR-TIMEZONE:America/New_York",
  ];

  for (const block of input.blocks) {
    const uid = `${block.block_id}-${block.start_date}@fiscmak.app`;
    const summary = block.rotation_label.replace(/\n/g, " ");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART;VALUE=DATE:${block.start_date.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${icsExclusiveEnd(block.end_date)}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText("FISCMAK rotation schedule — no clinical or patient details.")}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function icsExclusiveEnd(isoEnd: string): string {
  const [y, m, d] = isoEnd.split("-").map(Number);
  const end = new Date(y, m - 1, d);
  end.setDate(end.getDate() + 1);
  return `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, "0")}${String(end.getDate()).padStart(2, "0")}`;
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function googleCalendarSubscribeUrl(icsUrl: string): string {
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icsUrl)}`;
}

export function outlookSubscribeUrl(icsUrl: string): string {
  return `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(icsUrl)}&name=${encodeURIComponent("FISCMAK Rotations")}`;
}
