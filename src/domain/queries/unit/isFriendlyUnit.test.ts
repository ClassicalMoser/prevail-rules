import { createTestUnit } from '@testing';

import { isFriendlyUnit } from './isFriendlyUnit';

describe('isFriendlyUnit function', () => {
  it('holds for the side that fields the unit, and only that side', () => {
    // A black unit is Black's …
    const black = createTestUnit('black', { attack: 3 });
    expect(isFriendlyUnit(black, 'black')).toBe(true);
    expect(isFriendlyUnit(black, 'white')).toBe(false);

    // … and a white unit is White's.
    const white = createTestUnit('white', { attack: 3 });
    expect(isFriendlyUnit(white, 'white')).toBe(true);
    expect(isFriendlyUnit(white, 'black')).toBe(false);
  });
});
