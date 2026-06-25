/**
 * PdfLayoutDesigner.jsx — PDF Report Layout Customization
 * 
 * A visual configuration panel that lets lab owners customize their
 * PDF report layout — header elements, footer elements, watermark/background,
 * and global text styling — with a live A4 preview.
 * 
 * Features:
 *   - Toggle header/footer elements on/off
 *   - Reorder elements via up/down buttons
 *   - Per-element styling: font size, color
 *   - Header/footer border style & color
 *   - Watermark opacity, size, position
 *   - Global font family and accent color
 *   - Real-time A4 preview with placeholder data
 *   - Reset to default layout
 * 
 * The layout config is stored as JSON in the settings table under key
 * 'pdfLayoutConfig'. See defaultPdfLayout.js for the schema.
 */
import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Save,
  Loader2,
  Palette,
  Type,
  Image,
  Layout,
  ArrowUp,
  ArrowDown,
  Settings2,
  AlertTriangle,
} from 'lucide-react';
import { DEFAULT_PDF_LAYOUT, getDefaultPdfLayout, FONT_FAMILIES } from '../utils/defaultPdfLayout';

const PdfLayoutDesigner = ({ layoutConfig, onSave, saving }) => {
  const [config, setConfig] = useState(() =>
    layoutConfig ? JSON.parse(JSON.stringify(layoutConfig)) : getDefaultPdfLayout()
  );
  const [expandedSection, setExpandedSection] = useState('header');
  const [expandedElement, setExpandedElement] = useState(null);

  // --- Helpers ---
  const updateConfig = (path, value) => {
    setConfig(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const updateElement = (section, elementIndex, field, value) => {
    setConfig(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[section].elements[elementIndex][field] = value;
      return updated;
    });
  };

  const moveElement = (section, index, direction) => {
    setConfig(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const elements = updated[section].elements;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= elements.length) return prev;
      [elements[index], elements[newIndex]] = [elements[newIndex], elements[index]];
      return updated;
    });
  };

  const handleReset = () => {
    if (confirm('Reset layout to default? All customizations will be lost.')) {
      setConfig(getDefaultPdfLayout());
    }
  };

  const handleSave = () => {
    onSave(config);
  };

  // --- Style Constants ---
  const sectionBtnClass = (section) =>
    `flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all w-full text-left ${
      expandedSection === section
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
    }`;

  const colorInput = (value, onChange) => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-slate-600 bg-transparent"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 font-mono outline-none focus:border-blue-500"
      />
    </div>
  );

  // --- Render Element Row ---
  const renderElementRow = (section, element, index, totalCount) => {
    const isExpanded = expandedElement === `${section}-${element.id}`;

    return (
      <div
        key={element.id}
        className={`border rounded-lg transition-all ${
          element.enabled
            ? 'border-slate-600 bg-slate-800/50'
            : 'border-slate-700/50 bg-slate-900/30 opacity-60'
        }`}
      >
        {/* Element Header */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Toggle */}
          <button
            onClick={() => updateElement(section, index, 'enabled', !element.enabled)}
            className={`p-1 rounded transition-colors ${
              element.enabled
                ? 'text-emerald-400 hover:bg-emerald-900/30'
                : 'text-slate-600 hover:bg-slate-700'
            }`}
            title={element.enabled ? 'Disable' : 'Enable'}
          >
            {element.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          {/* Label */}
          <span className={`flex-1 text-sm font-medium ${element.enabled ? 'text-slate-200' : 'text-slate-500'}`}>
            {element.label}
          </span>

          {/* Reorder buttons */}
          <div className="flex gap-0.5">
            <button
              onClick={() => moveElement(section, index, -1)}
              disabled={index === 0}
              className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-slate-700 transition-colors"
              title="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => moveElement(section, index, 1)}
              disabled={index === totalCount - 1}
              className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-slate-700 transition-colors"
              title="Move down"
            >
              <ArrowDown size={14} />
            </button>
          </div>

          {/* Expand config */}
          {element.enabled && element.id !== 'authorizedSignatory' && (
            <button
              onClick={() => setExpandedElement(isExpanded ? null : `${section}-${element.id}`)}
              className={`p-1 rounded transition-colors ${
                isExpanded ? 'text-blue-400 bg-blue-900/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
              }`}
              title="Configure style"
            >
              <Settings2 size={14} />
            </button>
          )}
        </div>

        {/* Expanded Config Panel */}
        {isExpanded && element.enabled && (
          <div className="px-4 pb-3 pt-1 border-t border-slate-700/50 space-y-3">
            {/* Font Size (for text elements) */}
            {element.fontSize !== undefined && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-20 flex-shrink-0">Font Size</label>
                <select
                  value={element.fontSize}
                  onChange={(e) => updateElement(section, index, 'fontSize', e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
                >
                  {['9px','10px','11px','12px','13px','14px','16px','18px','20px','22px','24px','28px','32px'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Color (for text elements) */}
            {element.color !== undefined && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-20 flex-shrink-0">Color</label>
                {colorInput(element.color, (v) => updateElement(section, index, 'color', v))}
              </div>
            )}

            {/* Font Weight (for labName) */}
            {element.fontWeight !== undefined && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-20 flex-shrink-0">Weight</label>
                <select
                  value={element.fontWeight}
                  onChange={(e) => updateElement(section, index, 'fontWeight', e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
                >
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra Bold</option>
                </select>
              </div>
            )}

            {/* Position (for labLogo) */}
            {element.position !== undefined && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-20 flex-shrink-0">Position</label>
                <div className="flex gap-1">
                  {['left', 'right'].map(pos => (
                    <button
                      key={pos}
                      onClick={() => updateElement(section, index, 'position', pos)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        element.position === pos
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size (for labLogo) */}
            {element.size !== undefined && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-20 flex-shrink-0">Logo Size</label>
                <select
                  value={element.size}
                  onChange={(e) => updateElement(section, index, 'size', e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
                >
                  {['48px','56px','64px','72px','80px','88px','96px','108px','120px'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ===================================================
  // LIVE PREVIEW
  // ===================================================
  const renderPreview = () => {
    const fontCss = FONT_FAMILIES.find(f => f.id === config.global.fontFamily)?.css || FONT_FAMILIES[0].css;
    const logoEl = config.header.elements.find(e => e.id === 'labLogo');
    const logoPosition = logoEl?.position || 'right';
    const logoSize = logoEl?.size || '88px';
    const logoEnabled = logoEl?.enabled && config.header.enabled;

    // Build header elements in order (excluding logo — it's positioned separately)
    const headerTextElements = config.header.enabled
      ? config.header.elements.filter(e => e.id !== 'labLogo' && e.enabled)
      : [];

    const footerElements = config.footer.enabled
      ? config.footer.elements.filter(e => e.enabled)
      : [];

    // Watermark
    const wmEnabled = config.background.watermarkEnabled;
    const wmOpacity = config.background.watermarkOpacity;
    const wmSize = config.background.watermarkSize;

    // Header border
    const headerBorder = config.header.enabled
      ? config.header.borderStyle === 'solid' ? `2px solid ${config.header.borderColor}`
        : config.header.borderStyle === 'double' ? `4px double ${config.header.borderColor}`
        : config.header.borderStyle === 'gradient' ? `2px solid ${config.header.borderColor}`
        : 'none'
      : 'none';

    // Footer border
    const footerBorder = config.footer.enabled
      ? config.footer.borderStyle === 'solid' ? `1px solid ${config.footer.borderColor}`
        : config.footer.borderStyle === 'double' ? `3px double ${config.footer.borderColor}`
        : 'none'
      : 'none';

    const previewTextForElement = (el) => {
      switch (el.id) {
        case 'labName': return 'MICROLAB PRO DIAGNOSTICS';
        case 'address': return 'Near City Hospital, Main Road\nMumbai, Maharashtra 400001';
        case 'labTiming': return 'Mon-Sat: 8:00 AM - 8:00 PM';
        case 'phones': return '📞 9876543210  📞 9876543211';
        case 'labAssistant': return 'Lab Assistant\nA.K. Kokani (DMLT)';
        case 'labTechnician': return 'Lab Technician\nP.H. Rana (M.SC.MLT)';
        case 'authorizedSignatory': return 'Authorized Signatory';
        case 'footerText': return '*** End of Report ***';
        default: return el.label;
      }
    };

    return (
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 sticky top-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={14} className="text-blue-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Live Preview</span>
        </div>

        {/* A4 Preview (scaled down) */}
        <div
          className="relative mx-auto shadow-2xl overflow-hidden"
          style={{
            width: '280px',
            height: '396px', // A4 ratio
            background: config.background.pageBackground,
            fontFamily: fontCss,
            fontSize: '5px',
            color: config.global.bodyTextColor,
            borderRadius: '4px',
          }}
        >
          {/* Watermark */}
          {wmEnabled && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: wmOpacity,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <div
                style={{
                  width: wmSize,
                  height: wmSize,
                  background: `linear-gradient(135deg, ${config.global.accentColor}22, ${config.global.accentColor}08)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: config.global.accentColor,
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                LOGO
              </div>
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', padding: '10px 12px' }}>
            {/* HEADER */}
            {config.header.enabled && (
              <div style={{ borderBottom: headerBorder, paddingBottom: '6px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Text side */}
                  <div style={{ flex: 1, order: logoPosition === 'left' ? 2 : 1 }}>
                    {headerTextElements.map(el => (
                      <div
                        key={el.id}
                        style={{
                          fontSize: `calc(${el.fontSize} * 0.38)`,
                          color: el.color,
                          fontWeight: el.fontWeight || '400',
                          marginBottom: '1px',
                          whiteSpace: el.id === 'address' ? 'pre-line' : 'normal',
                          lineHeight: 1.3,
                          textTransform: el.id === 'labName' ? 'uppercase' : 'none',
                          letterSpacing: el.id === 'labName' ? '0.3px' : 'normal',
                        }}
                      >
                        {previewTextForElement(el)}
                      </div>
                    ))}
                  </div>

                  {/* Logo */}
                  {logoEnabled && (
                    <div
                      style={{
                        width: `calc(${logoSize} * 0.34)`,
                        height: `calc(${logoSize} * 0.34)`,
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '5px',
                        color: '#94a3b8',
                        flexShrink: 0,
                        order: logoPosition === 'left' ? 1 : 2,
                        marginLeft: logoPosition === 'right' ? '6px' : '0',
                        marginRight: logoPosition === 'left' ? '6px' : '0',
                      }}
                    >
                      Logo
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PATIENT INFO (always shown as placeholder) */}
            <div
              style={{
                border: `1px solid ${config.global.accentColor}30`,
                borderRadius: '3px',
                padding: '4px 5px',
                marginBottom: '6px',
                fontSize: '4.5px',
                background: `${config.global.accentColor}06`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong style={{ color: '#64748b' }}>Patient:</strong> <strong>John Doe</strong></span>
                <span><strong style={{ color: '#64748b' }}>Age/Sex:</strong> 35 Y / Male</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
                <span><strong style={{ color: '#64748b' }}>Ref. By:</strong> Dr. Sharma</span>
                <span><strong style={{ color: '#64748b' }}>Date:</strong> 13 Jun 2026</span>
              </div>
            </div>

            {/* TEST RESULTS (placeholder) */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '5px',
                  fontWeight: 700,
                  color: config.global.accentColor,
                  borderBottom: `1px solid ${config.global.accentColor}40`,
                  paddingBottom: '2px',
                  marginBottom: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}
              >
                Complete Blood Count (CBC)
              </div>
              {/* Table header */}
              <div style={{ display: 'flex', fontSize: '4px', color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5px', marginBottom: '2px' }}>
                <span style={{ width: '42%' }}>Investigation</span>
                <span style={{ width: '20%', fontWeight: 700, color: '#1e293b' }}>Value</span>
                <span style={{ width: '16%' }}>Unit</span>
                <span style={{ width: '22%' }}>Ref. Range</span>
              </div>
              {/* Placeholder rows — some show abnormal high/low colors */}
              {[
                ['Haemoglobin', '14.2', 'g/dL', '13.0 - 17.0', null],
                ['Total WBC Count', '7,200', '/cumm', '4,000 - 11,000', null],
                ['Neutrophils', '62', '%', '40 - 75', null],
                ['Lymphocytes', '18 *', '%', '20 - 45', 'low'],
                ['Platelet Count', '5.2 *', 'L/cumm', '1.5 - 4.0', 'high'],
                ['RBC Count', '5.1', 'M/cumm', '4.5 - 5.5', null],
                ['PCV', '42', '%', '40 - 50', null],
              ].map(([name, val, unit, ref, abnormal], i) => (
                <div key={i} style={{ display: 'flex', fontSize: '4px', padding: '1px 0', color: config.global.bodyTextColor }}>
                  <span style={{ width: '42%' }}>{name}</span>
                  <span style={{
                    width: '20%',
                    fontWeight: 700,
                    color: abnormal === 'high'
                      ? (config.global.abnormalHighColor || '#dc2626')
                      : abnormal === 'low'
                        ? (config.global.abnormalLowColor || '#2563eb')
                        : config.global.bodyTextColor
                  }}>{val}</span>
                  <span style={{ width: '16%', color: '#64748b' }}>{unit}</span>
                  <span style={{ width: '22%', color: '#64748b' }}>{ref}</span>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            {config.footer.enabled && (
              <div style={{ borderTop: footerBorder, paddingTop: '5px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3px' }}>
                  {footerElements.filter(e => ['labAssistant', 'authorizedSignatory', 'labTechnician'].includes(e.id)).map(el => (
                    <div
                      key={el.id}
                      style={{
                        textAlign: el.id === 'labAssistant' ? 'left' : el.id === 'labTechnician' ? 'right' : 'center',
                        fontSize: `calc(${el.fontSize} * 0.36)`,
                        color: el.color,
                        flex: 1,
                      }}
                    >
                      {el.id === 'authorizedSignatory' ? (
                        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{previewTextForElement(el)}</span>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 700 }}>{el.label}</div>
                          <div style={{ fontSize: `calc(${el.fontSize} * 0.34)`, marginTop: '0.5px' }}>
                            {el.id === 'labAssistant' ? 'A.K. Kokani' : 'P.H. Rana'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer text */}
                {footerElements.find(e => e.id === 'footerText')?.enabled && (() => {
                  const ftEl = footerElements.find(e => e.id === 'footerText');
                  return (
                    <div style={{ textAlign: 'center', fontSize: `calc(${ftEl.fontSize} * 0.36)`, color: ftEl.color }}>
                      {previewTextForElement(ftEl)}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===================================================
  // MAIN RENDER
  // ===================================================
  return (
    <div className="flex gap-6">
      {/* LEFT: Configuration Panel */}
      <div className="flex-1 space-y-4">
        {/* Section Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setExpandedSection('header')} className={sectionBtnClass('header')}>
            <Layout size={16} /> Header
          </button>
          <button onClick={() => setExpandedSection('background')} className={sectionBtnClass('background')}>
            <Image size={16} /> Background
          </button>
          <button onClick={() => setExpandedSection('footer')} className={sectionBtnClass('footer')}>
            <Layout size={16} className="rotate-180" /> Footer
          </button>
          <button onClick={() => setExpandedSection('global')} className={sectionBtnClass('global')}>
            <Palette size={16} /> Global Style
          </button>
        </div>

        {/* ==================== HEADER SECTION ==================== */}
        {expandedSection === 'header' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Master Toggle */}
            <div className="flex items-center justify-between bg-slate-800/80 rounded-lg px-4 py-3 border border-slate-700">
              <span className="text-sm font-semibold text-slate-200">Show Header</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.header.enabled}
                  onChange={(e) => updateConfig('header.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.header.enabled && (
              <>
                {/* Border Style */}
                <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-500 w-24 flex-shrink-0">Border Style</label>
                    <div className="flex gap-1">
                      {['solid', 'double', 'none'].map(style => (
                        <button
                          key={style}
                          onClick={() => updateConfig('header.borderStyle', style)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                            config.header.borderStyle === style
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                  {config.header.borderStyle !== 'none' && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-500 w-24 flex-shrink-0">Border Color</label>
                      {colorInput(config.header.borderColor, (v) => updateConfig('header.borderColor', v))}
                    </div>
                  )}
                </div>

                {/* Elements */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Header Elements (drag to reorder)</p>
                  {config.header.elements.map((el, i) =>
                    renderElementRow('header', el, i, config.header.elements.length)
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== BACKGROUND SECTION ==================== */}
        {expandedSection === 'background' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Page Background Color */}
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-32 flex-shrink-0">Page Background</label>
                {colorInput(config.background.pageBackground, (v) => updateConfig('background.pageBackground', v))}
              </div>
            </div>

            {/* Watermark Toggle */}
            <div className="flex items-center justify-between bg-slate-800/80 rounded-lg px-4 py-3 border border-slate-700">
              <span className="text-sm font-semibold text-slate-200">Show Watermark</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.background.watermarkEnabled}
                  onChange={(e) => updateConfig('background.watermarkEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.background.watermarkEnabled && (
              <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700/50 space-y-4">
                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-500">Opacity</label>
                    <span className="text-xs text-slate-400 font-mono">{Math.round(config.background.watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.03"
                    max="0.30"
                    step="0.01"
                    value={config.background.watermarkOpacity}
                    onChange={(e) => updateConfig('background.watermarkOpacity', parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Size */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-500 w-24 flex-shrink-0">Size</label>
                  <select
                    value={config.background.watermarkSize}
                    onChange={(e) => updateConfig('background.watermarkSize', e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
                  >
                    {['25%', '35%', '50%', '65%', '75%'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-500 w-24 flex-shrink-0">Position</label>
                  <div className="flex gap-1 flex-wrap">
                    {[
                      { value: 'center', label: 'Center' },
                      { value: 'top-left', label: 'Top Left' },
                      { value: 'top-right', label: 'Top Right' },
                      { value: 'bottom-left', label: 'Bottom Left' },
                      { value: 'bottom-right', label: 'Bottom Right' },
                    ].map(pos => (
                      <button
                        key={pos.value}
                        onClick={() => updateConfig('background.watermarkPosition', pos.value)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          config.background.watermarkPosition === pos.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== FOOTER SECTION ==================== */}
        {expandedSection === 'footer' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Master Toggle */}
            <div className="flex items-center justify-between bg-slate-800/80 rounded-lg px-4 py-3 border border-slate-700">
              <span className="text-sm font-semibold text-slate-200">Show Footer</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.footer.enabled}
                  onChange={(e) => updateConfig('footer.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.footer.enabled && (
              <>
                {/* Border Style */}
                <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-500 w-24 flex-shrink-0">Border Style</label>
                    <div className="flex gap-1">
                      {['solid', 'double', 'none'].map(style => (
                        <button
                          key={style}
                          onClick={() => updateConfig('footer.borderStyle', style)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                            config.footer.borderStyle === style
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                  {config.footer.borderStyle !== 'none' && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-500 w-24 flex-shrink-0">Border Color</label>
                      {colorInput(config.footer.borderColor, (v) => updateConfig('footer.borderColor', v))}
                    </div>
                  )}
                </div>

                {/* Elements */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Footer Elements</p>
                  {config.footer.elements.map((el, i) =>
                    renderElementRow('footer', el, i, config.footer.elements.length)
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== GLOBAL STYLE SECTION ==================== */}
        {expandedSection === 'global' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-slate-800/50 rounded-lg px-4 py-4 border border-slate-700/50 space-y-4">
              {/* Font Family */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-28 flex-shrink-0">
                  <Type size={12} className="inline mr-1" />
                  Font Family
                </label>
                <select
                  value={config.global.fontFamily}
                  onChange={(e) => updateConfig('global.fontFamily', e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500"
                >
                  {FONT_FAMILIES.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Accent Color */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-28 flex-shrink-0">
                  <Palette size={12} className="inline mr-1" />
                  Accent Color
                </label>
                {colorInput(config.global.accentColor, (v) => updateConfig('global.accentColor', v))}
              </div>

              {/* Body Text Color */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-28 flex-shrink-0">
                  <Type size={12} className="inline mr-1" />
                  Body Text
                </label>
                {colorInput(config.global.bodyTextColor, (v) => updateConfig('global.bodyTextColor', v))}
              </div>
            </div>

            {/* Abnormal Value Colors */}
            <div className="bg-slate-800/50 rounded-lg px-4 py-4 border border-slate-700/50 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Abnormal Value Colors</span>
              </div>
              <p className="text-xs text-slate-500 -mt-2">Colors used for test values that fall outside the reference range</p>

              {/* High (Above Range) Color */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-28 flex-shrink-0">
                  ↑ Above Range
                </label>
                {colorInput(config.global.abnormalHighColor || '#dc2626', (v) => updateConfig('global.abnormalHighColor', v))}
              </div>

              {/* Low (Below Range) Color */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 w-28 flex-shrink-0">
                  ↓ Below Range
                </label>
                {colorInput(config.global.abnormalLowColor || '#2563eb', (v) => updateConfig('global.abnormalLowColor', v))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ACTION BUTTONS ==================== */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            <RotateCcw size={16} />
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="w-[320px] flex-shrink-0 hidden xl:block">
        {renderPreview()}
      </div>
    </div>
  );
};

export default PdfLayoutDesigner;
