import type { GameState } from '@game';
import { createUnitIndexKey } from '@factories';

import {
  createGameStateWithUnits,
  createUnitWithPlacement,
  replaceBoard,
} from '@testing';
import { deployCommander } from '@transforms';
import { z } from 'zod';

import { refineGameStateIndex } from './refineGameStateIndex';

/**
 * Accepts any shape, so each case reaches the index check without the state
 * shape checks getting there first.
 */
const indexed = z.custom<GameState>().superRefine(refineGameStateIndex);

/**
 * A full state read from outside must have an index that agrees with its
 * board and its lists, and must hold every piece in one place only. The index
 * is a convenience; the board and the lists are the record.
 */
describe('refineGameStateIndex function', () => {
  // White's unit at E-5 facing north, and white's commander beside it.
  const standing = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'north',
    playerSide: 'white',
  });
  const key = createUnitIndexKey(standing.unit);
  const kept = deployCommander(
    createGameStateWithUnits([standing]),
    'white',
    'E-6',
  );

  it('accepts a state whose index was kept by its writers', () => {
    // Every write went through the writers, so the index follows the record.
    expect(indexed.safeParse(kept).success).toBe(true);
  });

  it('refuses an index that puts a unit somewhere the board does not', () => {
    // The index says E-6; the board has the unit at E-5.
    const state = {
      ...kept,
      index: { ...kept.index, units: { [key]: 'E-6' as const } },
    };

    const result = indexed.safeParse(state);

    // The issue names the unit, both places, and points at its entry.
    expect(result.error?.issues).toMatchObject([
      {
        message: `The index puts unit ${key} at E-6, but the record has it at E-5.`,
        path: ['index', 'units', key],
      },
    ]);
  });

  it('refuses an index that names a unit the record does not hold', () => {
    // The record has one unit; the index adds a second that is nowhere.
    const ghost = createUnitIndexKey({ ...standing.unit, instanceNumber: 2 });
    const state = {
      ...kept,
      index: {
        ...kept.index,
        units: { ...kept.index.units, [ghost]: 'reserved' as const },
      },
    };

    const result = indexed.safeParse(state);

    // The stray entry is the issue, and it is named.
    expect(result.error?.issues).toMatchObject([
      {
        message: `The index puts unit ${ghost} at reserved, but the record has it nowhere.`,
        path: ['index', 'units', ghost],
      },
    ]);
  });

  it('refuses an index that leaves out a unit the record holds', () => {
    // The board has the unit at E-5; the index has no entry for it.
    const state = { ...kept, index: { ...kept.index, units: {} } };

    const result = indexed.safeParse(state);

    // The missing entry is the issue: the index puts the unit nowhere.
    expect(result.error?.issues).toMatchObject([
      {
        message: `The index puts unit ${key} at nowhere, but the record has it at E-5.`,
        path: ['index', 'units', key],
      },
    ]);
  });

  it('refuses an index that misplaces a commander', () => {
    // The index says white's commander is lost; it stands at E-6.
    const state = {
      ...kept,
      index: {
        ...kept.index,
        commanders: { ...kept.index.commanders, white: 'lost' as const },
      },
    };

    const result = indexed.safeParse(state);

    // The issue names the commander, both places, and points at its entry.
    expect(result.error?.issues).toMatchObject([
      {
        message:
          'The index puts the white commander at lost, but the record has it at E-6.',
        path: ['index', 'commanders', 'white'],
      },
    ]);
  });

  it('refuses a unit held in two places, even when the index agrees with the board', () => {
    // The unit is on the board and still in reserve: the setup write left
    // half done. The index follows the board, but the record is not whole.
    const state = {
      ...kept,
      reservedUnits: [standing.unit],
    };
    const reindexed = replaceBoard(state, state.boardState);

    const result = indexed.safeParse(reindexed);

    // The issue names the unit and points at the reserve and the board alike.
    expect(result.error?.issues).toMatchObject([
      {
        message: `Unit ${key} is held in more than one place: reserved, E-5.`,
        path: ['index', 'units', key],
      },
    ]);
  });

  it('refuses a commander both on the board and lost', () => {
    // White's commander stands at E-6 and is also recorded as lost.
    const state = { ...kept, lostCommanders: ['white' as const] };
    const reindexed = replaceBoard(state, state.boardState);

    const result = indexed.safeParse(reindexed);

    // The issue names the commander and both places.
    expect(result.error?.issues).toMatchObject([
      {
        message:
          'The white commander is held in more than one place: lost, E-6.',
        path: ['index', 'commanders', 'white'],
      },
    ]);
  });
});
