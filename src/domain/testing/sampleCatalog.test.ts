import { commandCardSchema, unitTypeSchema } from '@entities';
import { armySchemaForMode } from '@legality';
import {
  blackMiniStarterArmy,
  tempCommandCards,
  tempUnits,
  whiteMiniStarterArmy,
} from '@sampleValues';

describe('tempUnits catalog', () => {
  it('every sample unit satisfies the unit type schema', () => {
    // Shape and trait membership must hold for every sheet row.
    for (const unit of tempUnits) {
      expect(unitTypeSchema.safeParse(unit).success).toBe(true);
    }
  });
});

describe('tempCommandCards catalog', () => {
  it('every sample card satisfies the command card schema', () => {
    // Shape and restriction membership must hold for every sheet row.
    for (const card of tempCommandCards) {
      expect(commandCardSchema.safeParse(card).success).toBe(true);
    }
  });
});

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
