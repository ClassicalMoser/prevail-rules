import type { Event } from '@events';
import { tempCommandCards } from '@sampleValues';

import { getNextEventNumber } from './getNextEventNumber';

import { createEmptyGameState } from '@factories';
describe(getNextEventNumber, () => {
  it('returns 0 when the round has no events yet', () => {
    const state = createEmptyGameState('standard');
    expect(getNextEventNumber(state)).toBe(0);
  });

  it('returns the length of the current round event stream', () => {
    const state = createEmptyGameState('standard');
    const events: readonly Event[] = [
      {
        black: tempCommandCards[0],
        effectType: 'revealCards',
        eventNumber: 0,
        eventType: 'gameEffect',
        white: tempCommandCards[1],
      },
      {
        effectType: 'resolveInitiative',
        eventNumber: 1,
        eventType: 'gameEffect',
        player: 'black',
      },
    ];
    state.currentRoundState = {
      ...state.currentRoundState,
      events,
    };

    expect(getNextEventNumber(state)).toBe(2);
  });
});
