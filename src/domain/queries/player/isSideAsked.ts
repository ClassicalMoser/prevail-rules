import type { PlayerSide } from '@entities';
import type { PlayerSource } from '@events';

/**
 * Whether a side is one the next choice is asked of. Most choices are asked
 * of one side; choosing cards is asked of both at once, in secret (§4.1.1),
 * until one of them has laid its card face down, and from then of the other
 * alone.
 *
 * @param source - Who the expected choice is asked of
 * @param side - The side in question
 * @returns True when that side is asked
 */
export function isSideAsked(source: PlayerSource, side: PlayerSide): boolean {
  // A choice asked of both players is asked of each of them.
  if (source === 'bothPlayers') {
    return true;
  }

  // Otherwise only the one side named is asked.
  const asked = source === side;
  return asked;
}
