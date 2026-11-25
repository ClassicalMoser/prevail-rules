import { createTestCard } from '@testing';

import { calculateInitiative } from './calculateInitiative';

/**
 * Both cards are revealed together and the lower initiative value takes the
 * initiative (§4.1.3); on a tie it stays with whoever already had it (§4.1.4).
 */
describe('calculateInitiative function', () => {
  it("gives White the initiative for White's lower card, whoever held it", () => {
    // White reveals a 2 against Black's 3.
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 3 });

    // Black loses the initiative it held …
    expect(calculateInitiative(whiteCard, blackCard, 'black')).toBe('white');
    // … and White, holding it already, keeps it.
    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('white');
  });

  it("gives Black the initiative for Black's lower card, whoever held it", () => {
    // Black reveals a 1 against White's 4.
    const whiteCard = createTestCard({ initiative: 4 });
    const blackCard = createTestCard({ initiative: 1 });

    // White loses the initiative it held …
    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('black');
    // … and Black, holding it already, keeps it.
    expect(calculateInitiative(whiteCard, blackCard, 'black')).toBe('black');
  });

  it('leaves the initiative with its holder on a tie', () => {
    // Both reveal a 2.
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 2 });

    // Black held it, so Black keeps it …
    expect(calculateInitiative(whiteCard, blackCard, 'black')).toBe('black');
    // … and the same tie leaves it with White when White held it.
    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('white');
  });
});
