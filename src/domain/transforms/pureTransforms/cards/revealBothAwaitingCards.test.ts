import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createTestCard, updateCardState } from '@testing';

import { projectGameStateForVisibility } from '../visibility';
import { revealBothAwaitingCards } from './revealBothAwaitingCards';

/**
 * Both face-down cards are turned over together, and each is in play for the
 * round (§4.1.2). A view that holds a waiting card puts its own copy in play;
 * a view that held it face down has only the reveal event's copy.
 */
describe('revealBothAwaitingCards function', () => {
  // Each side has one card face down, waiting to be revealed.
  const blackAwaiting = createTestCard({ name: 'Black, as held' });
  const whiteAwaiting = createTestCard({ name: 'White, as held' });
  const game = updateCardState(
    createEmptyGameState('standard'),
    createCardState({
      black: createOwnedCardState({
        awaitingPlay: blackAwaiting,
        inHand: [createTestCard()],
      }),
      white: createOwnedCardState({
        awaitingPlay: whiteAwaiting,
        inHand: [createTestCard()],
      }),
    }),
  );

  // The reveal names both cards, who they are, under other names, so each
  // case can tell the held copy from the event's.
  const revealed = {
    black: { ...blackAwaiting, name: 'Black, as revealed' },
    white: { ...whiteAwaiting, name: 'White, as revealed' },
  };

  it('puts both held copies in play in the full record', () => {
    const result = revealBothAwaitingCards(game.cardState, revealed);

    // The full record held both cards, so the event's copies are not read.
    expect(result.visibility).toBe('authoritative');
    expect(result.black.inPlay).toBe(blackAwaiting);
    expect(result.black.awaitingPlay).toBeNull();
    expect(result.white.inPlay).toBe(whiteAwaiting);
    expect(result.white.awaitingPlay).toBeNull();
  });

  it("puts White's held copy and Black's revealed copy in play at White's seat", () => {
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    const result = revealBothAwaitingCards(cardState, revealed);

    // White's seat held its own card; Black's it saw only face down.
    expect(result.visibility).toBe('whiteSeen');
    expect(result.white.inPlay).toBe(whiteAwaiting);
    expect(result.white.awaitingPlay).toBeNull();
    expect(result.black.inPlay).toBe(revealed.black);
    expect(result.black.awaitingPlay).toBeNull();
  });

  it("puts Black's held copy and White's revealed copy in play at Black's seat", () => {
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    const result = revealBothAwaitingCards(cardState, revealed);

    // Black's seat held its own card; White's it saw only face down.
    expect(result.visibility).toBe('blackSeen');
    expect(result.black.inPlay).toBe(blackAwaiting);
    expect(result.black.awaitingPlay).toBeNull();
    expect(result.white.inPlay).toBe(revealed.white);
    expect(result.white.awaitingPlay).toBeNull();
  });

  it('puts both revealed copies in play for a spectator, who held neither', () => {
    const { cardState } = projectGameStateForVisibility(game, 'spectator');

    const result = revealBothAwaitingCards(cardState, revealed);

    expect(result.visibility).toBe('spectator');
    expect(result.black.inPlay).toBe(revealed.black);
    expect(result.black.awaitingPlay).toBeNull();
    expect(result.white.inPlay).toBe(revealed.white);
    expect(result.white.awaitingPlay).toBeNull();
  });

  it('throws for a visibility the game does not know', () => {
    expect(() =>
      revealBothAwaitingCards(
        // A visibility the type forbids, to reach the exhaustive default.
        { ...game.cardState, visibility: 'nobody' } as never,
        revealed,
      ),
    ).toThrow('Invalid card state:');
  });
});
