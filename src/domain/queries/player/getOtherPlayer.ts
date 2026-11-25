import type { PlayerSide } from '@entities';

/**
 * Gets the opposite player from the one provided.
 * @param player - The player side to get the opposite player for
 * @returns The opposite player side
 */
export function getOtherPlayer(player: PlayerSide): PlayerSide {
  // Two sides face each other across the board, so Black's opponent is White …
  if (player === 'black') {
    return 'white';
  } else if (player === 'white') {
    // … and White's is Black.
    return 'black';
  }

  // Only a value the side type forbids reaches here, so it is a fault, not a
  // third side.
  throw new Error(`Invalid player side: ${player}`);
}
