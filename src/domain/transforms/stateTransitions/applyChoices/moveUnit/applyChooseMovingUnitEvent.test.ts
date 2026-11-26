import type { AuthoritativeGameState } from '@game';
import { createChooseMovingUnitEvent, createMoveUnitEvent } from '@factories';
import { getLegalMoveUnits } from '@legality';
import {
  getIssueCommandsPhaseState,
  getMovementResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import {
  createPlayableGame,
  createTestUnit,
  resolvingMoveOrder,
} from '@testing';
import { applyCompleteUnitMovementEvent } from '@transforms/stateTransitions/applyEffects/movement/applyCompleteUnitMovementEvent';
import { applyMoveUnitEvent } from './applyMoveUnitEvent';

import { applyChooseMovingUnitEvent } from './applyChooseMovingUnitEvent';

/**
 * Naming a unit under a Move order begins its move (§4.3.10): a movement
 * opens with the commitment still to come and the move unwritten, and the
 * unit leaves the list of those the order has still to move.
 *
 * Black carries out a Move order for two Speed-2 units on E-5 and E-3; a
 * white unit stands across the field so both armies are in it.
 */
function blackMovingTwo(): AuthoritativeGameState {
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      { coord: 'E-3', facing: 'north', player: 'black', speed: 2 },
      { coord: 'A-5', facing: 'south', player: 'white' },
    ],
    { initiative: 'black' },
  );
  const first = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-5');
  const second = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-3');
  const resolving = resolvingMoveOrder(game, [first.unit, second.unit]);
  return resolving;
}

describe('applyChooseMovingUnitEvent function', () => {
  it('opens the move with the commitment owed and the move unwritten', () => {
    const state = blackMovingTwo();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );

    // Black names the unit on E-5 to move.
    const named = applyChooseMovingUnitEvent(
      createChooseMovingUnitEvent({
        player: 'black',
        unit: mover.unit,
      }),
      state,
    );

    // The owner commits before the move is written (§4.3.10 step 2), so the
    // path, its destination, the riding commander and any engagement all
    // wait.
    expect(getMovementResolutionState(named)).toStrictEqual({
      commandResolutionType: 'movement',
      commitment: { commitmentType: 'pending' },
      engagementState: 'pending',
      moveCommander: 'pending',
      movingUnit: mover.unit,
      substepType: 'commandResolution',
      targetPlacement: 'pending',
    });
  });

  it('takes the unit off the list the order has still to move', () => {
    const state = blackMovingTwo();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const other = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-3',
    );

    // Black names the unit on E-5; each unit moves once (§4.3.6).
    const named = applyChooseMovingUnitEvent(
      createChooseMovingUnitEvent({
        player: 'black',
        unit: mover.unit,
      }),
      state,
    );

    // Only the unit on E-3 is still to move.
    expect(
      getIssueCommandsPhaseState(named).remainingUnitsFirstPlayer,
    ).toStrictEqual([other.unit]);
  });

  it('once its move is done, the unit is not offered again', () => {
    // Each unit moves once per order (§4.3.6).
    const state = blackMovingTwo();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );

    // Name the unit on E-5, write its move (one step north), complete it.
    const named = applyChooseMovingUnitEvent(
      createChooseMovingUnitEvent({
        player: 'black',
        unit: mover.unit,
      }),
      state,
    );
    const moved = applyMoveUnitEvent(
      createMoveUnitEvent({
        moveCommander: false,
        path: ['step'],
        player: 'black',
      }),
      named,
    );
    const done = applyCompleteUnitMovementEvent(
      {
        effectType: 'completeUnitMovement',
        eventType: 'gameEffect',
      },
      moved,
    );

    // Only the unit on E-3, the second of the order, is offered next.
    expect(
      getLegalMoveUnits(done)?.units.map((unit) => unit.unit.instanceNumber),
    ).toStrictEqual([2]);
  });

  it('refuses to open a second move while one is under way', () => {
    // Units are moved one at a time, each finished first (§4.3.9).
    const state = blackMovingTwo();
    const first = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const second = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-3',
    );

    // The unit on E-5 is named, and its move has not been written.
    const named = applyChooseMovingUnitEvent(
      createChooseMovingUnitEvent({
        player: 'black',
        unit: first.unit,
      }),
      state,
    );

    // Naming the unit on E-3 now is a fault in whatever sent it.
    expect(() =>
      applyChooseMovingUnitEvent(
        createChooseMovingUnitEvent({
          player: 'black',
          unit: second.unit,
        }),
        named,
      ),
    ).toThrow(new Error('A command is already being resolved'));
  });

  it('throws when the unit named is not on the board', () => {
    const state = blackMovingTwo();

    // A third black unit, never placed: the event names a unit the board
    // does not hold.
    const absent = createTestUnit('black', { instanceNumber: 3, speed: 2 });

    expect(() =>
      applyChooseMovingUnitEvent(
        createChooseMovingUnitEvent({
          player: 'black',
          unit: absent,
        }),
        state,
      ),
    ).toThrow(new Error('Unit not found on board'));
  });
});
