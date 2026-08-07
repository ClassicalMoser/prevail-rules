/** The minimum combined flexibility value required for friendly
 * units to pass through each other while unengaged. */
export const MIN_FLEXIBILITY_THRESHOLD = 4 as const;

/** The maximum distance a commander can move in a single move. */
export const COMMANDER_MOVE_DISTANCE = 4 as const;

/** The maximum number of units that can be included in a line. */
export const MAX_LINE_LENGTH = 8 as const;

/** The maximum number of a given unit type that can be included in an army. */
export const MAX_ARMY_UNIT_TYPE_COUNT = 8 as const;

/** The maximum total unit cost permitted in an army. */
export const MAX_ARMY_UNIT_COST = 200 as const;

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

/** Legal initiative values for command cards. */
export const LEGAL_INITIATIVES: readonly number[] = constructLegalInitiatives();

/** The minimum total morale value permitted in an army. */
export const MIN_ARMY_MORALE_VALUE = 12 as const;
