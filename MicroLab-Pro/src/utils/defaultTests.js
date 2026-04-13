/**
 * defaultTests.js — Default Test Menu & Pricing
 * 
 * Baseline list of tests the lab offers, with default prices in INR.
 * This is used as the initial data source when no custom test pricing
 * has been configured in Settings → Test Settings.
 * 
 * Each test has: { id, name, price }
 * The 'name' must exactly match a key in testCatalog.js for parameter lookup.
 */
export const DEFAULT_TESTS = [
  { id: 1, name: 'Complete Blood Count (CBC)', price: 350 },
  { id: 2, name: 'Lipid Profile', price: 600 },

  { id: 4, name: 'Liver Function Test (LFT)', price: 450 },
  { id: 5, name: 'Kidney Function Test (KFT)', price: 500 },
  { id: 6, name: 'Blood Glucose (Fasting)', price: 100 },
  { id: 7, name: 'Blood Glucose (PP)', price: 100 },
  { id: 8, name: 'HbA1c', price: 400 },
  { id: 9, name: 'Urine Routine', price: 150 },
  { id: 10, name: 'Vitamin D Total', price: 1200 },
  { id: 11, name: 'Blood Group (ABO & Rh)', price: 150 },
  { id: 12, name: 'Dengue Test', price: 800 },
  { id: 13, name: 'HIV I & II (ELISA)', price: 500 },
  { id: 14, name: 'AEC Test', price: 150 },
  { id: 15, name: 'BT & CT Test', price: 150 },
  { id: 16, name: 'CRP Test', price: 300 },
  { id: 17, name: 'ESR Test', price: 100 },
  { id: 18, name: 'Malaria Parasite', price: 150 },
  { id: 19, name: 'RBS Test', price: 100 },
  { id: 20, name: 'Serum Calcium', price: 200 },
  { id: 21, name: 'HBsAg Test', price: 250 },
  { id: 22, name: 'RA Factor Test', price: 300 },
  { id: 23, name: 'Serum Electrolytes', price: 400 },
  { id: 24, name: 'Sickle Cell Test', price: 250 },
  { id: 25, name: 'Sugar with Urine Test', price: 200 },
  { id: 26, name: 'Total Bilirubin Test', price: 200 },
  { id: 27, name: 'Urea Test', price: 150 },
  { id: 28, name: 'Uric Acid Test', price: 150 },
  { id: 29, name: 'Urine Pregnancy Test', price: 150 },
  { id: 30, name: 'VDRL Test', price: 250 },
  { id: 31, name: 'Widal Test', price: 250 },
];
