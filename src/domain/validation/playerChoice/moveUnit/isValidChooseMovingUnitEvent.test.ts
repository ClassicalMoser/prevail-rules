import type { AuthoritativeGameState } from '@game';
import { createChooseMovingUnitEvent, createEmptyGameState } from '@factories';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createPlayCardsPhaseState,
  createPlayableGame,
  resolvingMoveOrder,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseMovingUnitEvent } from './isValidChooseMovingUnitEvent';

/**
 * Naming the next unit to move under a Move order (§4.3.10): one of the
 * ordered units still to move, standing where the board has it.
 *
 * Black holds the initiative and carries out a Move order for its units on
 * E-5 and E-7. Its unit on E-9 was not ordered.
 */
describe('isValidChooseMovingUnitEvent function', () => {
  const game = createPlayableGame(
    [
      ['E-5', 'black'],
      ['E-7', 'black'],
      ['E-9', 'black'],
    ],
    { initiative: 'black' },
  );
  const firstOrdered = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-5',
  ).unit;
  const secondOrdered = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-7',
  ).unit;
  const notOrdered = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-9',
  ).unit;

  /** Black's Move order under way, both its units still to move. */
  function resolvingOrder(): AuthoritativeGameState {
    const resolving = resolvingMoveOrder(game, [firstOrdered, secondOrdered]);
    return resolving;
  }

  it('accepts either ordered unit still to move, in any order', () => {
    // Units are resolved one at a time in any order the player likes
    // (§4.3.9), so the second unit the order named may go first.
    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit: secondOrdered,
    });

    expect(isValidChooseMovingUnitEvent(event, resolvingOrder())).toStrictEqual(
      { result: true },
    );
  });

  it('refuses a unit the order did not name', () => {
    // A unit is moved only when an order names it (§4.3.2).
    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit: notOrdered,
    });

    expect(isValidChooseMovingUnitEvent(event, resolvingOrder())).toStrictEqual(
      {
        errorReason: 'Unit is not a legal move candidate for black',
        result: false,
      },
    );
  });

  it('refuses the other side naming a unit', () => {
    const event = createChooseMovingUnitEvent({
      player: 'white',
      unit: firstOrdered,
    });

    expect(isValidChooseMovingUnitEvent(event, resolvingOrder())).toStrictEqual(
      {
        errorReason: 'Expected a unit to move from black, got white',
        result: false,
      },
    );
  });

  it('throws when asked where no Move order is being carried out, which the expected check rules out first', () => {
    // Cards are being chosen, not orders carried out.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit: firstOrdered,
    });

    // A unit named while cards are chosen is refused by the expected check
    // before membership is asked; reaching here is a fault.
    expect(() => isValidChooseMovingUnitEvent(event, state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });
});
