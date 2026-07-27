/** Parses a SQLite `datetime('now')` string (UTC, "YYYY-MM-DD HH:MM:SS") into a Date. */
export function parseSqliteDate(value: string): Date {
  return new Date(`${value.replace(" ", "T")}Z`);
}

/** Formats a Date as a "YYYY-MM-DD" key in local time, for grouping by calendar day. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Formats a Date as a SQLite `datetime('now')`-compatible string (UTC, "YYYY-MM-DD HH:MM:SS"). */
export function toSqliteDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
