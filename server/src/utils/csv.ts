// Minimal CSV writer that is safe to open in spreadsheet apps.

/**
 * Spreadsheets run cells that start with = + - @ (or a tab / carriage return) as
 * formulas, which attackers abuse ("CSV injection"). Those cells get a leading
 * apostrophe so they stay plain text. Cells are quoted when they hold , " or a newline.
 */
export const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);

  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
};

export const toCsv = (headers: readonly string[], rows: readonly (readonly unknown[])[]): string =>
  [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n") + "\r\n";
