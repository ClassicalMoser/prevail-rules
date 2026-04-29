import type { UnitType } from "@entities";

/**
 * Punic War roster. Stats match the design sheet; `stats.rout` is the "Remove" column.
 * Dashes in Reverse/Range are stored as 0.
 *
 * Traits use prevail-rules `Trait` ids: Missile → javelin; Elephant → mounted
 * (until rules add dedicated traits).
 * Each `id` is a stable UUID (not derived from the display name).
 */
export const velites: UnitType = {
  id: "92a23063-1ebc-45c7-84e9-adec4bb1ffb4",
  name: "Velites",
  traits: ["javelin"],
  stats: {
    attack: 2,
    range: 2,
    speed: 3,
    flexibility: 3,
    reverse: 0,
    retreat: 1,
    rout: 3,
  },
  cost: 10,
  limit: 8,
  routPenalty: 0,
};

export const manipularLegion: UnitType = {
  id: "6bb57a16-946b-4c79-b551-eb0480041c3f",
  name: "Manipular Legion",
  traits: ["formation"],
  stats: {
    attack: 4,
    range: 0,
    speed: 2,
    flexibility: 2,
    reverse: 6,
    retreat: 5,
    rout: 8,
  },
  cost: 22,
  limit: 8,
  routPenalty: 2,
};

export const alaeSocii: UnitType = {
  id: "a75545cf-8487-460d-bd4f-207fcb7c3269",
  name: "Alae Socii",
  traits: ["formation"],
  stats: {
    attack: 4,
    range: 0,
    speed: 2,
    flexibility: 2,
    reverse: 6,
    retreat: 5,
    rout: 7,
  },
  cost: 20,
  limit: 8,
  routPenalty: 1,
};

export const equites: UnitType = {
  id: "a88ea489-c6f8-445f-b737-9a0e8dae1cdd",
  name: "Equites",
  traits: ["mounted"],
  stats: {
    attack: 4,
    range: 0,
    speed: 4,
    flexibility: 2,
    reverse: 5,
    retreat: 3,
    rout: 7,
  },
  cost: 26,
  limit: 4,
  routPenalty: 2,
};

export const numidianSkirmishers: UnitType = {
  id: "01d30d13-e881-4979-9679-d2da6c83af8e",
  name: "Numidian Skirmishers",
  traits: ["javelin"],
  stats: {
    attack: 2,
    range: 2,
    speed: 3,
    flexibility: 3,
    reverse: 0,
    retreat: 1,
    rout: 3,
  },
  cost: 10,
  limit: 8,
  routPenalty: 0,
};

export const numidianCavalry: UnitType = {
  id: "e76f376c-9b1b-4e35-a52b-202fbd7dca51",
  name: "Numidian Cavalry",
  traits: ["mounted", "javelin"],
  stats: {
    attack: 2,
    range: 1,
    speed: 5,
    flexibility: 3,
    reverse: 0,
    retreat: 2,
    rout: 4,
  },
  cost: 24,
  limit: 4,
  routPenalty: 0,
};

export const punicCitizenCavalry: UnitType = {
  id: "8b2e4ffb-d338-4f81-a894-2ef806976f06",
  name: "Punic Citizen Cavalry",
  traits: ["mounted"],
  stats: {
    attack: 4,
    range: 0,
    speed: 4,
    flexibility: 2,
    reverse: 5,
    retreat: 3,
    rout: 7,
  },
  cost: 25,
  limit: 4,
  routPenalty: 2,
};

export const punicCitizenSpearmen: UnitType = {
  id: "1c8a25b0-d326-4e0f-b65f-6df338cf3e5f",
  name: "Punic Citizen Spearmen",
  traits: ["formation", "phalanx"],
  stats: {
    attack: 3,
    range: 0,
    speed: 2,
    flexibility: 1,
    reverse: 7,
    retreat: 6,
    rout: 8,
  },
  cost: 21,
  limit: 8,
  routPenalty: 2,
};

export const libyanSpearmen: UnitType = {
  id: "35650b53-3dd1-4983-a206-d3d409ba44fc",
  name: "Libyan Spearmen",
  traits: ["formation", "phalanx"],
  stats: {
    attack: 4,
    range: 0,
    speed: 2,
    flexibility: 1,
    reverse: 7,
    retreat: 6,
    rout: 8,
  },
  cost: 20,
  limit: 8,
  routPenalty: 1,
};

export const africanVeterans: UnitType = {
  id: "a66d22ea-6111-42a6-a7f1-215574cf5b51",
  name: "African Veterans",
  traits: ["formation"],
  stats: {
    attack: 4,
    range: 0,
    speed: 2,
    flexibility: 2,
    reverse: 6,
    retreat: 5,
    rout: 8,
  },
  cost: 28,
  limit: 4,
  routPenalty: 2,
};

export const africanElephants: UnitType = {
  id: "9faf0f5f-fd46-46ab-8d97-a2307168255e",
  name: "African Elephants",
  traits: ["mounted"],
  stats: {
    attack: 6,
    range: 0,
    speed: 3,
    flexibility: 0,
    reverse: 3,
    retreat: 3,
    rout: 7,
  },
  cost: 45,
  limit: 2,
  routPenalty: 2,
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
