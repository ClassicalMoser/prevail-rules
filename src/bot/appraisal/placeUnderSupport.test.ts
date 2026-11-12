import { createTestUnit } from '@testing';
import { placeUnderSupport, stacksFor } from './placeUnderSupport';

/**
 * Who keeps a place under a hand's unit support after a rally (§10.4).
 */
describe('placeUnderSupport function', () => {
  // Two units of one type, and a third of another.
  const legion = createTestUnit('white', { attack: 4 });
  const secondLegion = { ...legion, instanceNumber: 2 };
  const other = createTestUnit('white', { attack: 2 });

  it('does not let a generic place take a unit a typed place could hold, when another unit needs it', () => {
    // One place for any unit, and one only for the legion's type. Placing the
    // first legion in the generic place would leave the other unit out.
    const stacks = stacksFor(
      [
        { count: 1, supportType: 'generic' },
        { count: 1, supportType: 'unitType', unitTypeId: legion.unitType.id },
      ],
      [legion, other],
    );
    const placed = placeUnderSupport(stacks, [legion, other]);
    expect(placed).toHaveLength(2);
  });

  it('keeps the units listed first when there are too few places', () => {
    // One generic place for two units: the first, the more valuable, keeps it.
    const stacks = stacksFor(
      [{ count: 1, supportType: 'generic' }],
      [legion, secondLegion],
    );
    const placed = placeUnderSupport(stacks, [legion, secondLegion]);
    expect(placed.map((assignment) => assignment.unit)).toStrictEqual([legion]);
  });

  it('places nobody under support no unit fits', () => {
    // Support for a type the army does not field holds nothing.
    const stacks = stacksFor(
      [{ count: 4, supportType: 'unitType', unitTypeId: 'not-in-this-army' }],
      [legion, other],
    );
    expect(placeUnderSupport(stacks, [legion, other])).toStrictEqual([]);
  });
});
