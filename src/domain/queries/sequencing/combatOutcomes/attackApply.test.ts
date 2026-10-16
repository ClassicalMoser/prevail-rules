import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getDefendingPlayerForNextIncompleteMeleeAttackApply,
} from './attackApply';

/**
 * Attack-apply readers. Ranged and melee readers return the slice the test
 * installed. The defender reader walks initiative order.
 */
describe('getAttackApplyStateFromRangedAttack function', () => {
  it('returns the attack apply on the ranged resolution', () => {
    const empty = createEmptyGameState('standard');
    const apply = createAttackApplyState(
      createTestUnit('white', { attack: 2 }),
      { completed: true },
    );
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
    });
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(getAttackApplyStateFromRangedAttack(state)).toBe(apply);
  });

  it('throws when the ranged attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getAttackApplyStateFromRangedAttack(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('throws when the command resolution is movement', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getAttackApplyStateFromRangedAttack(state)).toThrow(
      'Current command resolution is not a ranged attack',
    );
  });
});

describe('getAttackApplyStateFromMelee function', () => {
  it('returns the white attack apply', () => {
    const empty = createEmptyGameState('standard');
    const apply = createAttackApplyState(
      createTestUnit('white', { attack: 2 }),
      { completed: true },
    );
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: apply,
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getAttackApplyStateFromMelee(state, 'white')).toBe(apply);
  });

  it('returns the black attack apply', () => {
    const empty = createEmptyGameState('standard');
    const apply = createAttackApplyStateWithRout(
      createTestUnit('black', { attack: 2 }),
    );
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: apply,
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getAttackApplyStateFromMelee(state, 'black')).toBe(apply);
  });

  it('throws when the white attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: 'pending',
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getAttackApplyStateFromMelee(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});

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
