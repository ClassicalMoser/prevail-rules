import { findPlayerUnitWithPosition } from '@queries';
import { createGameState } from './createGameState';

/**
 * A spec lists where each unit stands in shorthand, and gets a new standard
 * game with those units on its board, each numbered as its side numbers its
 * copies of a type.
 */
describe('createGameState function', () => {
  it('stands each tuple’s unit on its space for its side, facing north', () => {
    const state = createGameState([
      ['E-5', 'black'],
      ['E-6', 'white'],
    ]);

    // Each unit is on the board where the tuple put it.
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-5', 'black')?.placement,
    ).toStrictEqual({ coordinate: 'E-5', facing: 'north' });
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-6', 'white')?.placement,
    ).toStrictEqual({ coordinate: 'E-6', facing: 'north' });
  });

  it('turns a tuple’s unit the way its third entry says', () => {
    const state = createGameState([['E-6', 'white', 'south']]);

    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-6', 'white')?.placement
        .facing,
    ).toBe('south');
  });

  it('turns an object’s unit the way it says, and north when it says nothing', () => {
    const state = createGameState([
      { coord: 'E-5', player: 'black' },
      { coord: 'E-6', facing: 'east', player: 'white' },
    ]);

    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-5', 'black')?.placement
        .facing,
    ).toBe('north');
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-6', 'white')?.placement
        .facing,
    ).toBe('east');
  });

  it('chooses an object’s unit by the stats it asks for', () => {
    // White asks for a unit of Attack 4.
    const state = createGameState([
      { attack: 4, coord: 'E-6', player: 'white' },
    ]);

    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-6', 'white')?.unit
        .unitType.stats.attack,
    ).toBe(4);
  });

  it('numbers one side’s units of a type 1, 2, 3 in the order listed', () => {
    const state = createGameState([
      ['E-5', 'black'],
      ['E-6', 'black'],
      ['E-7', 'black'],
    ]);

    const numberAt = (coordinate: 'E-5' | 'E-6' | 'E-7'): number | undefined =>
      findPlayerUnitWithPosition(state.boardState, coordinate, 'black')?.unit
        .instanceNumber;
    expect([numberAt('E-5'), numberAt('E-6'), numberAt('E-7')]).toStrictEqual([
      1, 2, 3,
    ]);
  });

  it('keeps a number a spec gives by hand', () => {
    const state = createGameState([
      { coord: 'E-5', instanceNumber: 5, player: 'black' },
      { coord: 'E-6', instanceNumber: 10, player: 'black' },
    ]);

    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-5', 'black')?.unit
        .instanceNumber,
    ).toBe(5);
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-6', 'black')?.unit
        .instanceNumber,
    ).toBe(10);
  });

  it('lets each side have its own unit numbered 1', () => {
    // A unit is known by its side as well as its number, so these are two
    // different units.
    const state = createGameState([
      { coord: 'E-5', instanceNumber: 1, player: 'black' },
      { coord: 'E-6', instanceNumber: 1, player: 'white' },
    ]);

    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-5', 'black')?.unit
        .instanceNumber,
    ).toBe(1);
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-6', 'white')?.unit
        .instanceNumber,
    ).toBe(1);
  });

  it('counts on past a number given by hand, side by side', () => {
    const state = createGameState([
      ['E-5', 'black'],
      { coord: 'E-6', instanceNumber: 12, player: 'white' },
      ['E-7', 'black'],
      ['E-8', 'white'],
    ]);

    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-5', 'black')?.unit
        .instanceNumber,
    ).toBe(1);
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-6', 'white')?.unit
        .instanceNumber,
    ).toBe(12);
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-7', 'black')?.unit
        .instanceNumber,
    ).toBe(2);
    // White numbers its own units: its auto-numbered one is its first, since
    // the explicit 12 was given by hand and is not counted.
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-8', 'white')?.unit
        .instanceNumber,
    ).toBe(1);
  });

  it('hands the initiative to the side a spec names', () => {
    // White holds it as a game starts, so Black is the side to ask for.
    const state = createGameState([], { currentInitiative: 'black' });

    expect(state.currentInitiative).toBe('black');
  });

  it('with no units, is an empty standard game with White holding the initiative', () => {
    const state = createGameState([]);

    expect(state.boardState.boardType).toBe('standard');
    // White holds the initiative at the start (§3.3.2).
    expect(state.currentInitiative).toBe('white');
  });

  it('files each unit in the game’s index where the board has it', () => {
    const state = createGameState([['E-5', 'black']]);

    // A query that asks the game where a unit stands reads this index.
    expect(Object.values(state.index.units)).toStrictEqual(['E-5']);
  });
});
