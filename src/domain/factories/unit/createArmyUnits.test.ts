import { getUnitByStatValue } from '@testing';
import { createArmyUnits } from './createArmyUnits';

/** Every unit an army brings, one instance per piece. */
describe('createArmyUnits function', () => {
  it('numbers each copy of a type from 1, type by type in the army’s order', () => {
    const first = getUnitByStatValue('attack', 2);
    const second = getUnitByStatValue('attack', 4);

    const pieces = createArmyUnits('black', [
      { count: 2, unitType: first },
      { count: 1, unitType: second },
    ]);

    expect(
      pieces.map((piece) => [piece.unitType.id, piece.instanceNumber]),
    ).toStrictEqual([
      [first.id, 1],
      [first.id, 2],
      [second.id, 1],
    ]);
  });

  it('fights every piece for the side named', () => {
    const pieces = createArmyUnits('white', [
      { count: 2, unitType: getUnitByStatValue('attack', 2) },
    ]);

    expect(pieces.map((piece) => piece.playerSide)).toStrictEqual([
      'white',
      'white',
    ]);
  });

  it('is empty for an army that brings no units', () => {
    expect(createArmyUnits('black', [])).toStrictEqual([]);
  });
});
