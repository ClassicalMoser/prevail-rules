import { armySchemaForMode } from '@legality';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from './miniStarterArmy';

describe('mini starter armies', () => {
  it('each side may bring its starter army to a mini game', () => {
    // Every mini limit holds: cost, morale, unit types, and card balance.
    expect(
      armySchemaForMode('mini').safeParse(whiteMiniStarterArmy).error,
    ).toBeUndefined();
    expect(
      armySchemaForMode('mini').safeParse(blackMiniStarterArmy).error,
    ).toBeUndefined();
  });

  it('the two sides bring different armies', () => {
    // Each side needs its own army id when both sit in one game.
    expect(whiteMiniStarterArmy.id).not.toBe(blackMiniStarterArmy.id);
  });
});
