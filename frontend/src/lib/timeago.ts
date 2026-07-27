import { differenceInSeconds } from 'date-fns';

export function getDueInLabel(dueDate: string): string {
  const now = new Date();
  const due = new Date(dueDate);
  const totalSeconds = differenceInSeconds(due, now);

  if (totalSeconds < 0) {
    const absSeconds = Math.abs(totalSeconds);
    return formatDuration(absSeconds, 'overdue');
  }

  return formatDuration(totalSeconds, 'due');
}

function formatDuration(totalSeconds: number, prefix: 'due' | 'overdue'): string {
  const years = Math.floor(totalSeconds / (365.25 * 24 * 60 * 60));
  const months = Math.floor((totalSeconds % (365.25 * 24 * 60 * 60)) / (30.44 * 24 * 60 * 60));
  const days = Math.floor((totalSeconds % (30.44 * 24 * 60 * 60)) / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

  const parts: string[] = [];

  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0 && years === 0 && months === 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0 && years === 0 && months === 0 && days === 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);

  if (parts.length === 0) {
    return prefix === 'overdue' ? 'overdue now' : 'due now';
  }

  const joined = parts.slice(0, 2).join(' ');
  return prefix === 'overdue' ? `${joined} overdue` : `due in ${joined}`;
}
