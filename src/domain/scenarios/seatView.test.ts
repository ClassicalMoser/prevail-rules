import { findExpectedEvent } from '@expected';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createPlayableGame,
  resolvingMoveOrder,
  resolvingShootOrder,
} from '@testing';
import { projectGameStateForVisibility } from '@transforms';

/**
 * What a player seated at the table sees of an opponent's orders. The card
 * the opponent played this round lies face up (§4.1.2), so what the order
 * is, and which of its units are still to act, is no secret: a seat's copy
 * of the game must ask for the same next move as the game itself does, or
 * the two drift apart as the stream is folded.
 *
 * Black holds initiative and has two units, both able to act; white has one
 * unit, in reach of black's.
 */
function blackWithTwoUnitsToAct() {
  return createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'E-6', facing: 'north', player: 'black', range: 2 },
      { coord: 'C-6', facing: 'south', player: 'white' },
    ],
    { initiative: 'black' },
  );
}

describe('an opponent’s order, as a seat sees it', () => {
  it('asks white’s seat for the same next shooter as the game does', () => {
    const game = blackWithTwoUnitsToAct();
    const first = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const second = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-6',
    );
    // Black is carrying out a Shoot order for both units; neither has shot.
    const resolving = resolvingShootOrder(game, [first.unit, second.unit]);

    const seat = projectGameStateForVisibility(resolving, 'whiteSeen');

    // Black is to name a shooter, whoever is looking.
    expect(findExpectedEvent(resolving)).toMatchObject({
      choiceType: 'chooseShooter',
      playerSource: 'black',
    });
    expect(findExpectedEvent(seat)).toStrictEqual(findExpectedEvent(resolving));
  });

  it('asks a spectator for the same next unit to move as the game does', () => {
    const game = blackWithTwoUnitsToAct();
    const first = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const second = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-6',
    );
    // Black is carrying out a Move order for both units; neither has moved.
    const resolving = resolvingMoveOrder(game, [first.unit, second.unit]);

    const spectator = projectGameStateForVisibility(resolving, 'spectator');

    expect(findExpectedEvent(resolving)).toMatchObject({
      choiceType: 'chooseMovingUnit',
      playerSource: 'black',
    });
    expect(findExpectedEvent(spectator)).toStrictEqual(
      findExpectedEvent(resolving),
    );
  });
});
