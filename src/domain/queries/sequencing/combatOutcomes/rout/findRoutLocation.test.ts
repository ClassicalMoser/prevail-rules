import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  createUnitWithPlacement,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRoutLocation } from './findRoutLocation';

describe('findRoutLocation function', () => {
  it('answers undefined before the round has a phase', () => {
    // Setup has no phase yet, and the endgame check asks on every state.
    expect(
      findRoutLocation(createEmptyGameState('standard'), 'white'),
    ).toBeUndefined();
  });

  it('answers undefined in a phase that routs nobody', () => {
    // Playing cards moves no units and so routs none.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(findRoutLocation(state, 'white')).toBeUndefined();
  });

  it('answers undefined between commands', () => {
    // No command is being carried out, so nothing has broken anyone.
    expect(
      findRoutLocation(createGameStateResolvingCommand('pending'), 'white'),
    ).toBeUndefined();
  });

  it('names the ranged attack that routed the defender', () => {
    // The shot reached White's unit's Rout.
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
      defendingUnit: defender,
    });

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'white'),
    ).toStrictEqual({
      routState: rout,
      source: 'rangedAttack',
    });
  });

  it('answers undefined when the rout belongs to the other player', () => {
    const empty = createEmptyGameState('standard');
    // One rout, and it is White's to pay for.
    const defender = createTestUnit('white', { attack: 2 });
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender),
      defendingUnit: defender,
    });

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'black'),
    ).toBeUndefined();
  });

  it('answers undefined while the shot is not yet measured', () => {
    // The shot is aimed but its apply is not written.
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'white'),
    ).toBeUndefined();
  });

  it('answers undefined when the shot routed nobody', () => {
    // The shot reached no threshold, so its rout slot is bypassed.
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithNothingDue(defender),
      defendingUnit: defender,
    });

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'white'),
    ).toBeUndefined();
  });

  it('answers undefined when a movement has engaged nobody', () => {
    // A move into an empty space breaks nobody.
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'white'),
    ).toBeUndefined();
  });

  it('names the rear engagement that routed the defender', () => {
    // Engaging White's unit from behind routs it outright (§6.3.3).
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty, {
      engagementState: createRearEngagementState(),
    });

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'white')
        ?.source,
    ).toBe('rearEngagementMovement');
  });

  it('answers undefined in a flank engagement', () => {
    // A defender caught in the flank is turned, not routed (§6.3.4).
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFlankEngagementState(),
    });

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'white'),
    ).toBeUndefined();
  });

  it('answers undefined while a front-engaged defender has not yet chosen', () => {
    // The engagement has just begun, so no retreat is open on it.
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFrontEngagementState(),
    });

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'white'),
    ).toBeUndefined();
  });

  it('answers undefined when a front-engaged defender gives ground', () => {
    // White's defender has somewhere to go, so its retreat holds no rout.
    const empty = createEmptyGameState('standard');
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

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'white'),
    ).toBeUndefined();
  });

  it('answers each side of a melee about its own rout', () => {
    // Both units strike at once, so a melee can hold a rout for each side.
    // Initiative decides which resolves first and not which rout is whose.
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const blackDefender = createTestUnit('black', { attack: 2 });
    const whiteDefender = createTestUnit('white', { attack: 2 });
    const blackRout = createRoutState('black', blackDefender);
    const whiteRout = createRoutState('white', whiteDefender);
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRout(
        blackDefender,
        { routState: blackRout },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRout(
        whiteDefender,
        { routState: whiteRout },
      ),
    });
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    // Each player is answered from the slot holding their own unit.
    expect(findRoutLocation(state, 'black')).toStrictEqual({
      routState: blackRout,
      source: 'melee',
    });
    expect(findRoutLocation(state, 'white')).toStrictEqual({
      routState: whiteRout,
      source: 'melee',
    });
  });

  it('answers undefined between engagements', () => {
    // No melee is being fought, so nobody is routing from one.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: 'pending',
      }),
    );

    expect(findRoutLocation(state, 'white')).toBeUndefined();
  });

  it('answers undefined while the blow on this side is not yet measured', () => {
    // White holds the initiative; Black's blow on White's unit is not written.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: createMeleeResolutionState(empty, {
          attackOnFirstPlayerApplyState: 'pending',
        }),
      }),
    );

    expect(findRoutLocation(state, 'white')).toBeUndefined();
  });

  it('names the rally that routed the unsupported units', () => {
    // White rallied first, and its support check left a unit without a place.
    const empty = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', unit);
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          routState: rout,
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    expect(findRoutLocation(state, 'white')).toStrictEqual({
      routState: rout,
      source: 'rally',
    });
  });

  it('finds no rally rout once cleanup is past the rallies', () => {
    // White holds initiative, so black rallied second. Black's rally routed a
    // unit and the step has moved on to the end of the round.
    const empty = createEmptyGameState('standard');
    const unit = createTestUnit('black', { attack: 2 });
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({
        secondPlayerRallyResolutionState: createRallyResolutionState({
          routState: createRoutState('black', unit),
        }),
        step: 'complete',
      }),
    );

    // No rally is being resolved on this step, so there is no rally rout to
    // locate, whatever a finished rally still holds.
    expect(findRoutLocation(state, 'black')).toBeUndefined();
  });

  it('answers undefined while the rallying player has not yet chosen', () => {
    // White, the first player, is deciding whether to rally, so no rally has
    // been made and nothing has routed from one.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );

    expect(findRoutLocation(state, 'white')).toBeUndefined();
  });

  it('names the retreat when the defender had nowhere to go', () => {
    // The rout is nested on the retreat, so it is resolved against the retreat
    // and not against the attack that forced it.
    const empty = createEmptyGameState('standard');
    const standing = createUnitWithPlacement({ playerSide: 'black' });
    const defender = standing.unit;
    const nested = createRoutState('black', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        standing.unit,
        legalRetreatsOf(standing),
        {
          retreatState: createRetreatState(
            standing.unit,
            legalRetreatsOf(standing, [enemyCuttingOffRetreat(standing)]),
            {
              routState: nested,
            },
          ),
        },
      ),
      defendingUnit: defender,
    });

    expect(
      findRoutLocation(createGameStateResolvingCommand(resolution), 'black'),
    ).toStrictEqual({
      routState: nested,
      source: 'retreat',
    });
  });

  it('throws on a rout inside a front engagement’s retreat, which cannot happen', () => {
    // A defender met head-on is offered a retreat only if it has somewhere to
    // go (§6.3.2), so it never falls into a rout from that retreat. Finding
    // one means the state was built wrong.
    const empty = createEmptyGameState('standard');
    const standing = createUnitWithPlacement({ playerSide: 'black' });
    const defender = standing.unit;
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFrontEngagementState({
        retreatState: createRetreatState(
          standing.unit,
          legalRetreatsOf(standing, [enemyCuttingOffRetreat(standing)]),
          { routState: createRoutState('black', defender) },
        ),
      }),
    });

    expect(() =>
      findRoutLocation(createGameStateResolvingCommand(resolution), 'black'),
    ).toThrow('A front engagement’s retreat holds a rout');
  });

  it('throws on an order of a kind the rules do not name', () => {
    // An order is a move or a shot; the type forbids any other, so the spec
    // forces one through to reach the fault.
    const charge = { commandResolutionType: 'charge' } as never;

    expect(() =>
      findRoutLocation(createGameStateResolvingCommand(charge), 'white'),
    ).toThrow('Unknown command resolution type: charge');
  });
});
