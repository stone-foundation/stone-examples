import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

/**
 * Utility function to play a sound.
 *
 * @param src - The source URL of the sound file to play.
 */
export const playSound = (src: string): void => {
  const audio = new Audio(src)
  audio.play().catch(() => {
    // Silently ignore autoplay restrictions or errors
  })
}

/**
 * Get the time from now
 *
 * @param date - Date in milliseconds
 * @returns The time from now
 */
export const dateTimeFromNow = (date: number): string => {
  return dayjs(date).fromNow()
}

/**
 * Format a date as "DD MMM YYYY HH:mm"
 *
 * @param date - Date in milliseconds
 * @returns The formatted date string
 */
export const formatDateTime = (date: number): string => {
  // Ensure the date is in milliseconds (pad if it's in seconds)
  const ms = date < 1e12 ? date * 1000 : date
  return dayjs(ms).format('DD MMM YYYY hh:mm A')
}