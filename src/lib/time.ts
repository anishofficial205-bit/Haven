import { strings } from '@/i18n/en';

/** "5m ago", "3h ago", "2d ago". Deliberately vague beyond a week. */
export function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return strings.time.now;
  if (minutes < 60) return strings.time.minutes(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return strings.time.hours(hours);
  return strings.time.days(Math.floor(hours / 24));
}
