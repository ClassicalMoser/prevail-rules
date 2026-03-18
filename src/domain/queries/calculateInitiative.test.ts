import { createTestCard } from '@testing';
import { describe, expect, it } from 'vitest';
import { calculateInitiative } from './calculateInitiative';

describe('calculateInitiative', () => {
  it('should give initiative to the lower card initiative value', () => {
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 3 });

    expect(calculateInitiative(whiteCard, blackCard, 'black')).toBe('white');
  });

  it('should give initiative to black when black card has the lower value', () => {
    const whiteCard = createTestCard({ initiative: 4 });
    const blackCard = createTestCard({ initiative: 1 });

    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('black');
  });

  it('should keep current initiative on a tie', () => {
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 2 });

    expect(calculateInitiative(whiteCard, blackCard, 'white')).toBe('white');
    expect(calculateInitiative(whiteCard, blackCard, 'black')).toBe('black');
  });
});
