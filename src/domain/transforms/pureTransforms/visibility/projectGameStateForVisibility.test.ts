import { tempCommandCards } from '@sampleValues';
import type { GameStateForVisibility } from '@game';

import { projectGameStateForVisibility } from './projectGameStateForVisibility';

import { createEmptyGameState } from '@factories';

function authoritativeState(): GameStateForVisibility<'authoritative'> {
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
});
