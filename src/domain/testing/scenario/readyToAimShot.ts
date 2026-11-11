import type { CommandCard, UnitWithPlacement } from '@entities';
import type { AuthoritativeGameState } from '@game';
import {
  createChooseShooterEvent,
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
 * @param state - A game waiting for the player to name the shooter
 * @param unit - The shooter, standing where the board has it
 * @param commitment - The card committed, or `null` to decline
 * @returns The game waiting for the `performRangedAttack`
 */
export function readyToAimShot(
  state: AuthoritativeGameState,
  unit: UnitWithPlacement,
  commitment: CommandCard | null,
): AuthoritativeGameState {
  const player = unit.unit.playerSide;

  // The player names the unit whose shot this is...
  const start = applyEffectsUntilChoice(state);
  if (start.next === 'gameOver') {
    throw new Error('The game ended before the shooter was named');
  }
  const named = applyEffectsUntilChoice(
    applyEvent(
      createChooseShooterEvent({
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
        committedCard: commitment,
        player,
      }),
      named.state,
    ),
  );
  if (committed.next === 'gameOver') {
    throw new Error('The game ended before the shot was aimed');
  }

  return committed.state;
}
