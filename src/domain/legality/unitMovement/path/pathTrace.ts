import type { MoveResult } from '../explore';

/**
 * The verdict on a submitted path: the ending it reaches and what that
 * cost, or the reason the rules refuse it. Shaped like a `ValidationResult`
 * so a validator can pass the refusal straight back to the player.
 */
export type PathTrace =
  | { result: true; ending: MoveResult }
  | { result: false; errorReason: string };
