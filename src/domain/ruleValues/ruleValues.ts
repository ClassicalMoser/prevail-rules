/** The minimum combined flexibility value required for friendly
 * units to pass through each other while unengaged.
 * Two stiff formations cannot interpenetrate; nimble troops can filter
 * through (§5.4.2). */
export const MIN_FLEXIBILITY_THRESHOLD = 6 as const;

/** The maximum distance a commander can move in a single move.
 * Diagonal steps count as one (§4.2.2). */
export const COMMANDER_MOVE_DISTANCE = 4 as const;

/**
 * The inspiration range of a card whose range is not applicable: it reaches
 * every unit, wherever the commander stands (§4.2.7). A printed range of 0 is
 * the commander's own space, so "no restriction" cannot be a number a range
 * could be; it is the one value below zero.
 */
export const NO_INSPIRATION_RANGE = -1 as const;

/** The maximum number of units that can be included in a line.
 * One line order can move up to eight units dressed in a rank, so
 * formation is how much an army gets done in a round (§4.3.5). */
export const MAX_LINE_LENGTH = 8 as const;

// Legal initiative values for command cards.

/** The lowest initiative a card may carry. Low goes first (§4.1.3), so
 * this is the fastest card. */
export const MIN_INITIATIVE_VALUE = 1 as const;

/** The highest initiative a card may carry. Low goes first (§4.1.3), so
 * this is the slowest card. */
export const MAX_INITIATIVE_VALUE = 4 as const;

/** Every initiative value from the lowest to the highest, each of which an
 * army must hold the same number of cards at (§3.1.7). */
function constructLegalInitiatives(): readonly number[] {
  // Every integer from the minimum initiative through the maximum is legal.
  const initiatives: number[] = [];
  for (let i = MIN_INITIATIVE_VALUE; i <= MAX_INITIATIVE_VALUE; i++) {
    initiatives.push(i);
  }
  return initiatives;
}

/** Legal initiative values for command cards. */
export const LEGAL_INITIATIVES: readonly number[] = constructLegalInitiatives();

/** The maximum number of a given unit type that can be included in an army.
 * Each unit type prints its own limit, which is never more than this
 * (§3.1.4). */
export const MAX_ARMY_UNIT_PER_TYPE_COUNT = 12 as const;

// Each mode's army limits (§3.1.3). The cost cap counts units and cards
// alike. The Morale floor keeps an army from being cheap troops that cost
// nothing when they die (§3.1.6), and an equal count of cards at every
// initiative keeps it from always going first (§3.1.7).

// For Standard mode
/** The number of cards of each initiative value that must be included in an army. */
export const STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT = 3 as const;

/** The maximum number of different unit types that can be included in a standard army. */
export const STANDARD_MAX_ARMY_UNIT_TYPE_COUNT = 8 as const;

/** The maximum combined unit and command-card cost permitted in a standard army. */
export const STANDARD_MAX_ARMY_COST = 300 as const;

/** The minimum total morale value permitted in a standard army. */
export const STANDARD_MIN_ARMY_MORALE_VALUE = 20 as const;

// For Mini mode
/** The number of cards of each initiative value that must be included in an army. */
export const MINI_ARMY_CARDS_PER_INITIATIVE_COUNT = 2 as const;

/** The maximum number of different unit types that can be included in a mini army. */
export const MINI_MAX_ARMY_UNIT_TYPE_COUNT = 4 as const;

/** The maximum combined unit and command-card cost permitted in a mini army. */
export const MINI_MAX_ARMY_COST = 200 as const;

/** The minimum total morale value permitted in a mini army. */
export const MINI_MIN_ARMY_MORALE_VALUE = 10 as const;

// For Epic mode
/** The number of cards of each initiative value that must be included in an army. */
export const EPIC_ARMY_CARDS_PER_INITIATIVE_COUNT = 4 as const;

/** The maximum number of different unit types that can be included in an epic army. */
export const EPIC_MAX_ARMY_UNIT_TYPE_COUNT = 12 as const;

/** The maximum combined unit and command-card cost permitted in an epic army. */
export const EPIC_MAX_ARMY_COST = 500 as const;

/** The minimum total morale value permitted in an epic army. */
export const EPIC_MIN_ARMY_MORALE_VALUE = 30 as const;
