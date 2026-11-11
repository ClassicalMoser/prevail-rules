import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createMeleeResolutionState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { findNextMeleeDefendingPlayer } from './findNextMeleeDefendingPlayer';

describe('findNextMeleeDefendingPlayer function', () => {
  it('returns the first player while that apply is incomplete', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('black', { attack: 2 }),
        { completed: true },
      ),
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('white', { attack: 2 }),
        { completed: false },
      ),
    });

    expect(findNextMeleeDefendingPlayer(melee)).toBe('white');
  });

  it('returns the second player when the first apply is complete', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('black', { attack: 2 }),
        { completed: false },
      ),
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('white', { attack: 2 }),
        { completed: true },
      ),
    });

    expect(findNextMeleeDefendingPlayer(melee)).toBe('black');
  });

  it('returns undefined when both applies are complete', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('black', { attack: 2 }),
        { completed: true },
      ),
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('white', { attack: 2 }),
        { completed: true },
      ),
    });

    expect(findNextMeleeDefendingPlayer(melee)).toBeUndefined();
  });

  it('returns undefined when an apply is still pending', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('black', { attack: 2 }),
      ),
      firstPlayerAttackApplyState: 'pending',
    });

    expect(findNextMeleeDefendingPlayer(melee)).toBeUndefined();
  });
});
