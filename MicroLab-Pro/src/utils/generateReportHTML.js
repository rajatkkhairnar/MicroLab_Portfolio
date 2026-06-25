/**
 * generateReportHTML.js — PDF Report HTML Generator
 * 
 * Generates a complete, self-contained HTML document string for lab reports.
 * This HTML is written to a temp file and loaded into a hidden BrowserWindow
 * by Electron's main process (main.cjs → print-report handler) to produce
 * a pixel-perfect PDF via printToPDF().
 * 
 * Supports multiple report templates: Modern, Classic, Minimalist,
 * Bold Professional, Letterhead (no header), Compact, and Unique.
 * 
 * Also supports a dynamic pdfLayoutConfig object that lets each lab
 * customize header elements, footer elements, watermark/background,
 * and global text styling without touching the test results body.
 * 
 * All CSS is inlined — no external stylesheets needed.
 * Lab branding (name, logo, footer) comes from the labProfile object.
 * Test parameters and reference ranges come from testCatalog + user overrides.
 * 
 * Options:
 *   - onlyReport: if true, produces a blank report (no header, footer, logo, watermark)
 *   - pdfLayoutConfig: if provided, overrides template-based header/footer/watermark rendering
 */
import { TEST_CATALOG } from './testCatalog';
import { getEffectiveParams } from './getEffectiveParams';
import { FONT_FAMILIES } from './defaultPdfLayout';
export function generateReportHTML({ order, results, labProfile, template = 'modern', testParamSettings = {}, pdfLayoutConfig = null, onlyReport = false }) {
  const isLetterhead = template === 'letterhead';
  const isCompact = template === 'compact';

  // --- Helper Functions ---
  const getRefRange = (testName, paramName) => {
    const effectiveParams = getEffectiveParams(testName, testParamSettings);
    const param = effectiveParams.find(p => p.name === paramName);
    return param ? param.ref : '-';
  };

  const getUnit = (testName, paramName) => {
    const effectiveParams = getEffectiveParams(testName, testParamSettings);
    const param = effectiveParams.find(p => p.name === paramName);
    return param ? param.unit : '';
  };

  const isAbnormal = (testName, paramName, observedValue) => {
    const effectiveParams = getEffectiveParams(testName, testParamSettings);
    const param = effectiveParams.find(p => p.name === paramName);
    if (!param || !param.ref || !observedValue) return false;

    const val = parseFloat(observedValue);
    if (isNaN(val)) {
      const refLower = param.ref.toLowerCase().trim();
      const obsLower = observedValue.toString().toLowerCase().trim();
      if (['non-reactive', 'negative', 'nil'].includes(refLower)) {
        return !['non-reactive', 'negative', 'nil'].includes(obsLower) ? 'high' : false;
      }
      return false;
    }

    const ref = param.ref;
    let match = ref.match(/^(?:<|UP\s+TO)\s*([\d.]+)/i);
    if (match) return val > parseFloat(match[1]) ? 'high' : false;

    match = ref.match(/^>\s*([\d.]+)/i);
    if (match) return val < parseFloat(match[1]) ? 'low' : false;

    match = ref.match(/([\d.]+)\s*(?:TO|-|–)\s*([\d.]+)/i);
    if (match) {
      if (val < parseFloat(match[1])) return 'low';
      if (val > parseFloat(match[2])) return 'high';
      return false;
    }

    match = ref.match(/([\d.]+)\s*(?:TO|-|–)\s*([\d.]+).*?([\d.]+)\s*(?:TO|-|–)\s*([\d.]+)/i);
    if (match) {
      const low = Math.min(parseFloat(match[1]), parseFloat(match[3]));
      const high = Math.max(parseFloat(match[2]), parseFloat(match[4]));
      if (val < low) return 'low';
      if (val > high) return 'high';
      return false;
    }

    return false;
  };

  // Resolve abnormal direction to user-configured color
  const abnormalHighColor = pdfLayoutConfig?.global?.abnormalHighColor || '#dc2626';
  const abnormalLowColor = pdfLayoutConfig?.global?.abnormalLowColor || '#2563eb';
  const getAbnormalColor = (direction) => {
    if (direction === 'high') return abnormalHighColor;
    if (direction === 'low') return abnormalLowColor;
    return '#0f172a';
  };

  // =============================================
  // Consistent spacing tokens (tightened for CBC fit)
  // =============================================
  const SP = {
    page: '8mm 12mm',        // page padding: top/bottom 8mm, left/right 12mm
    section: '8px',            // gap between header→patient, patient→results, results→footer
    headerPb: '8px',           // header padding-bottom (above border)
    patientPd: '6px 10px',     // patient info box inner padding
    testGap: '10px',           // gap between test sections
    rowPad: '3px 0',           // table row cell padding (tightened)
    footerPt: '10px',          // footer padding-top (below border)
  };

  // =============================================
  // Text size tokens (compact for better page fit)
  // =============================================
  const TXT = {
    labName: '20px',   // lab title
    subInfo: '12px',   // address, timing, phones
    patLabel: '12px',  // patient info labels & values
    testHead: '13px',  // test section heading (e.g. "COMPLETE BLOOD COUNT")
    thRow: '12px',     // table header row
    tdRow: '12px',     // table body row
    cbcSub: '11px',    // CBC sub-section header
    footer: '12px',    // footer signatory text
    footerEnd: '11px', // "*** End of Report ***"
  };

  // --- Build Header ---
  // When onlyReport is true, skip header entirely
  let headerHTML = '';
  if (onlyReport) {
    headerHTML = '';
  } else if (pdfLayoutConfig && pdfLayoutConfig.header) {
    // ===== DYNAMIC HEADER from pdfLayoutConfig =====
    const hc = pdfLayoutConfig.header;
    if (hc.enabled) {
      const borderStyle = hc.borderStyle === 'solid' ? `2px solid ${hc.borderColor}`
        : hc.borderStyle === 'double' ? `4px double ${hc.borderColor}`
        : 'none';

      const logoEl = hc.elements.find(e => e.id === 'labLogo');
      const logoEnabled = logoEl?.enabled;
      const logoPosition = logoEl?.position || 'right';
      const logoSize = logoEl?.size || '88px';

      const textElements = hc.elements.filter(e => e.id !== 'labLogo' && e.enabled);

      let textHTML = '';
      textElements.forEach(el => {
        switch (el.id) {
          case 'labName':
            textHTML += `<h1 style="font-size: ${el.fontSize}; font-weight: ${el.fontWeight || '700'}; text-transform: uppercase; letter-spacing: 1px; color: ${el.color}; margin: 0;">${labProfile.labName || 'MICROLAB DIAGNOSTICS'}</h1>`;
            break;
          case 'address':
            textHTML += `<p style="color: ${el.color}; margin-top: 3px; white-space: pre-wrap; font-size: ${el.fontSize}; max-width: 420px; line-height: 1.4;">${labProfile.address || ''}</p>`;
            break;
          case 'labTiming':
            if (labProfile.labTiming) {
              textHTML += `<p style="color: ${el.color}; margin-top: 2px; font-size: ${el.fontSize}; font-weight: 500;">${labProfile.labTiming}</p>`;
            }
            break;
          case 'phones':
            if (labProfile.phone || labProfile.phone2) {
              textHTML += `<div style="display: flex; gap: 14px; margin-top: 4px; font-size: ${el.fontSize}; color: ${el.color};">`;
              if (labProfile.phone) textHTML += `<span>📞 ${labProfile.phone}</span>`;
              if (labProfile.phone2) textHTML += `<span>📞 ${labProfile.phone2}</span>`;
              textHTML += `</div>`;
            }
            break;
        }
      });

      let logoHTML = '';
      if (logoEnabled) {
        logoHTML = `<div style="width: ${logoSize}; height: ${logoSize}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${labProfile.labLogo
            ? `<img src="${labProfile.labLogo}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`
            : `<div style="width: 72px; height: 72px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 11px; text-align: center;">Lab<br/>Logo</div>`
          }
        </div>`;
      }

      headerHTML = `
        <div style="border-bottom: ${borderStyle}; padding-bottom: ${SP.headerPb};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            ${logoPosition === 'left' ? logoHTML : ''}
            <div style="flex: 1;">${textHTML}</div>
            ${logoPosition === 'right' ? logoHTML : ''}
          </div>
        </div>`;
    }
  } else if (!isLetterhead && template !== 'unique') {
    // ===== LEGACY TEMPLATE-BASED HEADER =====
    const borderColor = template === 'modern' ? '#2563eb' : '#1e293b';
    const titleColor = template === 'modern' ? '#1e40af' : '#0f172a';
    headerHTML = `
      <div style="border-bottom: 2px solid ${borderColor}; padding-bottom: ${SP.headerPb};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: ${TXT.labName}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${titleColor}; margin: 0;">
              ${labProfile.labName || 'MICROLAB DIAGNOSTICS'}
            </h1>
            <p style="color: #475569; margin-top: 3px; white-space: pre-wrap; font-size: ${TXT.subInfo}; max-width: 420px; line-height: 1.4;">${labProfile.address || ''}</p>
            ${labProfile.labTiming ? `<p style="color: #475569; margin-top: 2px; font-size: ${TXT.subInfo}; font-weight: 500;">${labProfile.labTiming}</p>` : ''}
            <div style="display: flex; gap: 14px; margin-top: 4px; font-size: ${TXT.subInfo}; color: #64748b;">
              ${labProfile.phone ? `<span>📞 ${labProfile.phone}</span>` : ''}
              ${labProfile.phone2 ? `<span>📞 ${labProfile.phone2}</span>` : ''}
            </div>
          </div>
          <div style="width: 88px; height: 88px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${labProfile.labLogo
        ? `<img src="${labProfile.labLogo}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`
        : `<div style="width: 72px; height: 72px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 11px; text-align: center;">Lab<br/>Logo</div>`
      }
          </div>
        </div>
      </div>`;
  } else if (isLetterhead) {
    headerHTML = '<div style="height: 140px;"></div>';
  }

  // --- Build Patient Info ---
  const patientInfoHTML = `
    <div style="margin-bottom: ${SP.section}; padding: ${SP.patientPd}; border-radius: 6px; border: 1px solid ${template === 'modern' ? '#dbeafe' : '#cbd5e1'}; background: ${template === 'modern' ? 'rgba(239,246,255,0.5)' : '#fff'};">
      <table style="width: 100%; font-size: ${TXT.patLabel}; border-collapse: collapse; line-height: 1.5;">
        <tr>
          <td style="padding: 3px 0;"><strong style="color: #64748b; text-transform: uppercase; width: 80px; display: inline-block;">Patient:</strong> <strong style="color: #0f172a;">${order.patient_name}</strong></td>
          <td style="padding: 3px 0;"><strong style="color: #64748b; text-transform: uppercase; width: 80px; display: inline-block;">Age / Sex:</strong> <span style="color: #0f172a;">${order.age} Y / ${order.gender}</span></td>
        </tr>
        <tr>
          <td style="padding: 3px 0;"><strong style="color: #64748b; text-transform: uppercase; width: 80px; display: inline-block;">Ref. By:</strong> <span style="color: #0f172a;">${order.doctor_name ? `Dr. ${order.doctor_name}` : 'Self'}</span></td>
          <td style="padding: 3px 0;"><strong style="color: #64748b; text-transform: uppercase; width: 80px; display: inline-block;">Date:</strong> <span style="color: #0f172a;">${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></td>
        </tr>
        <tr>
          <td style="padding: 3px 0;"><strong style="color: #64748b; text-transform: uppercase; width: 80px; display: inline-block;">PID / SID:</strong> <span style="font-family: monospace; color: #0f172a;">#${order.patient_id} / #${order.id}</span></td>
          <td style="padding: 3px 0;"><strong style="color: #64748b; text-transform: uppercase; width: 80px; display: inline-block;">Time:</strong> <span style="color: #0f172a;">${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></td>
        </tr>
      </table>
    </div>`;

  // --- Build Results Tables ---
  let resultsHTML = '';
  const testNames = Object.keys(results);

  // CBC section definitions — defines the visual grouping order
  const CBC_SECTIONS = [
    {
      label: null, // No header for the first group (Blood Reports)
      params: ['Haemoglobin (Hb)', 'Total WBC Count']
    },
    {
      label: 'Differential WBC Count',
      params: ['Neutrophils', 'Lymphocytes', 'Mid', 'Eosinophils', 'Monocytes', 'Basophils']
    },
    {
      label: 'Total RBC Count',
      params: ['Total RBC Count']
    },
    {
      label: 'RBC Indices',
      params: ['PCV / Haematocrit', 'MCV', 'MCH', 'MCHC', 'Platelet Count', 'PCT', 'MPV', 'RDW', 'PDW']
    }
  ];

  testNames.forEach((testName, index) => {
    const headingColor = template === 'modern' ? '#1d4ed8' : '#1e293b';
    const borderCol = template === 'modern' ? '#bfdbfe' : '#1e293b';

    let rowsHTML = '';
    const isCBC = testName === 'Complete Blood Count (CBC)' || testName.toLowerCase().includes('cbc');

    if (isCBC) {
      const testResults = results[testName];
      const hasCustomOrder = testParamSettings[testName]?.__paramOrder__;

      // Differential WBC params that contribute to the Total row
      const DIFF_WBC_PARAMS = ['Neutrophils', 'Lymphocytes', 'Mid', 'Eosinophils', 'Monocytes', 'Basophils'];

      // Helper: build the TOTAL row for differential WBC count
      const buildDiffTotalRow = (paramNames) => {
        let diffTotal = 0;
        let hasDiffValues = false;
        paramNames.forEach(pName => {
          if (!DIFF_WBC_PARAMS.includes(pName)) return;
          const val = parseFloat(testResults[pName]);
          if (!isNaN(val)) {
            diffTotal += val;
            hasDiffValues = true;
          }
        });
        if (!hasDiffValues) return '';
        // Round to avoid floating point artifacts (e.g. 99.99999999)
        const displayTotal = parseFloat(diffTotal.toFixed(1));
        return `
          <tr>
            <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; text-transform: uppercase;">Total</td>
            <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; color: #0f172a;">${displayTotal}</td>
            <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};"></td>
            <td style="padding: ${SP.rowPad};"></td>
          </tr>`;
      };

      if (hasCustomOrder) {
        // Custom order set by user — render in effective params order (flat, no CBC sections)
        const effectiveParams = getEffectiveParams(testName, testParamSettings);

        // Find the index of the last differential param in the effective order
        let lastDiffIdx = -1;
        effectiveParams.forEach((param, idx) => {
          if (DIFF_WBC_PARAMS.includes(param.name)) lastDiffIdx = idx;
        });

        effectiveParams.forEach((param, idx) => {
          const value = testResults[param.name];
          if (value === undefined && value !== '') return; // skip if not entered
          const abnormal = isAbnormal(testName, param.name, value);
          const isLastDiff = (idx === lastDiffIdx);

          rowsHTML += `
            <tr>
              <td style="padding: ${SP.rowPad}; font-weight: 500; font-size: ${TXT.tdRow};">${param.name}</td>
              <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; color: ${getAbnormalColor(abnormal)};${isLastDiff ? ' border-bottom: 1px solid #1e293b;' : ''}">${value}${abnormal ? ' *' : ''}</td>
              <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${param.unit || ''}</td>
              <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${param.ref || '-'}</td>
            </tr>`;

          // Insert Total row right after the last differential param
          if (isLastDiff) {
            rowsHTML += buildDiffTotalRow(effectiveParams.map(p => p.name));
          }
        });
      } else {
        // Default CBC rendering — use strict section grouping from CBC_SECTIONS
        CBC_SECTIONS.forEach(section => {
          // Section header row
          if (section.label) {
            rowsHTML += `<tr style="background: rgba(248,250,252,0.8); border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <td colspan="4" style="padding: 6px; font-weight: 700; text-align: center; color: #1e293b; text-transform: uppercase; letter-spacing: 2px; font-size: ${TXT.cbcSub};">${section.label}</td>
            </tr>`;
          }

          // Find the last param in this section that has a value (for underline)
          let lastRenderedIdx = -1;
          if (section.label === 'Differential WBC Count') {
            for (let i = section.params.length - 1; i >= 0; i--) {
              const v = testResults[section.params[i]];
              if (v !== undefined && v !== '') { lastRenderedIdx = i; break; }
            }
          }

          // Parameter rows in defined order
          section.params.forEach((paramName, pIdx) => {
            const value = testResults[paramName];
            if (value === undefined && value !== '') return; // skip if not entered
            const abnormal = isAbnormal(testName, paramName, value);
            const isLastDiff = section.label === 'Differential WBC Count' && pIdx === lastRenderedIdx;

            rowsHTML += `
              <tr>
                <td style="padding: ${SP.rowPad}; font-weight: 500; font-size: ${TXT.tdRow};">${paramName}</td>
                <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; color: ${getAbnormalColor(abnormal)};${isLastDiff ? ' border-bottom: 1px solid #1e293b;' : ''}">${value}${abnormal ? ' *' : ''}</td>
                <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getUnit(testName, paramName)}</td>
                <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getRefRange(testName, paramName)}</td>
              </tr>`;
          });

          // Add Total row after Differential WBC Count section
          if (section.label === 'Differential WBC Count') {
            rowsHTML += buildDiffTotalRow(section.params);
          }
        });

        // Catch any parameters not in CBC_SECTIONS (future-proofing)
        const knownParams = CBC_SECTIONS.flatMap(s => s.params);
        Object.entries(testResults).forEach(([param, value]) => {
          if (!knownParams.includes(param)) {
            const abnormal = isAbnormal(testName, param, value);
            rowsHTML += `
              <tr>
                <td style="padding: ${SP.rowPad}; font-weight: 500; font-size: ${TXT.tdRow};">${param}</td>
                <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; color: ${getAbnormalColor(abnormal)};">${value}${abnormal ? ' *' : ''}</td>
                <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getUnit(testName, param)}</td>
                <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getRefRange(testName, param)}</td>
              </tr>`;
          }
        });
      }
    } else {
      // Non-CBC tests: render in effective params order (respects user reordering)
      const effectiveParams = getEffectiveParams(testName, testParamSettings);
      effectiveParams.forEach(param => {
        const value = results[testName][param.name];
        if (value === undefined || value === '') return; // skip if not entered
        const abnormal = isAbnormal(testName, param.name, value);
        rowsHTML += `
          <tr>
            <td style="padding: ${SP.rowPad}; font-weight: 500; font-size: ${TXT.tdRow};">${param.name}</td>
            <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; color: ${getAbnormalColor(abnormal)};">${value}${abnormal ? ' *' : ''}</td>
            <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${param.unit || ''}</td>
            <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${param.ref || '-'}</td>
          </tr>`;
      });
    }

    // CBC is too large to avoid page breaks — let it flow naturally
    const avoidBreak = !isCBC;
    resultsHTML += `
      <div class="${avoidBreak ? 'test-section' : ''}" style="margin-bottom: ${SP.testGap}; ${index > 0 ? `padding-top: ${SP.testGap};` : ''}">
        <h3 style="font-size: ${TXT.testHead}; font-weight: 700; border-bottom: 1px solid ${borderCol}; margin-bottom: 8px; padding-bottom: 3px; text-transform: uppercase; color: ${headingColor};">
          ${testName}
        </h3>
        <table style="width: 100%; text-align: left; font-size: ${TXT.thRow}; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b;">
              <th style="padding: ${SP.rowPad}; width: 42%;">Investigation</th>
              <th style="padding: ${SP.rowPad}; width: 20%; font-weight: 700; color: #1e293b;">Observed Value</th>
              <th style="padding: ${SP.rowPad}; width: 16%;">Unit</th>
              <th style="padding: ${SP.rowPad}; width: 22%;">Reference Range</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>`;
  });

  // --- Build Footer ---
  // Footer uses position:fixed to pin to page bottom on EVERY page (including last)
  // When onlyReport is true, skip footer entirely
  let footerHTML = '';
  if (onlyReport) {
    footerHTML = '';
  } else if (pdfLayoutConfig && pdfLayoutConfig.footer) {
    // ===== DYNAMIC FOOTER from pdfLayoutConfig =====
    const fc = pdfLayoutConfig.footer;
    if (fc.enabled) {
      const borderStyle = fc.borderStyle === 'solid' ? `1px solid ${fc.borderColor}`
        : fc.borderStyle === 'double' ? `3px double ${fc.borderColor}`
        : 'none';

      const enabledElements = fc.elements.filter(e => e.enabled);
      const signatoryEls = enabledElements.filter(e => ['labAssistant', 'authorizedSignatory', 'labTechnician'].includes(e.id));
      const footerTextEl = enabledElements.find(e => e.id === 'footerText');

      let signatoryHTML = '';
      if (signatoryEls.length > 0) {
        signatoryHTML = `<div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 8px; margin-bottom: 10px;">`;
        signatoryEls.forEach(el => {
          if (el.id === 'labAssistant') {
            signatoryHTML += `<div style="text-align: left;">${labProfile.labAssistant ? `<p style="font-weight: 700; color: ${el.color}; font-size: ${el.fontSize}; margin: 0;">Lab Assistant</p><p style="font-size: ${el.fontSize}; color: #475569; margin: 2px 0 0 0;">${labProfile.labAssistant}</p>` : ''}</div>`;
          } else if (el.id === 'authorizedSignatory') {
            signatoryHTML += `<div style="text-align: center;"><p style="font-size: ${el.fontSize}; font-weight: 700; color: ${el.color}; text-transform: uppercase; margin: 0;">Authorized Signatory</p></div>`;
          } else if (el.id === 'labTechnician') {
            signatoryHTML += `<div style="text-align: right;">${labProfile.labTechnician ? `<p style="font-weight: 700; color: ${el.color}; font-size: ${el.fontSize}; margin: 0;">Lab Technician</p><p style="font-size: ${el.fontSize}; color: #475569; margin: 2px 0 0 0;">${labProfile.labTechnician}</p>` : ''}</div>`;
          }
        });
        signatoryHTML += `</div>`;
      }

      let footerTextHTML = '';
      if (footerTextEl) {
        footerTextHTML = `<div style="text-align: center; font-size: ${footerTextEl.fontSize}; color: ${footerTextEl.color};">${labProfile.footerText || '*** End of Report ***'}</div>`;
      }

      footerHTML = `
      <div class="fixed-footer">
        <div style="padding-top: ${SP.footerPt}; border-top: ${borderStyle};">
          ${signatoryHTML}
          ${footerTextHTML}
        </div>
      </div>`;
    }
  } else if (!isLetterhead && template !== 'unique') {
    // ===== LEGACY TEMPLATE-BASED FOOTER =====
    footerHTML = `
    <div class="fixed-footer">
      <div style="padding-top: ${SP.footerPt}; border-top: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 8px; margin-bottom: 10px;">
          <div style="text-align: left;">
            ${labProfile.labAssistant ? `
              <p style="font-weight: 700; color: #1e293b; font-size: ${TXT.footer}; margin: 0;">Lab Assistant</p>
              <p style="font-size: ${TXT.footer}; color: #475569; margin: 2px 0 0 0;">${labProfile.labAssistant}</p>
            ` : ''}
          </div>
          <div style="text-align: center;">
            <p style="font-size: ${TXT.footer}; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0;">Authorized Signatory</p>
          </div>
          <div style="text-align: right;">
            ${labProfile.labTechnician ? `
              <p style="font-weight: 700; color: #1e293b; font-size: ${TXT.footer}; margin: 0;">Lab Technician</p>
              <p style="font-size: ${TXT.footer}; color: #475569; margin: 2px 0 0 0;">${labProfile.labTechnician}</p>
            ` : ''}
          </div>
        </div>
        <div style="text-align: center; font-size: ${TXT.footerEnd}; color: #94a3b8;">
          ${labProfile.footerText || '*** End of Report ***'}
        </div>
      </div>
    </div>`;
  }

  // --- Watermark / Background Logo ---
  // Use dedicated watermarkLogo if set, otherwise fall back to labLogo
  // When onlyReport is true, skip watermark entirely
  // When pdfLayoutConfig is present, respect its watermark settings
  const watermarkSrc = labProfile.watermarkLogo || labProfile.labLogo;
  let showWatermark = !onlyReport && watermarkSrc;
  let watermarkOpacity = 0.10;
  let watermarkSizeCSS = '50%';
  let watermarkPositionCSS = 'center';
  if (pdfLayoutConfig && pdfLayoutConfig.background) {
    const bg = pdfLayoutConfig.background;
    showWatermark = !onlyReport && bg.watermarkEnabled && watermarkSrc;
    watermarkOpacity = bg.watermarkOpacity || 0.10;
    watermarkSizeCSS = bg.watermarkSize || '50%';
    // Map position to CSS align/justify values
    const posMap = {
      'center': { ai: 'center', jc: 'center' },
      'top-left': { ai: 'flex-start', jc: 'flex-start' },
      'top-right': { ai: 'flex-start', jc: 'flex-end' },
      'bottom-left': { ai: 'flex-end', jc: 'flex-start' },
      'bottom-right': { ai: 'flex-end', jc: 'flex-end' },
    };
    watermarkPositionCSS = bg.watermarkPosition || 'center';
  }

  // =============================================
  // Layout strategy:
  //   - <thead> repeats the header on every printed page
  //   - Footer uses position:fixed;bottom:0 to pin to EVERY page bottom
  //     (including the last page — unlike tfoot which only pins on full pages)
  //   - The watermark also uses position:fixed to appear on all pages
  //   - Content has bottom padding so it never overlaps the footer
  // =============================================

  // --- Resolve global font family for pdfLayoutConfig ---
  let fontFamilyCSS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  let googleFontLink = '';
  let bodyTextColor = '#1e293b';
  let pageBackground = '#fff';
  let accentColor = template === 'modern' ? '#2563eb' : '#1e293b';

  if (pdfLayoutConfig && pdfLayoutConfig.global) {
    const g = pdfLayoutConfig.global;
    const fontDef = FONT_FAMILIES.find(f => f.id === g.fontFamily);
    if (fontDef) {
      fontFamilyCSS = fontDef.css;
      if (fontDef.googleFont) {
        googleFontLink = `<link href="https://fonts.googleapis.com/css2?family=${fontDef.googleFont.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;
      }
    }
    bodyTextColor = g.bodyTextColor || '#1e293b';
    accentColor = g.accentColor || '#2563eb';
  }
  if (pdfLayoutConfig && pdfLayoutConfig.background) {
    pageBackground = pdfLayoutConfig.background.pageBackground || '#fff';
  }

  // --- Watermark positioning ---
  const wmPosMap = {
    'center': { ai: 'center', jc: 'center' },
    'top-left': { ai: 'flex-start', jc: 'flex-start' },
    'top-right': { ai: 'flex-start', jc: 'flex-end' },
    'bottom-left': { ai: 'flex-end', jc: 'flex-start' },
    'bottom-right': { ai: 'flex-end', jc: 'flex-end' },
  };
  const wmPos = wmPosMap[watermarkPositionCSS] || wmPosMap['center'];

  // --- Full HTML Document ---
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Report - ${order.patient_name}</title>
  ${googleFontLink}
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      height: 100%;
    }
    body {
      font-family: ${fontFamilyCSS};
      font-size: 12px;
      color: ${bodyTextColor};
      background: ${pageBackground};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Watermark — position:fixed repeats on every printed page in Chromium */
    .watermark {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: ${wmPos.ai};
      justify-content: ${wmPos.jc};
      pointer-events: none;
      opacity: ${watermarkOpacity};
      z-index: 0;
    }
    .watermark img {
      width: ${watermarkSizeCSS};
      max-height: ${watermarkSizeCSS};
      object-fit: contain;
    }

    /* Fixed footer — pinned to bottom of EVERY page (including last) */
    .fixed-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0 12mm 8mm 12mm;
      background: #fff;
      z-index: 100;
    }

    /* 
     * Running header using <table> with thead.
     * In Chromium's print engine, <thead> of a table
     * repeats on every page automatically.
     */
    .report-table {
      width: 210mm;
      border-collapse: collapse;
    }

    /* Header row: repeats on each page */
    .report-table > thead > tr > td {
      padding: 8mm 12mm 0 12mm;
    }
    .report-table > thead .header-content {
      margin-bottom: ${SP.section};
    }

    /* Body content */
    .report-table > tbody > tr > td {
      padding: 0 12mm;
      vertical-align: top;
    }

    .content {
      position: relative;
      z-index: 10;
      width: 100%;
      /* Bottom padding to prevent content from overlapping the fixed footer */
      padding-bottom: 28mm;
    }

    /* Prevent non-CBC test sections from splitting across pages */
    .test-section {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    table.inner-table { border-collapse: collapse; }
  </style>
</head>
<body>
  ${showWatermark ? `
  <div class="watermark">
    <img src="${watermarkSrc}" />
  </div>` : ''}

  ${footerHTML}

  <table class="report-table">
    <!-- THEAD: Running header (repeats on every page) -->
    <thead>
      <tr>
        <td>
          <div class="header-content">
            ${headerHTML}
          </div>
        </td>
      </tr>
    </thead>

    <!-- TBODY: Main report content -->
    <tbody>
      <tr>
        <td>
          <div class="content">
            ${patientInfoHTML}
            ${resultsHTML}
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
}
