import type { Army, CommandCard, UnitCount, UnitType } from '@entities';
import { equites, manipularLegion, velites } from './tempUnits';
import { tempCommandCards } from './tempCommandCards';

const makeCounts = (unitType: UnitType, count: number): UnitCount => ({
  count,
  unitType,
});

const makeArmyUnits = (): UnitCount[] => [
  makeCounts(velites, 4),
  makeCounts(equites, 2),
  makeCounts(manipularLegion, 6),
];

const getCardByName = (name: string) =>
  tempCommandCards.find((card) => card.name === name);

const makeArmyCards = (): CommandCard[] => {
  const cards: (CommandCard | undefined)[] = [
    getCardByName('Strike'),
    getCardByName('Screen'),
    getCardByName('Move'),
    getCardByName('Rally'),
    getCardByName('Volley'),
    getCardByName('Charge'),
    getCardByName('Organize'),
  ];
  const filteredCards: CommandCard[] = cards.filter(
    (card) => card !== undefined,
  );
  return filteredCards;
};

const makeArmy = (id: string): Army => ({
  id,
  commandCards: makeArmyCards(),
  units: makeArmyUnits(),
});

export const whiteArmyUUID = '00000010-0000-1234-0000-000000000001';
export const blackArmyUUID = '00000020-0000-1234-0000-000000000002';

export const whiteTinyStarterArmy: Army = makeArmy(whiteArmyUUID);

export const blackTinyStarterArmy: Army = makeArmy(blackArmyUUID);
