import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRetreatLocation } from './findRetreatLocation';

describe('findRetreatLocation function', () => {
  it('answers undefined before the round has a phase', () => {
    // Setup has no phase yet, and the endgame check asks on every state.
    const state = createEmptyGameState('standard');

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('answers undefined in a phase where nobody falls back', () => {
    // Playing cards moves no units.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('answers undefined between commands', () => {
    // No command is being carried out, so nothing has forced a retreat.
    const state = createGameStateResolvingCommand('pending');

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('returns the white retreat on a ranged attack, held by the attack', () => {
    const empty = createEmptyGameState('standard');
    // The shot drove White's unit back, and its retreat is open.
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(
      defender.unit,
      legalRetreatsOf(defender),
    );
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender.unit,
        legalRetreatsOf(defender),
        { retreatState: retreat },
      ),
      defendingUnit: defender.unit,
    });
    const state = createGameStateResolvingCommand(resolution);

    expect(findRetreatLocation(state, 'white')).toStrictEqual({
      retreatState: retreat,
      source: 'rangedAttack',
    });
  });

  it('answers undefined when the retreat belongs to the other player', () => {
    const empty = createEmptyGameState('standard');
    // The shot drove White's unit back.
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender.unit,
        legalRetreatsOf(defender),
      ),
      defendingUnit: defender.unit,
    });
    const state = createGameStateResolvingCommand(resolution);

    // The defender of a ranged attack may be either side's unit, so black is
    // entitled to ask and entitled to a no.
    expect(findRetreatLocation(state, 'black')).toBeUndefined();
  });

  it('answers undefined while the shot is not yet measured', () => {
    // The shot has been aimed but its apply is not written.
    const empty = createEmptyGameState('standard');
    const state = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, { attackApplyState: 'pending' }),
    );

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('answers undefined when the shot did not reach the target’s Retreat', () => {
    // The shot reached nothing, so its retreat slot is bypassed.
    const empty = createEmptyGameState('standard');
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const state = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, {
        attackApplyState: createAttackApplyStateWithNothingDue(defender.unit),
        defendingUnit: defender.unit,
      }),
    );

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('answers undefined when a movement has engaged nobody', () => {
    const empty = createEmptyGameState('standard');
    // A move that opened no engagement forces no retreat, which is ordinary.
    const state = createGameStateResolvingCommand(
      createMovementResolutionState(empty),
    );

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('returns the retreat nested on a front engagement, held by the engagement', () => {
    const empty = createEmptyGameState('standard');
    // White's defender, met head-on, chose to give ground.
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(
      defender.unit,
      legalRetreatsOf(defender),
    );
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFrontEngagementState({
        defendingUnitRetreats: true,
        retreatState: retreat,
      }),
    });
    const state = createGameStateResolvingCommand(resolution);

    expect(findRetreatLocation(state, 'white')).toStrictEqual({
      retreatState: retreat,
      source: 'frontEngagement',
    });
  });

  it('answers undefined for the engaging player, who holds the space', () => {
    const empty = createEmptyGameState('standard');
    // White's defender gave ground to Black's engaging unit.
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFrontEngagementState({
        defendingUnitRetreats: true,
        retreatState: createRetreatState(
          defender.unit,
          legalRetreatsOf(defender),
        ),
      }),
    });
    const state = createGameStateResolvingCommand(resolution);

    // Only the defender falls back from a front engagement (§6.3.2).
    expect(findRetreatLocation(state, 'black')).toBeUndefined();
  });

  it('answers undefined while a front-engaged defender has not yet chosen', () => {
    // The engagement has just begun, and its retreat slot is still pending.
    const empty = createEmptyGameState('standard');
    const state = createGameStateResolvingCommand(
      createMovementResolutionState(empty, {
        engagementState: createFrontEngagementState(),
      }),
    );

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('answers undefined in a flank engagement', () => {
    // A defender caught in the flank is turned and may not fall back (§6.3.4).
    const empty = createEmptyGameState('standard');
    const state = createGameStateResolvingCommand(
      createMovementResolutionState(empty, {
        engagementState: createFlankEngagementState(),
      }),
    );

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('answers each side of a melee about its own unit’s retreat', () => {
    // Black holds the initiative, so Black's unit is in the first slot and
    // White's in the second, and both were driven back.
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const black = createUnitWithPlacement({ playerSide: 'black' });
    const white = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'white',
    });
    const blackRetreat = createRetreatState(black.unit, legalRetreatsOf(black));
    const whiteRetreat = createRetreatState(white.unit, legalRetreatsOf(white));
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        { retreatState: blackRetreat },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
        { retreatState: whiteRetreat },
      ),
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    // Each player is answered from the slot holding their own unit.
    expect(findRetreatLocation(state, 'black')).toStrictEqual({
      retreatState: blackRetreat,
      source: 'melee',
    });
    expect(findRetreatLocation(state, 'white')).toStrictEqual({
      retreatState: whiteRetreat,
      source: 'melee',
    });
  });

  it('answers undefined between engagements', () => {
    // No melee is being fought, so nobody is falling back from one.
    const state = createGameStateResolvingMelee('pending');

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('answers undefined when the blow on this unit reached no Retreat', () => {
    // White holds the initiative; Black's blow on White's unit reached nothing.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithNothingDue(
        white.unit,
      ),
    });
    const state = createGameStateResolvingMelee(melee);

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });
});
