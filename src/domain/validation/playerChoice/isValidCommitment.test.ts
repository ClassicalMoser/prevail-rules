import { createTestCard } from '@testing';

import { isValidCommitment } from './isValidCommitment';

/**
 * A card committed from hand counts for the stat it names at that moment, and
 * a player may always refuse (§8.3, §8.4). Each moment offers its own cards;
 * this judges what the player sent against them.
 */
describe('isValidCommitment function', () => {
  const card = createTestCard({ modifiers: ['attack'] });
  const offered = [
    { committedCard: card, player: 'black' as const },
    { committedCard: null, player: 'black' as const },
  ];

  it('accepts an offered card, and an offered refusal', () => {
    expect(
      isValidCommitment(
        { committedCard: card, player: 'black' },
        offered,
        'melee',
      ),
    ).toStrictEqual({ result: true });
    expect(
      isValidCommitment(
        { committedCard: null, player: 'black' },
        offered,
        'melee',
      ),
    ).toStrictEqual({ result: true });
  });

  it('refuses a card that is not offered, naming the moment', () => {
    const other = createTestCard({ modifiers: ['speed'] });

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
    expect(
      isValidCommitment(
        { committedCard: null, player: 'white' },
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
    const claimsMore = {
      ...card,
      modifiers: ['attack', 'speed'] as typeof card.modifiers,
    };

    expect(
      isValidCommitment(
        { committedCard: claimsMore, player: 'black' },
        offered,
        'ranged attack',
      ).result,
    ).toBe(false);
  });
});
