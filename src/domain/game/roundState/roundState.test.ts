import { tempCommandCards } from '@sampleValues';
import { createChooseCardEvent, createEmptyGameState } from '@factories';

import {
  authoritativeRoundStateSchema,
  roundStateSchema,
  seenRoundStateSchema,
} from './roundState';

/**
 * A round's event log holds each event as its viewer received it: the server
 * keeps every event as made, and a seat or a spectator holds the opponent's
 * face-down card as hidden (§4.1.1).
 */
describe('the round state schemas', () => {
  const { currentRoundState: empty } = createEmptyGameState('standard');
  const faceUp = createChooseCardEvent({
    card: tempCommandCards[0],
    player: 'black',
  });
  const faceDown = { ...faceUp, card: 'hidden' as const };

  it('accepts an event log of events as they were made on the server', () => {
    const round = { ...empty, events: [faceUp] };

    expect(authoritativeRoundStateSchema.safeParse(round).success).toBe(true);
  });

  it('refuses a hidden card in the server’s own log, which has seen every card', () => {
    const round = { ...empty, events: [faceDown] };

    expect(authoritativeRoundStateSchema.safeParse(round).success).toBe(false);
  });

  it('accepts an event log with the opponent’s card hidden on a seat', () => {
    const round = { ...empty, events: [faceDown] };

    expect(seenRoundStateSchema.safeParse(round).success).toBe(true);
  });

  it('accepts an event the seat could read in full, as a seat holds its own', () => {
    // A seat's own choice is not hidden from it.
    const round = { ...empty, events: [faceUp] };

    expect(seenRoundStateSchema.safeParse(round).success).toBe(true);
  });

  it('accepts either, for code that reads a round of any view', () => {
    expect(
      roundStateSchema.safeParse({ ...empty, events: [faceDown] }).success,
    ).toBe(true);
    expect(
      roundStateSchema.safeParse({ ...empty, events: [faceUp] }).success,
    ).toBe(true);
  });
});
