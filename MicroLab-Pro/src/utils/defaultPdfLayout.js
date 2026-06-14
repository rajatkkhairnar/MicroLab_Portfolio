/**
 * defaultPdfLayout.js — Default PDF Layout Configuration
 * 
 * Defines the default layout structure that matches the current "modern"
 * template appearance. Used as:
 *   - Fallback when no saved pdfLayoutConfig exists (backward-compatible)
 *   - Reset-to-default target in the PdfLayoutDesigner
 * 
 * The layout config is stored in the settings table as JSON under key
 * 'pdfLayoutConfig'. Each section (header, footer, background, global)
 * contains an array of toggleable elements with styling properties.
 */

export const DEFAULT_PDF_LAYOUT = {
  header: {
    enabled: true,
    borderStyle: 'solid',       // 'solid' | 'double' | 'gradient' | 'none'
    borderColor: '#2563eb',
    elements: [
      { id: 'labName', label: 'Lab Name', enabled: true, fontSize: '20px', color: '#1e40af', fontWeight: '700' },
      { id: 'address', label: 'Address', enabled: true, fontSize: '12px', color: '#475569' },
      { id: 'labTiming', label: 'Lab Timing', enabled: true, fontSize: '12px', color: '#475569' },
      { id: 'phones', label: 'Phone Numbers', enabled: true, fontSize: '12px', color: '#64748b' },
      { id: 'labLogo', label: 'Lab Logo', enabled: true, position: 'right', size: '88px' },
    ]
  },
  background: {
    watermarkEnabled: true,
    watermarkOpacity: 0.10,
    watermarkSize: '50%',
    watermarkPosition: 'center',  // 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    pageBackground: '#ffffff'
  },
  footer: {
    enabled: true,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    elements: [
      { id: 'labAssistant', label: 'Lab Assistant', enabled: true, fontSize: '12px', color: '#1e293b' },
      { id: 'authorizedSignatory', label: 'Authorized Signatory', enabled: true, fontSize: '12px', color: '#64748b' },
      { id: 'labTechnician', label: 'Lab Technician', enabled: true, fontSize: '12px', color: '#1e293b' },
      { id: 'footerText', label: 'Footer Text', enabled: true, fontSize: '11px', color: '#94a3b8' },
    ]
  },
  global: {
    fontFamily: 'system',       // 'system' | 'inter' | 'roboto' | 'serif' | 'mono'
    accentColor: '#2563eb',
    bodyTextColor: '#1e293b'
  }
};

/**
 * Maps layout element IDs to their corresponding Lab Profile field keys.
 * Used by Settings.jsx to conditionally show/hide Lab Profile input fields
 * based on which layout elements are enabled.
 */
export const ELEMENT_TO_PROFILE_FIELDS = {
  labName: ['labName'],
  address: ['address'],
  labTiming: ['labTiming'],
  phones: ['phone', 'phone2'],
  labLogo: ['labLogo'],
  labAssistant: ['labAssistant'],
  labTechnician: ['labTechnician'],
  footerText: ['footerText'],
};

/**
 * Returns a deep clone of the default layout config.
 * Always use this to get a fresh copy to avoid mutation.
 */
export function getDefaultPdfLayout() {
  return JSON.parse(JSON.stringify(DEFAULT_PDF_LAYOUT));
}

/**
 * Given a pdfLayoutConfig, returns the set of Lab Profile field keys
 * that should be visible (i.e., their layout element is enabled).
 * Also always includes 'watermarkLogo' if background.watermarkEnabled is true.
 */
export function getVisibleProfileFields(config) {
  if (!config) return null; // null means "show all fields" (no config saved yet)

  const visibleFields = new Set();

  // Header elements
  if (config.header?.enabled) {
    (config.header.elements || []).forEach(el => {
      if (el.enabled && ELEMENT_TO_PROFILE_FIELDS[el.id]) {
        ELEMENT_TO_PROFILE_FIELDS[el.id].forEach(f => visibleFields.add(f));
      }
    });
  }

  // Footer elements
  if (config.footer?.enabled) {
    (config.footer.elements || []).forEach(el => {
      if (el.enabled && ELEMENT_TO_PROFILE_FIELDS[el.id]) {
        ELEMENT_TO_PROFILE_FIELDS[el.id].forEach(f => visibleFields.add(f));
      }
    });
  }

  // Watermark
  if (config.background?.watermarkEnabled) {
    visibleFields.add('watermarkLogo');
  }

  return visibleFields;
}

/**
 * Font family options for the global font selector.
 */
export const FONT_FAMILIES = [
  { id: 'system', label: 'System Default', css: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  { id: 'inter', label: 'Inter', css: "'Inter', sans-serif", googleFont: 'Inter' },
  { id: 'roboto', label: 'Roboto', css: "'Roboto', sans-serif", googleFont: 'Roboto' },
  { id: 'outfit', label: 'Outfit', css: "'Outfit', sans-serif", googleFont: 'Outfit' },
  { id: 'serif', label: 'Serif (Georgia)', css: "Georgia, 'Times New Roman', serif" },
  { id: 'mono', label: 'Monospace', css: "'Courier New', Courier, monospace" },
];
