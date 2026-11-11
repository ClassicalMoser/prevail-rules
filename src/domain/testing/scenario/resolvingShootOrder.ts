import type { UnitInstance } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createIssueCommandsPhaseState } from '@testing/phaseStateHelpers';
import { createTestCard, createTestCommand } from '../testHelpers/cardHelpers';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

/**
 * Puts the game at the point where the player with initiative is carrying
 * out a Shoot order for the given units, one shot at a time (§4.3.11): a
 * Shoot card in play, and the units still to act. The other side still has
 * an order of its own to give, so when this order is done play has
 * somewhere valid to go next instead of a phase the sequencer rejects as
 * inconsistent.
 *
 * @param state - A playable game
 * @param units - The units the order names, all of the initiative holder's side
 * @returns The game, waiting for the first `chooseShooter`
 */
export function resolvingShootOrder(
  state: AuthoritativeGameState,
  units: readonly UnitInstance[],
): AuthoritativeGameState {
  // The order being carried out is the Shoot card the initiative holder
  // played this round; the stand-in card's command is a Move, so its
  // command is swapped for a Shoot.
  const shooter = state.currentInitiative;
  const shootCard = {
    ...createTestCard(),
    command: createTestCommand({ type: 'rangedAttack' }),
  };
  const withOrder = updatePlayerCardState(state, shooter, {
    ...state.cardState[shooter],
    inPlay: shootCard,
  });

  // The order's units wait their turn to shoot, and the other side's order is
  // still to be issued.
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
