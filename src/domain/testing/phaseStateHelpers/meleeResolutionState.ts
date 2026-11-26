import type { GameState, MeleeResolutionState } from '@game';
import { createOpenedMeleeResolutionState } from '@factories';
import { getOtherPlayer } from '@queries';
import { completedCommitment } from './completedCommitment';

/**
 * Creates a MeleeResolutionState with sensible defaults (standard board).
 */
export function createMeleeResolutionState(
  state: GameState,
  overrides?: Partial<MeleeResolutionState>,
): MeleeResolutionState {
  // A melee as it opens, with both commitments already made so a spec can start
  // at the attack.
  const opened = createOpenedMeleeResolutionState('E-5');
  const melee: MeleeResolutionState = {
    ...opened,
    // The first player commits first, then the second (§7.2.2), so each slot
    // takes the card of the side that holds that place this round.
    firstPlayerCommitment: completedCommitment(
      state.cardState[state.currentInitiative].inPlay,
    ),
    secondPlayerCommitment: completedCommitment(
      state.cardState[getOtherPlayer(state.currentInitiative)].inPlay,
    ),
    ...overrides,
  };

  // The melee, for `createResolveMeleePhaseState` to carry.
  return melee;
}
