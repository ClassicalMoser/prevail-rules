import {
  blackMiniStarterArmy,
  tempCommandCards,
  whiteMiniStarterArmy,
} from '@sampleValues';
import type { EnginePorts } from '@application/ports';
import { mathRandom } from '@application/infra';
import type { BlackSeenGameState, Game } from '@game';
import { createUnitWithPlacement } from '@testing';

import { createEmptyGameState } from '@factories';
import { addUnitToBoard, updateBoardState } from '@transforms';

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
  gameState = updateBoardState(
    gameState,
    addUnitToBoard(gameState.boardState, unit),
  );
  return {
    blackArmy: blackMiniStarterArmy,
    blackPlayer: '22222222-2222-4222-8222-222222222222',
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
    eventStreamStorage: {
      addEventToStream: vi.fn(),
      flushEventStream: vi.fn(),
      getEventStream: vi.fn(),
      newEventStream: vi.fn(),
      truncateEventStream: vi.fn(),
    },
    gameStateSubscribers: [],
    random: mathRandom,
    gameStorage: {
      getGame: getGameImpl,
      saveNewGame: vi.fn(),
      updateGameState: vi.fn(),
    },
    roundSnapshotStorage: {
      getRoundSnapshot: vi.fn(),
      saveRoundSnapshot: vi.fn(),
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
 * RequestGameStateSnapshot: seat-projected current game for client reconcile.
 */
describe('requestGameStateSnapshot function', () => {
  it('returns blackSeen projection including opponent units on the board', async () => {
    const game = authoritativeGame();
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: game, result: true as const }),
    );

    const result = await requestGameStateSnapshot(
      gameId,
      'mini',
      'black',
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

  it('returns failure when storage answers with no game', async () => {
    // Storage answers, and holds no game under this id.
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: undefined, result: true }),
    );

    await expect(
      requestGameStateSnapshot(gameId, 'mini', 'white', ports),
    ).resolves.toStrictEqual({
      errorReason: `Game ${gameId} not found`,
      result: false,
    });
  });

  it('returns failure when storage does not answer at all', async () => {
    // A port is allowed to hand back nothing for an id it has never seen.
    const ports = createPorts(vi.fn());

    await expect(
      requestGameStateSnapshot(gameId, 'mini', 'white', ports),
    ).resolves.toStrictEqual({
      errorReason: `Game ${gameId} not found`,
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
      requestGameStateSnapshot(gameId, 'mini', 'black', ports),
    ).resolves.toStrictEqual({
      errorReason: expect.stringContaining('gameState.cardState.visibility'),
      result: false,
    });
  });
});
