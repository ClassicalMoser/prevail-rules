import type { Army, CommandCard, UnitCount } from '@entities';
import { tempCommandCards } from './tempCommandCards';
import { equites, manipularLegion } from './tempUnits';

/**
 * Takes the first `count` sample cards at a given initiative.
 * Throws when the catalog is short, so a sample reshuffle cannot silently
 * unbalance the army's cards-per-initiative.
 */
function cardsAtInitiative(initiative: number, count: number): CommandCard[] {
  // Mini balances the deck by initiative value, not by printed card name.
  const atInitiative = tempCommandCards.filter(
    (card) => card.initiative === initiative,
  );
  // A short catalog would leave a side short of the mode's cards-per-initiative.
  if (atInitiative.length < count) {
    throw new Error(
      `Need at least ${count} sample cards at initiative ${initiative}, found ${atInitiative.length}`,
    );
  }
  const cards = atInitiative.slice(0, count);
  return cards;
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
  // Pick by initiative value from the sample catalog — not by printed name.
  const commandCards: CommandCard[] = [
    ...cardsAtInitiative(1, 2),
    ...cardsAtInitiative(2, 2),
    ...cardsAtInitiative(3, 2),
    ...cardsAtInitiative(4, 2),
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
