import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMeleeResolutionState } from './getMeleeResolutionState';

/** A caller that knows a melee is being fought in Phase 4 reads it here. */
describe('getMeleeResolutionState function', () => {
  it('returns the melee being fought', () => {
    // Phase 4, with a melee under way.
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty);
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    // The melee this test opened.
    expect(getMeleeResolutionState(state)).toBe(melee);
  });

  it('throws in Phase 3, before any melee is fought', () => {
    // Orders are still being carried out.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createIssueCommandsPhaseState());

    // Asking for a melee here is out of turn.
    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('throws before the round has entered a phase', () => {
    // No round is under way, so no melee can be.
    const state = createEmptyGameState('standard');

    // The same refusal as in any other phase.
    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('throws between one melee and the next', () => {
    // The first player has still to choose the next space (§4.4.2).
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: 'pending',
    });
    const state = updatePhaseState(empty, phase);

    // There is no melee to insist on.
    expect(() => getMeleeResolutionState(state)).toThrow(
      'No current melee resolution state',
    );
  });
});
