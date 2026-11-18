import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import type { EnginePorts } from '@application/ports';
import { mathRandom } from '@application/infra';
import type { Game } from '@game';

import { createInitialGameState } from '@factories';

import { requestGameRecord } from './requestGameRecord';

// Stored games are read as legal games, so every id is a UUID.
const gameId = '11111111-1111-4111-8111-111111111111';

// A legal mini game, just dealt: its armies keep mini's army rules, as a
// stored game must to be loaded at all.
function storedGame(): Game {
  const gameState = createInitialGameState({
    blackArmy: blackMiniStarterArmy,
    gameMode: 'mini',
    whiteArmy: whiteMiniStarterArmy,
  });
  return {
    blackArmy: blackMiniStarterArmy,
    blackPlayer: '22222222-2222-4222-8222-222222222222',
    events: [],
    gameMode: 'mini',
    gameState,
    id: gameId,
    whiteArmy: whiteMiniStarterArmy,
    whitePlayer: '33333333-3333-4333-8333-333333333333',
  };
}

// Storage that answers with whatever `getGame` resolves to.
function createPorts(
  getGameImpl: EnginePorts['gameStorage']['getGame'],
): EnginePorts {
  return {
    gameStateSubscribers: [],
    random: mathRandom,
    gameStorage: {
      getGame: getGameImpl,
      recordEvent: vi.fn(),
      saveNewGame: vi.fn(),
    },
  };
}

describe('requestGameRecord function', () => {
  it('sends a seat the game in its own view, the other hand face down', async () => {
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: storedGame(), result: true as const }),
    );

    const result = await requestGameRecord(gameId, 'mini', 'whiteSeen', ports);

    expect(result.result).toBe(true);
    if (!result.result) {
      throw new Error('expected success');
    }
    expect(result.data.visibility).toBe('whiteSeen');
    expect(result.data.openingState.cardState.black.inHand).toStrictEqual(
      blackMiniStarterArmy.commandCards.map(() => 'hidden'),
    );
    expect(result.data.gameState.cardState.black.inHand).toStrictEqual(
      blackMiniStarterArmy.commandCards.map(() => 'hidden'),
    );
  });

  it('refuses a game storage does not hold, naming it', async () => {
    // Storage answers, and holds no game under this id.
    const ports = createPorts(
      vi.fn().mockResolvedValue({ data: undefined, result: true }),
    );

    await expect(
      requestGameRecord(gameId, 'mini', 'spectator', ports),
    ).resolves.toStrictEqual({
      errorReason: `Game ${gameId} not found`,
      result: false,
    });
  });
});
