import type { Army, Card, UnitCount, UnitType } from '@entities';
import {
  equites,
  manipularLegion,
  tempCommandCards,
  velites,
} from '@sampleValues';

const makeCounts = (unitType: UnitType, count: number): UnitCount => {
  return {
    unitType,
    count,
  };
};

const makeArmyUnits = (): UnitCount[] => {
  return [
    makeCounts(velites, 4),
    makeCounts(equites, 2),
    makeCounts(manipularLegion, 6),
  ];
};

const getCardByName = (name: string) => {
  return tempCommandCards.find((card) => card.name === name);
};

const makeArmyCards = (): Card[] => {
  const cards: (Card | undefined)[] = [
    getCardByName('Strike'),
    getCardByName('Screen'),
    getCardByName('Move'),
    getCardByName('Rally'),
    getCardByName('Volley'),
    getCardByName('Charge'),
    getCardByName('Organize'),
  ];
  const filteredCards: Card[] = cards.filter((card) => card !== undefined);
  return filteredCards;
};

const makeArmy = (id: string): Army => {
  return {
    id,
    units: new Set(makeArmyUnits()),
    tempCommandCards: new Set(makeArmyCards()),
  };
};

export const whiteArmyUUID = '00000000-0000-1234-0000-000000000001';
export const blackArmyUUID = '00000000-0000-1234-0000-000000000002';

export const whiteTinyStarterArmy: Army = makeArmy(whiteArmyUUID);

export const blackTinyStarterArmy: Army = makeArmy(blackArmyUUID);
