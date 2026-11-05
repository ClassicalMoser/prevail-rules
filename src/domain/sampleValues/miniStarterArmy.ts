import type { Army, CommandCard, UnitCount } from '@entities';
import { tempCommandCards } from './tempCommandCards';
import { equites, manipularLegion } from './tempUnits';

/**
 * Finds a sample command card by name.
 * Throws rather than skipping, since a missing card would unbalance the
 * army's cards per initiative without anyone noticing.
 */
function cardNamed(name: string): CommandCard {
  const card = tempCommandCards.find((entry) => entry.name === name);
  if (!card) {
    throw new Error(`Unknown sample command card: ${name}`);
  }
  return card;
}

/**
 * Builds a starter army a side may bring to a mini game.
 * The units cost 114 and the cards 80, inside mini's 200; the units' morale
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
  const commandCards: CommandCard[] = [
    // Initiative 1.
    cardNamed('Move'),
    cardNamed('Brace'),
    // Initiative 2.
    cardNamed('Organize'),
    cardNamed('Advance'),
    // Initiative 3.
    cardNamed('Triplex Acies'),
    cardNamed('Socketed Pilum'),
    // Initiative 4.
    cardNamed('Brace for Impact'),
    cardNamed('Persistent Formation'),
  ];

  const army: Army = { id, name, units, commandCards };
  return army;
}

export const whiteMiniStarterArmy: Army = makeMiniStarterArmy(
  '30000000-0000-4000-8000-000000000003',
  'White',
);

export const blackMiniStarterArmy: Army = makeMiniStarterArmy(
  '40000000-0000-4000-8000-000000000004',
  'Black',
);
