import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createMeleeResolutionState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { getDefendingPlayerForNextIncompleteMeleeAttackApply } from './getDefendingPlayerForNextIncompleteMeleeAttackApply';

describe('getDefendingPlayerForNextIncompleteMeleeAttackApply function', () => {
  it('returns the first player while that apply is incomplete', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyState(
        createTestUnit('black', { attack: 2 }),
        { completed: true },
      ),
      whiteAttackApplyState: createAttackApplyState(
        createTestUnit('white', { attack: 2 }),
        { completed: false },
      ),
    });

    expect(
      getDefendingPlayerForNextIncompleteMeleeAttackApply(empty, melee),
    ).toBe('white');
  });

  it('returns the second player when the first apply is complete', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyState(
        createTestUnit('black', { attack: 2 }),
        { completed: false },
      ),
      whiteAttackApplyState: createAttackApplyState(
        createTestUnit('white', { attack: 2 }),
        { completed: true },
      ),
    });

    expect(
      getDefendingPlayerForNextIncompleteMeleeAttackApply(empty, melee),
    ).toBe('black');
  });

  it('returns null when both applies are complete', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyState(
        createTestUnit('black', { attack: 2 }),
        { completed: true },
      ),
      whiteAttackApplyState: createAttackApplyState(
        createTestUnit('white', { attack: 2 }),
        { completed: true },
      ),
    });

    expect(
      getDefendingPlayerForNextIncompleteMeleeAttackApply(empty, melee),
    ).toBeNull();
  });

  it('returns null when an apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyState(
        createTestUnit('black', { attack: 2 }),
      ),
      whiteAttackApplyState: 'pending',
    });

    expect(
      getDefendingPlayerForNextIncompleteMeleeAttackApply(empty, melee),
    ).toBeNull();
  });
});
