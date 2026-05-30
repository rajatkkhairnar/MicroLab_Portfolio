/**
 * LicenseContext.jsx — License State Context
 *
 * Provides license information to all React components:
 *   - licenseExpired: boolean — true if the subscription has ended
 *   - licenseInfo: { licenseKey, plan, expiresAt, numRoles } — current license details
 *   - refreshLicense: () => void — re-fetch license info from main process
 *
 * Components use `useLicense()` hook to access license state and conditionally
 * disable write actions when the license is expired (soft-lock mode).
 *
 * Usage:
 *   const { licenseExpired } = useLicense();
 *   <button disabled={licenseExpired}>Add Patient</button>
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const LicenseContext = createContext(null);

export const LicenseProvider = ({ children }) => {
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [licenseExpired, setLicenseExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLicenseInfo = async () => {
    try {
      const info = await window.api.getLicenseInfo();
      if (info) {
        setLicenseInfo(info);
        setLicenseExpired(info.expired === true);
      } else {
        // No license info available (should not happen if app started correctly)
        setLicenseInfo(null);
        setLicenseExpired(false);
      }
    } catch (err) {
      console.error('Failed to fetch license info:', err);
      setLicenseExpired(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenseInfo();
  }, []);

  return (
    <LicenseContext.Provider
      value={{
        licenseInfo,
        licenseExpired,
        loading,
        refreshLicense: fetchLicenseInfo,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
};

/**
 * Hook to access license state.
 * @returns {{ licenseInfo: Object|null, licenseExpired: boolean, loading: boolean, refreshLicense: Function }}
 */
export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

export default LicenseContext;
