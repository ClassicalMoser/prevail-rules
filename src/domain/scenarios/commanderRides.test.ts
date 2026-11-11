import type { AuthoritativeGameState } from '@game';
import { createMoveUnitEvent } from '@factories';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  readyToWriteMove,
  resolvingMoveOrder,
} from '@testing';
import { addCommanderToBoard, applyEvent, updateBoardState } from '@transforms';
import { validatePlayerChoice } from '@validation';

/**
 * A commander standing with a moving unit may ride with it (§4.3.10), played
 * through the engines: the commander ends in the unit's final space, or stays
 * behind if the player says so. Riding into an engagement is allowed too, the
 * one way a commander comes to share a space with an enemy.
 *
 * Black's unit stands on `start` facing north, with black's commander beside
 * it on the same space, and white keeps a unit far off on A-1 so both armies
 * stay in the field. Black declines to commit a card for the move.
 */
function blackReadyToWriteMove(options: {
  start: 'E-5' | 'F-5';
  whiteDefender?: 'E-5';
}): AuthoritativeGameState {
  const game = createPlayableGame(
    [
      { coord: options.start, facing: 'north', player: 'black' },
      { coord: 'A-1', facing: 'south', player: 'white' },
      // A white unit facing the same way as black's stands in its path, so
      // a step north lands on its back (§6.3.3).
      ...(options.whiteDefender === undefined
        ? []
        : [
            {
              coord: options.whiteDefender,
              facing: 'north',
              player: 'white',
            } as const,
          ]),
    ],
    { initiative: 'black' },
  );
  // The commander stands with the unit.
  const withCommander = updateBoardState(
    game,
    addCommanderToBoard(game.boardState, 'black', options.start),
  );
  const mover = getSingleUnitWithPlacementAtCoordinate(
    withCommander.boardState,
    options.start,
  );
  const ready = readyToWriteMove(
    resolvingMoveOrder(withCommander, [mover.unit]),
    mover,
    null,
  );
  return ready;
}

describe('a commander riding with a moving unit', () => {
  it('arrives with the unit when the player says it rides', () => {
    const state = blackReadyToWriteMove({ start: 'E-5' });
    // One step north, from E-5 to D-5, the commander riding along.
    const move = createMoveUnitEvent({
      moveCommander: true,
      path: ['step'],
      player: 'black',
    });

    expect(validatePlayerChoice(move, state)).toStrictEqual({ result: true });
    const { state: moved } = applyEffectsUntilChoice(applyEvent(move, state));

    // The commander ends in the unit's final space and nowhere else.
    expect(moved.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(moved.boardState.board['D-5']?.commanders).toStrictEqual(['black']);
  });

  it('stays behind when the player leaves it', () => {
    const state = blackReadyToWriteMove({ start: 'E-5' });
    // The same step, with the commander left where it stands.
    const move = createMoveUnitEvent({
      moveCommander: false,
      path: ['step'],
      player: 'black',
    });

    const { state: moved } = applyEffectsUntilChoice(applyEvent(move, state));

    // Only the unit went: the commander waits for Phase 2 to move.
    expect(moved.boardState.board['E-5']?.commanders).toStrictEqual(['black']);
    expect(moved.boardState.board['D-5']?.commanders).toStrictEqual([]);
  });

  it('rides into the space of an enemy it engages from the rear', () => {
    // §6.3.3: black's unit on F-5 steps into the back of white's unit on
    // E-5. The defender routs at once and the attacker takes its space, and
    // the commander riding with it takes the space too.
    const state = blackReadyToWriteMove({
      start: 'F-5',
      whiteDefender: 'E-5',
    });
    const move = createMoveUnitEvent({
      moveCommander: true,
      path: ['step'],
      player: 'black',
    });

    expect(validatePlayerChoice(move, state)).toStrictEqual({ result: true });
    const { state: engaged } = applyEffectsUntilChoice(applyEvent(move, state));

    // The commander is committed to the fight with its unit; the enemy's
    // rout does not touch it.
    expect(engaged.boardState.board['F-5']?.commanders).toStrictEqual([]);
    expect(engaged.boardState.board['E-5']?.commanders).toStrictEqual([
      'black',
    ]);
  });
});
