import type { EngagementType, UnitFacing } from '@entities';
import type { StartEngagementEvent } from '@events';
import type { GameState, MovementResolutionState } from '@game';
import {
  getBoardSpace,
  getFlankEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getRearEngagementStateFromMovement,
} from '@queries';
import {
  createBoardWithUnits,
  createGameStateResolvingCommand,
  createGameStateWithBoard,
  createMovementResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import {
  addCommanderToBoard,
  updateCurrentInitiative,
} from '@transforms/pureTransforms';
import { createUnitPlacement } from '@factories';

import { applyStartEngagementEvent } from './applyStartEngagementEvent';

/**
 * When a move enters an enemy hex, this seeds `engagementState` on the movement CRS from the
 * procedure’s `engagementType` (front vs rear rout vs flank rotation pipeline).
 */
describe('applyStartEngagementEvent function', () => {
  /** White's unit, standing on E-6. */
  const defender = createTestUnit('white');

  /** Black's unit, whose move from F-6 ends on E-6 facing north. */
  const mover = createTestUnit('black');

  /**
   * Black holds the initiative and carries out a Move: its unit has written
   * a move from F-6 into White's unit on E-6, ending facing north, and waits
   * on F-6 until the engagement places it. White's unit faces the way that
   * makes the engagement the case's kind (§6.3.1); if the commander rides,
   * Black's commander stands with the mover.
   */
  function movingIntoEnemy(
    defenderFacing: UnitFacing,
    options: {
      commanderRides?: boolean;
      movement?: Partial<MovementResolutionState>;
    } = {},
  ): GameState {
    const units = createBoardWithUnits([
      placed(defender, 'E-6', defenderFacing),
      placed(mover, 'F-6', 'north'),
    ]);
    const commanderRides = options.commanderRides ?? false;
    const board = commanderRides
      ? addCommanderToBoard(units, 'black', 'F-6')
      : units;
    const base = updateCurrentInitiative(
      createGameStateWithBoard(board),
      'black',
    );
    const movement = createMovementResolutionState(base, {
      moveCommander: commanderRides,
      movingUnit: mover,
      targetPlacement: createUnitPlacement('E-6', 'north'),
      ...options.movement,
    });
    const resolving = createGameStateResolvingCommand(movement, base);
    return resolving;
  }

  /** The procedure's answer: the kind of engagement, and the mover's Speed. */
  function startEngagement(
    engagementType: EngagementType,
    engagingSpeed = 2,
  ): StartEngagementEvent {
    const event: StartEngagementEvent = {
      defendingUnit: defender,
      effectType: 'startEngagement',
      engagementType,
      engagingSpeed,
      eventType: 'gameEffect',
    };
    return event;
  }

  it('sets a front attacker down with the defender at once, recording its Speed', () => {
    // Black waits on F-6; its move ends head-on into White facing south.
    const next = applyStartEngagementEvent(
      startEngagement('front', 3),
      movingIntoEnemy('south'),
    );

    // The attacker has left F-6 and stands engaged with White on E-6, before
    // the defender decides whether to fall back (§6.3.2).
    expect(getBoardSpace(next.boardState, 'F-6').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(getBoardSpace(next.boardState, 'E-6').unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'north',
      primaryUnit: mover,
      secondaryUnit: defender,
    });
    // The engagement is a front one, and keeps the Speed sampled where its
    // move began, to compare against the defender's.
    const front = getFrontEngagementStateFromMovement(next);
    expect(front.engagementResolutionState.engagingSpeed).toBe(3);
    // It stays open for the defender's commitment (§6.3.2 step 1).
    expect(front.completed).toBe(false);
  });

  it('a commander riding into a front engagement joins the fight with its unit', () => {
    // §4.3.10: the one way a commander comes to share an enemy's space.
    // Black's commander rides with the mover from F-6 into White on E-6.
    const next = applyStartEngagementEvent(
      startEngagement('front'),
      movingIntoEnemy('south', { commanderRides: true }),
    );

    // The commander has left F-6 with its unit and stands in the engaged
    // space, committed to the fight.
    expect(getBoardSpace(next.boardState, 'F-6').commanders).toStrictEqual([]);
    expect(getBoardSpace(next.boardState, 'E-6').commanders).toStrictEqual([
      'black',
    ]);
  });

  it('a rear engagement routs the defender off the board at once, its Morale owed by White', () => {
    // Black came from behind White, which faces north as Black does (§6.3.3).
    const next = applyStartEngagementEvent(
      startEngagement('rear'),
      movingIntoEnemy('north'),
    );

    // The defender is out of the game, with no melee and no reply.
    expect(next.routedUnits).toStrictEqual([defender]);
    // Its owner owes the Morale, which resolveRout works out, and the
    // engagement stays open until it is paid.
    const rear = getRearEngagementStateFromMovement(next);
    expect(rear.completed).toBe(false);
    expect(rear.engagementResolutionState.routState).toMatchObject({
      numberToDiscard: 'pending',
      player: 'white',
      unitsToRout: [defender],
    });
  });

  it('a rear engagement steps the attacker into the space its routed defender left', () => {
    // §6.3.3: the defender routs off the board at once, and the attacker
    // stands where it stood before its owner is asked for the Morale.
    const next = applyStartEngagementEvent(
      startEngagement('rear'),
      movingIntoEnemy('north'),
    );

    // The attacker has left its start space for the defender's.
    expect(getBoardSpace(next.boardState, 'F-6').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(getBoardSpace(next.boardState, 'E-6').unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit: mover,
    });
  });

  it("a commander riding into the defender's rear arrives with the attacker", () => {
    // §4.3.10: Black's commander stands with the attacker on F-6 and rides.
    // The rear engagement starts: the defender routs and the attacker takes
    // its space at once.
    const next = applyStartEngagementEvent(
      startEngagement('rear'),
      movingIntoEnemy('north', { commanderRides: true }),
    );

    // The commander is with the attacker in the space the defender left, and
    // the rout does not touch it: only the unit routed.
    expect(getBoardSpace(next.boardState, 'F-6').commanders).toStrictEqual([]);
    expect(getBoardSpace(next.boardState, 'E-6').commanders).toStrictEqual([
      'black',
    ]);
  });

  it('a flank engagement opens with the defender not yet turned, and nobody moved', () => {
    // Black's facing crosses White's, which faces east (§6.3.4).
    const state = movingIntoEnemy('east');
    const next = applyStartEngagementEvent(startEngagement('flank'), state);

    // The defender is turned by the next effect, resolveFlankEngagement.
    const flank = getFlankEngagementStateFromMovement(next);
    expect(flank.engagementResolutionState.defenderRotated).toBe(false);
    expect(flank.completed).toBe(false);
    // Until then the attacker waits on F-6 and the defender is untouched.
    expect(next.boardState).toStrictEqual(state.boardState);
    expect(next.routedUnits).toStrictEqual([]);
  });

  it('throws when the move into the defender has not been written', () => {
    // An engagement starts only from a move written into the enemy.
    const state = movingIntoEnemy('south', {
      movement: { targetPlacement: 'pending' },
    });

    expect(() =>
      applyStartEngagementEvent(startEngagement('front'), state),
    ).toThrow('The move has not been written yet');
  });

  it('throws on an engagement type that is not front, flank or rear', () => {
    // The three kinds cover every way two facings meet (§6.3.1); a fourth
    // can come only from a forged event.
    const forged: StartEngagementEvent = {
      ...startEngagement('front'),
      // A value the type forbids, to reach the exhaustive default.
      engagementType: 'siege' as never,
    };

    expect(() =>
      applyStartEngagementEvent(forged, movingIntoEnemy('south')),
    ).toThrow('Unknown engagement type: siege');
  });
});
