import { Color } from '../constants'

/**
 * Spin Payload Interface
 * Represents the payload sent when a spin is requested.
 */
export interface SpinPayload {
  name: string
  missionUuid: string
}

/**
 * Spin Result Interface
 */
export interface SpinResult {
  color: Color
}
