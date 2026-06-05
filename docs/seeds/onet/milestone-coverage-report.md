# ACGME Milestone Coverage Report (§10C)

Generated: 2026-06-05T16:38:54.051Z

## Summary

| Metric | Count |
|--------|-------|
| Total ACGME program files | 229 |
| Canonical programs (after dedup) | 135 |
| — Primary specialties | 21 |
| — Subspecialties (non-prefixed) | 84 |
| — Subspecialties (prefixed-only) | 30 |
| FISCMAK subspecialties (166 total) | 166 |
| With milestone emphasis applied | 78 |
| Ticket 9 only (no ACGME mapping) | 88 |
| ACGME slugs flagged (no FISCMAK) | 39 |

## Differentiation Check

Cosine similarity between milestone-modulated domain fingerprints and Ticket-9 baseline.
Lower cosine = more differentiation from parent.
O\*NET-only baseline (Ticket 9): median cosine = 0.997

| Metric | Value | Subspecialty |
|--------|-------|-------------|
| Min cosine | 0.9818 | Electrophysiology |
| Median cosine | 0.9976 | — |
| Max cosine | 0.9981 | EM / Hospice & Palliative |

## Spot-Checks

| Subspecialty | Expected | Largest positive shift | Largest negative shift |
|---|---|---|---|
| Forensic Psychiatry | expect high prof+sbp | prof=+0.092 | pc=-0.109 |
| Interventional Cardiology | expect high pc shift | ics=+0.034 | pc=-0.050 |
| Vascular Neurology/Stroke | expect high mk shift for neuro parent | mk=+0.206 | pc=-0.244 |
| Pediatric Surgery | expect high pc shift | pc=+0.273 | pbli=-0.087 |
| Spinal Cord Injury | expect balanced | pc=+0.051 | pbli=-0.080 |

## FLAGGED — ACGME Slugs Without FISCMAK Mapping

| ACGME Slug | Reason |
|---|---|
| `internal-medicine--sports-medicine` | no FISCMAK entry |
| `family-medicine--sleep-medicine` | no FISCMAK entry |
| `psychiatry--hospice-and-palliative-medicine` | no FISCMAK entry |
| `neurological-surgery` | no FISCMAK entry |
| `child-neurology` | not in SLUG_TO_FISCMAK |
| `clinical-informatics` | not in SLUG_TO_FISCMAK |
| `congenital-cardiac-surgery` | not in SLUG_TO_FISCMAK |
| `craniofacial-surgery` | not in SLUG_TO_FISCMAK |
| `critical-care-anesthesiology` | not in SLUG_TO_FISCMAK |
| `diagnostic-radiology` | not in SLUG_TO_FISCMAK |
| `hematology` | not in SLUG_TO_FISCMAK |
| `interventional-cardiology` | not in SLUG_TO_FISCMAK |
| `medical-oncology` | not in SLUG_TO_FISCMAK |
| `medical-toxicology` | not in SLUG_TO_FISCMAK |
| `musculoskeletal-oncology` | not in SLUG_TO_FISCMAK |
| `neurology` | not in SLUG_TO_FISCMAK |
| `nuclear-radiology` | not in SLUG_TO_FISCMAK |
| `orthopaedic-surgery-of-the-spine` | not in SLUG_TO_FISCMAK |
| `orthopaedic-trauma` | not in SLUG_TO_FISCMAK |
| `pediatric-cardiac-anesthesiology` | not in SLUG_TO_FISCMAK |
| `pediatric-orthopaedics` | not in SLUG_TO_FISCMAK |
| `pediatric-otolaryngology` | not in SLUG_TO_FISCMAK |
| `pediatric-pathology` | not in SLUG_TO_FISCMAK |
| `pulmonary-disease` | not in SLUG_TO_FISCMAK |
| `selective-pathology` | not in SLUG_TO_FISCMAK |
| `urogynecology-and-reconstructive-pelvic-surgery` | not in SLUG_TO_FISCMAK |
| `obstetrics-and-gynecology--hospice-and-palliative-medicine` | not in SLUG_TO_FISCMAK |
| `obstetrics-and-gynecology--maternal-fetal-medicine` | not in SLUG_TO_FISCMAK |
| `orthopaedic-surgery--orthopaedic-sports-medicine` | not in SLUG_TO_FISCMAK |
| `otolaryngology---head-and-neck-surgery--pediatric-otolaryngology` | not in SLUG_TO_FISCMAK |
| `pediatrics--hospice-and-palliative-medicine` | not in SLUG_TO_FISCMAK |
| `pediatrics--pediatric-hospital-medicine` | not in SLUG_TO_FISCMAK |
| `pediatrics--sleep-medicine` | not in SLUG_TO_FISCMAK |
| `pediatrics--sports-medicine` | not in SLUG_TO_FISCMAK |
| `physical-medicine-and-rehabilitation--hospice-and-palliative-medicine` | not in SLUG_TO_FISCMAK |
| `preventive-medicine--public-health-and-general-preventive-medicine` | not in SLUG_TO_FISCMAK |
| `radiation-oncology--hospice-and-palliative-medicine` | not in SLUG_TO_FISCMAK |
| `radiology--hospice-and-palliative-medicine` | not in SLUG_TO_FISCMAK |
| `surgery--hospice-and-palliative-medicine` | not in SLUG_TO_FISCMAK |

## FISCMAK Subspecialties Without Milestone Data

| FISCMAK Subspecialty | Status |
|---|---|
| Adult Congenital Heart | Ticket 9 fingerprint only |
| Hepatology/Transplant | Ticket 9 fingerprint only |
| Interventional Pulmonology | Ticket 9 fingerprint only |
| Critical Care Medicine | Ticket 9 fingerprint only |
| Clinical Informatics (IM) | Ticket 9 fingerprint only |
| Hospital Medicine (Adult) | Ticket 9 fingerprint only |
| FM / Adolescent Medicine | Ticket 9 fingerprint only |
| Peds Emergency Medicine | Ticket 9 fingerprint only |
| Adolescent Medicine | Ticket 9 fingerprint only |
| Peds Hospital Medicine | Ticket 9 fingerprint only |
| Consultation-Liaison Psychiatry | Ticket 9 fingerprint only |
| Addiction Medicine (Psych) | Ticket 9 fingerprint only |
| Complex Surgical Oncology | Ticket 9 fingerprint only |
| Hand Surgery (Surgery) | Ticket 9 fingerprint only |
| Ortho / Sports Medicine | Ticket 9 fingerprint only |
| Ortho / Spine | Ticket 9 fingerprint only |
| Ortho / Hand | Ticket 9 fingerprint only |
| Ortho / Trauma | Ticket 9 fingerprint only |
| Ortho / Pediatric | Ticket 9 fingerprint only |
| Ortho / Adult Reconstruction | Ticket 9 fingerprint only |
| Ortho / MSK Oncology | Ticket 9 fingerprint only |
| ENT / Pediatric ENT | Ticket 9 fingerprint only |
| ENT / Head & Neck Surg Onc | Ticket 9 fingerprint only |
| ENT / Facial Plastic | Ticket 9 fingerprint only |
| ENT / Laryngology | Ticket 9 fingerprint only |
| ENT / Rhinology | Ticket 9 fingerprint only |
| Urology | Ticket 9 fingerprint only |
| Congenital Cardiac Surgery | Ticket 9 fingerprint only |
| Plastic / Hand Surgery | Ticket 9 fingerprint only |
| Plastic / Craniofacial | Ticket 9 fingerprint only |
| Plastic / Microsurgery | Ticket 9 fingerprint only |
| EM / Medical Toxicology | Ticket 9 fingerprint only |
| EM / Sports Medicine | Ticket 9 fingerprint only |
| EM / Ultrasound | Ticket 9 fingerprint only |
| EM / Disaster Medicine | Ticket 9 fingerprint only |
| EM / Wilderness Medicine | Ticket 9 fingerprint only |
| EM / Critical Care (EMCCM) | Ticket 9 fingerprint only |
| EM / Administration | Ticket 9 fingerprint only |
| EM / Clinical Informatics | Ticket 9 fingerprint only |
| Anes / Critical Care | Ticket 9 fingerprint only |
| Anes / Pain Medicine | Ticket 9 fingerprint only |
| Anes / Neuroanesthesia | Ticket 9 fingerprint only |
| Anes / Regional-Acute Pain | Ticket 9 fingerprint only |
| Anes / Perioperative Medicine | Ticket 9 fingerprint only |
| Musculoskeletal Radiology | Ticket 9 fingerprint only |
| Breast Imaging | Ticket 9 fingerprint only |
| Abdominal/Body Imaging | Ticket 9 fingerprint only |
| Cardiothoracic Imaging | Ticket 9 fingerprint only |
| Interventional Radiology | Ticket 9 fingerprint only |
| Surgical Pathology | Ticket 9 fingerprint only |
| Clinical Pathology/Lab Medicine | Ticket 9 fingerprint only |
| Clinical Informatics (Path) | Ticket 9 fingerprint only |
| Dermatopathology (Derm) | Ticket 9 fingerprint only |
| Cosmetic Dermatology | Ticket 9 fingerprint only |
| Neuromuscular Medicine | Ticket 9 fingerprint only |
| Movement Disorders | Ticket 9 fingerprint only |
| Behavioral Neurology/Neuropsychiatry | Ticket 9 fingerprint only |
| Neuro-oncology | Ticket 9 fingerprint only |
| Headache Medicine | Ticket 9 fingerprint only |
| Neuroimmunology/MS | Ticket 9 fingerprint only |
| Autonomic Disorders | Ticket 9 fingerprint only |
| Pain Medicine (Neuro) | Ticket 9 fingerprint only |
| Clinical Informatics (Neuro) | Ticket 9 fingerprint only |
| Maternal-Fetal Medicine | Ticket 9 fingerprint only |
| Female Pelvic Med/Recon Surgery | Ticket 9 fingerprint only |
| Complex Family Planning | Ticket 9 fingerprint only |
| Minimally Invasive Gyn Surgery | Ticket 9 fingerprint only |
| Ophthalmology (general) | Ticket 9 fingerprint only |
| Retina/Vitreous | Ticket 9 fingerprint only |
| Glaucoma | Ticket 9 fingerprint only |
| Cornea/External Disease | Ticket 9 fingerprint only |
| Pediatric Ophthalmology/Strabismus | Ticket 9 fingerprint only |
| Neuro-ophthalmology | Ticket 9 fingerprint only |
| PM&R (general) | Ticket 9 fingerprint only |
| Brain Injury | Ticket 9 fingerprint only |
| Pain Medicine (PM&R) | Ticket 9 fingerprint only |
| Sports Medicine (PM&R) | Ticket 9 fingerprint only |
| Neuromuscular (PM&R) | Ticket 9 fingerprint only |
| EMG/Electrodiagnostics | Ticket 9 fingerprint only |
| Cancer Rehab | Ticket 9 fingerprint only |
| Preventive Med/Public Health | Ticket 9 fingerprint only |
| Occupational Medicine | Ticket 9 fingerprint only |
| Undersea & Hyperbaric Medicine | Ticket 9 fingerprint only |
| Addiction Medicine (Prev) | Ticket 9 fingerprint only |
| Clinical Informatics (Prev) | Ticket 9 fingerprint only |
| Medical Toxicology (Prev) | Ticket 9 fingerprint only |
| Clinical Cytogenetics | Ticket 9 fingerprint only |
| Pain Medicine (multidisciplinary) | Ticket 9 fingerprint only |

## Full ACGME Canonical Slug → FISCMAK Mapping

| ACGME Slug | FISCMAK Name | Status |
|---|---|---|
| `addiction-medicine` | FM / Addiction Medicine | mapped |
| `addiction-psychiatry` | Addiction Psychiatry | mapped |
| `adult-cardiothoracic-anesthesiology` | Anes / Cardiac | mapped |
| `advanced-heart-failure-and-transplant-cardiology` | Advanced Heart Failure/Transplant | mapped |
| `aerospace-medicine` | Aerospace Medicine | mapped |
| `anesthesiology--hospice-and-palliative-medicine` | Hospice & Palliative (IM) | mapped |
| `cardiovascular-disease` | Interventional Cardiology | mapped |
| `chemical-pathology` | Clinical Chemistry | mapped |
| `child-abuse-pediatrics` | Child Abuse Pediatrics | mapped |
| `child-and-adolescent-psychiatry` | Child & Adolescent Psychiatry | mapped |
| `child-neurology` | — | NOT IN SLUG_TO_FISCMAK |
| `clinical-cardiac-electrophysiology` | Electrophysiology | mapped |
| `clinical-informatics` | — | NOT IN SLUG_TO_FISCMAK |
| `clinical-neurophysiology` | Epilepsy/Clinical Neurophysiology | mapped |
| `congenital-cardiac-surgery` | — | NOT IN SLUG_TO_FISCMAK |
| `craniofacial-surgery` | — | NOT IN SLUG_TO_FISCMAK |
| `critical-care-anesthesiology` | — | NOT IN SLUG_TO_FISCMAK |
| `cytopathology` | Cytopathology | mapped |
| `dermatopathology` | Dermatopathology (Path) | mapped |
| `developmental-behavioral-pediatrics` | Developmental-Behavioral Peds | mapped |
| `diagnostic-radiology` | — | NOT IN SLUG_TO_FISCMAK |
| `emergency-medical-services` | EM / EMS-Prehospital | mapped |
| `emergency-medicine--hospice-and-palliative-medicine` | EM / Hospice & Palliative | mapped |
| `endocrinology-diabetes-and-metabolism` | Endocrinology | mapped |
| `family-medicine--geriatric-medicine` | FM / Geriatric Medicine | mapped |
| `family-medicine--hospice-and-palliative-medicine` | FM / Hospice & Palliative | mapped |
| `family-medicine--sleep-medicine` | — | FLAGGED (no FISCMAK entry) |
| `family-medicine--sports-medicine` | FM / Sports Medicine | mapped |
| `female-pelvic-medicine-and-reconstructive-surgery` | Urology / Female Pelvic/Recon | mapped |
| `forensic-pathology` | Forensic Pathology | mapped |
| `forensic-psychiatry` | Forensic Psychiatry | mapped |
| `gastroenterology` | Gastroenterology | mapped |
| `geriatric-psychiatry` | Geriatric Psychiatry | mapped |
| `gynecologic-oncology` | Gynecologic Oncology | mapped |
| `hematology` | — | NOT IN SLUG_TO_FISCMAK |
| `hematology-and-medical-oncology` | Hematology/Oncology | mapped |
| `hematopathology` | Hematopathology | mapped |
| `infectious-disease` | Infectious Disease | mapped |
| `internal-medicine--geriatric-medicine` | Geriatric Medicine (IM) | mapped |
| `internal-medicine--hospice-and-palliative-medicine` | Hospice & Palliative (IM) | mapped |
| `internal-medicine--sleep-medicine` | Sleep Medicine (IM) | mapped |
| `internal-medicine--sports-medicine` | — | FLAGGED (no FISCMAK entry) |
| `interventional-cardiology` | — | NOT IN SLUG_TO_FISCMAK |
| `laboratory-genetics-and-genomics` | Molecular Genetics | mapped |
| `medical-biochemical-genetics` | Biochemical Genetics | mapped |
| `medical-microbiology` | Microbiology (Path) | mapped |
| `medical-oncology` | — | NOT IN SLUG_TO_FISCMAK |
| `medical-toxicology` | — | NOT IN SLUG_TO_FISCMAK |
| `micrographic-surgery-and-dermatologic-oncology` | Mohs/Procedural Dermatology | mapped |
| `molecular-genetic-pathology` | Molecular Genetic Pathology | mapped |
| `musculoskeletal-oncology` | — | NOT IN SLUG_TO_FISCMAK |
| `neonatal-perinatal-medicine` | Neonatology | mapped |
| `nephrology` | Nephrology | mapped |
| `neurocritical-care` | Neurocritical Care | mapped |
| `neurodevelopmental-disabilities` | Developmental-Behavioral Peds | mapped |
| `neurology` | — | NOT IN SLUG_TO_FISCMAK |
| `neurology--hospice-and-palliative-medicine` | Hospice & Palliative (Neuro) | mapped |
| `neurology--sleep-medicine` | Sleep Medicine (Neuro) | mapped |
| `neuropathology` | Neuropathology | mapped |
| `neuroradiology` | Neuroradiology | mapped |
| `neurotology` | ENT / Neurotology | mapped |
| `nuclear-radiology` | — | NOT IN SLUG_TO_FISCMAK |
| `obstetric-anesthesiology` | Anes / Obstetric | mapped |
| `obstetrics-and-gynecology--hospice-and-palliative-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `obstetrics-and-gynecology--maternal-fetal-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `ophthalmic-plastic-and-reconstructive-surgery` | Oculoplastics | mapped |
| `orthopaedic-surgery--orthopaedic-sports-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `orthopaedic-surgery-of-the-spine` | — | NOT IN SLUG_TO_FISCMAK |
| `orthopaedic-trauma` | — | NOT IN SLUG_TO_FISCMAK |
| `otolaryngology---head-and-neck-surgery--neurotology` | ENT / Neurotology | mapped |
| `otolaryngology---head-and-neck-surgery--pediatric-otolaryngology` | — | NOT IN SLUG_TO_FISCMAK |
| `pathology--blood-banking-and-transfusion-medicine` | Blood Banking/Transfusion | mapped |
| `pediatric-anesthesiology` | Anes / Pediatric | mapped |
| `pediatric-cardiac-anesthesiology` | — | NOT IN SLUG_TO_FISCMAK |
| `pediatric-cardiology` | Peds Cardiology | mapped |
| `pediatric-critical-care` | Peds Critical Care | mapped |
| `pediatric-dermatology` | Pediatric Dermatology | mapped |
| `pediatric-endocrinology` | Peds Endocrinology | mapped |
| `pediatric-gastroenterology` | Peds GI | mapped |
| `pediatric-hematology-oncology` | Peds Heme/Onc | mapped |
| `pediatric-infectious-diseases` | Peds Infectious Disease | mapped |
| `pediatric-nephrology` | Peds Nephrology | mapped |
| `pediatric-orthopaedics` | — | NOT IN SLUG_TO_FISCMAK |
| `pediatric-otolaryngology` | — | NOT IN SLUG_TO_FISCMAK |
| `pediatric-pathology` | — | NOT IN SLUG_TO_FISCMAK |
| `pediatric-pulmonology` | Peds Pulmonology | mapped |
| `pediatric-radiology` | Pediatric Radiology | mapped |
| `pediatric-rehabilitation-medicine` | Pediatric Rehab | mapped |
| `pediatric-rheumatology` | Peds Rheumatology | mapped |
| `pediatric-surgery` | Pediatric Surgery | mapped |
| `pediatric-urology` | Urology / Pediatric | mapped |
| `pediatrics--hospice-and-palliative-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `pediatrics--pediatric-hospital-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `pediatrics--sleep-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `pediatrics--sports-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `physical-medicine-and-rehabilitation--hospice-and-palliative-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `physical-medicine-and-rehabilitation--spinal-cord-injury-medicine` | Spinal Cord Injury | mapped |
| `preventive-medicine--public-health-and-general-preventive-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `psychiatry--hospice-and-palliative-medicine` | — | FLAGGED (no FISCMAK entry) |
| `psychiatry--sleep-medicine` | Sleep Medicine (Neuro) | mapped |
| `pulmonary-disease` | — | NOT IN SLUG_TO_FISCMAK |
| `pulmonary-disease-and-critical-care-medicine` | Pulmonary/Critical Care | mapped |
| `radiation-oncology` | Radiation Oncology | mapped |
| `radiation-oncology--hospice-and-palliative-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `radiology--hospice-and-palliative-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `reproductive-endocrinology-and-infertility` | Reproductive Endocrinology/Infertility | mapped |
| `rheumatology` | Rheumatology | mapped |
| `selective-pathology` | — | NOT IN SLUG_TO_FISCMAK |
| `surgery--hospice-and-palliative-medicine` | — | NOT IN SLUG_TO_FISCMAK |
| `surgical-critical-care` | Surgical Critical Care | mapped |
| `thoracic-surgery-integrated` | Thoracic Surgery | mapped |
| `urogynecology-and-reconstructive-pelvic-surgery` | — | NOT IN SLUG_TO_FISCMAK |
| `vascular-neurology` | Vascular Neurology/Stroke | mapped |
| `vascular-surgery-independent` | Vascular Surgery | mapped |
