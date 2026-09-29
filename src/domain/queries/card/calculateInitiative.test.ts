import { createTestCard } from '@testing';

import { calculateInitiative } from './calculateInitiative';

/**
 * CalculateInitiative: compares played cards' initiative values; lower wins; on a tie, initiative stays with
 * the current holder.
 */
describe(calculateInitiative, () => {
  it('white takes initiative when its card is lower', () => {
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 3 });

    expect(calculateInitiative(whiteCard, blackCard, 'black')).toBe('white');
  });

  it('white keeps initiative when its card is lower', () => {
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 3 });

    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('white');
  });

  it('black takes initiative when its card is lower', () => {
    const whiteCard = createTestCard({ initiative: 4 });
    const blackCard = createTestCard({ initiative: 1 });

    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('black');
  });

  it('black keeps initiative when its card is lower', () => {
    const whiteCard = createTestCard({ initiative: 4 });
    const blackCard = createTestCard({ initiative: 1 });

    expect(calculateInitiative(whiteCard, blackCard, 'black')).toBe('black');
  });

  it('black keeps initiative when tied', () => {
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 2 });

    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('white');
  });

  it('white keeps initiative when tied', () => {
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 2 });

    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('white');
  });
});
