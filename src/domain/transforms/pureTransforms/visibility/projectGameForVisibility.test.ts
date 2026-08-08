import type { Army } from '@entities';
import type { GameForVisibility } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { projectGameForVisibility } from './projectGameForVisibility';

const placeholderArmy: Army = {
  commandCards: [],
  id: '00000000-0000-0000-0000-000000000000',
  units: [],
};

function authoritativeGame(): GameForVisibility<'authoritative'> {
  const gameState = createEmptyGameState();
  return {
    blackArmy: placeholderArmy,
    blackPlayer: 'black-user',
    gameMode: 'standard',
    gameState: {
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
    },
    id: 'game-1',
    whiteArmy: placeholderArmy,
    whitePlayer: 'white-user',
  };
}

describe(projectGameForVisibility, () => {
  it('projects whiteSeen with white owned and black hidden', () => {
    const projected = projectGameForVisibility(
      authoritativeGame(),
      'whiteSeen',
    );

    expect(projected.gameState.cardState.visibility).toBe('whiteSeen');
    expect(projected.gameState.cardState.white.inHand).toStrictEqual([
      tempCommandCards[3],
      tempCommandCards[4],
    ]);
    expect(projected.gameState.cardState.black).toStrictEqual({
      awaitingPlay: 'hidden',
      burnt: [],
      discarded: [],
      inHand: ['hidden'],
      inPlay: null,
      played: [],
    });
    expect(projected.gameState.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
  });

  it('projects blackSeen with black owned and white hidden', () => {
    const projected = projectGameForVisibility(
      authoritativeGame(),
      'blackSeen',
    );

    expect(projected.gameState.cardState.visibility).toBe('blackSeen');
    expect(projected.gameState.cardState.black.awaitingPlay).toBe(
      tempCommandCards[0],
    );
    expect(projected.gameState.cardState.white.inHand).toStrictEqual([
      'hidden',
      'hidden',
    ]);
    expect(projected.gameState.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
  });
});
