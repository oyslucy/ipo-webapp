import type { Tone } from '../domain/performance'

/** Korean market convention: gains in red, losses in blue. */
export const TONE_TEXT: Record<Tone, string> = { up: 'text-red-500', down: 'text-blue-500', flat: '' }
