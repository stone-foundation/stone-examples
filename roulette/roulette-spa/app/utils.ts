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
