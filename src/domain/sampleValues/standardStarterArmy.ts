import type { Army, CommandCard, UnitCount } from '@entities';
import { cardsAtInitiative } from './cardsAtInitiative';
import { equites, manipularLegion } from './tempUnits';

/**
 * Builds a starter army a side may bring to a standard game.
 * The units cost 124 and the cards 96, inside standard's 300; the units'
 * morale comes to exactly standard's minimum of 20.
 */
function makeStandardStarterArmy(id: string, name: string): Army {
  // Two unit types, well inside standard's eight. Eight legions and two
  // cavalry units carry 2 morale each, for 20, and neither passes its limit.
  const units: UnitCount[] = [
    { unitType: manipularLegion, count: 8 },
    { unitType: equites, count: 2 },
  ];

  // Standard asks for exactly three cards at each initiative, 1 through 4.
  // Pick by initiative value from the sample catalog — not by printed name.
  // TODO(wrong): picking by initiative alone takes Fearless Velites, whose
  // unit support names Velites, which this army does not field; that card
  // can never hold a unit at a rally's support check (§10.4). Settled by
  // choosing cards whose support this army can use, or by deciding a dead
  // card in a sample hand does not matter.
  const commandCards: CommandCard[] = [
    ...cardsAtInitiative(1, 3),
    ...cardsAtInitiative(2, 3),
    ...cardsAtInitiative(3, 3),
    ...cardsAtInitiative(4, 3),
  ];

  const army: Army = { id, name, units, commandCards };
  return army;
}

/** The standard starter army White brings in samples and tests. */
export const whiteStandardStarterArmy: Army = makeStandardStarterArmy(
  '50000000-0000-4000-8000-000000000005',
  'White',
);

/** The standard starter army Black brings in samples and tests. */
export const blackStandardStarterArmy: Army = makeStandardStarterArmy(
  '60000000-0000-4000-8000-000000000006',
  'Black',
);
