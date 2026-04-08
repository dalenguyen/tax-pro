export function parseDateString(dateStr: string): Date {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Invalid date: ${dateStr}`);
  return date;
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
}

export function getTaxYearRange(year: number): { start: Date; end: Date } {
  return {
    start: new Date(year, 0, 1),    // Jan 1
    end: new Date(year, 11, 31),    // Dec 31
  };
}

export function toFirestoreDate(date: Date | string): Date {
  if (typeof date === 'string') return parseDateString(date);
  return date;
}
