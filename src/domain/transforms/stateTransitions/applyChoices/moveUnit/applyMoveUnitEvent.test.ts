import type { UnitWithPlacement } from '@entities';
import type { AuthoritativeGameState } from '@game';
import {
  createChooseMovingUnitEvent,
  createCommitToMovementEvent,
  createMoveUnitEvent,
} from '@factories';
import { generateStartEngagementEvent } from '@procedures';
import {
  findCommanderSpace,
  getMovementResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
  getUnitWithPlacementOnBoard,
} from '@queries';
import { createPlayableGame, resolvingMoveOrder } from '@testing';
import { deployCommander } from '@transforms/pureTransforms';
import { applyCommitToMovementEvent } from '../commitment/applyCommitToMovementEvent';
import { applyChooseMovingUnitEvent } from './applyChooseMovingUnitEvent';

import { applyMoveUnitEvent } from './applyMoveUnitEvent';

/**
 * The move is written into the movement its unit's `chooseMovingUnit`
 * opened, once any card has been committed (§4.3.10). Each case starts there:
 * black, holding the initiative, has named the unit on E-5 under a Move order
 * and declined to commit, and its move is not yet written.
 *
 * `readyToWriteMove` in `@testing` plays the same two choices, but through
 * `applyEvent`, which reaches this spec's subject; so the two are applied
 * here directly.
 *
 * @param units - Where each unit stands; black's mover on E-5 among them
 * @param commanderOnMover - Whether black's commander stands with the mover
 * @returns The game waiting for the mover's `moveUnit`, and the mover
 */
function awaitingMove(
  units: Parameters<typeof createPlayableGame>[0],
  commanderOnMover = false,
): { mover: UnitWithPlacement; state: AuthoritativeGameState } {
  // The armies in the field, black to act first.
  const game = createPlayableGame(units, { initiative: 'black' });

  // Black's commander, where the spec puts it: with the mover, so it may
  // ride (§4.3.10).
  const withCommander = commanderOnMover
    ? deployCommander(game, 'black', 'E-5')
    : game;

  // The Move order names the unit on E-5 alone.
  const mover = getSingleUnitWithPlacementAtCoordinate(
    withCommander.boardState,
    'E-5',
  );
  const ordered = resolvingMoveOrder(withCommander, [mover.unit]);

  // Black names it, then declines to commit a card for its move.
  const named = applyChooseMovingUnitEvent(
    createChooseMovingUnitEvent({ player: 'black', unit: mover.unit }),
    ordered,
  );
  const declined = applyCommitToMovementEvent(
    createCommitToMovementEvent({ committedCard: 'none', player: 'black' }),
    named,
  );
  return { mover, state: declined };
}

describe('applyMoveUnitEvent function', () => {
  it('a move onto open ground carries the unit there and records where it went', () => {
    // Flexibility 4 pays for the four turns below; Speed 2 for the steps.
    const { mover, state } = awaitingMove([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 4,
        player: 'black',
        speed: 2,
      },
      { coord: 'A-5', facing: 'south', player: 'white' },
    ]);

    // From E-5: wheel right to east, two steps to E-7, wheel back to north.
    // The transform reads where the path leads; legality was settled before.
    const moved = applyMoveUnitEvent(
      createMoveUnitEvent({
        moveCommander: false,
        path: [
          'turnRight',
          'turnRight',
          'step',
          'step',
          'turnLeft',
          'turnLeft',
        ],
        player: 'black',
      }),
      state,
    );

    // The unit stands on E-7, facing north again.
    expect(
      getUnitWithPlacementOnBoard(moved, mover.unit).placement,
    ).toStrictEqual({
      coordinate: 'E-7',
      facing: 'north',
    });
    // The move records where it ended and that no commander rode.
    const movement = getMovementResolutionState(moved);
    expect(movement.targetPlacement).toStrictEqual({
      coordinate: 'E-7',
      facing: 'north',
    });
    expect(movement.moveCommander).toBe(false);
  });

  it('a move into an enemy leaves the mover on its start space until the engagement', () => {
    // §5.1.4: the mover's stats were read where the move began, and it
    // waits there until the engagement places it.
    const { mover, state } = awaitingMove([
      { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      { coord: 'D-5', facing: 'south', player: 'white' },
    ]);

    // One step from E-5 into the enemy on D-5, already head-on.
    const moved = applyMoveUnitEvent(
      createMoveUnitEvent({
        moveCommander: false,
        path: ['step'],
        player: 'black',
      }),
      state,
    );

    // The mover has not left E-5.
    expect(
      getUnitWithPlacementOnBoard(moved, mover.unit).placement,
    ).toStrictEqual({
      coordinate: 'E-5',
      facing: 'north',
    });
    // The move records the enemy's space, squared up to it.
    const movement = getMovementResolutionState(moved);
    expect(movement.targetPlacement).toStrictEqual({
      coordinate: 'D-5',
      facing: 'north',
    });
    // The written move is what the engagement starts from.
    expect(generateStartEngagementEvent(moved).engagementType).toBe('front');
  });

  it('a commander riding onto open ground arrives with the unit', () => {
    // §4.3.10: black's commander stands with the mover on E-5 and rides.
    const { state } = awaitingMove(
      [
        { coord: 'E-5', facing: 'north', player: 'black' },
        { coord: 'A-5', facing: 'south', player: 'white' },
      ],
      true,
    );

    // One step north, from E-5 to D-5, the commander riding along.
    const moved = applyMoveUnitEvent(
      createMoveUnitEvent({
        moveCommander: true,
        path: ['step'],
        player: 'black',
      }),
      state,
    );

    // The commander ends in the unit's final space, and the move records
    // that it rode.
    expect(findCommanderSpace('black', moved)).toBe('D-5');
    expect(getMovementResolutionState(moved).moveCommander).toBe(true);
  });

  it('a commander riding into an enemy waits with the unit', () => {
    // The mover waits on its start space until the engagement places it
    // (§5.1.4); so does the commander riding with it.
    const { state } = awaitingMove(
      [
        { coord: 'E-5', facing: 'north', player: 'black' },
        { coord: 'D-5', facing: 'south', player: 'white' },
      ],
      true,
    );

    // One step from E-5 into the enemy on D-5, the commander riding along.
    const moved = applyMoveUnitEvent(
      createMoveUnitEvent({
        moveCommander: true,
        path: ['step'],
        player: 'black',
      }),
      state,
    );

    // Not yet in the enemy's space: it goes when the engagement places the
    // unit, and no earlier.
    expect(findCommanderSpace('black', moved)).toBe('E-5');
  });

  it('throws when the path written runs off the board', () => {
    // The unit on E-5 faces the north edge, four rows away.
    const { state } = awaitingMove([
      { coord: 'E-5', facing: 'north', player: 'black' },
      { coord: 'L-5', facing: 'north', player: 'white' },
    ]);

    // Five steps forward pass row A and leave the board, a path no
    // validation offers.
    expect(() =>
      applyMoveUnitEvent(
        createMoveUnitEvent({
          moveCommander: false,
          path: ['step', 'step', 'step', 'step', 'step'],
          player: 'black',
        }),
        state,
      ),
    ).toThrow(new Error('The advance path leaves the board'));
  });
});
