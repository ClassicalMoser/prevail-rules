import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
} from '@factories';
import { createTestUnit } from '@testing';
import { hasSingleUnit } from './hasSingleUnit';

/**
 * A space holds nothing, one unit, or two enemies engaged in it (§2.2.1).
 * `hasSingleUnit` answers for the lone unit alone.
 */
describe('hasSingleUnit function', () => {
  it('an empty space has no single unit', () => {
    // An empty space.
    expect(hasSingleUnit(createNoneUnitPresence())).toBe(false);
  });

  it('a lone unit is a single unit', () => {
    // A black unit standing alone, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const alone = createSingleUnitPresence(unit, 'north');

    expect(hasSingleUnit(alone)).toBe(true);
  });

  it('an engaged space does not hold a single unit', () => {
    // Black facing north, and the white unit that walked into it.
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const engaged = createEngagedUnitPresence(black, 'north', white);

    expect(hasSingleUnit(engaged)).toBe(false);
  });
});
