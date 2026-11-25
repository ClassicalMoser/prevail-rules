import type { GameModeName } from '@ruleValues';
import {
  LEGAL_INITIATIVES,
  STANDARD_MAX_ARMY_COST,
  STANDARD_MIN_ARMY_MORALE_VALUE,
  STANDARD_MAX_ARMY_UNIT_TYPE_COUNT,
  MINI_MAX_ARMY_UNIT_TYPE_COUNT,
  MINI_MAX_ARMY_COST,
  MINI_MIN_ARMY_MORALE_VALUE,
  EPIC_MAX_ARMY_UNIT_TYPE_COUNT,
  EPIC_MAX_ARMY_COST,
  EPIC_MIN_ARMY_MORALE_VALUE,
  EPIC_ARMY_CARDS_PER_INITIATIVE_COUNT,
  STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT,
  MINI_ARMY_CARDS_PER_INITIATIVE_COUNT,
} from '@ruleValues';

/**
 * Mode-specific army list-building limits.
 * `null` means the check is skipped (tutorial / arbitrary lists).
 */
export interface ArmyCompositionRules {
  /** Maximum combined unit and command-card cost, or null to skip. */
  maxArmyCost: number | null;
  /** Minimum total morale value, or null to skip. */
  minMoraleValue: number | null;
  /** Required cards per initiative value, or null to skip balance. */
  cardsPerInitiative: number | null;
  /** Maximum number of different unit types in the army. */
  maxUnitTypeCount: number;
}

/**
 * Army composition catalog keyed by game mode.
 *
 * TODO(composition): DESIGN.md puts a table a fact states in `@entities`,
 * `@game` or `@ruleValues` (as `boardSizeByGameMode` is), while
 * `entities/README.md` names army mode limits as `@legality`'s. This table is
 * the Mode limits of RULEBOOK §3.1.3 read row by row; settle which layer owns
 * it, and whether the board row of that table should sit beside it.
 */
export const armyCompositionByMode: Record<GameModeName, ArmyCompositionRules> =
  {
    // A first game is for learning the rules, not for building to a budget:
    // no cost cap, no Morale floor and no initiative spread, only the four
    // unit types Mini allows (§3.1.3).
    tutorial: {
      maxArmyCost: null,
      minMoraleValue: null,
      cardsPerInitiative: null,
      maxUnitTypeCount: MINI_MAX_ARMY_UNIT_TYPE_COUNT,
    },
    // Mini: 200 points, 10 Morale, two cards at each initiative, four types.
    mini: {
      maxArmyCost: MINI_MAX_ARMY_COST,
      minMoraleValue: MINI_MIN_ARMY_MORALE_VALUE,
      cardsPerInitiative: MINI_ARMY_CARDS_PER_INITIATIVE_COUNT,
      maxUnitTypeCount: MINI_MAX_ARMY_UNIT_TYPE_COUNT,
    },
    // Standard: 300 points, 20 Morale, three cards at each initiative, eight
    // types.
    standard: {
      maxArmyCost: STANDARD_MAX_ARMY_COST,
      minMoraleValue: STANDARD_MIN_ARMY_MORALE_VALUE,
      cardsPerInitiative: STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT,
      maxUnitTypeCount: STANDARD_MAX_ARMY_UNIT_TYPE_COUNT,
    },
    // Epic: 500 points, 30 Morale, four cards at each initiative, twelve
    // types.
    epic: {
      maxArmyCost: EPIC_MAX_ARMY_COST,
      minMoraleValue: EPIC_MIN_ARMY_MORALE_VALUE,
      cardsPerInitiative: EPIC_ARMY_CARDS_PER_INITIATIVE_COUNT,
      maxUnitTypeCount: EPIC_MAX_ARMY_UNIT_TYPE_COUNT,
    },
  };

/**
 * Initiative values used when enforcing cards-per-initiative balance.
 *
 * TODO(composition): this is `LEGAL_INITIATIVES` under a second name, which
 * DESIGN.md's "a value is declared once" rules out. Its one reader,
 * `getArmyCompositionStatus`, could read `LEGAL_INITIATIVES` itself; settle
 * whether the name is kept as public API for a list builder.
 */
export const armyCompositionInitiatives: readonly number[] = LEGAL_INITIATIVES;
