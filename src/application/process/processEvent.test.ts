import type { EnginePorts } from '@application/ports';
import type { GameEffectEvent } from '@events';
import { createEmptyGameState } from '@factories';

import { processEvent } from './processEvent';

const { addEventToStreamMock, applyEventMock, updateGameStateMock } =
  vi.hoisted(() => ({
    addEventToStreamMock: vi.fn(),
    applyEventMock: vi.fn(),
    updateGameStateMock: vi.fn(),
  }));

vi.mock(import('@transforms'), () => ({
  applyEvent: applyEventMock,
}));

vi.mock(import('@application/composable'), () => ({
  updateGameState: updateGameStateMock,
}));

vi.mock(import('./handleNewRound'));

/**
 * A game's record is its event stream, and the stream is the game's history:
 * it holds the events that happened. An event the game could not take is not
 * part of that history, so it is applied first and recorded only once it has
 * been.
 */
describe('processEvent function', () => {
  // Only the stream port is reached by these cases; the others are never
  // called, so an empty stand-in is enough for them.
  const ports = {
    eventStreamStorage: { addEventToStream: addEventToStreamMock },
    gameStateSubscribers: [],
    gameStorage: {},
  } as unknown as EnginePorts;

  const event: GameEffectEvent = {
    effectType: 'gameOver',
    eventType: 'gameEffect',
    winner: 'black',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('records nothing when the event cannot be applied', async () => {
    const state = createEmptyGameState('standard');
    // The stream would take the event, were it offered.
    addEventToStreamMock.mockResolvedValue({ data: undefined, result: true });
    // The game cannot take this event, so applying it throws.
    applyEventMock.mockImplementation(() => {
      throw new Error('The event does not fit the game');
    });

    await expect(
      processEvent('game-1', 'standard', event, state, ports),
    ).rejects.toThrow('The event does not fit the game');

    // The stream never learns of an event the game never took.
    expect(addEventToStreamMock).not.toHaveBeenCalled();
    expect(updateGameStateMock).not.toHaveBeenCalled();
  });

  it('refuses, and keeps the stored game as it was, when the event cannot be recorded', async () => {
    const state = createEmptyGameState('standard');
    applyEventMock.mockReturnValue(state);
    addEventToStreamMock.mockResolvedValue({
      errorReason: 'The stream is not available',
      result: false,
    });

    const result = await processEvent(
      'game-1',
      'standard',
      event,
      state,
      ports,
    );

    // The game is not stored ahead of its own history.
    expect(result).toStrictEqual({
      errorReason: 'The stream is not available',
      result: false,
    });
    expect(updateGameStateMock).not.toHaveBeenCalled();
  });
});
