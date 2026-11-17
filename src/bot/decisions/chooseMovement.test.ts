import type { RandomSource } from '@utils';
import { getLegalUnitMoves } from '@legality';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';
import { projectGameStateForVisibility } from '@transforms';
import { surveyBattlefield } from '@bot/appraisal';
import { defaultBotTemperament } from '@bot/temperament';
import { chooseUnitMove } from './chooseMovement';

/**
 * A whim that favours whichever option comes later: each draw is larger
 * than the last, so of two options scored alike the second wins. Enough to
 * show that a path's length is not left to whim.
 */
function risingWhims(): RandomSource {
  let draw = 0;
  const random: RandomSource = {
    nextFloat: () => {
      draw = Math.min(draw + 0.3, 0.99);
      return draw;
    },
  };
  return random;
}

/**
 * How a bot writes a move: having chosen where its unit should end, it goes
 * there the plain way, with no turn or step it could have saved.
 */
describe('chooseUnitMove function', () => {
  it('stays put without turning when it chooses to end where it stands', () => {
    // A white unit at E-5 facing north, able to turn three times (§5.2.1).
    const state = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 3,
        player: 'white',
        speed: 2,
      },
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );

    // Of every legal move, only those ending where it stands, facing north:
    // standing still, and turning left then right again (§5.2.2).
    const moves = [...getLegalUnitMoves(unit, state)].filter(
      (move) =>
        move.placement.coordinate === 'E-5' &&
        move.placement.facing === 'north',
    );

    const view = projectGameStateForVisibility(state, 'whiteSeen');
    const choice = chooseUnitMove(unit, moves, {
      random: risingWhims(),
      seat: 'white',
      survey: surveyBattlefield(view, 'white'),
      temperament: defaultBotTemperament,
      view,
    });

    // Both end in the same place, so the bot sends the path that wastes no turn.
    expect(choice.path).toStrictEqual([]);
  });
});
