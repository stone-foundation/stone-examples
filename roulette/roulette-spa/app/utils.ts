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
