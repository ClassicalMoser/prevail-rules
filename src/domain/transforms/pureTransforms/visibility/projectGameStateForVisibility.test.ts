import { tempCommandCards } from '@sampleValues';
import type { AuthoritativeGameState } from '@game';

import { projectGameStateForVisibility } from './projectGameStateForVisibility';

import { createChooseCardEvent, createEmptyGameState } from '@factories';
import { updateRoundEventStream } from '../state/updateRoundEventStream';

function authoritativeState(): AuthoritativeGameState {
  const gameState = createEmptyGameState('standard');
  return {
    ...gameState,
    cardState: {
      visibility: 'authoritative',
      black: {
        awaitingPlay: tempCommandCards[0],
        burnt: [],
        discarded: [],
        inHand: [tempCommandCards[1]],
        inPlay: null,
        played: [],
      },
      white: {
        awaitingPlay: null,
        burnt: [],
        discarded: [tempCommandCards[2]],
        inHand: [tempCommandCards[3], tempCommandCards[4]],
        inPlay: null,
        played: [],
      },
    },
  };
}

describe('projectGameStateForVisibility function', () => {
  it('projects whiteSeen with white owned and black hidden', () => {
    const projected = projectGameStateForVisibility(
      authoritativeState(),
      'whiteSeen',
    );

    expect(projected.cardState.visibility).toBe('whiteSeen');
    expect(projected.cardState.white.inHand).toStrictEqual([
      tempCommandCards[3],
      tempCommandCards[4],
    ]);
    expect(projected.cardState.black).toStrictEqual({
      awaitingPlay: 'hidden',
      burnt: [],
      discarded: [],
      inHand: ['hidden'],
      inPlay: null,
      played: [],
    });
    expect(projected.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
  });

  it('projects blackSeen with black owned and white hidden', () => {
    const projected = projectGameStateForVisibility(
      authoritativeState(),
      'blackSeen',
    );

    expect(projected.cardState.visibility).toBe('blackSeen');
    expect(projected.cardState.black.awaitingPlay).toBe(tempCommandCards[0]);
    expect(projected.cardState.white.inHand).toStrictEqual([
      'hidden',
      'hidden',
    ]);
    expect(projected.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
  });

  it('projects spectator with both hands hidden and public piles intact', () => {
    const state = authoritativeState();
    const projected = projectGameStateForVisibility(state, 'spectator');

    expect(projected.cardState.visibility).toBe('spectator');
    expect(projected.cardState.white.inHand).toStrictEqual([
      'hidden',
      'hidden',
    ]);
    expect(projected.cardState.black.inHand).toStrictEqual(['hidden']);
    expect(projected.cardState.black.awaitingPlay).toBe('hidden');
    expect(projected.cardState.white.awaitingPlay).toBeNull();
    expect(projected.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
    // The board is never hidden.
    expect(projected.boardState).toBe(state.boardState);
  });

  it("hides the opponent's face-down choice in the round's event log, as it hides it in the cards", () => {
    // Both players have chosen a card for the round, face down. Each seat may
    // read its own choice in the log and only that it happened for the other.
    const base = authoritativeState();
    const state = updateRoundEventStream(base, [
      createChooseCardEvent({ card: tempCommandCards[0], player: 'black' }),
      createChooseCardEvent({ card: tempCommandCards[3], player: 'white' }),
    ]);

    const whiteView = projectGameStateForVisibility(state, 'whiteSeen');
    const blackView = projectGameStateForVisibility(state, 'blackSeen');
    const spectatorView = projectGameStateForVisibility(state, 'spectator');

    // White sees its own choice and not black's.
    expect(whiteView.currentRoundState.events).toMatchObject([
      { card: 'hidden', player: 'black' },
      { card: tempCommandCards[3], player: 'white' },
    ]);
    // Black sees its own choice and not white's.
    expect(blackView.currentRoundState.events).toMatchObject([
      { card: tempCommandCards[0], player: 'black' },
      { card: 'hidden', player: 'white' },
    ]);
    // A spectator sees neither.
    expect(spectatorView.currentRoundState.events).toMatchObject([
      { card: 'hidden', player: 'black' },
      { card: 'hidden', player: 'white' },
    ]);
  });
});
