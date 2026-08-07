/** The minimum combined flexibility value required for friendly
 * units to pass through each other while unengaged. */
export const MIN_FLEXIBILITY_THRESHOLD = 4 as const;

/** The maximum distance a commander can move in a single move. */
export const COMMANDER_MOVE_DISTANCE = 4 as const;

/** The maximum number of units that can be included in a line. */
export const MAX_LINE_LENGTH = 8 as const;

/** Legal initiative values for command cards. */
export const MIN_INITIATIVE_VALUE = 1 as const;
export const MAX_INITIATIVE_VALUE = 4 as const;

function constructLegalInitiatives(): readonly number[] {
  const initiatives: number[] = [];
  for (let i = MIN_INITIATIVE_VALUE; i <= MAX_INITIATIVE_VALUE; i++) {
    initiatives.push(i);
  }
  return initiatives;
}

/** The maximum number of a given unit type that can be included in an army. */
export const MAX_ARMY_UNIT_PER_TYPE_COUNT = 8 as const;

/** Legal initiative values for command cards. */
export const LEGAL_INITIATIVES: readonly number[] = constructLegalInitiatives();

// For Standard mode
/** The number of cards of each initiative value that must be included in an army. */
export const STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT = 3 as const;

/** The maximum number of a given unit type that can be included in a standard  army. */
export const STANDARD_MAX_ARMY_UNIT_TYPE_COUNT = 8 as const;

/** The maximum total unit cost permitted in a standard army. */
export const STANDARD_MAX_ARMY_UNIT_COST = 200 as const;

/** The minimum total morale value permitted in a standard army. */
export const STANDARD_MIN_ARMY_MORALE_VALUE = 12 as const;

// For Mini mode
/** The number of cards of each initiative value that must be included in an army. */
export const MINI_ARMY_CARDS_PER_INITIATIVE_COUNT = 2 as const;

/** The maximum number of a given unit type that can be included in a mini army. */
export const MINI_MAX_ARMY_UNIT_TYPE_COUNT = 4 as const;

/** The maximum total unit cost permitted in a mini army. */
export const MINI_MAX_ARMY_UNIT_COST = 100 as const;

/** The minimum total morale value permitted in a mini army. */
export const MINI_MIN_ARMY_MORALE_VALUE = 8 as const;

// For Epic mode
/** The number of cards of each initiative value that must be included in an army. */
export const EPIC_ARMY_CARDS_PER_INITIATIVE_COUNT = 4 as const;

/** The maximum number of a given unit type that can be included in an epic army. */
export const EPIC_MAX_ARMY_UNIT_TYPE_COUNT = 12 as const;

/** The maximum total unit cost permitted in an epic army. */
export const EPIC_MAX_ARMY_UNIT_COST = 300 as const;

/** The minimum total morale value permitted in an epic army. */
export const EPIC_MIN_ARMY_MORALE_VALUE = 16 as const;
