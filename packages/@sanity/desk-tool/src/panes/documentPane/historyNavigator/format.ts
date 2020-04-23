import {
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  isSameYear,
  isToday,
  isYesterday
} from 'date-fns'

export function formatDate(now: number, date: Date | number): string {
  if (isToday(date)) {
    const diff = {
      hours: differenceInHours(now, date),
      minutes: differenceInMinutes(now, date),
      seconds: differenceInSeconds(now, date)
    }

    if (diff.hours) {
      return `${diff.hours}h`
    }

    if (diff.minutes) {
      return `${diff.minutes}m`
    }

    if (diff.seconds > 0) {
      return `${diff.seconds}s`
    }

    return 'Now'
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  if (isSameYear(now, date)) {
    return format(date, 'MMM d @ HH:mm:ss')
  }

  return format(date, 'MMM d, YYYY @ HH:mm:ss')
}
