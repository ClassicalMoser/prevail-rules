import type { Card } from '@entities';
import {
  alaeSocii,
  equites,
  libyanSpearmen,
  manipularLegion,
  punicCitizenSpearmen,
  velites,
} from './tempUnits';

/**
 * Sample command deck translated from the design sheet.
 * - First four cards keep legacy UUIDs and baseline mechanics so existing tests stay stable.
 * - “Skirmisher” → `javelin` trait. “Spear / Pike” → phalanx unit rows. “Manipular Alae” → {@link alaeSocii}.
 * - “0 Units” cards use `command.number: 1` (schema minimum) until commands support zero-sized orders.
 * - “RAMPAGE” has no trait id yet; encoded as open movement + command modifiers only.
 */
const manipularOrAlae = [manipularLegion.id, alaeSocii.id] as const;
const spearOrPike = [punicCitizenSpearmen.id, libyanSpearmen.id] as const;

const fourVelitesUnitSupport = {
  count: 4,
  supportType: 'unitType' as const,
  unitTypeId: velites.id,
};

const twoManipularSupport = {
  count: 2,
  supportType: 'unitType' as const,
  unitTypeId: manipularLegion.id,
};

export const tempCommandCards: readonly Card[] = [
  {
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
    id: '00000000-0000-4000-8000-000000000001',
    initiative: 1,
    modifiers: ['attack'],
    name: 'Strike',
    roundEffect: {
      modifiers: [{ type: 'attack', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 0, supportType: 'generic' },
    version: '1.0.0',
  },
  {
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
    id: '00000000-0000-4000-8000-000000000002',
    initiative: 2,
    modifiers: ['attack'],
    name: 'Evade',
    roundEffect: {
      modifiers: [],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 0, supportType: 'generic' },
    version: '1.0.0',
  },
  {
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
    id: '00000000-0000-4000-8000-000000000003',
    initiative: 3,
    modifiers: ['attack'],
    name: 'Volley',
    roundEffect: {
      modifiers: [],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 0, supportType: 'generic' },
    version: '1.0.0',
  },
  {
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
    id: '00000000-0000-4000-8000-000000000004',
    initiative: 4,
    modifiers: ['attack'],
    name: 'Charge',
    roundEffect: {
      modifiers: [],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 0, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000005',
    initiative: 1,
    modifiers: ['speed'],
    name: 'Move',
    roundEffect: {
      modifiers: [{ type: 'flexibility', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 3,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: twoManipularSupport,
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [
        { type: 'attack', value: 1 },
        { type: 'speed', value: -2 },
      ],
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['phalanx'],
        unitRestrictions: [],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000006',
    initiative: 1,
    modifiers: ['defense'],
    name: 'Brace',
    roundEffect: {
      modifiers: [{ type: 'attack', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 0,
        traitRestrictions: [],
        unitRestrictions: [...spearOrPike],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [{ type: 'attack', value: 1 }],
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['javelin'],
        unitRestrictions: [],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000007',
    initiative: 1,
    modifiers: ['defense'],
    name: 'Screen',
    roundEffect: {
      modifiers: [{ type: 'attack', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['javelin'],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [
        { type: 'attack', value: 1 },
        { type: 'defense', value: -1 },
      ],
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['formation'],
        unitRestrictions: [],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000008',
    initiative: 2,
    modifiers: ['attack'],
    name: 'Rampage',
    roundEffect: {
      modifiers: [{ type: 'defense', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['formation'],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000009',
    initiative: 2,
    modifiers: ['speed'],
    name: 'Organize',
    roundEffect: {
      modifiers: [{ type: 'speed', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 3,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
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
    id: '00000000-0000-4000-8000-00000000000a',
    initiative: 2,
    modifiers: ['speed'],
    name: 'Recede',
    roundEffect: {
      modifiers: [{ type: 'speed', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 4,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [{ type: 'attack', value: 1 }],
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['mounted'],
        unitRestrictions: [],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-00000000000b',
    initiative: 2,
    modifiers: ['attack'],
    name: 'Overrun',
    roundEffect: {
      modifiers: [{ type: 'defense', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['mounted'],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 2,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-00000000000c',
    initiative: 2,
    modifiers: ['flexibility'],
    name: 'Advance',
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
  },
  {
    command: {
      modifiers: [],
      number: 3,
      restrictions: {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-00000000000d',
    initiative: 2,
    modifiers: ['flexibility'],
    name: 'Coordinate',
    roundEffect: {
      modifiers: [{ type: 'defense', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [{ type: 'attack', value: 1 }],
      number: 2,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [equites.id],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-00000000000e',
    initiative: 2,
    modifiers: ['flexibility'],
    name: 'Noble Cavalry',
    roundEffect: {
      modifiers: [{ type: 'attack', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 0,
        traitRestrictions: [],
        unitRestrictions: [equites.id],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 6,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [velites.id],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-00000000000f',
    initiative: 3,
    modifiers: ['attack'],
    name: 'Fearless Velites',
    roundEffect: {
      modifiers: [{ type: 'attack', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [velites.id],
      },
    },
    unitSupport: fourVelitesUnitSupport,
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [...manipularOrAlae],
      },
      size: 'lines',
      type: 'rangedAttack',
    },
    id: '00000000-0000-4000-8000-000000000010',
    initiative: 3,
    modifiers: ['range'],
    name: 'Socketed Pilum',
    roundEffect: {
      modifiers: [{ type: 'range', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['formation'],
        unitRestrictions: [...manipularOrAlae],
      },
    },
    unitSupport: twoManipularSupport,
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 8,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [manipularLegion.id],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000011',
    initiative: 3,
    modifiers: ['flexibility'],
    name: 'Quincunx Formation',
    roundEffect: {
      modifiers: [],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [...manipularOrAlae],
      },
    },
    unitSupport: twoManipularSupport,
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 3,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [manipularLegion.id],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000012',
    initiative: 3,
    modifiers: ['flexibility'],
    name: 'Triplex Acies',
    roundEffect: {
      modifiers: [{ type: 'speed', value: -1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['formation'],
        unitRestrictions: [...manipularOrAlae],
      },
    },
    unitSupport: twoManipularSupport,
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 8,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [manipularLegion.id, alaeSocii.id],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000013',
    initiative: 3,
    modifiers: ['defense'],
    name: 'Down to the Triarii',
    roundEffect: {
      modifiers: [{ type: 'defense', value: 2 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [manipularLegion.id],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
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
    id: '00000000-0000-4000-8000-000000000014',
    initiative: 3,
    modifiers: ['speed'],
    name: 'Give Ground',
    roundEffect: {
      modifiers: [{ type: 'speed', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 3,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [{ type: 'flexibility', value: 1 }],
      number: 2,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000015',
    initiative: 3,
    modifiers: ['flexibility'],
    name: 'Coordinated Maneuver',
    roundEffect: {
      modifiers: [{ type: 'flexibility', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [
        { type: 'flexibility', value: 1 },
        { type: 'attack', value: 2 },
      ],
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000016',
    initiative: 3,
    modifiers: ['attack'],
    name: 'Chaotic Destruction',
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
  },
  {
    command: {
      modifiers: [
        { type: 'speed', value: -2 },
        { type: 'attack', value: 2 },
      ],
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['phalanx'],
        unitRestrictions: [],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000017',
    initiative: 4,
    modifiers: ['defense'],
    name: 'Brace for Impact',
    roundEffect: {
      modifiers: [{ type: 'defense', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['phalanx'],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['phalanx'],
        unitRestrictions: [],
      },
      size: 'units',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000018',
    initiative: 4,
    modifiers: ['defense'],
    name: 'Persistent Formation',
    roundEffect: {
      modifiers: [{ type: 'defense', value: 2 }],
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['phalanx'],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
  {
    command: {
      modifiers: [],
      number: 3,
      restrictions: {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'lines',
      type: 'movement',
    },
    id: '00000000-0000-4000-8000-000000000019',
    initiative: 4,
    modifiers: ['flexibility'],
    name: 'Combined Arms Tactics',
    roundEffect: {
      modifiers: [{ type: 'flexibility', value: 1 }],
      restrictions: {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    },
    unitSupport: { count: 1, supportType: 'generic' },
    version: '1.0.0',
  },
] as const satisfies readonly Card[];
