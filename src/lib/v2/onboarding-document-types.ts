/** Onboarding upload picker — maps UI labels to DB-safe documents.document_type values. */

export type OnboardingStorageDocumentType =
  | "CV"
  | "Resume"
  | "Portfolio"
  | "Cover Letter"
  | "Other";

export type OnboardingUploadTypeOption = {
  id: string;
  label: string;
  storageType: OnboardingStorageDocumentType;
  requiresCustomLabel?: boolean;
};

export const ONBOARDING_DOCUMENT_TYPE_OPTIONS: OnboardingUploadTypeOption[] = [
  { id: "CV", label: "CV / Resume", storageType: "CV" },
  { id: "Personal_Statement", label: "Personal Statement", storageType: "Cover Letter" },
  { id: "Portfolio", label: "Portfolio", storageType: "Portfolio" },
  { id: "Dossier", label: "Dossier", storageType: "Other" },
  {
    id: "Performance_Reviews",
    label: "Performance Reviews & Evaluations",
    storageType: "Other",
  },
  { id: "Publications_List", label: "Publications List", storageType: "Other" },
  {
    id: "Research_Grants",
    label: "Research Proposals & Grants",
    storageType: "Other",
  },
  { id: "Teaching_Documentation", label: "Teaching Documentation", storageType: "Other" },
  {
    id: "Case_Procedure_Logs",
    label: "Deidentified Case & Procedure Logs",
    storageType: "Other",
  },
  { id: "QI_Projects", label: "Quality Improvement Projects", storageType: "Other" },
  { id: "CME_CPD", label: "CME/CPD Records", storageType: "Other" },
  { id: "Volunteer_Leadership", label: "Volunteer & Leadership", storageType: "Other" },
  { id: "Other", label: "Other", storageType: "Other", requiresCustomLabel: true },
];

export function getOnboardingUploadOption(typeId: string): OnboardingUploadTypeOption | undefined {
  return ONBOARDING_DOCUMENT_TYPE_OPTIONS.find((option) => option.id === typeId);
}

export function resolveOnboardingDocumentUpload(
  typeId: string,
  customLabel?: string,
): {
  document_type: OnboardingStorageDocumentType;
  document_subtype: string;
  document_label: string;
} {
  const option = getOnboardingUploadOption(typeId);
  if (!option) {
    throw new Error("Select a document type.");
  }

  const trimmedCustom = customLabel?.trim() ?? "";
  if (option.requiresCustomLabel && !trimmedCustom) {
    throw new Error("Enter a label for your document type.");
  }

  return {
    document_type: option.storageType,
    document_subtype: option.id,
    document_label: option.requiresCustomLabel ? trimmedCustom : option.label,
  };
}

export function documentSubtypeFromRecord(input: {
  document_type: string;
  metadata?: Record<string, unknown> | null;
}): string {
  const subtype = input.metadata?.document_subtype;
  if (typeof subtype === "string" && subtype.trim()) return subtype;
  if (input.document_type === "CV") return "CV";
  if (input.document_type === "Cover Letter") return "Personal_Statement";
  if (input.document_type === "Portfolio") return "Portfolio";
  return input.document_type;
}

export function documentLabelFromRecord(input: {
  document_type: string;
  metadata?: Record<string, unknown> | null;
}): string {
  const label = input.metadata?.document_label;
  if (typeof label === "string" && label.trim()) return label;
  const option = ONBOARDING_DOCUMENT_TYPE_OPTIONS.find(
    (item) => item.id === documentSubtypeFromRecord(input),
  );
  return option?.label ?? input.document_type;
}

export function documentFileNameFromRecord(input: {
  file_name?: string | null;
  metadata?: Record<string, unknown> | null;
}): string {
  if (input.file_name?.trim()) return input.file_name.trim();
  const metaName = input.metadata?.file_name;
  if (typeof metaName === "string" && metaName.trim()) return metaName.trim();
  return "Uploaded document";
}

export function isCvDocument(input: {
  document_type: string;
  metadata?: Record<string, unknown> | null;
}): boolean {
  return input.document_type === "CV" || documentSubtypeFromRecord(input) === "CV";
}

export function findCvDocument<T extends { document_type: string; metadata?: Record<string, unknown> | null }>(
  documents: T[],
): T | undefined {
  return documents.find(isCvDocument);
}
