import type { Event } from '@events';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { applyEvent } from './applyEvent';
import { applyGameEffectEvent } from './applyGameEffectEvent';
import { applyPlayerChoiceEvent } from './applyPlayerChoiceEvent';

vi.mock(import('./applyPlayerChoiceEvent'));
vi.mock(import('./applyGameEffectEvent'));

/**
 * `applyEvent` is the single entry for applying any `Event` to game state: it narrows on
 * `eventType` and delegates to `applyPlayerChoiceEvent` or `applyGameEffectEvent`. Anything
 * else should fail fast (exhaustiveness / unknown tag).
 */
describe(applyEvent, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('given playerChoice chooseCard event, delegates to applyPlayerChoiceEvent and appends event', () => {
    const state = createEmptyGameState();
    const event: Event = {
      card: tempCommandCards[0],
      choiceType: 'chooseCard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };
    const mockReturnState = {
      ...state,
      currentRoundNumber: 99,
    };
    vi.mocked(applyPlayerChoiceEvent).mockReturnValue(mockReturnState);

    const result = applyEvent(event, state);

    expect(applyPlayerChoiceEvent).toHaveBeenCalledWith(event, state);
    expect(applyGameEffectEvent).not.toHaveBeenCalled();
    expect(result.currentRoundNumber).toBe(99);
    expect(result.currentRoundState.events).toStrictEqual([event]);
  });

  it('given gameEffect revealCards event, delegates to applyGameEffectEvent and appends event', () => {
    const state = createEmptyGameState();
    const event: Event = {
      effectType: 'revealCards' as const,
      eventNumber: 0,
      eventType: 'gameEffect',
    };
    const mockReturnState = {
      ...state,
      currentRoundNumber: 1,
    };
    vi.mocked(applyGameEffectEvent).mockReturnValue(mockReturnState);

    const result = applyEvent(event, state);

    expect(applyGameEffectEvent).toHaveBeenCalledWith(event, state);
    expect(applyPlayerChoiceEvent).not.toHaveBeenCalled();
    expect(result.currentRoundNumber).toBe(1);
    expect(result.currentRoundState.events).toStrictEqual([event]);
  });

  it('accumulates events across multiple applyEvent calls', () => {
    const state = createEmptyGameState();
    const event1: Event = {
      card: tempCommandCards[0],
      choiceType: 'chooseCard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };
    const event2: Event = {
      effectType: 'revealCards' as const,
      eventNumber: 1,
      eventType: 'gameEffect',
    };

    vi.mocked(applyPlayerChoiceEvent).mockImplementation((_e, s) => s);
    vi.mocked(applyGameEffectEvent).mockImplementation((_e, s) => s);

    const after1 = applyEvent(event1, state);
    const after2 = applyEvent(event2, after1);

    expect(after2.currentRoundState.events).toStrictEqual([event1, event2]);
  });

  it('given event with unknown eventType cast, throws and does not call choice or effect applier', () => {
    const state = createEmptyGameState();
    // Use bad cast to trigger type error
    const event = { eventType: 'unknown' } as unknown as Event;

    expect(() => applyEvent(event, state)).toThrow(
      'Unknown event type: unknown',
    );

    expect(applyPlayerChoiceEvent).not.toHaveBeenCalled();
    expect(applyGameEffectEvent).not.toHaveBeenCalled();
  });
});
