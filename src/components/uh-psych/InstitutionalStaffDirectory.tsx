import {
  getInstitutionalStaffDirectoryMeta,
  getInstitutionalStaffDirectorySections,
  type StaffContactRow,
  type StaffDirectorySection,
} from "@/lib/v2/programs/institutional-staff-directory";

function StaffTable({ rows }: { rows: StaffContactRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-cx-forest-dark/10 text-xs uppercase tracking-wide text-cx-forest-dark/55">
            <th className="py-2 pr-4 font-semibold">Department</th>
            <th className="py-2 pr-4 font-semibold">Name</th>
            <th className="py-2 pr-4 font-semibold">E-mail</th>
            <th className="py-2 font-semibold">Phone</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.role}-${row.name}`} className="border-b border-cx-forest-dark/5 align-top">
              <td className="py-2.5 pr-4 text-cx-forest-dark/75">{row.role}</td>
              <td className="py-2.5 pr-4 font-medium text-cx-forest-dark">
                {row.name}
                {row.notes ? (
                  <span className="mt-0.5 block text-xs font-normal text-cx-forest-dark/55">
                    {row.notes}
                  </span>
                ) : null}
              </td>
              <td className="py-2.5 pr-4">
                {row.email ? (
                  <a
                    href={`mailto:${row.email}`}
                    className="text-cx-forest-dark underline-offset-2 hover:underline"
                  >
                    {row.email}
                  </a>
                ) : (
                  <span className="text-cx-forest-dark/35">—</span>
                )}
              </td>
              <td className="py-2.5">
                {row.phone ? (
                  <a
                    href={`tel:${row.phone}`}
                    className="text-cx-forest-dark underline-offset-2 hover:underline"
                  >
                    {row.phone}
                  </a>
                ) : (
                  <span className="text-cx-forest-dark/35">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DirectorySection({ section }: { section: StaffDirectorySection }) {
  return (
    <section id={section.id} className="scroll-mt-24 rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5">
      <h2 className="text-base font-semibold text-cx-forest-dark">{section.title}</h2>
      {section.rows.length > 0 ? (
        <div className="mt-3">
          <StaffTable rows={section.rows} />
        </div>
      ) : (
        <p className="mt-2 text-sm italic text-cx-forest-dark/60">{section.emptyMessage}</p>
      )}
    </section>
  );
}

export function InstitutionalStaffDirectory() {
  const meta = getInstitutionalStaffDirectoryMeta();
  const sections = getInstitutionalStaffDirectorySections();

  return (
    <div id="staff-directory" className="scroll-mt-24 space-y-4">
      <div className="rounded-2xl border border-[#5FD65F]/35 bg-[#5FD65F]/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/70">
          Institutional on-boarding
        </p>
        <p className="mt-1 text-sm text-cx-forest-dark/85">{meta.title}</p>
        <p className="mt-1 text-xs text-cx-forest-dark/55">Last updated {meta.lastUpdated}</p>
      </div>

      {sections.map((section) => (
        <DirectorySection key={section.id} section={section} />
      ))}

      {meta.onboardingNotes.length > 0 && (
        <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-cx-forest-dark">Onboarding notes</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-cx-forest-dark/85">
            {meta.onboardingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
