# Subspecialty Anchor Validation Report (9B)

Generated: 2026-06-05T16:38:53.898Z
Total subspecialties: 166
Validated (anchor in top-10 adjacency basket): 63
Not in top-10: 103
  - Flagged SOC rows (computation uses substitute): 19
  - Excluded from pool (29-1xxx anchors, by design): 23
  - Unflagged not in top-10 (alpha=0.20 blend too weak): 61

## Note on adjacency pool

The adjacency candidate pool mirrors the main pipeline: it excludes all 29-1xxx SOC codes
(physician and allied-health practitioner family) and requires Job Zone >= 3.
Six anchor SOCs in the CSV are 29-1xxx codes (Respiratory Therapists, Physical Therapists,
Speech-Language Pathologists, Nurse Midwives, Optometrists, Dentists All Other).
These codes are used to compute V_blend correctly — they are valid anchor vectors —
but they cannot appear in the adjacency basket because they are structurally excluded from
the pool. "Anchor in top-10 = false" for these subspecialties is expected, not a defect.

## Flagged SOC Codes (stale O*NET 30.3 references)

| CSV SOC | Effective SOC | Reason |
|---------|--------------|--------|
| 19-3031.00 | 19-3033.00 | Renamed: Clinical and Counseling Psychologists |
| 13-1061.00 | 11-9161.00 | Wrong SOC family; correct Emergency Management Directors code |
| 29-2041.00 | avg(29-2042.00,29-2043.00) | Split into EMTs (29-2042) + Paramedics (29-2043) |
| 25-2054.00 | 25-2059.00 | Restructured; use Special Education Teachers, All Other |
| 29-2010.00 | 29-2011.00 | Group code; use Medical and Clinical Laboratory Technologists |

## Per-subspecialty results

| Subspecialty | Anchor SOC (CSV) | Effective SOC | Anchor In Top-10 | Anchor Rank | Notes |
|---|---|---|---|---|---|
| Electrophysiology | 17-2072.00 | 17-2072.00 | No | 18 |  |
| Interventional Cardiology | 29-2031.00 | 29-2031.00 | No | 18 |  |
| Advanced Heart Failure/Transplant | 21-1022.00 | 21-1022.00 | No | 16 |  |
| Adult Congenital Heart | 25-1042.00 | 25-1042.00 | No | 17 |  |
| Gastroenterology | 29-2034.00 | 29-2034.00 | No | 16 |  |
| Hepatology/Transplant | 21-1022.00 | 21-1022.00 | Yes | 5 |  |
| Pulmonary/Critical Care | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| Interventional Pulmonology | 29-2034.00 | 29-2034.00 | No | 16 |  |
| Hematology/Oncology | 19-1042.00 | 19-1042.00 | Yes | 5 |  |
| Endocrinology | 19-1042.00 | 19-1042.00 | Yes | 5 |  |
| Nephrology | 17-2112.00 | 17-2112.00 | No | — |  |
| Rheumatology | 19-1042.00 | 19-1042.00 | Yes | 5 |  |
| Infectious Disease | 19-1041.00 | 19-1041.00 | Yes | 7 |  |
| Geriatric Medicine (IM) | 21-1015.00 | 21-1015.00 | No | 19 |  |
| Critical Care Medicine | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| Allergy & Immunology | 19-1042.00 | 19-1042.00 | Yes | 5 |  |
| Clinical Informatics (IM) | 15-1252.00 | 15-1252.00 | No | — |  |
| Hospice & Palliative (IM) | 21-1022.00 | 21-1022.00 | Yes | 5 |  |
| Sleep Medicine (IM) | 29-2099.00 | 29-2099.00 | No | — |  |
| Hospital Medicine (Adult) | 11-9111.00 | 11-9111.00 | No | 15 |  |
| FM / Geriatric Medicine | 21-1015.00 | 21-1015.00 | No | 19 |  |
| FM / Sports Medicine | 29-9091.00 | 29-9091.00 | Yes | 7 |  |
| FM / Hospice & Palliative | 21-1022.00 | 21-1022.00 | Yes | 5 |  |
| FM / Addiction Medicine | 21-1011.00 | 21-1011.00 | No | 11 |  |
| FM / Adolescent Medicine | 21-1012.00 | 21-1012.00 | No | 11 |  |
| Neonatology | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| Peds Cardiology | 29-2031.00 | 29-2031.00 | Yes | 7 |  |
| Peds Critical Care | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| Peds Emergency Medicine | 29-2041.00 | avg(29-2042.00,29-2043.00) | No | — | Flagged SOC — substitute used |
| Peds GI | 29-2034.00 | 29-2034.00 | No | — |  |
| Peds Heme/Onc | 19-1042.00 | 19-1042.00 | Yes | 10 |  |
| Peds Endocrinology | 19-1042.00 | 19-1042.00 | Yes | 10 |  |
| Peds Pulmonology | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| Peds Nephrology | 17-2112.00 | 17-2112.00 | No | — |  |
| Peds Rheumatology | 19-1042.00 | 19-1042.00 | Yes | 10 |  |
| Peds Infectious Disease | 19-1041.00 | 19-1041.00 | No | 13 |  |
| Developmental-Behavioral Peds | 19-3031.00 | 19-3033.00 | Yes | 7 | Flagged SOC — substitute used |
| Adolescent Medicine | 21-1012.00 | 21-1012.00 | Yes | 9 |  |
| Child Abuse Pediatrics | 19-4092.00 | 19-4092.00 | No | — |  |
| Peds Hospital Medicine | 11-9111.00 | 11-9111.00 | No | — |  |
| Child & Adolescent Psychiatry | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Addiction Psychiatry | 21-1011.00 | 21-1011.00 | Yes | 4 |  |
| Forensic Psychiatry | 19-4092.00 | 19-4092.00 | No | — |  |
| Geriatric Psychiatry | 21-1015.00 | 21-1015.00 | No | 14 |  |
| Consultation-Liaison Psychiatry | 11-9111.00 | 11-9111.00 | No | — |  |
| Addiction Medicine (Psych) | 21-1011.00 | 21-1011.00 | Yes | 4 |  |
| Surgical Critical Care | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| Pediatric Surgery | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Complex Surgical Oncology | 19-1042.00 | 19-1042.00 | Yes | 1 |  |
| Vascular Surgery | 17-2112.00 | 17-2112.00 | No | 18 |  |
| Hand Surgery (Surgery) | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Ortho / Sports Medicine | 29-9091.00 | 29-9091.00 | No | 12 |  |
| Ortho / Spine | 17-2112.00 | 17-2112.00 | No | — |  |
| Ortho / Hand | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Ortho / Trauma | 29-2041.00 | avg(29-2042.00,29-2043.00) | Yes | 1 | Flagged SOC — substitute used |
| Ortho / Pediatric | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Ortho / Adult Reconstruction | 17-2112.00 | 17-2112.00 | No | — |  |
| Ortho / MSK Oncology | 19-1042.00 | 19-1042.00 | No | 13 |  |
| Otolaryngology (ENT) | 29-1029.00 | 29-1029.00 | No | — | 29-1xxx excluded from pool by design |
| ENT / Neurotology | 17-2072.00 | 17-2072.00 | No | 18 |  |
| ENT / Pediatric ENT | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| ENT / Head & Neck Surg Onc | 19-1042.00 | 19-1042.00 | Yes | 1 |  |
| ENT / Facial Plastic | 27-1013.00 | 27-1013.00 | No | — |  |
| ENT / Laryngology | 29-1127.00 | 29-1127.00 | No | — | 29-1xxx excluded from pool by design |
| ENT / Rhinology | 29-2034.00 | 29-2034.00 | Yes | 10 |  |
| Urology | 17-2112.00 | 17-2112.00 | No | 18 |  |
| Urology / Pediatric | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Urology / Female Pelvic/Recon | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Thoracic Surgery | 17-2112.00 | 17-2112.00 | No | 18 |  |
| Congenital Cardiac Surgery | 17-2072.00 | 17-2072.00 | No | 18 |  |
| Plastic Surgery | 27-1013.00 | 27-1013.00 | No | — |  |
| Plastic / Hand Surgery | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Plastic / Craniofacial | 17-2112.00 | 17-2112.00 | No | 18 |  |
| Plastic / Microsurgery | 51-9071.00 | 51-9071.00 | No | — |  |
| Colorectal Surgery | 17-2112.00 | 17-2112.00 | No | 18 |  |
| EM / Medical Toxicology | 19-4092.00 | 19-4092.00 | No | — |  |
| EM / Sports Medicine | 29-9091.00 | 29-9091.00 | Yes | 4 |  |
| EM / Ultrasound | 29-2032.00 | 29-2032.00 | Yes | 7 |  |
| EM / EMS-Prehospital | 29-2041.00 | avg(29-2042.00,29-2043.00) | No | — | Flagged SOC — substitute used |
| EM / Disaster Medicine | 13-1061.00 | 11-9161.00 | No | — | Flagged SOC — substitute used |
| EM / Wilderness Medicine | 29-2041.00 | avg(29-2042.00,29-2043.00) | No | — | Flagged SOC — substitute used |
| EM / Hospice & Palliative | 21-1022.00 | 21-1022.00 | Yes | 4 |  |
| EM / Critical Care (EMCCM) | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| EM / Administration | 11-9111.00 | 11-9111.00 | No | 20 |  |
| EM / Clinical Informatics | 15-1252.00 | 15-1252.00 | No | — |  |
| Anes / Critical Care | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| Anes / Pain Medicine | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Anes / Cardiac | 29-2031.00 | 29-2031.00 | Yes | 2 |  |
| Anes / Pediatric | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Anes / Neuroanesthesia | 17-2072.00 | 17-2072.00 | No | — |  |
| Anes / Regional-Acute Pain | 29-2032.00 | 29-2032.00 | Yes | 5 |  |
| Anes / Obstetric | 29-1161.00 | 29-1161.00 | No | — | 29-1xxx excluded from pool by design |
| Anes / Perioperative Medicine | 11-9111.00 | 11-9111.00 | No | — |  |
| Neuroradiology | 19-1042.00 | 19-1042.00 | Yes | 2 |  |
| Musculoskeletal Radiology | 29-9091.00 | 29-9091.00 | No | — |  |
| Breast Imaging | 19-1042.00 | 19-1042.00 | Yes | 2 |  |
| Pediatric Radiology | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Abdominal/Body Imaging | 29-2034.00 | 29-2034.00 | Yes | 5 |  |
| Cardiothoracic Imaging | 29-2031.00 | 29-2031.00 | Yes | 1 |  |
| Interventional Radiology | 17-2112.00 | 17-2112.00 | No | — |  |
| Nuclear Medicine | 29-2033.00 | 29-2033.00 | Yes | 1 |  |
| Radiation Oncology | 17-2199.00 | 17-2199.00 | No | — |  |
| Surgical Pathology | 19-1042.00 | 19-1042.00 | Yes | 1 |  |
| Cytopathology | 19-1042.00 | 19-1042.00 | Yes | 1 |  |
| Dermatopathology (Path) | 27-1013.00 | 27-1013.00 | No | — |  |
| Neuropathology | 19-1042.00 | 19-1042.00 | Yes | 1 |  |
| Forensic Pathology | 19-4092.00 | 19-4092.00 | No | — |  |
| Clinical Pathology/Lab Medicine | 11-9121.00 | 11-9121.00 | Yes | 7 |  |
| Hematopathology | 19-1042.00 | 19-1042.00 | Yes | 1 |  |
| Clinical Chemistry | 19-2031.00 | 19-2031.00 | Yes | 7 |  |
| Microbiology (Path) | 19-1022.00 | 19-1022.00 | Yes | 1 |  |
| Blood Banking/Transfusion | 11-9121.00 | 11-9121.00 | Yes | 7 |  |
| Molecular Genetic Pathology | 15-2051.00 | 15-2051.00 | No | — |  |
| Clinical Informatics (Path) | 15-1252.00 | 15-1252.00 | No | — |  |
| Dermatopathology (Derm) | 19-1042.00 | 19-1042.00 | Yes | 4 |  |
| Mohs/Procedural Dermatology | 51-9071.00 | 51-9071.00 | No | — |  |
| Pediatric Dermatology | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Cosmetic Dermatology | 27-1013.00 | 27-1013.00 | No | — |  |
| Vascular Neurology/Stroke | 29-2041.00 | avg(29-2042.00,29-2043.00) | No | — | Flagged SOC — substitute used |
| Epilepsy/Clinical Neurophysiology | 17-2072.00 | 17-2072.00 | No | — |  |
| Neuromuscular Medicine | 19-1042.00 | 19-1042.00 | Yes | 9 |  |
| Movement Disorders | 19-1042.00 | 19-1042.00 | Yes | 9 |  |
| Behavioral Neurology/Neuropsychiatry | 19-3031.00 | 19-3033.00 | Yes | 5 | Flagged SOC — substitute used |
| Neuro-oncology | 19-1042.00 | 19-1042.00 | Yes | 9 |  |
| Headache Medicine | 21-1015.00 | 21-1015.00 | No | 20 |  |
| Neuroimmunology/MS | 19-1042.00 | 19-1042.00 | Yes | 9 |  |
| Autonomic Disorders | 17-2072.00 | 17-2072.00 | No | — |  |
| Sleep Medicine (Neuro) | 29-2099.00 | 29-2099.00 | No | — |  |
| Neurocritical Care | 29-1126.00 | 29-1126.00 | No | — | 29-1xxx excluded from pool by design |
| Pain Medicine (Neuro) | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Hospice & Palliative (Neuro) | 21-1022.00 | 21-1022.00 | No | 13 |  |
| Clinical Informatics (Neuro) | 15-1252.00 | 15-1252.00 | No | — |  |
| Maternal-Fetal Medicine | 29-2032.00 | 29-2032.00 | Yes | 7 |  |
| Reproductive Endocrinology/Infertility | 19-1042.00 | 19-1042.00 | Yes | 4 |  |
| Gynecologic Oncology | 19-1042.00 | 19-1042.00 | Yes | 4 |  |
| Female Pelvic Med/Recon Surgery | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Complex Family Planning | 21-1022.00 | 21-1022.00 | Yes | 10 |  |
| Minimally Invasive Gyn Surgery | 17-2112.00 | 17-2112.00 | No | — |  |
| Ophthalmology (general) | 29-1041.00 | 29-1041.00 | No | — | 29-1xxx excluded from pool by design |
| Retina/Vitreous | 29-2034.00 | 29-2034.00 | Yes | 9 |  |
| Glaucoma | 17-2112.00 | 17-2112.00 | Yes | 7 |  |
| Cornea/External Disease | 19-1042.00 | 19-1042.00 | Yes | 1 |  |
| Oculoplastics | 27-1013.00 | 27-1013.00 | No | — |  |
| Pediatric Ophthalmology/Strabismus | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Neuro-ophthalmology | 19-1042.00 | 19-1042.00 | Yes | 1 |  |
| PM&R (general) | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Spinal Cord Injury | 21-1015.00 | 21-1015.00 | Yes | 2 |  |
| Brain Injury | 21-1015.00 | 21-1015.00 | Yes | 2 |  |
| Pain Medicine (PM&R) | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
| Sports Medicine (PM&R) | 29-9091.00 | 29-9091.00 | Yes | 2 |  |
| Pediatric Rehab | 25-2054.00 | 25-2059.00 | No | — | Flagged SOC — substitute used |
| Neuromuscular (PM&R) | 17-2072.00 | 17-2072.00 | No | — |  |
| EMG/Electrodiagnostics | 17-2072.00 | 17-2072.00 | No | — |  |
| Cancer Rehab | 21-1015.00 | 21-1015.00 | Yes | 2 |  |
| Preventive Med/Public Health | 19-1041.00 | 19-1041.00 | Yes | 1 |  |
| Occupational Medicine | 13-1041.00 | 13-1041.00 | No | 13 |  |
| Aerospace Medicine | 17-2011.00 | 17-2011.00 | No | — |  |
| Undersea & Hyperbaric Medicine | 17-2199.00 | 17-2199.00 | No | — |  |
| Addiction Medicine (Prev) | 21-1011.00 | 21-1011.00 | Yes | 2 |  |
| Clinical Informatics (Prev) | 15-1252.00 | 15-1252.00 | No | — |  |
| Medical Toxicology (Prev) | 19-4092.00 | 19-4092.00 | Yes | 7 |  |
| Medical Genetics (general) | 29-9092.00 | 29-9092.00 | Yes | 1 |  |
| Biochemical Genetics | 19-2031.00 | 19-2031.00 | Yes | 3 |  |
| Molecular Genetics | 15-2051.00 | 15-2051.00 | No | — |  |
| Clinical Cytogenetics | 29-2010.00 | 29-2011.00 | Yes | 1 | Flagged SOC — substitute used |
| Pain Medicine (multidisciplinary) | 29-1123.00 | 29-1123.00 | No | — | 29-1xxx excluded from pool by design |
