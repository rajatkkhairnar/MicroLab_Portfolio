import { TEST_CATALOG } from './testCatalog';

/**
 * Returns the effective test parameters for a given test,
 * merging defaults from TEST_CATALOG with user overrides from testParamSettings.
 * 
 * - Respects enabled/disabled per parameter
 * - Uses custom reference ranges if set
 * 
 * @param {string} testName - Name of the test (e.g. "Complete Blood Count (CBC)")
 * @param {Object} testParamSettings - User overrides from settings { testName: { paramName: { enabled, ref } } }
 * @returns {Array} - Filtered array of { name, unit, ref, type } objects
 */
export function getEffectiveParams(testName, testParamSettings = {}) {
  const defaultParams = TEST_CATALOG[testName] || [];
  const overrides = testParamSettings[testName] || {};

  return defaultParams
    .filter(param => {
      // If user explicitly disabled this parameter, exclude it
      const override = overrides[param.name];
      if (override && override.enabled === false) return false;
      return true;
    })
    .map(param => {
      const override = overrides[param.name];
      return {
        ...param,
        // Use custom ref range if set, otherwise keep default
        ref: (override && override.ref !== undefined) ? override.ref : param.ref,
      };
    });
}
