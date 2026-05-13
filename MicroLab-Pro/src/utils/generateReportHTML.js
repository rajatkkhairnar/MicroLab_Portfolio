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
 * All CSS is inlined — no external stylesheets needed.
 * Lab branding (name, logo, footer) comes from the labProfile object.
 * Test parameters and reference ranges come from testCatalog + user overrides.
 * 
 * Options:
 *   - onlyReport: if true, produces a blank report (no header, footer, logo, watermark)
 */
import { TEST_CATALOG } from './testCatalog';
import { getEffectiveParams } from './getEffectiveParams';
export function generateReportHTML({ order, results, labProfile, template = 'modern', testParamSettings = {}, onlyReport = false }) {
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
        return !['non-reactive', 'negative', 'nil'].includes(obsLower);
      }
      return false;
    }

    const ref = param.ref;
    let match = ref.match(/^(?:<|UP\s+TO)\s*([\d.]+)/i);
    if (match) return val > parseFloat(match[1]);

    match = ref.match(/^>\s*([\d.]+)/i);
    if (match) return val < parseFloat(match[1]);

    match = ref.match(/([\d.]+)\s*(?:TO|-|–)\s*([\d.]+)/i);
    if (match) return val < parseFloat(match[1]) || val > parseFloat(match[2]);

    match = ref.match(/([\d.]+)\s*(?:TO|-|–)\s*([\d.]+).*?([\d.]+)\s*(?:TO|-|–)\s*([\d.]+)/i);
    if (match) {
      const low = Math.min(parseFloat(match[1]), parseFloat(match[3]));
      const high = Math.max(parseFloat(match[2]), parseFloat(match[4]));
      return val < low || val > high;
    }

    return false;
  };

  // =============================================
  // Consistent spacing tokens (used everywhere)
  // =============================================
  const SP = {
    page:      '10mm 14mm',       // page padding: top/bottom 10mm, left/right 14mm
    section:   '14px',            // gap between header→patient, patient→results, results→footer
    headerPb:  '12px',            // header padding-bottom (above border)
    patientPd: '10px 14px',       // patient info box inner padding
    testGap:   '16px',            // gap between test sections
    rowPad:    '5px 0',           // table row cell padding
    footerPt:  '14px',            // footer padding-top (below border)
  };

  // =============================================
  // Text size tokens (slightly bumped up)
  // =============================================
  const TXT = {
    labName:   '22px',   // lab title
    subInfo:   '14px',   // address, timing, phones
    patLabel:  '14px',   // patient info labels & values
    testHead:  '15px',   // test section heading (e.g. "COMPLETE BLOOD COUNT")
    thRow:     '14px',   // table header row
    tdRow:     '14px',   // table body row
    cbcSub:    '12px',   // CBC sub-section header
    footer:    '14px',   // footer signatory text
    footerEnd: '12px',   // "*** End of Report ***"
  };

  // --- Build Header ---
  // When onlyReport is true, skip header entirely
  let headerHTML = '';
  if (onlyReport) {
    headerHTML = '';
  } else if (!isLetterhead && template !== 'unique') {
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
      params: ['Neutrophils', 'Lymphocytes', 'Mid', 'Granulocytes', 'Eosinophils', 'Monocytes', 'Basophils']
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
      // Render CBC in strict section order from CBC_SECTIONS
      const testResults = results[testName];

      CBC_SECTIONS.forEach(section => {
        // Section header row
        if (section.label) {
          rowsHTML += `<tr style="background: rgba(248,250,252,0.8); border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
            <td colspan="4" style="padding: 6px; font-weight: 700; text-align: center; color: #1e293b; text-transform: uppercase; letter-spacing: 2px; font-size: ${TXT.cbcSub};">${section.label}</td>
          </tr>`;
        }

        // Parameter rows in defined order
        section.params.forEach(paramName => {
          const value = testResults[paramName];
          if (value === undefined && value !== '') return; // skip if not entered
          const abnormal = isAbnormal(testName, paramName, value);

          rowsHTML += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: ${SP.rowPad}; font-weight: 500; font-size: ${TXT.tdRow};">${paramName}</td>
              <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; color: ${abnormal ? '#dc2626' : '#0f172a'};">${value}${abnormal ? ' *' : ''}</td>
              <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getUnit(testName, paramName)}</td>
              <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getRefRange(testName, paramName)}</td>
            </tr>`;
        });
      });

      // Catch any parameters not in CBC_SECTIONS (future-proofing)
      const knownParams = CBC_SECTIONS.flatMap(s => s.params);
      Object.entries(testResults).forEach(([param, value]) => {
        if (!knownParams.includes(param)) {
          const abnormal = isAbnormal(testName, param, value);
          rowsHTML += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: ${SP.rowPad}; font-weight: 500; font-size: ${TXT.tdRow};">${param}</td>
              <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; color: ${abnormal ? '#dc2626' : '#0f172a'};">${value}${abnormal ? ' *' : ''}</td>
              <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getUnit(testName, param)}</td>
              <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getRefRange(testName, param)}</td>
            </tr>`;
        }
      });
    } else {
      // Non-CBC tests: render in natural order
      Object.entries(results[testName]).forEach(([param, value]) => {
        const abnormal = isAbnormal(testName, param, value);
        rowsHTML += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: ${SP.rowPad}; font-weight: 500; font-size: ${TXT.tdRow};">${param}</td>
            <td style="padding: ${SP.rowPad}; font-weight: 700; font-size: ${TXT.tdRow}; color: ${abnormal ? '#dc2626' : '#0f172a'};">${value}${abnormal ? ' *' : ''}</td>
            <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getUnit(testName, param)}</td>
            <td style="padding: ${SP.rowPad}; color: #64748b; font-size: ${TXT.tdRow};">${getRefRange(testName, param)}</td>
          </tr>`;
      });
    }

    resultsHTML += `
      <div style="margin-bottom: ${SP.testGap}; ${index > 0 ? `padding-top: ${SP.testGap};` : ''} page-break-inside: auto;">
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
  // When onlyReport is true, skip footer entirely
  let footerInnerHTML = '';
  if (!onlyReport && !isLetterhead && template !== 'unique') {
    footerInnerHTML = `
      <div style="padding-top: ${SP.footerPt}; border-top: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 8px; margin-bottom: 16px;">
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
      </div>`;
  }

  // --- Watermark / Background Logo ---
  // Use dedicated watermarkLogo if set, otherwise fall back to labLogo
  // When onlyReport is true, skip watermark entirely
  const watermarkSrc = labProfile.watermarkLogo || labProfile.labLogo;
  const showWatermark = !onlyReport && watermarkSrc;

  // =============================================
  // Use a <table> layout trick so that:
  //   - <thead> repeats as a running header on every printed page
  //   - <tfoot> repeats as a running footer on every printed page
  //   - The watermark uses position:fixed to appear on all pages
  // =============================================

  // --- Full HTML Document ---
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Report - ${order.patient_name}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      color: #1e293b;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Watermark — position:fixed repeats on every printed page in Chromium */
    .watermark {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      opacity: 0.10;
      z-index: 0;
    }
    .watermark img {
      width: 50%;
      max-height: 50%;
      object-fit: contain;
    }

    /* 
     * Running header/footer trick using <table> with thead/tfoot.
     * In Chromium's print engine, <thead> and <tfoot> of a table
     * repeat on every page automatically.
     */
    .report-table {
      width: 210mm;
      border-collapse: collapse;
    }

    /* Header row: repeats on each page */
    .report-table > thead > tr > td {
      padding: 10mm 14mm 0 14mm;
    }
    .report-table > thead .header-content {
      margin-bottom: ${SP.section};
    }

    /* Footer row: repeats on each page */
    .report-table > tfoot > tr > td {
      padding: 0 14mm 10mm 14mm;
      vertical-align: bottom;
    }
    .report-table > tfoot .footer-content {
      margin-top: 20px;
    }

    /* Body content */
    .report-table > tbody > tr > td {
      padding: 0 14mm;
      vertical-align: top;
    }

    .content {
      position: relative;
      z-index: 10;
      width: 100%;
    }

    table.inner-table { border-collapse: collapse; }
  </style>
</head>
<body>
  ${showWatermark ? `
  <div class="watermark">
    <img src="${watermarkSrc}" />
  </div>` : ''}

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

    <!-- TFOOT: Running footer (repeats on every page) -->
    <tfoot>
      <tr>
        <td>
          <div class="footer-content">
            ${footerInnerHTML}
          </div>
        </td>
      </tr>
    </tfoot>

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
