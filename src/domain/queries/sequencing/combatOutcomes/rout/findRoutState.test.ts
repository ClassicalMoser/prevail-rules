import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRout,
  createGameStateResolvingCommand,
  createRangedAttackResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';

import { findRoutState } from './findRoutState';

/**
 * The rout `findRoutLocation` finds, without the parent holding it. Where the
 * walk looks is that query's spec; this one shows only what is handed back.
 */
describe('findRoutState function', () => {
  it('finds the rout a ranged attack opened', () => {
    const empty = createEmptyGameState('standard');
    // The shot reached White's unit's Rout.
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
      defendingUnit: defender,
    });

    // The rout itself, with no parent beside it.
    expect(
      findRoutState(createGameStateResolvingCommand(resolution), 'white'),
    ).toBe(rout);
  });

  it('answers undefined when the attack routed nobody', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached no threshold, so its rout slot is bypassed.
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithNothingDue(defender),
      defendingUnit: defender,
    });

    expect(
      findRoutState(createGameStateResolvingCommand(resolution), 'white'),
    ).toBeUndefined();
  });
});
