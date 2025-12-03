import type { Card } from '@entities';

export const commandCards: readonly Card[] = [
  {
    id: 'card-1',
    version: '1.0.0',
    name: 'Command Card 1',
    initiative: 1,
    modifiers: [
      {
        type: 'attack',
        value: 1,
      },
    ],
    command: {
      size: 'units',
      type: 'movement',
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [
        {
          type: 'attack',
          value: 1,
        },
      ],
    },
  },
  {
    id: '2',
    name: 'Command Card 2',
    version: '1.0.0',
    initiative: 2,
    modifiers: [
      {
        type: 'attack',
        value: 1,
      },
    ],
    command: {
      size: 'units',
      type: 'movement',
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
  },
  {
    id: '3',
    name: 'Command Card 3',
    version: '1.0.0',
    initiative: 3,
    modifiers: [
      {
        type: 'attack',
        value: 1,
      },
    ],
    command: {
      size: 'units',
      type: 'movement',
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
  },
  {
    id: '4',
    name: 'Command Card 4',
    version: '1.0.0',
    initiative: 4,
    modifiers: [
      {
        type: 'attack',
        value: 1,
      },
    ],
    command: {
      size: 'units',
      type: 'movement',
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
  },
];
