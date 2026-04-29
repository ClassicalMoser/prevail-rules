import type { Card } from "@entities";
import {
  alaeSocii,
  equites,
  libyanSpearmen,
  manipularLegion,
  punicCitizenSpearmen,
  velites,
} from "./tempUnits";

/**
 * Sample command deck translated from the design sheet.
 * - First four cards keep legacy UUIDs and baseline mechanics so existing tests stay stable.
 * - “Skirmisher” → `javelin` trait. “Spear / Pike” → phalanx unit rows. “Manipular Alae” → {@link alaeSocii}.
 * - “0 Units” cards use `command.number: 1` (schema minimum) until commands support zero-sized orders.
 * - “RAMPAGE” has no trait id yet; encoded as open movement + command modifiers only.
 */
const manipularOrAlae = [manipularLegion.id, alaeSocii.id] as const;
const spearOrPike = [punicCitizenSpearmen.id, libyanSpearmen.id] as const;

export const tempCommandCards: readonly Card[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    version: "1.0.0",
    name: "Strike",
    initiative: 1,
    modifiers: [{ type: "attack", value: 1 }],
    command: {
      size: "units",
      type: "movement",
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
      modifiers: [{ type: "attack", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    version: "1.0.0",
    name: "Evade",
    initiative: 2,
    modifiers: [{ type: "attack", value: 1 }],
    command: {
      size: "units",
      type: "movement",
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
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    version: "1.0.0",
    name: "Volley",
    initiative: 3,
    modifiers: [{ type: "attack", value: 1 }],
    command: {
      size: "units",
      type: "movement",
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
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    version: "1.0.0",
    name: "Charge",
    initiative: 4,
    modifiers: [{ type: "attack", value: 1 }],
    command: {
      size: "units",
      type: "movement",
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
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    version: "1.0.0",
    name: "Move",
    initiative: 1,
    modifiers: [{ type: "speed", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
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
        inspirationRangeRestriction: 3,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [{ type: "flexibility", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    version: "1.0.0",
    name: "Brace",
    initiative: 1,
    modifiers: [{ type: "defense", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["phalanx"],
        unitRestrictions: [],
      },
      modifiers: [
        { type: "attack", value: 1 },
        { type: "speed", value: -2 },
      ],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 0,
        traitRestrictions: [],
        unitRestrictions: [...spearOrPike],
      },
      modifiers: [{ type: "attack", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    version: "1.0.0",
    name: "Screen",
    initiative: 1,
    modifiers: [{ type: "defense", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["javelin"],
        unitRestrictions: [],
      },
      modifiers: [{ type: "attack", value: 1 }],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["javelin"],
        unitRestrictions: [],
      },
      modifiers: [{ type: "attack", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    version: "1.0.0",
    name: "Rampage",
    initiative: 2,
    modifiers: [{ type: "attack", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["formation"],
        unitRestrictions: [],
      },
      modifiers: [
        { type: "attack", value: 1 },
        { type: "defense", value: -1 },
      ],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["formation"],
        unitRestrictions: [],
      },
      modifiers: [{ type: "defense", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000009",
    version: "1.0.0",
    name: "Organize",
    initiative: 2,
    modifiers: [{ type: "speed", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 3,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [{ type: "speed", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-00000000000a",
    version: "1.0.0",
    name: "Recede",
    initiative: 2,
    modifiers: [{ type: "speed", value: 1 }],
    command: {
      size: "units",
      type: "movement",
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
        inspirationRangeRestriction: 4,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [{ type: "speed", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-00000000000b",
    version: "1.0.0",
    name: "Overrun",
    initiative: 2,
    modifiers: [{ type: "attack", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["mounted"],
        unitRestrictions: [],
      },
      modifiers: [{ type: "attack", value: 1 }],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["mounted"],
        unitRestrictions: [],
      },
      modifiers: [{ type: "defense", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-00000000000c",
    version: "1.0.0",
    name: "Advance",
    initiative: 2,
    modifiers: [{ type: "flexibility", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
      number: 2,
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
      modifiers: [{ type: "attack", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-00000000000d",
    version: "1.0.0",
    name: "Coordinate",
    initiative: 2,
    modifiers: [{ type: "flexibility", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
      number: 3,
      restrictions: {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [{ type: "defense", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-00000000000e",
    version: "1.0.0",
    name: "Noble Cavalry",
    initiative: 2,
    modifiers: [{ type: "flexibility", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 2,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [equites.id],
      },
      modifiers: [{ type: "attack", value: 1 }],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 0,
        traitRestrictions: [],
        unitRestrictions: [equites.id],
      },
      modifiers: [{ type: "attack", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-00000000000f",
    version: "1.0.0",
    name: "Fearless Velites",
    initiative: 3,
    modifiers: [{ type: "attack", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 6,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [velites.id],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [velites.id],
      },
      modifiers: [{ type: "attack", value: 1 }],
    },
    unitPreservation: [velites.id, velites.id, velites.id, velites.id],
  },
  {
    id: "00000000-0000-4000-8000-000000000010",
    version: "1.0.0",
    name: "Socketed Pilum",
    initiative: 3,
    modifiers: [{ type: "range", value: 1 }],
    command: {
      size: "lines",
      type: "rangedAttack",
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [...manipularOrAlae],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["formation"],
        unitRestrictions: [...manipularOrAlae],
      },
      modifiers: [{ type: "range", value: 1 }],
    },
    unitPreservation: [...manipularOrAlae, ...manipularOrAlae],
  },
  {
    id: "00000000-0000-4000-8000-000000000011",
    version: "1.0.0",
    name: "Quincunx Formation",
    initiative: 3,
    modifiers: [{ type: "flexibility", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 8,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [manipularLegion.id],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [...manipularOrAlae],
      },
      modifiers: [],
    },
    unitPreservation: [...manipularOrAlae, ...manipularOrAlae],
  },
  {
    id: "00000000-0000-4000-8000-000000000012",
    version: "1.0.0",
    name: "Triplex Acies",
    initiative: 3,
    modifiers: [{ type: "flexibility", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
      number: 3,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [manipularLegion.id],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["formation"],
        unitRestrictions: [...manipularOrAlae],
      },
      modifiers: [{ type: "speed", value: -1 }],
    },
    unitPreservation: [...manipularOrAlae, ...manipularOrAlae],
  },
  {
    id: "00000000-0000-4000-8000-000000000013",
    version: "1.0.0",
    name: "Down to the Triarii",
    initiative: 3,
    modifiers: [{ type: "defense", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 8,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [manipularLegion.id, alaeSocii.id],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [manipularLegion.id],
      },
      modifiers: [{ type: "defense", value: 2 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000014",
    version: "1.0.0",
    name: "Give Ground",
    initiative: 3,
    modifiers: [{ type: "speed", value: 1 }],
    command: {
      size: "units",
      type: "movement",
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
        inspirationRangeRestriction: 3,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [{ type: "speed", value: 1 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000015",
    version: "1.0.0",
    name: "Coordinated Maneuver",
    initiative: 3,
    modifiers: [{ type: "flexibility", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
      number: 2,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [{ type: "flexibility", value: 1 }],
    },
    roundEffect: undefined,
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000016",
    version: "1.0.0",
    name: "Chaotic Destruction",
    initiative: 3,
    modifiers: [{ type: "attack", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [
        { type: "flexibility", value: 1 },
        { type: "attack", value: 2 },
      ],
    },
    roundEffect: undefined,
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000017",
    version: "1.0.0",
    name: "Brace for Impact",
    initiative: 4,
    modifiers: [{ type: "defense", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["phalanx"],
        unitRestrictions: [],
      },
      modifiers: [
        { type: "speed", value: -2 },
        { type: "attack", value: 2 },
      ],
    },
    roundEffect: undefined,
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000018",
    version: "1.0.0",
    name: "Persistent Formation",
    initiative: 4,
    modifiers: [{ type: "defense", value: 1 }],
    command: {
      size: "units",
      type: "movement",
      number: 4,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["phalanx"],
        unitRestrictions: [],
      },
      modifiers: [],
    },
    roundEffect: {
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["phalanx"],
        unitRestrictions: [],
      },
      modifiers: [{ type: "defense", value: 2 }],
    },
    unitPreservation: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000019",
    version: "1.0.0",
    name: "Combined Arms Tactics",
    initiative: 4,
    modifiers: [{ type: "flexibility", value: 1 }],
    command: {
      size: "lines",
      type: "movement",
      number: 3,
      restrictions: {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      modifiers: [],
    },
    roundEffect: undefined,
    unitPreservation: [],
  },
] as const satisfies readonly Card[];
