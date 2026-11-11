import type { GameStateForVisibility } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { createChooseShooterEvent, createEmptyGameState } from '@factories';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createPlayableGame, resolvingShootOrder } from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseShooterEvent } from './isValidChooseShooterEvent';

/**
 * Naming the next unit to shoot under a Shoot order (§4.3.11 step 1): one of
 * the ordered units still to act, unengaged, with Range and something in
 * its arc to shoot at, standing where the board has it.
 *
 * Black carries out a Shoot order for its Range-2 unit on E-5 facing north;
 * a white unit stands two ranks ahead on C-5, inside that Range.
 */
describe('isValidChooseShooterEvent function', () => {
  function resolvingOrder(): GameStateForVisibility<'authoritative'> {
    const game = createPlayableGame(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'C-5', facing: 'south', player: 'white' },
      ],
      { initiative: 'black' },
    );
    const ordered = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const resolving = resolvingShootOrder(game, [ordered.unit]);
    return resolving;
  }

  it('accepts an ordered unit with a target in reach', () => {
    const state = resolvingOrder();
    const ordered = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    // Black names the unit on E-5, where it stands.
    const event = createChooseShooterEvent({
      player: 'black',
      unit: ordered,
    });

    expect(isValidChooseShooterEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('refuses the unit named where it does not stand', () => {
    const state = resolvingOrder();
    const ordered = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    // The same unit, claimed to stand one space off.
    const event = createChooseShooterEvent({
      player: 'black',
      unit: { ...ordered, placement: { coordinate: 'D-5', facing: 'north' } },
    });

    expect(isValidChooseShooterEvent(event, state)).toStrictEqual({
      errorReason: 'Unit is not a legal ranged attacker for black',
      result: false,
    });
  });

  it('refuses the other side naming a unit', () => {
    const state = resolvingOrder();
    const ordered = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    // White tries to name black's shooter during black's order.
    const event = createChooseShooterEvent({
      player: 'white',
      unit: ordered,
    });

    expect(isValidChooseShooterEvent(event, state)).toStrictEqual({
      errorReason: 'Expected a shooter from black, got white',
      result: false,
    });
  });

  it('refuses when no Shoot order is being carried out', () => {
    // Cards are being chosen, not orders carried out.
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const ordered = getSingleUnitWithPlacementAtCoordinate(
      resolvingOrder().boardState,
      'E-5',
    );
    const event = createChooseShooterEvent({
      player: 'black',
      unit: ordered,
    });

    expect(isValidChooseShooterEvent(event, state)).toStrictEqual({
      errorReason: 'Choosing a shooter is not expected in the current state',
      result: false,
    });
  });
});
