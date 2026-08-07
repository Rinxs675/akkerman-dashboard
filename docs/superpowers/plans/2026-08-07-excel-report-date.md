# Excel Report Date Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the correct report date when users upload the supplied operational Excel format.

**Architecture:** Keep parsing in `parseExcelWorkbook`. Add an optional source-file name parameter, extract a year from that name, and combine it with the day/month already present in cell `A1`; invalid or absent values retain a safe fallback.

**Tech Stack:** React 18, Vite 5, SheetJS `xlsx`, Node.js built-in assertions.

## Global Constraints

- Do not modify incident images, safety data, or their management flows.
- Preserve existing production-cell mappings and fallback behaviour for malformed workbooks.
- Do not add runtime dependencies.

---

### Task 1: Add a focused workbook parser regression test

**Files:**
- Create: `tests/excelParser.test.mjs`
- Modify: `src/utils/excelParser.js:34`

**Interfaces:**
- Consumes: `parseExcelWorkbook(arrayBuffer, selectedSheetName, sourceFileName)`.
- Produces: tests proving that the supplied workbook retains its UOK values and that a filename year controls the parsed report year.

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseExcelWorkbook } from '../src/utils/excelParser.js';

const file = process.argv[2];
const parsed = parseExcelWorkbook(fs.readFileSync(file), '05', file);
assert.equal(parsed.reportDate, '5 августа 2026 г.');
assert.equal(parsed.uok.daily.plan, 6700);
assert.ok(Math.abs(parsed.uok.daily.fact - 5734.574417984448) < 1e-9);

const yearProbe = parseExcelWorkbook(fs.readFileSync(file), '05', 'report_05_08_30.xlsx');
assert.equal(yearProbe.reportDate, '5 августа 2030 г.');
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node tests/excelParser.test.mjs 'C:\Users\shiga\Downloads\Telegram Desktop\Оперативные_сведения_АККЕРМАНН_TURON_05_08_26г_.xlsx'
```

Expected: the filename-year assertion fails because the parser currently hard-codes `2026`.

- [ ] **Step 3: Implement the minimal parser change**

```js
export function parseExcelWorkbook(arrayBuffer, selectedSheetName = null, sourceFileName = '') {
  // extract a two- or four-digit year from sourceFileName and use it in reportDate
}
```

- [ ] **Step 4: Run the regression test and the production build**

Run:

```powershell
node tests/excelParser.test.mjs 'C:\Users\shiga\Downloads\Telegram Desktop\Оперативные_сведения_АККЕРМАНН_TURON_05_08_26г_.xlsx'
npm.cmd run build
```

Expected: both commands exit with code 0.

- [ ] **Step 5: Commit**

```bash
git add src/utils/excelParser.js src/App.jsx tests/excelParser.test.mjs
git commit -m "Fix report year parsing for uploaded Excel files"
```

### Task 2: Pass the uploaded filename into the parser

**Files:**
- Modify: `src/App.jsx:29,88,144`

**Interfaces:**
- Consumes: `parseExcelWorkbook(buffer, selectedSheetName, sourceFileName)`.
- Produces: filename-aware date parsing for both uploaded and server-fetched workbooks.

- [ ] **Step 1: Update call sites**

```js
const parsed = parseExcelWorkbook(buf, null, fileName);
const parsed = parseExcelWorkbook(buf, null, file.name);
const parsed = parseExcelWorkbook(rawBuffer, sheetName, fileName);
```

- [ ] **Step 2: Verify no production mapping changed**

Run:

```powershell
node tests/excelParser.test.mjs 'C:\Users\shiga\Downloads\Telegram Desktop\Оперативные_сведения_АККЕРМАНН_TURON_05_08_26г_.xlsx'
npm.cmd run build
```

Expected: the workbook retains UOK plan `6700` and fact `5734.574417984448`; build exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx tests/excelParser.test.mjs
git commit -m "Pass uploaded Excel filenames to parser"
```
