import type { CommandCard, UnitWithPlacement } from '@entities';
import type { RangedAttackModifier } from '@events';
import type { GameStateForVisibility } from '@game';
import {
  createChooseFiringUnitEvent,
  createCommitToRangedAttackEvent,
} from '@factories';
import { applyEvent } from '@transforms';
import { applyEffectsUntilChoice } from './applyEffectsUntilChoice';

/**
 * Plays a Shoot order up to the point where the shot is aimed (§4.3.11):
 * the player names the shooter, then commits a card for the shot or
 * declines. What remains is the target and its supporters, which is what a
 * scenario is usually about, so everything before it lives here.
 *
 * @param state - A game waiting for the player to name the unit to fire
 * @param unit - The unit to fire, standing where the board has it
 * @param commitment - The card committed and what it adds, or `null` to decline
 * @returns The game waiting for the `performRangedAttack`, and the number that event must carry
 */
export function readyToAimShot(
  state: GameStateForVisibility<'authoritative'>,
  unit: UnitWithPlacement,
  commitment: {
    card: CommandCard;
    modifierTypes: RangedAttackModifier[];
  } | null,
): { state: GameStateForVisibility<'authoritative'>; eventNumber: number } {
  const player = unit.unit.playerSide;

  // The player names the unit whose shot this is...
  const start = applyEffectsUntilChoice(state);
  if (start.next === 'gameOver') {
    throw new Error('The game ended before the shooter was named');
  }
  const named = applyEffectsUntilChoice(
    applyEvent(
      createChooseFiringUnitEvent({
        eventNumber: start.next.expectedEventNumber,
        player,
        unit,
      }),
      start.state,
    ),
  );
  if (named.next === 'gameOver') {
    throw new Error('The game ended before the commitment was asked');
  }

  // ...then commits a card to the shot, or declines.
  const committed = applyEffectsUntilChoice(
    applyEvent(
      createCommitToRangedAttackEvent({
        committedCard: commitment?.card ?? null,
        eventNumber: named.next.expectedEventNumber,
        modifierTypes: commitment?.modifierTypes ?? [],
        player,
      }),
      named.state,
    ),
  );
  if (committed.next === 'gameOver') {
    throw new Error('The game ended before the shot was aimed');
  }

  const ready = {
    eventNumber: committed.next.expectedEventNumber,
    state: committed.state,
  };
  return ready;
}
