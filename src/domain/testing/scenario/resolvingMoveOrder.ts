import type { UnitInstance } from '@entities';
import type { GameStateForVisibility } from '@game';
import { createIssueCommandsPhaseState } from '@testing/phaseStateHelpers';
import { createTestCard, createTestCommand } from '../testHelpers/cardHelpers';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

/**
 * Puts the game at the point where the player with initiative is carrying
 * out a Move order for the given units, one unit at a time (§4.3.10): a
 * Move card in play, and the units still to move. The other side still has an order of its own to give, so when
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
  // The order being carried out is the Move card the initiative holder
  // played this round.
  const mover = state.currentInitiative;
  const withOrder = updatePlayerCardState(state, mover, {
    ...state.cardState[mover],
    inPlay: createTestCard(),
  });
  const resolving = updatePhaseState(
    withOrder,
    createIssueCommandsPhaseState(withOrder, {
      currentCommandResolutionState: 'pending',
      remainingCommandsSecondPlayer: [createTestCommand()],
      remainingUnitsFirstPlayer: [...units],
      step: 'firstPlayerResolveCommands',
    }),
  );
  return resolving;
}
