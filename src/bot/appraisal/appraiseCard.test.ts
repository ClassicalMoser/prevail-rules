import { tempCommandCards } from '@sampleValues';
import { appraiseKeeping } from './appraiseCard';

/**
 * A card worth keeping steadies more units at a rally, or wins initiative.
 */
describe('appraiseKeeping function', () => {
  it('values a card that steadies more units above one that steadies fewer, at the same initiative', () => {
    const [card] = tempCommandCards;
    if (card === undefined) {
      throw new Error('The sample catalog has a card');
    }
    const steadiesMore = {
      ...card,
      unitSupport: { ...card.unitSupport, count: card.unitSupport.count + 2 },
    };
    expect(appraiseKeeping(steadiesMore)).toBeGreaterThan(
      appraiseKeeping(card),
    );
  });

  it('values a card that goes first above one that goes later, all else equal', () => {
    const [card] = tempCommandCards;
    if (card === undefined) {
      throw new Error('The sample catalog has a card');
    }
    expect(appraiseKeeping({ ...card, initiative: 1 })).toBeGreaterThan(
      appraiseKeeping({ ...card, initiative: 4 }),
    );
  });
});
