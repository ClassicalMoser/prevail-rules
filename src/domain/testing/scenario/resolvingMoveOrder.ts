import type { UnitInstance } from '@entities';
import type { GameStateForVisibility } from '@game';
import { createIssueCommandsPhaseState } from '@testing/phaseStateHelpers';
import { createTestCommand } from '../testHelpers/cardHelpers';
import { updatePhaseState } from '@transforms';

/**
 * Puts the game at the point where the player with initiative is carrying
 * out a Move order for the given units, one `moveUnit` choice at a time
 * (§4.3.10). The other side still has an order of its own to give, so when
 * this order is done play has somewhere valid to go next instead of a
 * phase the sequencer rejects as inconsistent.
 *
 * @param state - A playable game
 * @param units - The units the order names, all of the initiative holder's side
 * @returns The game, waiting for the first `moveUnit`
 */
export function resolvingMoveOrder(
  state: GameStateForVisibility<'authoritative'>,
  units: readonly UnitInstance[],
): GameStateForVisibility<'authoritative'> {
  const resolving = updatePhaseState(
    state,
    createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: 'pending',
      remainingCommandsSecondPlayer: [createTestCommand()],
      remainingUnitsFirstPlayer: [...units],
      step: 'firstPlayerResolveCommands',
    }),
  );
  return resolving;
}
