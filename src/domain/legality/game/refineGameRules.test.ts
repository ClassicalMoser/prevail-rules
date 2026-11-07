import type { Army, Board, UnitType } from '@entities';
import { createEmptySmallBoard, createEmptyStandardBoard } from '@factories';
import { z } from 'zod';

import { refineGameRules } from './refineGameRules';

/** Limit 2 — over-limit cases write count 3 against this. */
const limitTwo: UnitType = {
  cost: 10,
  id: '00000000-0000-4000-8000-ffff00000010',
  imageUrl: null,
  limit: 2,
  morale: 1,
  name: 'Test Unit',
  stats: {
    attack: 1,
    flexibility: 1,
    range: 0,
    retreat: 1,
    reverse: 1,
    rout: 1,
    speed: 1,
  },
  traits: ['formation'],
  version: '1.0.0',
};

/** Two copies: exactly the limit. */
const legalArmy: Army = {
  commandCards: [],
  id: '33333333-3333-4333-8333-333333333333',
  name: 'Legal Army',
  units: [{ count: 2, unitType: limitTwo }],
};

/** A small board with its far corner, H-12, taken away. */
const { 'H-12': _farCorner, ...withoutFarCorner } =
  createEmptySmallBoard().board;
const boardWithHole: Board = { board: withoutFarCorner, boardType: 'small' };

/**
 * Accepts any shape, so each case reaches the game rules without the game
 * shape checks getting there first.
 */
const gameRules = z
  .custom<Parameters<typeof refineGameRules>[0]>()
  .superRefine(refineGameRules);

describe('refineGameRules function', () => {
  // Tutorial plays on the small board and has no composition limits.
  it('accepts a tutorial game on a whole small board with legal armies', () => {
    const result = gameRules.safeParse({
      blackArmy: legalArmy,
      gameMode: 'tutorial',
      gameState: { boardState: createEmptySmallBoard() },
      whiteArmy: legalArmy,
    });

    expect(result.success).toBe(true);
  });

  it("reports a hole in the game's board at its place in the game", () => {
    const result = gameRules.safeParse({
      blackArmy: legalArmy,
      gameMode: 'tutorial',
      gameState: { boardState: boardWithHole },
      whiteArmy: legalArmy,
    });

    expect(result.error?.issues).toMatchObject([
      {
        message: 'Missing coordinate H-12 for small board.',
        path: ['gameState', 'boardState', 'board', 'H-12'],
      },
    ]);
  });

  it('reports a board the wrong size for the mode', () => {
    // Tutorial is played on the small board, not the standard one.
    const result = gameRules.safeParse({
      blackArmy: legalArmy,
      gameMode: 'tutorial',
      gameState: { boardState: createEmptyStandardBoard() },
      whiteArmy: legalArmy,
    });

    expect(result.error?.issues).toMatchObject([
      {
        message: 'gameMode tutorial requires board size small, got standard.',
        path: ['gameState', 'boardState', 'boardType'],
      },
    ]);
  });

  it('still reports an army rule a side breaks', () => {
    // A third copy is one past the limit.
    const overLimitArmy: Army = {
      ...legalArmy,
      units: [{ count: 3, unitType: limitTwo }],
    };

    const result = gameRules.safeParse({
      blackArmy: legalArmy,
      gameMode: 'tutorial',
      gameState: { boardState: createEmptySmallBoard() },
      whiteArmy: overLimitArmy,
    });

    expect(result.error?.issues).toMatchObject([
      { path: ['whiteArmy', 'units', 0, 'count'] },
    ]);
  });
});
