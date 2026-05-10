import type { UnitType } from '@entities';

/**
 * Punic War roster. Stats match the design sheet; `stats.rout` is the "Remove" column.
 * Dashes in Reverse/Range are stored as 0.
 *
 * Traits use prevail-rules `Trait` ids: Missile → javelin; Elephant → mounted
 * (until rules add dedicated traits).
 * Each `id` is a stable UUID (not derived from the display name).
 */
export const velites: UnitType = {
  cost: 10,
  id: '92a23063-1ebc-45c7-84e9-adec4bb1ffb4',
  limit: 8,
  name: 'Velites',
  routPenalty: 0,
  stats: {
    attack: 2,
    flexibility: 3,
    range: 2,
    retreat: 1,
    reverse: 0,
    rout: 3,
    speed: 3,
  },
  traits: ['javelin'],
};

export const manipularLegion: UnitType = {
  cost: 22,
  id: '6bb57a16-946b-4c79-b551-eb0480041c3f',
  limit: 8,
  name: 'Manipular Legion',
  routPenalty: 2,
  stats: {
    attack: 4,
    flexibility: 2,
    range: 0,
    retreat: 5,
    reverse: 6,
    rout: 8,
    speed: 2,
  },
  traits: ['formation'],
};

export const alaeSocii: UnitType = {
  cost: 20,
  id: 'a75545cf-8487-460d-bd4f-207fcb7c3269',
  limit: 8,
  name: 'Alae Socii',
  routPenalty: 1,
  stats: {
    attack: 4,
    flexibility: 2,
    range: 0,
    retreat: 5,
    reverse: 6,
    rout: 7,
    speed: 2,
  },
  traits: ['formation'],
};

export const equites: UnitType = {
  cost: 26,
  id: 'a88ea489-c6f8-445f-b737-9a0e8dae1cdd',
  limit: 4,
  name: 'Equites',
  routPenalty: 2,
  stats: {
    attack: 4,
    flexibility: 2,
    range: 0,
    retreat: 3,
    reverse: 5,
    rout: 7,
    speed: 4,
  },
  traits: ['mounted'],
};

export const numidianSkirmishers: UnitType = {
  cost: 10,
  id: '01d30d13-e881-4979-9679-d2da6c83af8e',
  limit: 8,
  name: 'Numidian Skirmishers',
  routPenalty: 0,
  stats: {
    attack: 2,
    flexibility: 3,
    range: 2,
    retreat: 1,
    reverse: 0,
    rout: 3,
    speed: 3,
  },
  traits: ['javelin'],
};

export const numidianCavalry: UnitType = {
  cost: 24,
  id: 'e76f376c-9b1b-4e35-a52b-202fbd7dca51',
  limit: 4,
  name: 'Numidian Cavalry',
  routPenalty: 0,
  stats: {
    attack: 2,
    flexibility: 3,
    range: 1,
    retreat: 2,
    reverse: 0,
    rout: 4,
    speed: 5,
  },
  traits: ['mounted', 'javelin'],
};

export const punicCitizenCavalry: UnitType = {
  cost: 25,
  id: '8b2e4ffb-d338-4f81-a894-2ef806976f06',
  limit: 4,
  name: 'Punic Citizen Cavalry',
  routPenalty: 2,
  stats: {
    attack: 4,
    flexibility: 2,
    range: 0,
    retreat: 3,
    reverse: 5,
    rout: 7,
    speed: 4,
  },
  traits: ['mounted'],
};

export const punicCitizenSpearmen: UnitType = {
  cost: 21,
  id: '1c8a25b0-d326-4e0f-b65f-6df338cf3e5f',
  limit: 8,
  name: 'Punic Citizen Spearmen',
  routPenalty: 2,
  stats: {
    attack: 3,
    flexibility: 1,
    range: 0,
    retreat: 6,
    reverse: 7,
    rout: 8,
    speed: 2,
  },
  traits: ['formation', 'phalanx'],
};

export const libyanSpearmen: UnitType = {
  cost: 20,
  id: '35650b53-3dd1-4983-a206-d3d409ba44fc',
  limit: 8,
  name: 'Libyan Spearmen',
  routPenalty: 1,
  stats: {
    attack: 4,
    flexibility: 1,
    range: 0,
    retreat: 6,
    reverse: 7,
    rout: 8,
    speed: 2,
  },
  traits: ['formation', 'phalanx'],
};

export const africanVeterans: UnitType = {
  cost: 28,
  id: 'a66d22ea-6111-42a6-a7f1-215574cf5b51',
  limit: 4,
  name: 'African Veterans',
  routPenalty: 2,
  stats: {
    attack: 4,
    flexibility: 2,
    range: 0,
    retreat: 5,
    reverse: 6,
    rout: 8,
    speed: 2,
  },
  traits: ['formation'],
};

export const africanElephants: UnitType = {
  cost: 45,
  id: '9faf0f5f-fd46-46ab-8d97-a2307168255e',
  limit: 2,
  name: 'African Elephants',
  routPenalty: 2,
  stats: {
    attack: 6,
    flexibility: 0,
    range: 0,
    retreat: 3,
    reverse: 3,
    rout: 7,
    speed: 3,
  },
  traits: ['mounted'],
};

/** All defined unit types in sheet order. */
export const tempUnits: readonly UnitType[] = [
  velites,
  manipularLegion,
  alaeSocii,
  equites,
  numidianSkirmishers,
  numidianCavalry,
  punicCitizenCavalry,
  punicCitizenSpearmen,
  libyanSpearmen,
  africanVeterans,
  africanElephants,
];
