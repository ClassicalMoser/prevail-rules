import type { Army } from './army';
import type { CommandCard } from '@entities/card';
import type { UnitType } from '@entities/unit';
import { armyCompositionByMode } from './armyComposition';
import { armySchema, armySchemaForMode } from './army';

const baseUnitType = (overrides: Partial<UnitType> = {}): UnitType => ({
  cost: 10,
  id: '11111111-1111-4111-8111-111111111111',
  imageUrl: null,
  limit: 8,
  morale: 1,
  name: 'Test Unit',
  stats: {
    attack: 1,
    flexibility: 1,
    range: 0,
    retreat: 1,
    reverse: 0,
    rout: 1,
    speed: 1,
  },
  traits: ['formation'],
  version: '1.0.0',
  ...overrides,
});

const baseCard = (initiative: 1 | 2 | 3 | 4, index: number): CommandCard => ({
  command: {
    modifiers: [],
    number: 1,
    restrictions: {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
    size: 'units',
    type: 'movement',
  },
  id: `22222222-2222-4222-8222-2222222222${String(index).padStart(2, '0')}`,
  initiative,
  modifiers: ['attack'],
  name: `Card ${initiative}-${index}`,
  roundEffect: {
    modifiers: [{ type: 'attack', value: 1 }],
    restrictions: {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
  },
  unitSupport: { count: 1, supportType: 'generic' },
  version: '1.0.0',
});

const balancedCommandCards = (): CommandCard[] =>
  ([1, 2, 3, 4] as const).flatMap((initiative) =>
    [0, 1, 2].map((copy) => baseCard(initiative, initiative * 10 + copy)),
  );

const validStandardArmy = (): Army => ({
  commandCards: balancedCommandCards(),
  id: '33333333-3333-4333-8333-333333333333',
  units: [
    {
      count: 4,
      unitType: baseUnitType({ cost: 20, morale: 2 }),
    },
    {
      count: 4,
      unitType: baseUnitType({
        cost: 15,
        id: '44444444-4444-4444-8444-444444444444',
        morale: 1,
      }),
    },
  ],
});

describe('schema: armySchema', () => {
  it('accepts shape without enforcing mode composition', () => {
    const army: Army = {
      commandCards: [],
      id: '33333333-3333-4333-8333-333333333333',
      units: [],
    };

    expect(armySchema.parse(army)).toEqual(army);
  });

  it('rejects count above unit type limit', () => {
    const army: Army = {
      commandCards: [],
      id: '33333333-3333-4333-8333-333333333333',
      units: [{ count: 5, unitType: baseUnitType({ limit: 4 }) }],
    };

    expect(armySchema.safeParse(army).success).toBe(false);
  });

  it('rejects duplicate unit types', () => {
    const army = validStandardArmy();
    const unitType = baseUnitType({ cost: 10, morale: 2 });
    army.units = [
      { count: 1, unitType },
      { count: 2, unitType },
    ];

    expect(armySchema.safeParse(army).success).toBe(false);
  });

  it('rejects duplicate command cards', () => {
    const army = validStandardArmy();
    const card = baseCard(1, 1);
    army.commandCards = [card, { ...card }];

    expect(armySchema.safeParse(army).success).toBe(false);
  });
});

describe('schema: armySchemaForMode', () => {
  it('standard accepts a legal composition', () => {
    expect(armySchemaForMode('standard').parse(validStandardArmy())).toEqual(
      validStandardArmy(),
    );
  });

  it('standard rejects over-cost armies', () => {
    const army = validStandardArmy();
    army.units = [
      {
        count: 8,
        unitType: baseUnitType({ cost: 30, morale: 2 }),
      },
    ];

    const result = armySchemaForMode('standard').safeParse(army);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.path[0] === 'units' &&
            issue.message.includes('Standard armies'),
        ),
      ).toBe(true);
    }
  });

  it('standard rejects under-morale armies', () => {
    const army = validStandardArmy();
    army.units = [
      {
        count: 1,
        unitType: baseUnitType({ cost: 10, morale: 0 }),
      },
    ];

    expect(armySchemaForMode('standard').safeParse(army).success).toBe(false);
  });

  it('standard rejects unbalanced initiatives', () => {
    const army = validStandardArmy();
    army.commandCards = army.commandCards.map((card, index) =>
      index === 0 ? { ...card, initiative: 2 } : card,
    );

    expect(armySchemaForMode('standard').safeParse(army).success).toBe(false);
  });

  it('mini rejects more distinct unit types than maxUnitTypeCount', () => {
    const army = validStandardArmy();
    army.units = [1, 2, 3, 4, 5].map((n) => ({
      count: 1,
      unitType: baseUnitType({
        cost: 10,
        id: `11111111-1111-4111-8111-11111111111${n}`,
        morale: 2,
      }),
    }));

    expect(armyCompositionByMode.mini.maxUnitTypeCount).toBe(4);
    expect(armySchemaForMode('mini').safeParse(army).success).toBe(false);
  });

  it('tutorial skips cost, morale, and card composition checks', () => {
    const army: Army = {
      commandCards: [baseCard(1, 1)],
      id: '33333333-3333-4333-8333-333333333333',
      units: [{ count: 1, unitType: baseUnitType({ cost: 100, morale: 0 }) }],
    };

    expect(armySchemaForMode('tutorial').parse(army)).toEqual(army);
  });
});
