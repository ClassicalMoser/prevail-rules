import { createEmptyGameState, createMoveUnitEvent } from '@factories';
import { PLAY_CARDS_PHASE } from '@game';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createGameStateResolvingCommand,
  createMovementResolutionState,
  createPlayableGame,
  createTestCard,
  readyToWriteMove,
  replaceBoard,
  resolvingMoveOrder,
} from '@testing';
import { addCommanderToBoard, updatePhaseState } from '@transforms';

import { isValidMoveUnitEvent } from './isValidMoveUnitEvent';

/**
 * The move for a unit already named, with its card committed or declined
 * (§4.3.10): a legal path, counting the card, and a rider only if the
 * commander stands with the unit.
 *
 * Black's Speed-2 unit stands on E-5 facing north, with nothing in its way,
 * and Black holds a card that may be committed for Speed. White keeps a unit
 * far off, on A-1, so both armies stay in the field.
 */
describe('isValidMoveUnitEvent function', () => {
  const speedCard = createTestCard({ modifiers: ['speed'] });
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      { coord: 'A-1', facing: 'south', player: 'white' },
    ],
    { hands: { black: [speedCard, createTestCard()] }, initiative: 'black' },
  );
  const mover = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-5');

  // Black's Move order names that unit, and Black declines to commit.
  const declined = readyToWriteMove(
    resolvingMoveOrder(game, [mover.unit]),
    mover,
    'none',
  );

  it('accepts a legal move without the commander', () => {
    // One step straight ahead, from E-5 to D-5.
    const event = createMoveUnitEvent({
      moveCommander: false,
      path: ['step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, declined)).toStrictEqual({
      result: true,
    });
  });

  it('counts a card committed for Speed toward the move', () => {
    // Black commits the Speed card instead of declining.
    const committed = readyToWriteMove(
      resolvingMoveOrder(game, [mover.unit]),
      mover,
      speedCard,
    );

    // Three steps is one more than the unit's Speed of 2; the card adds it.
    const event = createMoveUnitEvent({
      moveCommander: false,
      path: ['step', 'step', 'step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, committed)).toStrictEqual({
      result: true,
    });
  });

  it('without a committed card, refuses the step past the unit’s Speed', () => {
    // The same three steps, with no card to pay for the third.
    const event = createMoveUnitEvent({
      moveCommander: false,
      path: ['step', 'step', 'step'],
      player: 'black',
    });

    // The path's own refusal, naming the step the unit cannot make.
    expect(isValidMoveUnitEvent(event, declined)).toStrictEqual({
      errorReason: 'Move 3 (step) is not one the unit may make there',
      result: false,
    });
  });

  it('accepts the commander riding along when it shares the unit’s space', () => {
    // Black's commander stands with the unit on E-5 before the order.
    const withCommander = replaceBoard(
      game,
      addCommanderToBoard(game.boardState, 'black', 'E-5'),
    );
    const state = readyToWriteMove(
      resolvingMoveOrder(withCommander, [mover.unit]),
      mover,
      'none',
    );
    const event = createMoveUnitEvent({
      moveCommander: true,
      path: ['step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('refuses the commander riding along when it stands elsewhere', () => {
    // No black commander stands on E-5.
    const event = createMoveUnitEvent({
      moveCommander: true,
      path: ['step'],
      player: 'black',
    });

    // Only a commander in the unit's space may move with it (§4.3.10).
    expect(isValidMoveUnitEvent(event, declined)).toStrictEqual({
      errorReason: 'Cannot move commander with unit: commander not at E-5',
      result: false,
    });
  });

  it("refuses a move from the side whose unit it isn't", () => {
    // White writes the move for Black's unit.
    const event = createMoveUnitEvent({
      moveCommander: false,
      path: ['step'],
      player: 'white',
    });

    expect(isValidMoveUnitEvent(event, declined)).toStrictEqual({
      errorReason: 'Expected the move from black, got white',
      result: false,
    });
  });

  it('refuses a second move for a unit whose move is already written', () => {
    // Black's unit has already been moved to D-5 under this order.
    const moved = createGameStateResolvingCommand(
      createMovementResolutionState(game, {
        commitment: { commitmentType: 'declined' },
        movingUnit: mover.unit,
        targetPlacement: { coordinate: 'D-5', facing: 'north' },
      }),
      game,
    );
    const event = createMoveUnitEvent({
      moveCommander: false,
      path: ['step'],
      player: 'black',
    });

    // A unit makes one move per order (§4.3.10).
    expect(isValidMoveUnitEvent(event, moved)).toStrictEqual({
      errorReason: 'This unit has already moved',
      result: false,
    });
  });

  it('throws, naming the phase, when no command is being carried out', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createMoveUnitEvent({
      moveCommander: false,
      path: ['step'],
      player: 'black',
    });

    // A unit moves only while a Move order is carried out.
    expect(() => isValidMoveUnitEvent(event, state)).toThrow(
      'Not in issueCommands phase',
    );
  });
});
