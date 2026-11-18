import { STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT } from '@ruleValues';

import { meetsCardsPerInitiative } from './meetsCardsPerInitiative';

/** A Standard list holds exactly three cards at each initiative (§3.1.7). */
describe('meetsCardsPerInitiative function', () => {
  it('allows exactly the required number', () => {
    expect(
      meetsCardsPerInitiative(3, STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT),
    ).toBe(true);
  });

  it('refuses one too few', () => {
    expect(
      meetsCardsPerInitiative(2, STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT),
    ).toBe(false);
  });

  it('refuses one too many, since the spread must be equal', () => {
    expect(
      meetsCardsPerInitiative(4, STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT),
    ).toBe(false);
  });

  it('allows any number where the mode sets no spread', () => {
    expect(meetsCardsPerInitiative(7, null)).toBe(true);
  });
});
