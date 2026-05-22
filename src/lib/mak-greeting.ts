export function timeOfDayGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

export function buildDashboardGreeting(displayName?: string | null): string {
  const time = timeOfDayGreeting();
  const name = displayName?.trim();
  const salutation = name ? `${time}, ${name}.` : `${time}.`;
  return `${salutation}\nHow can I help today?`;
}

export function formatDisplayName(
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const first = firstName?.trim();
  const last = lastName?.trim();
  if (first && last) return `Dr. ${last}`;
  if (last) return `Dr. ${last}`;
  if (first) return `Dr. ${first}`;
  return null;
}
