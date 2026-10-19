/**
 * Formatter and timezone helpers for Manage Dot
 * Default timezone: Asia/Dhaka (UTC+6)
 * Default currency: Bangladeshi Taka (৳ BDT)
 */

export const DHAKA_TIMEZONE = 'Asia/Dhaka';

/**
 * Format a number as Bangladeshi Taka (e.g. ৳12,500 or ৳12,500.50)
 */
export function formatBDT(amount: number, showDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '৳0';
  }

  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const isInteger = rounded % 1 === 0;

  const formattedNumber = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: showDecimals ? 2 : (isInteger ? 0 : 2),
    maximumFractionDigits: 2,
  }).format(rounded);

  return `৳${formattedNumber}`;
}

/**
 * Format raw number with sign (e.g. +৳12,500 or -৳350)
 */
export function formatBDTWithSign(amount: number, type?: 'income' | 'expense'): string {
  const absAmount = Math.abs(amount);
  const formatted = formatBDT(absAmount);
  if (type === 'income' || amount > 0) {
    return `+${formatted}`;
  }
  if (type === 'expense' || amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

/**
 * Validate currency input: positive number with at most 2 decimals
 */
export function validateAmount(val: unknown): { isValid: boolean; error?: string; value: number } {
  if (val === '' || val === null || val === undefined) {
    return { isValid: false, error: 'Amount is required', value: 0 };
  }
  const num = typeof val === 'number' ? val : parseFloat(String(val).trim());
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number', value: 0 };
  }
  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0', value: 0 };
  }
  // Check decimal places
  const parts = String(val).split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    return { isValid: false, error: 'Amount can have at most 2 decimal places', value: 0 };
  }
  return { isValid: true, value: Math.round(num * 100) / 100 };
}

/**
 * Get current date in Asia/Dhaka as 'YYYY-MM-DD'
 */
export function getDhakaTodayDateString(): string {
  const d = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

/**
 * Get current month key in Asia/Dhaka as 'YYYY-MM'
 */
export function getDhakaCurrentMonthKey(date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Convert user selected local Dhaka date (and optional time) to UTC ISO string
 */
export function dhakaDateTimeToUtcIso(dateStr: string, timeStr = '12:00'): string {
  if (!dateStr) return new Date().toISOString();
  // Dhaka is UTC+6 standard time (no DST)
  // E.g., '2026-10-19T14:30:00+06:00'
  const time = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  const isoWithDhakaOffset = `${dateStr}T${time}+06:00`;
  const dateObj = new Date(isoWithDhakaOffset);
  return isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
}

/**
 * Convert UTC ISO string to Dhaka 'YYYY-MM-DD' for date inputs
 */
export function utcIsoToDhakaDateInput(utcIso: string): string {
  try {
    const d = new Date(utcIso);
    if (isNaN(d.getTime())) return getDhakaTodayDateString();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: DHAKA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return getDhakaTodayDateString();
  }
}

/**
 * Convert UTC ISO string to Dhaka 'HH:mm' for time inputs
 */
export function utcIsoToDhakaTimeInput(utcIso: string): string {
  try {
    const d = new Date(utcIso);
    if (isNaN(d.getTime())) return '12:00';
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: DHAKA_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return '12:00';
  }
}

/**
 * Display formatted date in Asia/Dhaka (e.g., "19 Oct 2026", "Today", "Yesterday")
 */
export function formatDhakaDisplayDate(utcIso: string, includeRelative = false): string {
  try {
    const d = new Date(utcIso);
    if (isNaN(d.getTime())) return 'Invalid date';

    if (includeRelative) {
      const today = getDhakaTodayDateString();
      const dateInDhaka = utcIsoToDhakaDateInput(utcIso);
      if (dateInDhaka === today) return 'Today';

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayInDhaka = new Intl.DateTimeFormat('en-CA', {
        timeZone: DHAKA_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(yesterday);
      if (dateInDhaka === yesterdayInDhaka) return 'Yesterday';
    }

    return new Intl.DateTimeFormat('en-US', {
      timeZone: DHAKA_TIMEZONE,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Display formatted date & time in Asia/Dhaka (e.g., "19 Oct, 4:30 PM")
 */
export function formatDhakaDisplayDateTime(utcIso: string): string {
  try {
    const d = new Date(utcIso);
    if (isNaN(d.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: DHAKA_TIMEZONE,
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Calculate difference in days from Dhaka today to the due date
 * Positive = future, 0 = today, negative = past (overdue)
 */
export function getDaysUntilDue(dueDateIso: string): number {
  const todayDhakaStr = getDhakaTodayDateString();
  const dueDhakaStr = dueDateIso.includes('T') ? utcIsoToDhakaDateInput(dueDateIso) : dueDateIso;

  const todayDhaka = new Date(`${todayDhakaStr}T00:00:00+06:00`);
  const dueDhaka = new Date(`${dueDhakaStr}T00:00:00+06:00`);

  const diffMs = dueDhaka.getTime() - todayDhaka.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine bill status dynamically if not paid
 */
export function resolveBillStatus(bill: { status: 'paid' | 'pending' | 'overdue'; dueDate: string }): 'paid' | 'pending' | 'overdue' {
  if (bill.status === 'paid') return 'paid';
  const days = getDaysUntilDue(bill.dueDate);
  return days < 0 ? 'overdue' : 'pending';
}
