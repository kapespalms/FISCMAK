import staffDirectory from "../../../../docs/seeds/uh-program-guides/institutional_onboarding_staff.json";

export type StaffContactRow = {
  department: string;
  role: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes?: string;
};

export type StaffDirectorySection = {
  id: string;
  title: string;
  rows: StaffContactRow[];
  emptyMessage?: string;
};

type StaffContact = {
  role: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string;
};

type StaffDirectorySeed = {
  title: string;
  last_updated: string;
  department_leadership: StaffContact[];
  divisions_and_fellowships: Array<{
    division: string;
    contacts: StaffContact[];
  }>;
  general_adult_psychiatry_residency: {
    program_name: string;
    staff: StaffContact[];
  };
  onboarding_notes: string[];
};

const seed = staffDirectory as StaffDirectorySeed;

function toRow(department: string, contact: StaffContact): StaffContactRow {
  return {
    department,
    role: contact.role,
    name: contact.name,
    email: contact.email ?? null,
    phone: contact.phone ?? null,
    notes: contact.notes,
  };
}

function withContactRouting(row: StaffContactRow): StaffContactRow {
  const routing = (seed as StaffDirectorySeed & {
    contact_routing?: {
      chief_residents?: { names: string[]; route_to: StaffContact; note: string };
      education_chief?: { name: string; route_to: StaffContact };
    };
  }).contact_routing;

  if (routing?.chief_residents?.names.includes(row.name.replace(/^Dr\.\s*/, ""))) {
    const target = routing.chief_residents.route_to;
    return {
      ...row,
      notes:
        row.notes ??
        `Contact via ${target.name} (${target.email ?? "program admin"}) — ${routing.chief_residents.note}`,
    };
  }

  if (routing?.education_chief?.name === row.name.replace(/^Dr\.\s*/, "")) {
    const target = routing.education_chief.route_to;
    return {
      ...row,
      email: row.email ?? target.email ?? null,
      notes: row.notes ?? `Education questions — cc ${target.name} (${target.email})`,
    };
  }

  return row;
}

export function getInstitutionalStaffDirectorySections(): StaffDirectorySection[] {
  const mapRows = (rows: StaffContactRow[]) => rows.map(withContactRouting);

  return [
    {
      id: "department-leadership",
      title: "Department leadership",
      rows: mapRows(seed.department_leadership.map((contact) => toRow(contact.role, contact))),
    },
    ...seed.divisions_and_fellowships.map((division) => ({
      id: division.division.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: division.division,
      rows: mapRows(division.contacts.map((contact) => toRow(contact.role, contact))),
      emptyMessage: "Contacts pending.",
    })),
    {
      id: "general-adult-psychiatry-residency",
      title: seed.general_adult_psychiatry_residency.program_name,
      rows: mapRows(
        seed.general_adult_psychiatry_residency.staff.map((contact) =>
          toRow(contact.role, contact),
        ),
      ),
    },
  ];
}

export function getInstitutionalStaffDirectoryMeta() {
  return {
    title: seed.title,
    lastUpdated: seed.last_updated,
    onboardingNotes: seed.onboarding_notes,
  };
}
