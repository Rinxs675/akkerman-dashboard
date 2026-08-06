import * as XLSX from 'xlsx';

/**
 * Client-Side Parser for AKKERMANN TURON Excel Reports (.xlsx)
 */
export function parseExcelWorkbook(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const result = {};

  console.log('Workbook Sheet Names:', workbook.SheetNames);

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    if (!ws) continue;

    // Convert sheet to row array
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    if (rawRows.length < 5) continue;

    const sheetData = {
      day: sheetName,
      clinker: [],
      cement: [],
      shipment: [],
      equipment: [],
      energy: []
    };

    // Helper to safely get row value
    const getRow = (r) => rawRows[r - 1] || [];
    const getVal = (r, c) => {
      const row = getRow(r);
      const v = row[c - 1];
      return v !== undefined && v !== null ? v : 0;
    };

    // 1. Clinker (rows 5 to 13)
    for (let r = 5; r <= 13; r++) {
      const name = getVal(r, 1);
      if (name && String(name).trim()) {
        sheetData.clinker.append ? null : null;
        sheetData.clinker.push({
          name: String(name).trim(),
          unit: String(getVal(r, 2) || 'т').trim(),
          plan_month: getVal(r, 3),
          start_stock: getVal(r, 4),
          plan_day: getVal(r, 5),
          fact_day: getVal(r, 6),
          plan_cumul: getVal(r, 7),
          fact_cumul: getVal(r, 8),
          pct_cumul: getVal(r, 9),
          ship_day: getVal(r, 10),
          ship_cumul: getVal(r, 11),
          end_stock: getVal(r, 12)
        });
      }
    }

    // 2. Cement (rows 14 to 22)
    for (let r = 14; r <= 22; r++) {
      const name = getVal(r, 1);
      if (name && String(name).trim()) {
        sheetData.cement.push({
          name: String(name).trim(),
          unit: String(getVal(r, 2) || 'т').trim(),
          plan_month: getVal(r, 3),
          start_stock: getVal(r, 4),
          plan_day: getVal(r, 5),
          fact_day: getVal(r, 6),
          plan_cumul: getVal(r, 7),
          fact_cumul: getVal(r, 8),
          pct_cumul: getVal(r, 9),
          ship_day: getVal(r, 10),
          ship_cumul: getVal(r, 11),
          end_stock: getVal(r, 12)
        });
      }
    }

    // 3. Equipment (rows 85 to 95)
    for (let r = 85; r <= 95; r++) {
      const name = getVal(r, 1);
      if (name && String(name).trim()) {
        sheetData.equipment.push({
          name: String(name).trim(),
          unit: String(getVal(r, 2) || 'ч').trim(),
          hours_norm: getVal(r, 3),
          hours_fact_day: getVal(r, 4),
          hours_fact_cumul: getVal(r, 6)
        });
      }
    }

    // 4. Shipment (rows 100 to 122)
    for (let r = 100; r <= 122; r++) {
      const name = getVal(r, 1);
      if (name && String(name).trim()) {
        sheetData.shipment.push({
          name: String(name).trim(),
          unit: String(getVal(r, 2) || 'т').trim(),
          plan_month: getVal(r, 3),
          fact_day: getVal(r, 4),
          plan_day: getVal(r, 5),
          pct_day: getVal(r, 6),
          plan_cumul: getVal(r, 7),
          fact_cumul: getVal(r, 8),
          pct_cumul: getVal(r, 9)
        });
      }
    }

    // 5. Energy (rows 126 to 132)
    for (let r = 126; r <= 132; r++) {
      const name = getVal(r, 1);
      if (name && String(name).trim()) {
        sheetData.energy.push({
          name: String(name).trim(),
          unit: String(getVal(r, 2) || '').trim(),
          equipment: String(getVal(r, 3) || '').trim(),
          plan_day: getVal(r, 4),
          fact_day: getVal(r, 5),
          pct_day: getVal(r, 6),
          plan_cumul: getVal(r, 7),
          fact_cumul: getVal(r, 8),
          pct_cumul: getVal(r, 9)
        });
      }
    }

    result[sheetName] = sheetData;
  }

  return result;
}
