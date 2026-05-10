import { hasNoUnit } from '@entities';
import { createTestUnit } from '@testing/unitHelpers';
import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
} from '@testing/unitPresenceHelpers';

/**
 * HasNoUnit: type guard — unit presence is empty (none).
 */
describe(hasNoUnit, () => {
  it('given none unit presence, returns true', () => {
    const unitPresence = createNoneUnitPresence();
    expect(hasNoUnit(unitPresence)).toBeTruthy();
  });

  it('given single unit presence, returns false', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const unitPresence = createSingleUnitPresence(unit, 'north');
    expect(hasNoUnit(unitPresence)).toBeFalsy();
  });

  it('given engaged unit presence, returns false', () => {
    const unit1 = createTestUnit('black', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unitPresence = createEngagedUnitPresence(unit1, 'north', unit2);
    expect(hasNoUnit(unitPresence)).toBeFalsy();
  });
});
