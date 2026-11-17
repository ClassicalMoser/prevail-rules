import type { Army } from '@entities';
import { createTestCard } from '@testing';

import { countCommandCardsByInitiative } from './countCommandCardsByInitiative';

describe('countCommandCardsByInitiative function', () => {
  it('counts the cards at each initiative, and reads a value with none as zero', () => {
    // Two cards at initiative 1, one at 3, none at 2 or 4.
    const army: Army = {
      commandCards: [
        createTestCard({ initiative: 1 }),
        createTestCard({ initiative: 1 }),
        createTestCard({ initiative: 3 }),
      ],
      id: '55555555-5555-4555-8555-555555555555',
      name: 'Spread test',
      units: [],
    };

    // Every legal value 1 to 4 is present, so the spread rule (§3.1.7) can
    // compare each one with the mode's count.
    expect(countCommandCardsByInitiative(army)).toStrictEqual({
      1: 2,
      2: 0,
      3: 1,
      4: 0,
    });
  });
});
