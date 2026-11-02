import { createTestUnit } from '@testing';

import { isFriendlyUnit } from './isFriendlyUnit';

/**
 * IsFriendlyUnit: true when the unit's playerSide matches the queried side.
 */
describe('isFriendlyUnit function', () => {
  it('returns true when the unit and the side are both black', () => {
    const unit = createTestUnit('black', { attack: 3 });
    expect(isFriendlyUnit(unit, 'black')).toBe(true);
  });

  it('returns false when a black unit is checked against white', () => {
    const unit = createTestUnit('black', { attack: 3 });
    expect(isFriendlyUnit(unit, 'white')).toBe(false);
  });

  it('returns true when the unit and the side are both white', () => {
    const unit = createTestUnit('white', { attack: 3 });
    expect(isFriendlyUnit(unit, 'white')).toBe(true);
  });

  it('returns false when a white unit is checked against black', () => {
    const unit = createTestUnit('white', { attack: 3 });
    expect(isFriendlyUnit(unit, 'black')).toBe(false);
  });
});
