# Excel report date parsing

## Scope

Correct the report date shown after users upload operational Excel workbooks such as `..._05_08_26г_.xlsx`.

## Behaviour

- Keep all production metrics and the independently managed incident images unchanged.
- Read the day and month from the selected sheet's `A1` title.
- Read a two- or four-digit year from the uploaded file name.
- Use the current year only when neither source contains a usable year.
- Preserve the existing fallback date for malformed workbooks.

## Verification

Use the supplied workbook to assert that sheet `05` produces `5 августа 2026 г.` and that its existing production metrics remain unchanged.
