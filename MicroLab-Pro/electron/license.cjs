/**
 * license.cjs — License Management Module (Electron Main Process)
 *
 * Handles all license operations for MicroLab Pro:
 *   - activateLicense: Bind a license key to this machine
 *   - validateLicense: Check if the current license is valid (local JWT + server refresh)
 *   - deactivateLicense: Revoke this machine's activation
 *   - getLicenseInfo: Read the current license state from disk
 *
 * License state is persisted in <userData>/license.json.
 *
 * Offline grace period:
 *   - JWT is validated locally first (no network needed)
 *   - If JWT is within 3 days of expiry OR >7 days old → tries server refresh
 *   - If server unreachable but JWT still valid → allows (30-day offline grace)
 *   - If JWT expired AND server unreachable → blocks
 *
 * Security:
 *   - License check happens ONLY in the main process, never the renderer
 *   - The renderer only receives the result (plan, expired status, etc.)
 *   - API_KEY and SIGNING_SECRET are bundled as build-time constants
 */
const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { machineIdSync } = require('node-machine-id');

// ─── Configuration ──────────────────────────────────────────────────

// These should be set via environment or build-time constants
// In production, inject via Vite's define config or .env
const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.LICENSE_API_KEY || '1L8v1k1TL0TIEHKFpp4QzSpY56tEPOQS';
const SIGNING_SECRET = process.env.LICENSE_SIGNING_SECRET || 'YgNdpRUdTaL85bjXCcP4G7RjoE65xr3oUZ3j7WFriA61mPs2B9Hfy3LmioVIbs9W';

// ─── Constants ──────────────────────────────────────────────────────

const GRACE_PERIOD_DAYS = 30;       // How long the app works offline after JWT expires
const REFRESH_THRESHOLD_DAYS = 7;   // Refresh if last validated > 7 days ago
const EXPIRY_BUFFER_DAYS = 3;       // Refresh if JWT expires within 3 days

// ─── File Path ──────────────────────────────────────────────────────

/**
 * Returns the path to the license.json file.
 * In production: <userData>/license.json (persists across updates)
 * In development: ./license.json (project root)
 */
function getLicenseFilePath() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    return path.join(__dirname, '..', 'license.json');
  }
  return path.join(app.getPath('userData'), 'license.json');
}

// ─── File I/O ───────────────────────────────────────────────────────

/**
 * Reads the license.json file.
 * @returns {Object|null} License data or null if file doesn't exist
 */
function readLicenseFile() {
  try {
    const filePath = getLicenseFilePath();
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read license file:', err.message);
    return null;
  }
}

/**
 * Writes license data to license.json.
 * @param {Object} data - License data to persist
 */
function writeLicenseFile(data) {
  try {
    const filePath = getLicenseFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write license file:', err.message);
  }
}

/**
 * Deletes the license.json file.
 */
function deleteLicenseFile() {
  try {
    const filePath = getLicenseFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Failed to delete license file:', err.message);
  }
}

// ─── Hardware ID ────────────────────────────────────────────────────

/**
 * Gets a stable hardware fingerprint for this machine.
 * Uses node-machine-id which generates an ID based on the OS install.
 * @returns {string} Machine ID
 */
function getMachineId() {
  try {
    return machineIdSync(true); // true = use original value (not hashed)
  } catch (err) {
    console.error('Failed to get machine ID:', err.message);
    // Fallback to a hostname-based ID
    const os = require('os');
    return `fallback-${os.hostname()}-${os.platform()}`;
  }
}

// ─── HTTP Client ────────────────────────────────────────────────────

/**
 * Creates an axios instance configured for the license server.
 */
const apiClient = axios.create({
  baseURL: LICENSE_SERVER_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// ─── License Operations ─────────────────────────────────────────────

/**
 * Activate a license key on this machine.
 *
 * @param {string} licenseKey - The license key (e.g., MLAB-XXXX-XXXX-XXXX)
 * @returns {Object} { success, plan, expiresAt, numRoles } or { success: false, error }
 */
async function activateLicense(licenseKey) {
  try {
    const machineId = getMachineId();
    const os = require('os');
    const machineLabel = os.hostname();

    const response = await apiClient.post('/api/license/activate', {
      licenseKey: licenseKey.toUpperCase().trim(),
      machineId,
      machineLabel,
    });

    const { token, plan, expiresAt, numRoles } = response.data;

    // Persist to disk
    writeLicenseFile({
      licenseKey: licenseKey.toUpperCase().trim(),
      token,
      plan,
      numRoles: numRoles || 2,
      expiresAt,
      tokenExpiresAt: getTokenExpiry(token),
      lastValidatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      plan,
      expiresAt,
      numRoles: numRoles || 2,
    };
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message || 'Activation failed';
    const reason = err.response?.data?.reason || 'unknown';
    console.error('License activation failed:', errorMsg);
    return { success: false, error: errorMsg, reason };
  }
}

/**
 * Validate the current license.
 *
 * Logic:
 *   1. Read license.json — if missing, return not_activated
 *   2. Verify JWT signature locally
 *   3. If JWT valid and not near expiry → return valid immediately (no network)
 *   4. If JWT near expiry or old → try server refresh
 *   5. If server unreachable but within grace period → allow
 *   6. If license expiresAt has passed → return expired (soft-lock mode)
 *
 * @returns {Object} { valid, plan, expiresAt, expired, numRoles, reason? }
 */
async function validateLicense() {
  const licenseData = readLicenseFile();

  // --- No license file → not activated ---
  if (!licenseData || !licenseData.token) {
    return { valid: false, reason: 'not_activated' };
  }

  const { token, licenseKey, plan, expiresAt, numRoles, lastValidatedAt } = licenseData;

  // --- Verify JWT signature locally ---
  let decoded;
  try {
    decoded = jwt.verify(token, SIGNING_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // JWT expired — check grace period
      return await handleExpiredToken(licenseData);
    }
    // Invalid signature
    return { valid: false, reason: 'invalid_token' };
  }

  // --- Check subscription expiry (different from JWT expiry) ---
  if (expiresAt && new Date(expiresAt) < new Date()) {
    // Subscription expired → soft-lock mode
    // Try to refresh with server in case vendor extended it
    const refreshResult = await tryServerRefresh(licenseData);
    if (refreshResult && refreshResult.valid) {
      // Vendor extended the license!
      return refreshResult;
    }
    return {
      valid: true,
      expired: true, // Soft-lock flag
      plan,
      expiresAt,
      numRoles: numRoles || 2,
    };
  }

  // --- JWT is valid. Check if we need to refresh ---
  const needsRefresh = shouldRefresh(decoded, lastValidatedAt);

  if (needsRefresh) {
    const refreshResult = await tryServerRefresh(licenseData);
    if (refreshResult) {
      return refreshResult;
    }
    // Server unreachable — continue with local JWT (it's still valid)
  }

  // --- All good ---
  return {
    valid: true,
    expired: false,
    plan,
    expiresAt,
    numRoles: numRoles || 2,
  };
}

/**
 * Deactivate the license from this machine.
 * Calls the server to revoke the activation, then deletes local license file.
 *
 * @returns {Object} { success } or { success: false, error }
 */
async function deactivateLicense() {
  const licenseData = readLicenseFile();

  if (!licenseData) {
    return { success: false, error: 'No active license found.' };
  }

  try {
    const machineId = getMachineId();
    await apiClient.post('/api/license/deactivate', {
      licenseKey: licenseData.licenseKey,
      machineId,
    });
  } catch (err) {
    console.warn('Server deactivation failed (continuing with local cleanup):', err.message);
    // Still delete local file even if server is unreachable
  }

  deleteLicenseFile();
  return { success: true };
}

/**
 * Get the current license info (for display in Settings page).
 *
 * @returns {Object|null} { licenseKey, plan, expiresAt, numRoles, expired } or null
 */
function getLicenseInfo() {
  const licenseData = readLicenseFile();
  if (!licenseData) return null;

  const expired = licenseData.expiresAt
    ? new Date(licenseData.expiresAt) < new Date()
    : false;

  return {
    licenseKey: licenseData.licenseKey,
    plan: licenseData.plan,
    expiresAt: licenseData.expiresAt,
    numRoles: licenseData.numRoles || 2,
    expired,
  };
}

// ─── Helper Functions ───────────────────────────────────────────────

/**
 * Extracts the expiry date from a JWT token.
 * @param {string} token
 * @returns {string|null} ISO date string
 */
function getTokenExpiry(token) {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000).toISOString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Determines if we should refresh the license with the server.
 * @param {Object} decoded - Decoded JWT payload
 * @param {string} lastValidatedAt - ISO date of last server validation
 * @returns {boolean}
 */
function shouldRefresh(decoded, lastValidatedAt) {
  const now = Date.now();

  // JWT expiring within 3 days?
  if (decoded.exp) {
    const expiresIn = decoded.exp * 1000 - now;
    const bufferMs = EXPIRY_BUFFER_DAYS * 24 * 60 * 60 * 1000;
    if (expiresIn < bufferMs) return true;
  }

  // Last validated more than 7 days ago?
  if (lastValidatedAt) {
    const lastValidated = new Date(lastValidatedAt).getTime();
    const thresholdMs = REFRESH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
    if (now - lastValidated > thresholdMs) return true;
  }

  return false;
}

/**
 * Tries to refresh the license status with the server.
 * On success, updates the local license file with fresh data.
 *
 * @param {Object} licenseData - Current license data from file
 * @returns {Object|null} Updated validation result, or null if server unreachable
 */
async function tryServerRefresh(licenseData) {
  try {
    const machineId = getMachineId();
    const response = await apiClient.post('/api/license/validate', {
      licenseKey: licenseData.licenseKey,
      machineId,
    });

    if (response.data.valid) {
      // Update local file with fresh data
      const updatedData = {
        ...licenseData,
        plan: response.data.plan,
        expiresAt: response.data.expiresAt,
        numRoles: response.data.numRoles || licenseData.numRoles,
        lastValidatedAt: new Date().toISOString(),
      };

      // Update token if server returned a fresh one
      if (response.data.token) {
        updatedData.token = response.data.token;
        updatedData.tokenExpiresAt = getTokenExpiry(response.data.token);
      }

      writeLicenseFile(updatedData);

      // Check subscription expiry with the FRESH data from server
      const expired = updatedData.expiresAt
        ? new Date(updatedData.expiresAt) < new Date()
        : false;

      return {
        valid: true,
        expired,
        plan: updatedData.plan,
        expiresAt: updatedData.expiresAt,
        numRoles: updatedData.numRoles,
      };
    } else {
      // Server says invalid
      return {
        valid: false,
        reason: response.data.reason || 'server_rejected',
      };
    }
  } catch (err) {
    console.warn('License server unreachable:', err.message);
    return null; // Server unreachable — caller handles fallback
  }
}

/**
 * Handles the case where the JWT token has expired.
 * Checks the offline grace period.
 *
 * @param {Object} licenseData - Current license data from file
 * @returns {Object} Validation result
 */
async function handleExpiredToken(licenseData) {
  // Try server refresh first
  const refreshResult = await tryServerRefresh(licenseData);
  if (refreshResult) return refreshResult;

  // Server unreachable — check grace period
  const lastValidated = new Date(licenseData.lastValidatedAt || 0).getTime();
  const graceMs = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (now - lastValidated < graceMs) {
    // Within grace period — allow but with expired flag if subscription expired
    const expired = licenseData.expiresAt
      ? new Date(licenseData.expiresAt) < new Date()
      : false;

    return {
      valid: true,
      expired,
      plan: licenseData.plan,
      expiresAt: licenseData.expiresAt,
      numRoles: licenseData.numRoles || 2,
      offlineGrace: true,
    };
  }

  // Grace period exceeded
  return { valid: false, reason: 'grace_period_expired' };
}

// ─── Exports ────────────────────────────────────────────────────────

module.exports = {
  activateLicense,
  validateLicense,
  deactivateLicense,
  getLicenseInfo,
  getMachineId,
};
