import type { CommandCard, UnitWithPlacement } from '@entities';
import type { MovementModifier } from '@events';
import type { GameStateForVisibility } from '@game';
import {
  createChooseMovingUnitEvent,
  createCommitToMovementEvent,
} from '@factories';
import { applyEvent } from '@transforms';
import { applyEffectsUntilChoice } from './applyEffectsUntilChoice';

/**
 * Plays a Move order up to the point where the move itself is written
 * (§4.3.10): the player names the unit, then commits a card for its
 * movement or declines. What remains is the path, which is what a scenario
 * is usually about, so everything before it lives here.
 *
 * @param state - A game waiting for the player to name the unit to move
 * @param unit - The unit to move, standing where the board has it
 * @param commitment - The card committed and what it adds, or `null` to decline
 * @returns The game waiting for the `moveUnit`
 */
export function readyToWriteMove(
  state: GameStateForVisibility<'authoritative'>,
  unit: UnitWithPlacement,
  commitment: { card: CommandCard; modifierTypes: MovementModifier[] } | null,
): GameStateForVisibility<'authoritative'> {
  const player = unit.unit.playerSide;

  // The player names the unit whose move this is...
  const start = applyEffectsUntilChoice(state);
  if (start.next === 'gameOver') {
    throw new Error('The game ended before the unit was named');
  }
  const named = applyEffectsUntilChoice(
    applyEvent(
      createChooseMovingUnitEvent({
        player,
        unit,
      }),
      start.state,
    ),
  );
  if (named.next === 'gameOver') {
    throw new Error('The game ended before the commitment was asked');
  }

  // ...then commits a card to its movement, or declines.
  const committed = applyEffectsUntilChoice(
    applyEvent(
      createCommitToMovementEvent({
        committedCard: commitment?.card ?? null,
        modifierTypes: commitment?.modifierTypes ?? [],
        player,
      }),
      named.state,
    ),
  );
  if (committed.next === 'gameOver') {
    throw new Error('The game ended before the move was written');
  }

  return committed.state;
}
