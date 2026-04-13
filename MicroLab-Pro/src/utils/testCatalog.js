/**
 * testCatalog.js — Medical Test Parameter Database
 * 
 * Defines the full list of test parameters, units, and reference ranges
 * for every test the lab can perform. This is the "ground truth" data source.
 * 
 * Used by:
 * - EnterResultsModal (to render input fields for each parameter)
 * - generateReportHTML (to display units and ref ranges in PDF reports)
 * - getEffectiveParams (to merge with user-customized settings)
 * 
 * To add a new test: add a new key to TEST_CATALOG with an array of
 * { name, unit, ref, type } objects.
 */

export const TEST_CATALOG = {
  // 1. HAEMATOLOGY (CBC)
  'Complete Blood Count (CBC)': [
    // Basic
    { name: 'Haemoglobin (Hb)', unit: 'g/dL', ref: 'M: 13-17, F: 12-15', type: 'number' },
    { name: 'Total WBC Count', unit: 'cells/cumm', ref: '4000 - 11000', type: 'number' },
    // Differential WBC Count
    { name: 'Neutrophils', unit: '%', ref: '40 - 70', type: 'number' },
    { name: 'Lymphocytes', unit: '%', ref: '20 - 40', type: 'number' },
    { name: 'Eosinophils', unit: '%', ref: '1 - 6', type: 'number' },
    { name: 'Monocytes', unit: '%', ref: '2 - 10', type: 'number' },
    { name: 'Basophils', unit: '%', ref: '0 - 1', type: 'number' },
    // Basic 2
    { name: 'Total RBC Count', unit: 'mill/cumm', ref: '4.5 - 5.5', type: 'number' },
    // RBC Indices
    { name: 'PCV / Haematocrit', unit: '%', ref: '40 - 50', type: 'number' },
    { name: 'MCV', unit: 'fL', ref: '83 - 101', type: 'number' },
    { name: 'MCH', unit: 'pg', ref: '27 - 32', type: 'number' },
    { name: 'MCHC', unit: 'g/dL', ref: '31.5 - 34.5', type: 'number' },
    { name: 'Platelet Count', unit: 'lakh/cumm', ref: '1.5 - 4.5', type: 'number' },
  ],

  // 2. BIOCHEMISTRY (Lipid Profile)
  'Lipid Profile': [
    { name: 'Total Cholesterol', unit: 'mg/dL', ref: '< 200', type: 'number' },
    { name: 'Triglycerides', unit: 'mg/dL', ref: '< 150', type: 'number' },
    { name: 'HDL Cholesterol', unit: 'mg/dL', ref: '> 40', type: 'number' },
    { name: 'LDL Cholesterol', unit: 'mg/dL', ref: '< 100', type: 'number' },
    { name: 'VLDL Cholesterol', unit: 'mg/dL', ref: '10 - 30', type: 'number' },
    { name: 'Total / HDL Ratio', unit: '', ref: '< 5.0', type: 'number' },
  ],



  // 4. LIVER (LFT)
  'Liver Function Test (LFT)': [
    { name: 'Bilirubin Total', unit: 'mg/dL', ref: '0.2 - 1.2', type: 'number' },
    { name: 'Bilirubin Direct', unit: 'mg/dL', ref: '0.0 - 0.3', type: 'number' },
    { name: 'Bilirubin Indirect', unit: 'mg/dL', ref: '0.2 - 0.9', type: 'number' },
    { name: 'SGOT (AST)', unit: 'U/L', ref: '5 - 40', type: 'number' },
    { name: 'SGPT (ALT)', unit: 'U/L', ref: '5 - 45', type: 'number' },
    { name: 'Alkaline Phosphatase', unit: 'U/L', ref: '40 - 150', type: 'number' },
    { name: 'Total Protein', unit: 'g/dL', ref: '6.0 - 8.0', type: 'number' },
    { name: 'Albumin', unit: 'g/dL', ref: '3.5 - 5.5', type: 'number' },
    { name: 'Globulin', unit: 'g/dL', ref: '2.0 - 3.5', type: 'number' },
    { name: 'A/G Ratio', unit: '', ref: '1.2 - 2.2', type: 'number' },
  ],

  // 5. KIDNEY (KFT)
  'Kidney Function Test (KFT)': [
    { name: 'Blood Urea', unit: 'mg/dL', ref: '15 - 45', type: 'number' },
    { name: 'Serum Creatinine', unit: 'mg/dL', ref: '0.6 - 1.2', type: 'number' },
    { name: 'Uric Acid', unit: 'mg/dL', ref: '3.5 - 7.2', type: 'number' },
    { name: 'Sodium (Na+)', unit: 'mmol/L', ref: '135 - 145', type: 'number' },
    { name: 'Potassium (K+)', unit: 'mmol/L', ref: '3.5 - 5.1', type: 'number' },
    { name: 'Chloride (Cl-)', unit: 'mmol/L', ref: '98 - 107', type: 'number' },
  ],

  // 6. GLUCOSE
  'Blood Glucose (Fasting)': [{ name: 'Fasting Blood Sugar', unit: 'mg/dL', ref: '70 - 110', type: 'number' }],
  'Blood Glucose (PP)': [{ name: 'Post Prandial Blood Sugar', unit: 'mg/dL', ref: '< 140', type: 'number' }],
  'HbA1c': [{ name: 'HbA1c', unit: '%', ref: '< 5.7', type: 'number' }, { name: 'Est. Avg Glucose', unit: 'mg/dL', ref: '', type: 'number' }],

  // 7. OTHERS
  'Urine Routine': [
    { name: 'Color', unit: '', ref: 'Pale Yellow', type: 'text' },
    { name: 'Appearance', unit: '', ref: 'Clear', type: 'text' },
    { name: 'pH', unit: '', ref: '5.0 - 8.0', type: 'number' },
    { name: 'Specific Gravity', unit: '', ref: '1.010 - 1.030', type: 'number' },
    { name: 'Protein/Albumin', unit: '', ref: 'Nil', type: 'text' },
    { name: 'Sugar/Glucose', unit: '', ref: 'Nil', type: 'text' },
    { name: 'Pus Cells', unit: '/hpf', ref: '0 - 5', type: 'text' },
    { name: 'Epithelial Cells', unit: '/hpf', ref: 'Few', type: 'text' },
  ],
  'Vitamin D Total': [{ name: '25-OH Vitamin D', unit: 'ng/mL', ref: '30 - 100', type: 'number' }],

  // 8. BLOOD GROUP
  'Blood Group (ABO & Rh)': [
    { name: 'ABO Group', unit: '', ref: 'A / B / AB / O', type: 'text' },
    { name: 'Rh Factor (D)', unit: '', ref: 'Positive / Negative', type: 'text' },
  ],

  // 9. DENGUE
  'Dengue Test': [
    { name: 'NS1', unit: '', ref: 'Negative', type: 'text' },
    { name: 'IgG', unit: '', ref: 'Negative', type: 'text' },
    { name: 'IgM', unit: '', ref: 'Negative', type: 'text' },
  ],

  // 10. HIV
  'HIV I & II (ELISA)': [
    { name: 'HIV I Antibody', unit: '', ref: 'Non-Reactive', type: 'text' },
    { name: 'HIV II Antibody', unit: '', ref: 'Non-Reactive', type: 'text' },
    { name: 'HIV Combo (p24 Ag + Ab)', unit: '', ref: 'Non-Reactive', type: 'text' },
  ],

  // newly added tests from Demo Reports
  'AEC Test': [
    { name: 'AEC (Absolute Eosinophil Count)', unit: '/CUMM', ref: '40 TO 440', type: 'number' }
  ],
  'BT & CT Test': [
    { name: 'BT (Bleeding Time)', unit: 'min', ref: '2.00 TO 5.00', type: 'text' },
    { name: 'CT (Clotting Time)', unit: 'min', ref: '3.00 TO 8.00', type: 'text' }
  ],
  'CRP Test': [
    { name: 'CRP', unit: 'mg/l', ref: 'UP TO 6.0', type: 'number' }
  ],
  'ESR Test': [
    { name: 'ESR', unit: 'mm/hr', ref: '05 TO 20', type: 'number' }
  ],
  'Malaria Parasite': [
    { name: 'Malaria Parasite (MP)', unit: '', ref: 'Negative', type: 'text' }
  ],
  'RBS Test': [
    { name: 'RBS', unit: 'mg/dl', ref: '70 TO 140', type: 'number' }
  ],
  'Serum Calcium': [
    { name: 'S. Calcium', unit: 'mg/dl', ref: '8.00 TO 11.00', type: 'number' }
  ],
  'HBsAg Test': [
    { name: 'HBsAg', unit: '', ref: 'Non-Reactive', type: 'text' }
  ],
  'RA Factor Test': [
    { name: 'RA Factor', unit: '', ref: 'Non-Reactive', type: 'text' }
  ],
  'Serum Electrolytes': [
    { name: 'Sodium (Na+)', unit: 'mmol/L', ref: '136 - 145', type: 'number' },
    { name: 'Potassium (K+)', unit: 'mmol/L', ref: '3.5 - 5.1', type: 'number' },
    { name: 'Calcium (Ca)', unit: 'mg/dl', ref: '8.0 - 11.0', type: 'number' }
  ],
  'Sickle Cell Test': [
    { name: 'Sickle Cell', unit: '', ref: 'Negative', type: 'text' }
  ],
  'Sugar with Urine Test': [
    { name: 'FBS', unit: 'mg/dl', ref: '70 TO 110', type: 'number' },
    { name: 'Fasting Urine Sugar', unit: '', ref: 'NIL', type: 'text' },
    { name: 'PP2BS', unit: 'mg/dl', ref: '70 TO 140', type: 'number' },
    { name: 'Post Prandial Urine Sugar', unit: '', ref: 'NIL', type: 'text' }
  ],
  'Total Bilirubin Test': [
    { name: 'Total Bilirubin', unit: 'mg/dl', ref: '0.2 TO 1.2', type: 'number' },
    { name: 'Direct Bilirubin', unit: 'mg/dl', ref: '0.0 to 0.4', type: 'number' },
    { name: 'Indirect Bilirubin', unit: 'mg/dl', ref: '0.0 to 0.4', type: 'number' }
  ],
  'Urea Test': [
    { name: 'Urea', unit: 'mg/dl', ref: '12 TO 42', type: 'number' }
  ],
  'Uric Acid Test': [
    { name: 'Uric Acid', unit: 'mg/dl', ref: '3.5 TO 7.5', type: 'number' }
  ],
  'Urine Pregnancy Test': [
    { name: 'Urine Pregnancy Test (UPT)', unit: '', ref: 'Negative', type: 'text' }
  ],
  'VDRL Test': [
    { name: 'VDRL', unit: '', ref: 'Non-Reactive', type: 'text' }
  ],
  'Widal Test': [
    { name: "S.TYPHI 'O'", unit: '', ref: 'NEGATIVE', type: 'text' },
    { name: "S.TYPHI 'H'", unit: '', ref: 'NEGATIVE', type: 'text' },
    { name: 'Overall Result', unit: '', ref: 'NEGATIVE', type: 'text' }
  ],
};