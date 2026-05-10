import { createTestUnit } from '@testing';

import { isFriendlyUnit } from './isFriendlyUnit';

/**
 * IsFriendlyUnit: true when the unit's playerSide matches the queried side.
 */
describe(isFriendlyUnit, () => {
  it('given black unit and black side, returns true', () => {
    const unit = createTestUnit('black', { attack: 3 });
    expect(isFriendlyUnit(unit, 'black')).toBeTruthy();
  });

  it('given black unit and white side, returns false', () => {
    const unit = createTestUnit('black', { attack: 3 });
    expect(isFriendlyUnit(unit, 'white')).toBeFalsy();
  });

  it('given white unit and white side, returns true', () => {
    const unit = createTestUnit('white', { attack: 3 });
    expect(isFriendlyUnit(unit, 'white')).toBeTruthy();
  });

  it('given white unit and black side, returns false', () => {
    const unit = createTestUnit('white', { attack: 3 });
    expect(isFriendlyUnit(unit, 'black')).toBeFalsy();
  });
});
