import type { PlayerSide } from '@entities';
import type { CommanderIndexEntry, GameStateIndex } from '@game';

/**
 * The index with one side's commander filed afresh: where it now is, every
 * other entry as it was. A shared step of the writers that move a commander,
 * each of which changes the record and files the commander in the same new
 * state; never called on its own.
 *
 * @param index - The index as it was
 * @param side - The side whose commander's entry changes
 * @param entry - Where it now is: a space, in reserve, or lost
 * @returns A new index with that one entry overwritten
 */
export function fileCommanderInIndex(
  index: GameStateIndex,
  side: PlayerSide,
  entry: CommanderIndexEntry,
): GameStateIndex {
  // Only this side's entry changes, so the other commander and every unit
  // are found where they were.
  const filed: GameStateIndex = {
    ...index,
    commanders: { ...index.commanders, [side]: entry },
  };

  // The index with the commander filed where it now is.
  return filed;
}
