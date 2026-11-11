import type { EnginePorts } from '@application/ports';
import { updateCardState } from '@testing';
import { createEmptyGameState } from '@factories';

import { advanceEffects } from './advanceEffects';

const {
  findExpectedEventMock,
  generateEventFromProcedureMock,
  getExpectedEventMock,
  processEventMock,
} = vi.hoisted(() => ({
  findExpectedEventMock: vi.fn(),
  generateEventFromProcedureMock: vi.fn(),
  getExpectedEventMock: vi.fn(),
  processEventMock: vi.fn(),
}));

vi.mock(import('@expected'), () => ({
  findExpectedEvent: findExpectedEventMock,
  getExpectedEvent: getExpectedEventMock,
}));

vi.mock(import('@procedures'), () => ({
  generateEventFromProcedure: generateEventFromProcedureMock,
}));

vi.mock(import('./processEvent'), () => ({
  processEvent: processEventMock,
}));

describe('advanceEffects function', () => {
  const ports = {} as EnginePorts;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('answers that the game is over, without throwing, when it has already finished', async () => {
    const finished = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };
    // A finished game owes nothing: the total reader answers `undefined`,
    // and only the insisting one throws.
    findExpectedEventMock.mockReturnValue(undefined);
    getExpectedEventMock.mockImplementation(() => {
      throw new Error('Game is already over');
    });

    const result = await advanceEffects('game-1', 'standard', finished, ports);

    expect(result).toStrictEqual({
      errorReason: 'The game is already over',
      result: false,
    });
    expect(generateEventFromProcedureMock).not.toHaveBeenCalled();
  });

  it('stops after applying gameOver without re-querying expected event', async () => {
    const initial = createEmptyGameState('standard');
    const withEmptyWhite = updateCardState(initial, {
      ...initial.cardState,
      white: { ...initial.cardState.white, inHand: [] },
    });
    const finished = { ...withEmptyWhite, winner: 'black' as const };

    getExpectedEventMock.mockReturnValueOnce({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
    generateEventFromProcedureMock.mockReturnValue({
      effectType: 'gameOver',
      eventType: 'gameEffect',
      winner: 'black',
    });
    processEventMock.mockResolvedValue({
      data: finished,
      result: true,
    });

    const result = await advanceEffects(
      'game-1',
      'standard',
      withEmptyWhite,
      ports,
    );

    expect(result).toStrictEqual({ data: undefined, result: true });
    expect(generateEventFromProcedureMock).toHaveBeenCalledTimes(1);
    expect(processEventMock).toHaveBeenCalledTimes(1);
    expect(getExpectedEventMock).toHaveBeenCalledTimes(1);
  });

  it('continues the loop for non-terminal game effects until a non-effect', async () => {
    const state = createEmptyGameState('standard');
    const afterReveal = { ...state };

    getExpectedEventMock
      .mockReturnValueOnce({
        actionType: 'gameEffect',
        effectType: 'revealCards',
      })
      .mockReturnValueOnce({
        actionType: 'playerChoice',
        choiceType: 'chooseCard',
        playerSource: 'bothPlayers',
      });
    generateEventFromProcedureMock.mockReturnValue({
      effectType: 'revealCards',
      eventType: 'gameEffect',
    });
    processEventMock.mockResolvedValue({
      data: afterReveal,
      result: true,
    });

    const result = await advanceEffects('game-1', 'standard', state, ports);

    expect(result).toStrictEqual({ data: undefined, result: true });
    expect(getExpectedEventMock).toHaveBeenCalledTimes(2);
    expect(processEventMock).toHaveBeenCalledTimes(1);
  });
});
