import { createTestUnit } from '@testing';

import { addUnitsToCommandedUnits } from './addUnitsToCommandedUnits';

import { createEmptyGameState } from '@factories';
/**
 * AddUnitsToCommandedUnits: Adds units to the commandedUnits set in the current round state.
 * A unit is commanded once a round (§4.3.6), so the round keeps a list of
 * every unit ordered so far, both players' alike.
 */
describe('addUnitsToCommandedUnits function', () => {
  // Two of White's units, and one of Black's.
  const whiteFirst = createTestUnit('white', { attack: 3 });
  const whiteSecond = createTestUnit('white', {
    attack: 3,
    instanceNumber: 2,
  });
  const black = createTestUnit('black', { attack: 3 });

  it('records the units a player orders as commanded this round', () => {
    // A new round: nobody has been commanded yet.
    const state = createEmptyGameState('standard');

    const newState = addUnitsToCommandedUnits(state, [whiteFirst, whiteSecond]);

    // Both of White's units are commanded.
    expect(newState.currentRoundState.commandedUnits).toStrictEqual([
      whiteFirst,
      whiteSecond,
    ]);
  });

  it('keeps the units commanded earlier in the round when more are ordered, and leaves the state it was given as it was', () => {
    // White, holding the initiative, has ordered its two units.
    const whiteOrdered = addUnitsToCommandedUnits(
      createEmptyGameState('standard'),
      [whiteFirst, whiteSecond],
    );

    // Then Black orders its one.
    const newState = addUnitsToCommandedUnits(whiteOrdered, [black]);

    // All three are commanded, in the order they were ordered.
    expect(newState.currentRoundState.commandedUnits).toStrictEqual([
      whiteFirst,
      whiteSecond,
      black,
    ]);
    // The state it was given still lists only White's two.
    expect(whiteOrdered.currentRoundState.commandedUnits).toStrictEqual([
      whiteFirst,
      whiteSecond,
    ]);
  });
});
