import { TEST_CATALOG } from './testCatalog';

/**
 * Returns the effective test parameters for a given test,
 * merging defaults from TEST_CATALOG with user overrides from testParamSettings.
 * 
 * - Respects enabled/disabled per parameter
 * - Uses custom reference ranges if set
 * - Respects custom parameter ordering via __paramOrder__
 * 
 * @param {string} testName - Name of the test (e.g. "Complete Blood Count (CBC)")
 * @param {Object} testParamSettings - User overrides from settings { testName: { paramName: { enabled, ref }, __paramOrder__: [...] } }
 * @returns {Array} - Filtered array of { name, unit, ref, type } objects
 */
export function getEffectiveParams(testName, testParamSettings = {}) {
  const defaultParams = TEST_CATALOG[testName] || [];
  const overrides = testParamSettings[testName] || {};
  const paramOrder = overrides.__paramOrder__;

  let params = defaultParams
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

  // Apply custom ordering if present
  if (Array.isArray(paramOrder) && paramOrder.length > 0) {
    params.sort((a, b) => {
      const idxA = paramOrder.indexOf(a.name);
      const idxB = paramOrder.indexOf(b.name);
      // Parameters not in the order array go to the end
      const posA = idxA === -1 ? paramOrder.length : idxA;
      const posB = idxB === -1 ? paramOrder.length : idxB;
      return posA - posB;
    });
  }

  return params;
}
