import { createTestCard } from '@testing';

import { isValidCommitment } from './isValidCommitment';

/**
 * A card committed from hand counts for the stat it names at that moment, and
 * a player may always refuse (§8.3, §8.4). Each moment offers its own cards;
 * this judges what the player sent against them.
 */
describe('isValidCommitment function', () => {
  // Black is the player asked, and holds one card the moment accepts: the
  // offers are that card and the refusal, as an enumerator lists them.
  const card = createTestCard({ modifiers: ['attack'] });
  const offered = [
    { committedCard: card, player: 'black' as const },
    { committedCard: 'none' as const, player: 'black' as const },
  ];

  it('accepts an offered card, and an offered refusal', () => {
    // The card as black holds it, then declining to commit at all.
    expect(
      isValidCommitment(
        { committedCard: card, player: 'black' },
        offered,
        'melee',
      ),
    ).toStrictEqual({ result: true });
    expect(
      isValidCommitment(
        { committedCard: 'none', player: 'black' },
        offered,
        'melee',
      ),
    ).toStrictEqual({ result: true });
  });

  it('refuses a card that is not offered, naming the moment', () => {
    // A card black does not hold, so it was never offered.
    const other = createTestCard({ modifiers: ['speed'] });

    // The reason says which commitment was refused, and with what card.
    expect(
      isValidCommitment(
        { committedCard: other, player: 'black' },
        offered,
        'movement',
      ),
    ).toStrictEqual({
      errorReason: `Commit to movement is not legal for black with card ${other.id}`,
      result: false,
    });
  });

  it('refuses the other player’s commitment', () => {
    // White is not the one asked, so even white's refusal is not an answer.
    expect(
      isValidCommitment(
        { committedCard: 'none', player: 'white' },
        offered,
        'ranged defense',
      ),
    ).toStrictEqual({
      errorReason:
        'Commit to ranged defense is not legal for white with refuse',
      result: false,
    });
  });

  it('refuses a card that bears an offered id but claims other stats', () => {
    // The id names the card held; the stats must be that card's.
    const claimsMore = createTestCard({
      id: card.id,
      modifiers: ['attack', 'speed'],
    });

    // Refused with the part of the card that differs.
    expect(
      isValidCommitment(
        { committedCard: claimsMore, player: 'black' },
        offered,
        'ranged attack',
      ),
    ).toStrictEqual({
      errorReason: `Card ${card.id} differs from the card held in its commit stats`,
      result: false,
    });
  });
});
