import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createUnitWithPlacement,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
} from '@testing';

import { getRetreatAwaitingRout } from './getRetreatAwaitingRout';

/**
 * A retreat with nowhere to go turns into a rout (§9.1.6); asking for the one
 * waiting to, when none is, is a fault.
 */
describe('getRetreatAwaitingRout function', () => {
  it('returns the retreat a shot forced with nowhere to go', () => {
    // The shot drove Black's unit back, and an enemy at its back cuts the
    // line of withdrawal (§9.1.5), so it has no retreat to make.
    const empty = createEmptyGameState('standard');
    const defender = createUnitWithPlacement({ playerSide: 'black' });
    const cutOff = createRetreatState(
      defender.unit,
      legalRetreatsOf(defender, [enemyCuttingOffRetreat(defender)]),
    );
    const state = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, {
        attackApplyState: createAttackApplyStateWithRetreat(
          defender.unit,
          legalRetreatsOf(defender),
          { retreatState: cutOff },
        ),
        defendingUnit: defender.unit,
      }),
    );

    expect(getRetreatAwaitingRout(state)).toStrictEqual({
      retreatState: cutOff,
      source: 'rangedAttack',
    });
  });

  it('throws when a front engagement’s retreat has nowhere to go', () => {
    // A defender met head-on is offered a retreat only when it has one to
    // make (§6.3.2), so a front engagement holding a retreat with no path is
    // a state no game reaches.
    const empty = createEmptyGameState('standard');
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const state = createGameStateResolvingCommand(
      createMovementResolutionState(empty, {
        engagementState: createFrontEngagementState({
          defendingUnitRetreats: true,
          retreatState: createRetreatState(
            defender.unit,
            legalRetreatsOf(defender, [enemyCuttingOffRetreat(defender)]),
          ),
        }),
      }),
    );

    expect(() => getRetreatAwaitingRout(state)).toThrow(
      'A front engagement retreat always has a legal path',
    );
  });

  it('throws when no retreat is waiting to turn into a rout', () => {
    // Setup has no phase, so nobody is falling back.
    expect(() =>
      getRetreatAwaitingRout(createEmptyGameState('standard')),
    ).toThrow('No retreat with nowhere to go is waiting for its rout');
  });
});
