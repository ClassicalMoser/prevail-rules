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
    firstPlayerCommitment: completedCommitment(
      state.cardState[state.currentInitiative].inPlay,
    ),
    secondPlayerCommitment: completedCommitment(
      state.cardState[getOtherPlayer(state.currentInitiative)].inPlay,
    ),
    ...overrides,
  };
  return melee;
}
