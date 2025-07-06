import { isEmpty } from '@stone-js/core'
import { phone as phoneNormalizer } from 'phone'
import { BadRequestError } from '@stone-js/http-core'

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

/**
 * Normalizes a phone number to a standard format.
 *
 * @param phone - The phone number to normalize.
 * @param mustThrow - Whether to throw an error if the phone number is invalid or empty.
 * @returns The normalized phone number as a string.
 */
export function normalizePhone (phone?: string, mustThrow?: true): string

/**
 * Normalizes a phone number to a standard format.
 *
 * @param phone - The phone number to normalize.
 * @param mustThrow - Whether to throw an error if the phone number is invalid or empty.
 * @returns The normalized phone number as a string.
 */
export function normalizePhone (phone?: string, mustThrow?: false): string | undefined

/**
 * Normalizes a phone number to a standard format.
 *
 * @param phone - The phone number to normalize.
 * @param mustThrow - Whether to throw an error if the phone number is invalid or empty.
 * @returns The normalized phone number as a string.
 */
export function normalizePhone (phone?: string, mustThrow: boolean = false): string | undefined {
  const phoneNumber = phoneNormalizer(phone ?? '').phoneNumber

  if (mustThrow && isEmpty(phoneNumber)) {
    throw new BadRequestError('Invalid phone number')
  }

  return phoneNumber ?? undefined
}
