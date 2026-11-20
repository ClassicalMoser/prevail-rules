import {
  blackMiniStarterArmy,
  tempCommandCards,
  whiteMiniStarterArmy,
} from '@sampleValues';
import type { EnginePorts } from '@application/ports';
import { mathRandom } from '@application/infra';
import type { BlackSeenGameState, Game } from '@game';
import { createUnitWithPlacement, replaceBoard } from '@testing';

import { createEmptyGameState } from '@factories';

import { addUnitToBoard } from '@transforms';

import { requestGameStateSnapshot } from './requestGameStateSnapshot';

// Stored games are read as legal games, so every id is a UUID.
const gameId = '11111111-1111-4111-8111-111111111111';

function authoritativeGame(): Game {
  const unit = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'north',
    playerSide: 'white',
  });
  // A legal mini game: its armies keep mini's army rules, as a stored game
  // must to be loaded at all.
  let gameState = createEmptyGameState('mini');
  gameState = replaceBoard(
    gameState,
    addUnitToBoard(gameState.boardState, unit),
  );
  return {
    blackArmy: blackMiniStarterArmy,
    blackPlayer: '22222222-2222-4222-8222-222222222222',
    events: [],
    gameMode: 'mini',
    gameState: {
      ...gameState,
      cardState: {
        visibility: 'authoritative',
        black: {
          awaitingPlay: null,
          burnt: [],
          discarded: [],
          inHand: [tempCommandCards[0]],
          inPlay: null,
          played: [],
        },
        white: {
          awaitingPlay: null,
          burnt: [],
          discarded: [],
          inHand: [tempCommandCards[1]],
          inPlay: null,
          played: [],
        },
      },
    },
    id: gameId,
    whiteArmy: whiteMiniStarterArmy,
    whitePlayer: '33333333-3333-4333-8333-333333333333',
  };
}

function createPorts(
  getGameImpl: EnginePorts['gameStorage']['getGame'],
): EnginePorts {
  return {
    gameStateSubscribers: [],
    random: mathRandom,
    gameStorage: {
      getGame: getGameImpl,
      saveNewGame: vi.fn(),
      recordEvent: vi.fn(),
    },
  };
}

function projectAsBlackSeen(game: Game): BlackSeenGameState['cardState'] {
  return {
    black: game.gameState.cardState.black,
    visibility: 'blackSeen',
    white: {
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: ['hidden'],
      inPlay: null,
      played: [],
    },
  };
}

/**
 * RequestGameStateSnapshot: the current game in one viewer's view, for client reconcile.
 */
describe('requestGameStateSnapshot function', () => {
  it('returns the authoritative state with both hands in view', async () => {
    // The stored game holds one card in each hand.
    const game = authoritativeGame();
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: game, result: true as const }),
    );

    const result = await requestGameStateSnapshot(
      gameId,
      'mini',
      'authoritative',
      ports,
    );

    expect(result.result).toBe(true);
    if (!result.result) {
      throw new Error('expected success');
    }
    // A viewer allowed every card reads both hands as they are.
    expect(result.data.cardState.visibility).toBe('authoritative');
    expect(result.data.cardState.black.inHand).toStrictEqual([
      tempCommandCards[0],
    ]);
    expect(result.data.cardState.white.inHand).toStrictEqual([
      tempCommandCards[1],
    ]);
  });

  it('returns blackSeen projection including opponent units on the board', async () => {
    const game = authoritativeGame();
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: game, result: true as const }),
    );

    const result = await requestGameStateSnapshot(
      gameId,
      'mini',
      'blackSeen',
      ports,
    );

    expect(result.result).toBe(true);
    if (!result.result) {
      throw new Error('expected success');
    }
    expect(result.data.cardState.visibility).toBe('blackSeen');
    expect(result.data.cardState.black.inHand).toStrictEqual([
      tempCommandCards[0],
    ]);
    expect(result.data.cardState.white.inHand).toStrictEqual(['hidden']);
    expect(result.data.boardState.board['E-5']?.unitPresence).toStrictEqual(
      game.gameState.boardState.board['E-5']?.unitPresence,
    );
  });

  it('returns a spectator projection with both hands hidden and units on the board', async () => {
    const game = authoritativeGame();
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: game, result: true as const }),
    );

    const result = await requestGameStateSnapshot(
      gameId,
      'mini',
      'spectator',
      ports,
    );

    expect(result.result).toBe(true);
    if (!result.result) {
      throw new Error('expected success');
    }
    expect(result.data.cardState.visibility).toBe('spectator');
    expect(result.data.cardState.black.inHand).toStrictEqual(['hidden']);
    expect(result.data.cardState.white.inHand).toStrictEqual(['hidden']);
    expect(result.data.boardState.board['E-5']?.unitPresence).toStrictEqual(
      game.gameState.boardState.board['E-5']?.unitPresence,
    );
  });

  it('refuses a game asked for in another mode than it is played in', async () => {
    // The stored game is a mini game.
    const game = authoritativeGame();
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: game, result: true as const }),
    );

    // The caller names the wrong mode, which is its mistake, not the game's.
    await expect(
      requestGameStateSnapshot(gameId, 'standard', 'whiteSeen', ports),
    ).resolves.toStrictEqual({
      errorReason: 'Game mode mismatch: expected standard, got mini',
      failure: 'gameModeMismatch',
      result: false,
    });
  });

  it('returns failure when storage answers with no game', async () => {
    // Storage answers, and holds no game under this id.
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: undefined, result: true }),
    );

    await expect(
      requestGameStateSnapshot(gameId, 'mini', 'whiteSeen', ports),
    ).resolves.toStrictEqual({
      errorReason: `Game ${gameId} not found`,
      failure: 'gameNotFound',
      result: false,
    });
  });

  it('returns failure when storage does not answer at all', async () => {
    // A port is allowed to hand back nothing for an id it has never seen.
    const ports = createPorts(vi.fn());

    await expect(
      requestGameStateSnapshot(gameId, 'mini', 'whiteSeen', ports),
    ).resolves.toStrictEqual({
      errorReason: `Game ${gameId} not found`,
      failure: 'gameNotFound',
      result: false,
    });
  });

  it('refuses a stored game that holds a seat’s view, naming why', async () => {
    // The server only ever stores its own record; a game whose cards are a
    // seat's view is not a legal game, and is refused when it is loaded.
    const game = authoritativeGame();
    const nonAuthoritative = {
      ...game,
      gameState: {
        ...game.gameState,
        cardState: {
          ...projectAsBlackSeen(game),
        },
      },
    };
    const ports = createPorts(
      vi
        .fn()
        .mockResolvedValue({ data: nonAuthoritative, result: true as const }),
    );

    await expect(
      requestGameStateSnapshot(gameId, 'mini', 'blackSeen', ports),
    ).resolves.toStrictEqual({
      errorReason: expect.stringContaining('gameState.cardState.visibility'),
      failure: 'illegalGame',
      result: false,
    });
  });
});
