import type { CardState } from '@game';
import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createTestCard, updateCardState } from '@testing';
import { projectGameStateForVisibility } from '@transforms';

import { getOwnedPlayerCardState } from './getOwnedPlayerCardState';

/**
 * A caller that insists on a hand, such as one about to take a card from it,
 * gets it where this view can see it and a fault where it cannot. Hands are
 * secret (§1.4): each seat sees its own, a spectator neither.
 */
describe('getOwnedPlayerCardState function', () => {
  // Each side holds one card in hand and has another waiting face down.
  const game = updateCardState(
    createEmptyGameState('standard'),
    createCardState({
      black: createOwnedCardState({
        awaitingPlay: createTestCard(),
        inHand: [createTestCard()],
      }),
      white: createOwnedCardState({
        awaitingPlay: createTestCard(),
        inHand: [createTestCard()],
      }),
    }),
  );

  it('gives both hands from the full record', () => {
    const { cardState } = game;

    expect(getOwnedPlayerCardState(cardState, 'black')).toBe(cardState.black);
    expect(getOwnedPlayerCardState(cardState, 'white')).toBe(cardState.white);
  });

  it("gives each seat its own hand and throws for the opponent's", () => {
    // White's seat holds its own cards; Black's are face down to it.
    const whiteSeen = projectGameStateForVisibility(game, 'whiteSeen');
    expect(getOwnedPlayerCardState(whiteSeen.cardState, 'white')).toBe(
      game.cardState.white,
    );
    expect(() => getOwnedPlayerCardState(whiteSeen.cardState, 'black')).toThrow(
      'Player black is not owned under whiteSeen visibility',
    );

    // And the same from Black's side of the table.
    const blackSeen = projectGameStateForVisibility(game, 'blackSeen');
    expect(getOwnedPlayerCardState(blackSeen.cardState, 'black')).toBe(
      game.cardState.black,
    );
    expect(() => getOwnedPlayerCardState(blackSeen.cardState, 'white')).toThrow(
      'Player white is not owned under blackSeen visibility',
    );
  });

  it('throws for either hand at a spectator view', () => {
    // A spectator owns neither hand.
    const { cardState } = projectGameStateForVisibility(game, 'spectator');

    expect(() => getOwnedPlayerCardState(cardState, 'black')).toThrow(
      'Player black is not owned under spectator visibility',
    );
    expect(() => getOwnedPlayerCardState(cardState, 'white')).toThrow(
      'Player white is not owned under spectator visibility',
    );
  });

  it('throws for a visibility the game does not know', () => {
    expect(() =>
      getOwnedPlayerCardState(
        // Intentionally bad type cast to test error path
        { ...game.cardState, visibility: 'nobody' } as unknown as CardState,
        'white',
      ),
    ).toThrow('Invalid visibility: nobody');
  });
});
