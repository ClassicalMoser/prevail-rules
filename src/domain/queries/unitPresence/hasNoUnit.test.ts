import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
  createTestUnit,
} from '@testing';
import { hasNoUnit } from './hasNoUnit';

/**
 * A space holds nothing, one unit, or two enemies engaged in it (§2.2.1).
 * `hasNoUnit` answers for the empty space alone.
 */
describe('hasNoUnit function', () => {
  it('an empty space has no unit', () => {
    // An empty space.
    expect(hasNoUnit(createNoneUnitPresence())).toBe(true);
  });

  it('a space with a lone unit is not empty', () => {
    // A black unit standing alone, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const alone = createSingleUnitPresence(unit, 'north');

    expect(hasNoUnit(alone)).toBe(false);
  });

  it('an engaged space is not empty', () => {
    // Black facing north, and the white unit that walked into it.
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const engaged = createEngagedUnitPresence(black, 'north', white);

    expect(hasNoUnit(engaged)).toBe(false);
  });
});
