export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatVietnameseDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatVietnameseFullDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const [year, month, day] = dateStr.split('-');
    return `${days[dayOfWeek]}, ${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export interface WeekRange {
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string;   // YYYY-MM-DD (Sunday)
  days: { date: string; label: string; shortLabel: string }[];
}

/**
 * Returns Monday to Sunday for the week of the given date (default: today)
 */
export function getWeekRange(referenceDate: Date = new Date(), offsetWeeks: number = 0): WeekRange {
  const d = new Date(referenceDate);
  d.setDate(d.getDate() + offsetWeeks * 7);

  // In JS, 0 is Sunday, 1 is Monday. Convert so Monday is 0.
  const currentDay = d.getDay();
  const distanceToMonday = (currentDay + 6) % 7;

  const monday = new Date(d);
  monday.setDate(d.getDate() - distanceToMonday);

  const days: { date: string; label: string; shortLabel: string }[] = [];
  const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const shortLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const dayNum = String(current.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dayNum}`;
    days.push({
      date: dateStr,
      label: `${dayLabels[i]} (${dayNum}/${m})`,
      shortLabel: shortLabels[i],
    });
  }

  return {
    startDate: days[0].date,
    endDate: days[6].date,
    days,
  };
}

export function isDateInWeek(dateStr: string, week: WeekRange): boolean {
  return dateStr >= week.startDate && dateStr <= week.endDate;
}
