import type { PlayerSide } from '@entities';

/**
 * Gets the opposite player from the one provided.
 * @param player - The player side to get the opposite player for
 * @returns The opposite player side
 */
export function getOtherPlayer(player: PlayerSide): PlayerSide {
  if (player === 'black') {
    return 'white';
  } else if (player === 'white') {
    return 'black';
  } else {
    throw new Error(`Invalid player side: ${player}`);
  }
}
