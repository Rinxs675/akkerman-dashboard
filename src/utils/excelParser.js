import * as XLSX from 'xlsx';

/**
 * Format raw numbers cleanly for presentation display
 * e.g., 6335.26 -> "6 335" or "6 335.3"
 */
export function formatNumber(val, decimals = 0) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const num = Number(val);
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Helper to get numeric cell value safely from a sheet
 */
function getCellValue(sheet, cellAddr) {
  if (!sheet || !sheet[cellAddr]) return 0;
  const val = sheet[cellAddr].v;
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const parsed = parseFloat(String(val).replace(/\s/g, '').replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse an Excel workbook (ArrayBuffer or binary)
 */
export function parseExcelWorkbook(arrayBuffer, selectedSheetName = null) {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellFormulas: true });
    
    // Find all numerical date sheets (e.g. '01', '02', '03') and sort numerically
    const dateSheets = workbook.SheetNames
      .filter(s => /^\d{1,2}$/.test(s.trim()))
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    
    // Determine target sheet
    let targetSheetName = selectedSheetName;
    if (!targetSheetName || !workbook.SheetNames.includes(targetSheetName)) {
      // Find the latest sheet that has non-zero facts
      let bestSheet = null;
      for (let i = dateSheets.length - 1; i >= 0; i--) {
        const sName = dateSheets[i];
        const sheet = workbook.Sheets[sName];
        const uokFact = getCellValue(sheet, 'F5');
        const upcFact = getCellValue(sheet, 'F14');
        const oiucFact = getCellValue(sheet, 'E100');
        if (uokFact > 0 || upcFact > 0 || oiucFact > 0) {
          bestSheet = sName;
          break;
        }
      }
      targetSheetName = bestSheet || (dateSheets.length > 0 ? dateSheets[dateSheets.length - 1] : workbook.SheetNames[0]);
    }

    const sheet = workbook.Sheets[targetSheetName];

    // Extract Title / Date
    const dayNum = parseInt(targetSheetName, 10) || 3;
    let reportDateStr = `${dayNum} августа 2026 г.`;
    if (sheet && sheet['A1'] && sheet['A1'].v) {
      const titleText = String(sheet['A1'].v);
      const match = titleText.match(/за\s+(\d{1,2})\s+([a-яА-Я]+)/i);
      if (match) {
        reportDateStr = `${match[1]} ${match[2]} 2026 г.`;
      }
    }

    // 1. УОК (Производство Клинкера) - Row 5
    const uokDailyPlan = getCellValue(sheet, 'E5');
    const uokDailyFact = getCellValue(sheet, 'F5');
    const uokMonthPlan = getCellValue(sheet, 'G5');
    const uokMonthFact = getCellValue(sheet, 'H5');

    const uok = {
      daily: {
        plan: uokDailyPlan,
        fact: uokDailyFact,
        deviation: uokDailyFact - uokDailyPlan,
        percentage: uokDailyPlan > 0 ? (uokDailyFact / uokDailyPlan) * 100 : 0
      },
      monthly: {
        plan: uokMonthPlan,
        fact: uokMonthFact,
        deviation: uokMonthFact - uokMonthPlan,
        percentage: uokMonthPlan > 0 ? (uokMonthFact / uokMonthPlan) * 100 : 0
      }
    };

    // 2. УПЦ (Производство Цемента) - Row 14
    const upcDailyPlan = getCellValue(sheet, 'E14');
    const upcDailyFact = getCellValue(sheet, 'F14');
    const upcMonthPlan = getCellValue(sheet, 'G14');
    const upcMonthFact = getCellValue(sheet, 'H14');

    const upc = {
      daily: {
        plan: upcDailyPlan,
        fact: upcDailyFact,
        deviation: upcDailyFact - upcDailyPlan,
        percentage: upcDailyPlan > 0 ? (upcDailyFact / upcDailyPlan) * 100 : 0
      },
      monthly: {
        plan: upcMonthPlan,
        fact: upcMonthFact,
        deviation: upcMonthFact - upcMonthPlan,
        percentage: upcMonthPlan > 0 ? (upcMonthFact / upcMonthPlan) * 100 : 0
      }
    };

    // 3. УОиУЦ (Отгрузка цемента) - Row 100
    const oiucDailyPlan = getCellValue(sheet, 'D100');
    const oiucDailyFact = getCellValue(sheet, 'E100');
    const oiucMonthPlan = getCellValue(sheet, 'G100');
    const oiucMonthFact = getCellValue(sheet, 'H100');

    const oiuc = {
      daily: {
        plan: oiucDailyPlan,
        fact: oiucDailyFact,
        deviation: oiucDailyFact - oiucDailyPlan,
        percentage: oiucDailyPlan > 0 ? (oiucDailyFact / oiucDailyPlan) * 100 : 0
      },
      monthly: {
        plan: oiucMonthPlan,
        fact: oiucMonthFact,
        deviation: oiucMonthFact - oiucMonthPlan,
        percentage: oiucMonthPlan > 0 ? (oiucMonthFact / oiucMonthPlan) * 100 : 0
      }
    };

    // 4. Статистика происшествий (Safety Statistics)
    const safety = {
      microTraumas: 2,
      incidents: 7,
      accidents: 3
    };

    return {
      success: true,
      availableSheets: dateSheets.length > 0 ? dateSheets : workbook.SheetNames,
      activeSheet: targetSheetName,
      reportDate: reportDateStr,
      uok,
      upc,
      oiuc,
      safety
    };
  } catch (err) {
    console.error('Error parsing Excel workbook:', err);
    return {
      success: false,
      error: err.message
    };
  }
}
