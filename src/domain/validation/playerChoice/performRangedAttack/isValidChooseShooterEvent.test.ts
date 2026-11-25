import type { AuthoritativeGameState } from '@game';
import { createChooseShooterEvent, createEmptyGameState } from '@factories';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createPlayCardsPhaseState,
  createPlayableGame,
  resolvingShootOrder,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseShooterEvent } from './isValidChooseShooterEvent';

/**
 * Naming the next unit to shoot under a Shoot order (§4.3.11 step 1): one of
 * the ordered units still to act, unengaged, with Range and something in
 * its arc to shoot at, standing where the board has it.
 *
 * Black carries out a Shoot order for its Range-2 units on E-5 and E-7,
 * facing north; a white unit stands two ranks ahead on C-5, inside the arc
 * of both. Black's unit on E-9 was not ordered.
 */
describe('isValidChooseShooterEvent function', () => {
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'E-7', facing: 'north', player: 'black', range: 2 },
      { coord: 'E-9', facing: 'north', player: 'black', range: 2 },
      { coord: 'C-5', facing: 'south', player: 'white' },
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

  /** Black's Shoot order under way, both its ordered units still to shoot. */
  function resolvingOrder(): AuthoritativeGameState {
    const resolving = resolvingShootOrder(game, [firstOrdered, secondOrdered]);
    return resolving;
  }

  it('accepts either ordered unit with a target in reach, in any order', () => {
    // Shots are taken one unit at a time in any order (§4.3.9), so the
    // second unit the order named may shoot first.
    const event = createChooseShooterEvent({
      player: 'black',
      unit: secondOrdered,
    });

    expect(isValidChooseShooterEvent(event, resolvingOrder())).toStrictEqual({
      result: true,
    });
  });

  it('refuses a unit the order did not name', () => {
    // Shooting is never automatic: a unit with Range shoots only when a
    // Shoot order names it (§4.3.11).
    const event = createChooseShooterEvent({
      player: 'black',
      unit: notOrdered,
    });

    expect(isValidChooseShooterEvent(event, resolvingOrder())).toStrictEqual({
      errorReason: 'Unit is not a legal ranged attacker for black',
      result: false,
    });
  });

  it('refuses the other side naming a unit', () => {
    // White tries to name black's shooter during black's order.
    const event = createChooseShooterEvent({
      player: 'white',
      unit: firstOrdered,
    });

    expect(isValidChooseShooterEvent(event, resolvingOrder())).toStrictEqual({
      errorReason: 'Expected a shooter from black, got white',
      result: false,
    });
  });

  it('throws when asked where no Shoot order is being carried out, which the expected check rules out first', () => {
    // Cards are being chosen, not orders carried out.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createChooseShooterEvent({
      player: 'black',
      unit: firstOrdered,
    });

    // A shooter named while cards are chosen is refused by the expected check
    // before membership is asked; reaching here is a fault.
    expect(() => isValidChooseShooterEvent(event, state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });
});
