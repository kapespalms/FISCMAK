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

export function getInstitutionalStaffDirectorySections(): StaffDirectorySection[] {
  return [
    {
      id: "department-leadership",
      title: "Department leadership",
      rows: seed.department_leadership.map((contact) => toRow(contact.role, contact)),
    },
    ...seed.divisions_and_fellowships.map((division) => ({
      id: division.division.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: division.division,
      rows: division.contacts.map((contact) => toRow(contact.role, contact)),
      emptyMessage: "Contacts pending.",
    })),
    {
      id: "general-adult-psychiatry-residency",
      title: seed.general_adult_psychiatry_residency.program_name,
      rows: seed.general_adult_psychiatry_residency.staff.map((contact) =>
        toRow(contact.role, contact),
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
