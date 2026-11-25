import type { ResolveFlankEngagementEvent } from '@events';
import type { GameState, MovementResolutionState } from '@game';
import { getBoardSpace, getFlankEngagementStateFromMovement } from '@queries';
import {
  createBoardWithUnits,
  createFlankEngagementState,
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

import { applyResolveFlankEngagementEvent } from './applyResolveFlankEngagementEvent';

/** A defender engaged from the flank is turned to face its attacker (§6.3.4). */
describe('applyResolveFlankEngagementEvent function', () => {
  const event: ResolveFlankEngagementEvent = {
    effectType: 'resolveFlankEngagement',
    eventType: 'gameEffect',
  };

  /** White's unit, standing on E-5 facing east. */
  const defender = createTestUnit('white');

  /** Black's unit, whose move ends on White's flank, facing north. */
  const attacker = createTestUnit('black', { attack: 2 });

  /**
   * Black holds the initiative and carries out a Move: its unit's move into
   * E-5 facing north has opened a flank engagement on White's unit, and the
   * attacker waits on F-5 until the engagement places it.
   */
  function flankEngaged(
    options: {
      commanderRides?: boolean;
      movement?: Partial<MovementResolutionState>;
    } = {},
  ): GameState {
    const units = createBoardWithUnits([
      placed(defender, 'E-5', 'east'),
      placed(attacker, 'F-5', 'north'),
    ]);
    // A commander riding with the attacker stands with it on F-5.
    const board =
      options.commanderRides === true
        ? addCommanderToBoard(units, 'black', 'F-5')
        : units;
    const base = updateCurrentInitiative(
      createGameStateWithBoard(board),
      'black',
    );
    const movement = createMovementResolutionState(base, {
      engagementState: createFlankEngagementState(),
      moveCommander: options.commanderRides === true,
      movingUnit: attacker,
      targetPlacement: { coordinate: 'E-5', facing: 'north' },
      ...options.movement,
    });
    const resolving = createGameStateResolvingCommand(movement, base);
    return resolving;
  }

  it('sets the attacker down with the defender, the defender turned to face it (§6.3.4)', () => {
    const next = applyResolveFlankEngagementEvent(event, flankEngaged());

    // The two are engaged in E-5: Black facing north, so White faces south.
    expect(getBoardSpace(next.boardState, 'E-5').unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'north',
      primaryUnit: attacker,
      secondaryUnit: defender,
    });
    // Black has left the space it waited on.
    expect(getBoardSpace(next.boardState, 'F-5').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    // The engagement is over: the defender has turned.
    // It may not retreat, so nothing more is owed before Phase 4.
    const flank = getFlankEngagementStateFromMovement(next);
    expect(flank.completed).toBe(true);
    expect(flank.engagementResolutionState).toStrictEqual({
      defenderRotated: true,
      engagementType: 'flank',
    });
  });

  it('a commander riding into a flank engagement joins the fight with its unit', () => {
    // §4.3.10: Black's commander rides with the attacker from F-5.
    const next = applyResolveFlankEngagementEvent(
      event,
      flankEngaged({ commanderRides: true }),
    );

    // It has left F-5 and stands in the engaged space, committed to the
    // fight.
    expect(getBoardSpace(next.boardState, 'F-5').commanders).toStrictEqual([]);
    expect(getBoardSpace(next.boardState, 'E-5').commanders).toStrictEqual([
      'black',
    ]);
  });

  it('throws when the move into the defender has not been written', () => {
    // An engagement opens only from a move written into the enemy, so an
    // engagement on an unwritten move is a fault in whatever wrote it.
    const state = flankEngaged({ movement: { targetPlacement: 'pending' } });

    expect(() => applyResolveFlankEngagementEvent(event, state)).toThrow(
      'The move has not been written yet',
    );
  });
});
