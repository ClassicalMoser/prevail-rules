import type { EnginePorts, NewGame } from '@application/ports';
import {
  blackMiniStarterArmy,
  blackStandardStarterArmy,
  whiteMiniStarterArmy,
  whiteStandardStarterArmy,
} from '@sampleValues';
import { defaultRandom } from '@utils';

import { parseLegalGameForMode } from '../utils/parseLegalGame';
import { startNewGame } from './startNewGame';
import { gameModes } from '@entities';

const gameId = '11111111-1111-4111-8111-111111111111';

/**
 * A legal mini game: its armies keep mini's army rules, as a game must to be
 * started at all.
 */
const miniGame: NewGame = {
  blackArmy: blackMiniStarterArmy,
  blackPlayer: '22222222-2222-4222-8222-222222222222',
  id: gameId,
  whiteArmy: whiteMiniStarterArmy,
  whitePlayer: '33333333-3333-4333-8333-333333333333',
};

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
    random: defaultRandom,
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

describe('startNewGame function', () => {
  it('notifies matching subscribers with initial game state after save succeeds', async () => {
    expect.hasAssertions();
    const onGameStateChange = vi.fn();
    const ports = createEnginePorts({
      gameStateSubscribers: [
        {
          gameId,
          gameMode: gameModes[1].name,
          onError: vi.fn(),
          onGameStateChange,
        },
      ],
    });

    const outcome = await startNewGame('mini', miniGame, ports);

    expect(outcome).toStrictEqual({ data: undefined, result: true });
    expect(onGameStateChange).toHaveBeenCalledTimes(1);
    const [change] = onGameStateChange.mock.calls[0] ?? [];
    expect(change).toMatchObject({
      gameId,
      gameMode: gameModes[1].name,
    });
    expect(change?.gameState).toBeDefined();
  });

  it('does not notify subscribers when gameId or gameMode does not match', async () => {
    expect.hasAssertions();
    const matching = vi.fn();
    const wrongId = vi.fn();
    const wrongMode = vi.fn();
    const ports = createEnginePorts({
      gameStateSubscribers: [
        {
          gameId,
          gameMode: gameModes[1].name,
          onError: vi.fn(),
          onGameStateChange: matching,
        },
        {
          gameId: '44444444-4444-4444-8444-444444444444',
          gameMode: gameModes[1].name,
          onError: vi.fn(),
          onGameStateChange: wrongId,
        },
        {
          gameId,
          gameMode: gameModes[2].name,
          onError: vi.fn(),
          onGameStateChange: wrongMode,
        },
      ],
    });

    const outcome = await startNewGame('mini', miniGame, ports);

    expect(outcome).toStrictEqual({ data: undefined, result: true });
    expect(matching).toHaveBeenCalledTimes(1);
    expect(wrongId).not.toHaveBeenCalled();
    expect(wrongMode).not.toHaveBeenCalled();
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

    const outcome = await startNewGame('mini', miniGame, ports);

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
          gameId,
          gameMode: gameModes[1].name,
          onError,
          onGameStateChange,
        },
      ],
    });

    const outcome = await startNewGame('mini', miniGame, ports);

    expect(outcome).toStrictEqual({
      errorReason: 'subscriber failed',
      result: false,
    });
    expect(onError).toHaveBeenCalledWith(boom);
  });

  it('saves the game with the players and armies it was given', async () => {
    expect.hasAssertions();
    const ports = createEnginePorts({});

    await startNewGame('mini', miniGame, ports);

    expect(ports.gameStorage.saveNewGame).toHaveBeenCalledWith(
      expect.objectContaining({
        blackArmy: blackMiniStarterArmy,
        blackPlayer: miniGame.blackPlayer,
        gameMode: 'mini',
        id: gameId,
        whiteArmy: whiteMiniStarterArmy,
        whitePlayer: miniGame.whitePlayer,
      }),
    );
  });

  it('refuses a game whose army breaks the mode rules, and saves nothing', async () => {
    expect.hasAssertions();
    const ports = createEnginePorts({});
    // An army with nothing in it cannot meet mini's morale or its cards per
    // initiative.
    const empty = { ...whiteMiniStarterArmy, commandCards: [], units: [] };

    const outcome = await startNewGame(
      'mini',
      { ...miniGame, whiteArmy: empty },
      ports,
    );

    expect(outcome).toStrictEqual({
      errorReason: expect.stringContaining('total morale value of 10'),
      result: false,
    });
    expect(ports.gameStorage.saveNewGame).not.toHaveBeenCalled();
  });

  it('starts a game that can be loaded again as a legal game', async () => {
    expect.hasAssertions();
    const ports = createEnginePorts({});

    await startNewGame('mini', miniGame, ports);
    const [saved] =
      vi.mocked(ports.gameStorage.saveNewGame).mock.calls[0] ?? [];

    // What was saved is what loading accepts: creation and loading agree on
    // what a legal game is.
    expect(parseLegalGameForMode('mini', saved)).toMatchObject({
      result: true,
    });
  });

  it('starts a standard game from the standard starter armies', async () => {
    expect.hasAssertions();
    const ports = createEnginePorts({});
    // A legal standard game: morale of 20, three cards at each initiative,
    // and a cost inside standard's 300.
    const standardGame: NewGame = {
      ...miniGame,
      blackArmy: blackStandardStarterArmy,
      whiteArmy: whiteStandardStarterArmy,
    };

    const outcome = await startNewGame('standard', standardGame, ports);

    expect(outcome).toStrictEqual({ data: undefined, result: true });
    expect(ports.gameStorage.saveNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ gameMode: 'standard' }),
    );
  });

  it('refuses a mini army in a standard game, naming the rule it breaks', async () => {
    expect.hasAssertions();
    const ports = createEnginePorts({});

    // The mini starter army is legal for mini, but standard asks for 20
    // morale and three cards at each initiative.
    const outcome = await startNewGame('standard', miniGame, ports);

    expect(outcome).toStrictEqual({
      errorReason: expect.stringContaining('total morale value of 20'),
      result: false,
    });
  });
});
