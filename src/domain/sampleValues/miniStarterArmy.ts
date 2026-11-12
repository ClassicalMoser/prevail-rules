import type { Army, CommandCard, UnitCount } from '@entities';
import { cardsAtInitiative } from './cardsAtInitiative';
import { equites, manipularLegion } from './tempUnits';

/**
 * Builds a starter army a side may bring to a mini game.
 * The units cost 62 and the cards 64, inside mini's 200; the units' morale
 * comes to exactly mini's minimum of 10.
 */
function makeMiniStarterArmy(id: string, name: string): Army {
  // Two unit types, well inside mini's four. Four legions and one cavalry
  // unit carry 2 morale each, for 10.
  const units: UnitCount[] = [
    { unitType: manipularLegion, count: 4 },
    { unitType: equites, count: 1 },
  ];

  // Mini asks for exactly two cards at each initiative, 1 through 4.
  // Pick by initiative value from the sample catalog — not by printed name.
  // TODO(wrong): picking by initiative alone takes Fearless Velites, whose
  // unit support names Velites, which this army does not field; that card
  // can never hold a unit at a rally's support check (§10.4). Settled by
  // choosing cards whose support this army can use, or by deciding a dead
  // card in a sample hand does not matter.
  const commandCards: CommandCard[] = [
    ...cardsAtInitiative(1, 2),
    ...cardsAtInitiative(2, 2),
    ...cardsAtInitiative(3, 2),
    ...cardsAtInitiative(4, 2),
  ];

  const army: Army = { id, name, units, commandCards };
  return army;
}

/** The mini starter army White brings in samples and tests. */
export const whiteMiniStarterArmy: Army = makeMiniStarterArmy(
  '30000000-0000-4000-8000-000000000003',
  'White',
);

/** The mini starter army Black brings in samples and tests. */
export const blackMiniStarterArmy: Army = makeMiniStarterArmy(
  '40000000-0000-4000-8000-000000000004',
  'Black',
);
