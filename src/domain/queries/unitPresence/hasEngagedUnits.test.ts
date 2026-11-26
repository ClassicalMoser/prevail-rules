import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
} from '@factories';
import { createTestUnit } from '@testing';
import { hasEngagedUnits } from './hasEngagedUnits';

/**
 * A space holds nothing, one unit, or two enemies engaged in it (§2.2.1).
 * `hasEngagedUnits` answers for the engaged space alone.
 */
describe('hasEngagedUnits function', () => {
  it('an empty space is not engaged', () => {
    // An empty space.
    expect(hasEngagedUnits(createNoneUnitPresence())).toBe(false);
  });

  it('a lone unit is not engaged', () => {
    // A black unit standing alone, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const alone = createSingleUnitPresence(unit, 'north');

    expect(hasEngagedUnits(alone)).toBe(false);
  });

  it('two units sharing a space are engaged', () => {
    // Black facing north, and the white unit that walked into it.
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const engaged = createEngagedUnitPresence(black, 'north', white);

    expect(hasEngagedUnits(engaged)).toBe(true);
  });
});
