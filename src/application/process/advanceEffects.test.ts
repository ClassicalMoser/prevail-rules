import type { EnginePorts } from '@application/ports';
import { createEmptyGameState, updateCardState } from '@testing';

import { advanceEffects } from './advanceEffects';

const {
  getExpectedEventMock,
  generateEventFromProcedureMock,
  processEventMock,
} = vi.hoisted(() => ({
  generateEventFromProcedureMock: vi.fn(),
  getExpectedEventMock: vi.fn(),
  processEventMock: vi.fn(),
}));

vi.mock(import('@expected'), () => ({
  getExpectedEvent: getExpectedEventMock,
}));

vi.mock(import('@procedures'), () => ({
  generateEventFromProcedure: generateEventFromProcedureMock,
}));

vi.mock(import('./processEvent'), () => ({
  processEvent: processEventMock,
}));

describe(advanceEffects, () => {
  const ports = {} as EnginePorts;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stops after applying gameOver without re-querying expected event', async () => {
    const initial = createEmptyGameState();
    const withEmptyWhite = updateCardState(initial, {
      ...initial.cardState,
      white: { ...initial.cardState.white, inHand: [] },
    });
    const finished = { ...withEmptyWhite, winner: 'black' as const };

    getExpectedEventMock.mockReturnValueOnce({
      actionType: 'gameEffect',
      effectType: 'gameOver',
      expectedEventNumber: 0,
    });
    generateEventFromProcedureMock.mockReturnValue({
      effectType: 'gameOver',
      eventNumber: 0,
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
    const state = createEmptyGameState();
    const afterReveal = { ...state };

    getExpectedEventMock
      .mockReturnValueOnce({
        actionType: 'gameEffect',
        effectType: 'revealCards',
        expectedEventNumber: 0,
      })
      .mockReturnValueOnce({
        actionType: 'playerChoice',
        choiceType: 'chooseCard',
        expectedEventNumber: 1,
        playerSource: 'bothPlayers',
      });
    generateEventFromProcedureMock.mockReturnValue({
      effectType: 'revealCards',
      eventNumber: 0,
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
