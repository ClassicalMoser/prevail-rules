import type { Army } from '@entities';
import { createEmptyGameState, createInitialGameState } from '@factories';
import type { GameState } from '@game';
import {
  createTestUnit,
  createUnitWithPlacement,
  replaceBoard,
  withReservedUnits,
} from '@testing';
import { addUnitToBoard } from '@transforms';

import { findWinnerFromNoUnits } from './findWinnerFromNoUnits';

/**
 * No-units loss (§11.4): an army destroyed to the last unit loses, however
 * many cards its player holds — the rule closes the door on feeding an army
 * to the enemy to cycle a small hand forever. Units still in reserve are an
 * army not yet fielded, not a destroyed one, so setup never trips it.
 */
function withUnitOnBoard(
  state: GameState,
  playerSide: 'black' | 'white',
  coordinate: 'E-5' | 'E-6',
): GameState {
  // One survivor anywhere on the field keeps that army in the game.
  const unit = createUnitWithPlacement({ coordinate, playerSide });
  const board = addUnitToBoard(state.boardState, unit);
  const next = replaceBoard(state, board);
  return next;
}

describe('findWinnerFromNoUnits function', () => {
  it('continues while both armies have a unit on the board', () => {
    // One white unit and one black unit on the field.
    const base = createEmptyGameState('standard');
    const withWhite = withUnitOnBoard(base, 'white', 'E-5');
    const state = withUnitOnBoard(withWhite, 'black', 'E-6');

    expect(findWinnerFromNoUnits(state)).toBeUndefined();
  });

  it('black wins when the white army is destroyed', () => {
    // Only a black unit stands; White has none on the board or in reserve.
    const base = createEmptyGameState('standard');
    const state = withUnitOnBoard(base, 'black', 'E-6');

    expect(findWinnerFromNoUnits(state)).toBe('black');
  });

  it('white wins when the black army is destroyed', () => {
    // Only a white unit stands; Black has none on the board or in reserve.
    const base = createEmptyGameState('standard');
    const state = withUnitOnBoard(base, 'white', 'E-5');

    expect(findWinnerFromNoUnits(state)).toBe('white');
  });

  it('an army still in reserve has not been fielded, let alone destroyed', () => {
    // A freshly initialized game: both armies wait in reserve and the board
    // is empty. Setup must never read as a loss for either side.
    const whiteArmy: Army = {
      commandCards: [],
      id: '10000000-0000-4000-8000-000000000001',
      name: 'White',
      units: [{ count: 1, unitType: createTestUnit('white').unitType }],
    };
    const blackArmy: Army = {
      commandCards: [],
      id: '20000000-0000-4000-8000-000000000002',
      name: 'Black',
      units: [{ count: 1, unitType: createTestUnit('black').unitType }],
    };
    const state = createInitialGameState({
      blackArmy,
      gameMode: 'mini',
      whiteArmy,
    });

    expect(findWinnerFromNoUnits(state)).toBeUndefined();
  });

  it('an army waiting to deploy is not destroyed while the other stands on the board', () => {
    // Midway through setup: White has deployed one unit, Black's still waits
    // in reserve.
    const whiteDeployed = withUnitOnBoard(
      createEmptyGameState('standard'),
      'white',
      'E-5',
    );
    const state = withReservedUnits(whiteDeployed, [createTestUnit('black')]);

    // Black has not been fielded yet, so it has not lost.
    expect(findWinnerFromNoUnits(state)).toBeUndefined();
  });

  it('a board with no armies at all is a game not yet begun, not a loss', () => {
    // No unit anywhere, for either side.
    const state = createEmptyGameState('standard');

    expect(findWinnerFromNoUnits(state)).toBeUndefined();
  });
});
