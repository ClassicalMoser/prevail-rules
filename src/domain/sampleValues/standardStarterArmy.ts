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
  // Pick by initiative value from the sample catalog — not by printed name —
  // and only cards whose support these units can meet at a rally (§10.4).
  const commandCards: CommandCard[] = [
    ...cardsAtInitiative(1, 3, units),
    ...cardsAtInitiative(2, 3, units),
    ...cardsAtInitiative(3, 3, units),
    ...cardsAtInitiative(4, 3, units),
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
