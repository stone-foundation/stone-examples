/**
 * Converts a tab-separated values (TSV) string to a JSON array.
 *
 * @param content - The TSV content as a string.
 * @returns An array of objects representing the TSV data, where each object corresponds to a row
 */
export function convertCSVtoJSON<R = Array<Record<string, any>>> (content: string): R {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')

  return lines.slice(1).map(line => {
    const values = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]?.trim()]))
  }) as R
}
