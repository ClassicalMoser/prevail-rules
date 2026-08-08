import type { EnginePorts } from '@application/ports';
import type { Army } from '@entities';
import type { GameForVisibility } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, createUnitWithPlacement } from '@testing';
import { addUnitToBoard, updateBoardState } from '@transforms';

import { requestGameStateSnapshot } from './requestGameStateSnapshot';

const gameId = 'game-snapshot-1';
const placeholderArmy: Army = {
  commandCards: [],
  id: '00000000-0000-0000-0000-000000000000',
  units: [],
};

function authoritativeGame(): GameForVisibility<'authoritative'> {
  const unit = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'north',
    playerSide: 'white',
  });
  let gameState = createEmptyGameState();
  gameState = updateBoardState(
    gameState,
    addUnitToBoard(gameState.boardState, unit),
  );
  return {
    blackArmy: placeholderArmy,
    blackPlayer: 'black-user',
    gameMode: 'standard',
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
    whiteArmy: placeholderArmy,
    whitePlayer: 'white-user',
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

function projectAsBlackSeen(
  game: GameForVisibility<'authoritative'>,
): GameForVisibility<'blackSeen'>['gameState']['cardState'] {
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
describe(requestGameStateSnapshot, () => {
  it('returns blackSeen projection including opponent units on the board', async () => {
    const game = authoritativeGame();
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: game, result: true as const }),
    );

    const result = await requestGameStateSnapshot(
      gameId,
      'standard',
      'black',
      ports,
    );

    expect(result.result).toBe(true);
    if (!result.result) {
      throw new Error('expected success');
    }
    expect(result.data.gameState.cardState.visibility).toBe('blackSeen');
    expect(result.data.gameState.cardState.black.inHand).toStrictEqual([
      tempCommandCards[0],
    ]);
    expect(result.data.gameState.cardState.white.inHand).toStrictEqual([
      'hidden',
    ]);
    expect(result.data.gameState.boardState.board['E-5']?.unitPresence).toEqual(
      game.gameState.boardState.board['E-5']?.unitPresence,
    );
  });

  it('returns failure when the game is missing', async () => {
    const ports = createPorts(vi.fn().mockResolvedValue(null));

    await expect(
      requestGameStateSnapshot(gameId, 'standard', 'white', ports),
    ).resolves.toStrictEqual({
      errorReason: 'Game not found',
      result: false,
    });
  });

  it('returns failure when stored game is not authoritative', async () => {
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
      requestGameStateSnapshot(gameId, 'standard', 'black', ports),
    ).resolves.toStrictEqual({
      errorReason: 'Engine requires authoritative game state',
      result: false,
    });
  });
});
