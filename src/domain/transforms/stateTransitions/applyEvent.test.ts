import type { GameState, StandardBoard } from '@entities';
import type { Event } from '@events';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyEvent } from './applyEvent';
import { applyGameEffectEvent } from './applyGameEffectEvent';
import { applyPlayerChoiceEvent } from './applyPlayerChoiceEvent';

vi.mock('./applyPlayerChoiceEvent');
vi.mock('./applyGameEffectEvent');

describe('applyEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should route playerChoice events to applyPlayerChoiceEvent and return its result', () => {
    const state = createEmptyGameState();
    const event: Event<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseCard',
      player: 'black',
      card: commandCards[0],
    };
    const mockReturnState = {
      ...state,
      currentRoundNumber: 99,
    } as GameState<StandardBoard>;
    vi.mocked(applyPlayerChoiceEvent).mockReturnValue(mockReturnState);

    const result = applyEvent(event, state);

    expect(applyPlayerChoiceEvent).toHaveBeenCalledWith(event, state);
    expect(applyGameEffectEvent).not.toHaveBeenCalled();
    expect(result).toBe(mockReturnState);
  });

  it('should route gameEffect events to applyGameEffectEvent and return its result', () => {
    const state = createEmptyGameState();
    const event: Event<StandardBoard> = {
      eventType: 'gameEffect',
      effectType: 'revealCards' as const,
    };
    const mockReturnState = {
      ...state,
      currentRoundNumber: 1,
    } as GameState<StandardBoard>;
    vi.mocked(applyGameEffectEvent).mockReturnValue(mockReturnState);

    const result = applyEvent(event, state);

    expect(applyGameEffectEvent).toHaveBeenCalledWith(event, state);
    expect(applyPlayerChoiceEvent).not.toHaveBeenCalled();
    expect(result).toBe(mockReturnState);
  });

  it('should throw for unknown event type', () => {
    const state = createEmptyGameState();
    // Use bad cast to trigger type error
    const event = { eventType: 'unknown' } as unknown as Event<StandardBoard>;

    expect(() => applyEvent(event, state)).toThrow(
      'Unknown event type: unknown',
    );

    expect(applyPlayerChoiceEvent).not.toHaveBeenCalled();
    expect(applyGameEffectEvent).not.toHaveBeenCalled();
  });
});
