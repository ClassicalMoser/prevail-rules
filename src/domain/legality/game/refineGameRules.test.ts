import type { Army, Board, UnitType } from '@entities';
import type { Game } from '@game';
import {
  createEmptyGameState,
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
  createInitialGameState,
} from '@factories';
import { replaceBoard } from '@testing';
import { z } from 'zod';

import {
  legalGameSchema,
  legalGameStateSchema,
  refineGameRules,
} from './refineGameRules';

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
  .superRefine((game, ctx) => {
    refineGameRules(game, ctx);
  });

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

describe('legalGameSchema schema', () => {
  /** Black's own copy of the legal army, so the two lists are not one. */
  const blackArmy: Army = {
    ...legalArmy,
    id: '44444444-4444-4444-8444-444444444444',
  };

  /** A tutorial game just begun: both armies in reserve, no events yet. */
  const game: Game = {
    blackArmy,
    blackPlayer: '55555555-5555-4555-8555-555555555555',
    events: [],
    gameMode: 'tutorial',
    gameState: createInitialGameState({
      blackArmy,
      gameMode: 'tutorial',
      whiteArmy: legalArmy,
    }),
    id: '66666666-6666-4666-8666-666666666666',
    whiteArmy: legalArmy,
    whitePlayer: '77777777-7777-4777-8777-777777777777',
  };

  it('accepts a game just begun from legal armies', () => {
    const result = legalGameSchema.safeParse(game);

    expect(result.success).toBe(true);
  });

  it('refuses a game on a board with a hole, rather than throwing', () => {
    // The game's board lacks H-12. The index check would look that space up,
    // so it must wait until the board is known to be whole: a record read
    // from outside is refused, never thrown on.
    const holed: Game = {
      ...game,
      // Spread rather than replaced, since rebuilding the index would itself
      // look the missing space up; the index stays the game's own, which
      // places no piece on the board.
      gameState: { ...game.gameState, boardState: boardWithHole },
    };

    const result = legalGameSchema.safeParse(holed);

    // Only the hole is reported, at its place in the game.
    expect(result.error?.issues).toMatchObject([
      {
        message: 'Missing coordinate H-12 for small board.',
        path: ['gameState', 'boardState', 'board', 'H-12'],
      },
    ]);
  });

  it("refuses a game whose state's index disagrees with its record, at its place in the game", () => {
    // Neither commander has been placed, but the index calls White's lost.
    const forged: Game = {
      ...game,
      gameState: {
        ...game.gameState,
        index: {
          ...game.gameState.index,
          commanders: { ...game.gameState.index.commanders, white: 'lost' },
        },
      },
    };

    const result = legalGameSchema.safeParse(forged);

    // The index check runs on the game's state, and points inside it.
    expect(result.error?.issues).toMatchObject([
      { path: ['gameState', 'index', 'commanders', 'white'] },
    ]);
  });
});

describe('legalGameStateSchema function', () => {
  it('accepts an empty state on the board its mode is played on', () => {
    // Tutorial is played on the small board.
    const result = legalGameStateSchema('tutorial').safeParse(
      createEmptyGameState('tutorial'),
    );

    expect(result.success).toBe(true);
  });

  it('refuses a state on a board the wrong size for its mode, at the state root', () => {
    // A standard board, whole and indexed, under a tutorial game.
    const result = legalGameStateSchema('tutorial').safeParse(
      createEmptyGameState('standard'),
    );

    // The state is the root, so the issue points at its own board type.
    expect(result.error?.issues).toMatchObject([
      {
        message: 'gameMode tutorial requires board size small, got standard.',
        path: ['boardState', 'boardType'],
      },
    ]);
  });

  it('refuses a space from another board size, at the state root', () => {
    // The small board with the large board's far corner, X-36, added.
    const farLargeCorner = createEmptyLargeBoard().board['X-36'];
    const widened: Board = {
      board: { ...createEmptySmallBoard().board, 'X-36': farLargeCorner },
      boardType: 'small',
    };
    const state = replaceBoard(createEmptyGameState('tutorial'), widened);

    const result = legalGameStateSchema('tutorial').safeParse(state);

    expect(result.error?.issues).toMatchObject([
      {
        message: 'Unexpected coordinate X-36 for small board.',
        path: ['boardState', 'board', 'X-36'],
      },
    ]);
  });

  it('refuses a board with a hole, at the state root, rather than throwing', () => {
    // The tutorial board lacks H-12; the index check must not look it up.
    // Spread in, since rebuilding the index would look it up itself.
    const state = {
      ...createEmptyGameState('tutorial'),
      boardState: boardWithHole,
    };

    const result = legalGameStateSchema('tutorial').safeParse(state);

    // Only the hole is reported, pointing into the state's own board.
    expect(result.error?.issues).toMatchObject([
      {
        message: 'Missing coordinate H-12 for small board.',
        path: ['boardState', 'board', 'H-12'],
      },
    ]);
  });

  it('refuses an index that disagrees with the record, at the state root', () => {
    // Neither commander has been placed, but the index calls White's lost.
    const state = createEmptyGameState('tutorial');
    const forged = {
      ...state,
      index: {
        ...state.index,
        commanders: { ...state.index.commanders, white: 'lost' as const },
      },
    };

    const result = legalGameStateSchema('tutorial').safeParse(forged);

    expect(result.error?.issues).toMatchObject([
      { path: ['index', 'commanders', 'white'] },
    ]);
  });
});
