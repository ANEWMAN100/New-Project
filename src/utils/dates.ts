/**
 * Date utilities for the trip planner.
 */

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
  if (sMonth === eMonth && s.getFullYear() === e.getFullYear()) {
    return `${sMonth} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${formatDateShort(start)} – ${formatDateShort(end)}, ${e.getFullYear()}`;
}

export function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const current = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (current <= last) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function getDayNumber(start: string, date: string): number {
  const s = new Date(start + 'T00:00:00');
  const d = new Date(date + 'T00:00:00');
  return Math.floor((d.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function getDayLabel(start: string, date: string): string {
  const dayNum = getDayNumber(start, date);
  const d = new Date(date + 'T00:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  return `Day ${dayNum} · ${weekday}`;
}

export function isUpcoming(startDate: string): boolean {
  return new Date(startDate + 'T00:00:00') >= new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');
}

export function isPast(endDate: string): boolean {
  return new Date(endDate + 'T00:00:00') < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getMonthMatrix(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = new Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}
