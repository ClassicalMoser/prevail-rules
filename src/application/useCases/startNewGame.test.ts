import type { EnginePorts } from '../ports';

import { startNewGame } from './startNewGame';
import { gameModes } from '@entities';

const placeholderGameId = '00000000-0000-0000-0000-000000000000';

function createEnginePorts(overrides: {
  gameStateSubscribers?: EnginePorts['gameStateSubscribers'];
}): EnginePorts {
  return {
    eventStreamStorage: {
      addEventToStream: vi.fn(),
      flushEventStream: vi.fn(),
      getEventStream: vi.fn(),
      newEventStream: vi.fn(),
      truncateEventStream: vi.fn(),
    },
    gameStateSubscribers: overrides.gameStateSubscribers ?? [],
    gameStorage: {
      getGame: vi.fn(),
      saveNewGame: vi
        .fn()
        .mockResolvedValue({ data: undefined, result: true as const }),
      updateGameState: vi.fn(),
    },
    roundSnapshotStorage: {
      getRoundSnapshot: vi.fn(),
      saveRoundSnapshot: vi.fn(),
    },
  };
}

describe(startNewGame, () => {
  it('notifies matching subscribers with initial game state after save succeeds', async () => {
    expect.hasAssertions();
    const onGameStateChange = vi.fn();
    const ports = createEnginePorts({
      gameStateSubscribers: [
        {
          gameId: placeholderGameId,
          gameMode: gameModes[1],
          onError: vi.fn(),
          onGameStateChange,
        },
      ],
    });

    const outcome = await startNewGame('mini', ports);

    expect(outcome).toStrictEqual({ data: undefined, result: true });
    expect(onGameStateChange).toHaveBeenCalledTimes(1);
    const [change] = onGameStateChange.mock.calls[0] ?? [];
    expect(change).toMatchObject({
      gameId: placeholderGameId,
      gameMode: gameModes[1].name,
    });
    expect(change?.gameState).toBeDefined();
  });

  it('does not notify subscribers when gameId or gameType does not match', async () => {
    expect.hasAssertions();
    const matching = vi.fn();
    const wrongId = vi.fn();
    const wrongType = vi.fn();
    const ports = createEnginePorts({
      gameStateSubscribers: [
        {
          gameId: placeholderGameId,
          gameMode: gameModes[1],
          onError: vi.fn(),
          onGameStateChange: matching,
        },
        {
          gameId: '11111111-1111-1111-1111-111111111111',
          gameMode: gameModes[1],
          onError: vi.fn(),
          onGameStateChange: wrongId,
        },
        {
          gameId: placeholderGameId,
          gameMode: gameModes[2],
          onError: vi.fn(),
          onGameStateChange: wrongType,
        },
      ],
    });

    const outcome = await startNewGame('mini', ports);

    expect(outcome).toStrictEqual({ data: undefined, result: true });
    expect(matching).toHaveBeenCalledTimes(1);
    expect(wrongId).not.toHaveBeenCalled();
    expect(wrongType).not.toHaveBeenCalled();
  });

  it('returns failure when saveNewGame fails', async () => {
    expect.hasAssertions();
    const ports = createEnginePorts({
      gameStateSubscribers: [],
    });
    vi.mocked(ports.gameStorage.saveNewGame).mockResolvedValueOnce({
      errorReason: 'Game already exists',
      result: false,
    });

    const outcome = await startNewGame('mini', ports);

    expect(outcome).toStrictEqual({
      errorReason: 'Game already exists',
      result: false,
    });
  });

  it('calls onError and returns failure when a subscriber throws', async () => {
    expect.hasAssertions();
    const boom = new Error('subscriber failed');
    const onGameStateChange = vi.fn(() => {
      throw boom;
    });
    const onError = vi.fn();
    const ports = createEnginePorts({
      gameStateSubscribers: [
        {
          gameId: placeholderGameId,
          gameMode: gameModes[1],
          onError,
          onGameStateChange,
        },
      ],
    });

    const outcome = await startNewGame('mini', ports);

    expect(outcome).toStrictEqual({
      errorReason: 'subscriber failed',
      result: false,
    });
    expect(onError).toHaveBeenCalledWith(boom);
  });
});
