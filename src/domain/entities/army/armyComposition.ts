import type { GameModeName } from '@entities/gameModes';
import {
  LEGAL_INITIATIVES,
  STANDARD_MAX_ARMY_UNIT_COST,
  STANDARD_MIN_ARMY_MORALE_VALUE,
  STANDARD_MAX_ARMY_UNIT_TYPE_COUNT,
  STANDARD_MIN_ARMY_PER_INITIATIVE_COUNT,
  MINI_MAX_ARMY_UNIT_TYPE_COUNT,
  MINI_MAX_ARMY_UNIT_COST,
  MINI_MIN_ARMY_MORALE_VALUE,
  MINI_MIN_ARMY_PER_INITIATIVE_COUNT,
  EPIC_MAX_ARMY_UNIT_TYPE_COUNT,
  EPIC_MAX_ARMY_UNIT_COST,
  EPIC_MIN_ARMY_MORALE_VALUE,
  EPIC_MIN_ARMY_PER_INITIATIVE_COUNT,
} from '@ruleValues';

/**
 * Mode-specific army list-building limits.
 * `null` means the check is skipped (tutorial / arbitrary lists).
 */
export interface ArmyCompositionRules {
  /** Maximum total unit cost, or null to skip. */
  maxUnitCost: number | null;
  /** Minimum total morale value, or null to skip. */
  minMoraleValue: number | null;
  /** Required cards per initiative value, or null to skip balance. */
  cardsPerInitiative: number | null;
  /** Maximum copies of a single unit type in the list. */
  maxUnitTypeCount: number;
}

/**
 * Army composition catalog keyed by game mode.
 * Mini/epic numeric limits are placeholders until final balance values land.
 */
export const armyCompositionByMode: Record<GameModeName, ArmyCompositionRules> =
  {
    tutorial: {
      maxUnitCost: STANDARD_MAX_ARMY_UNIT_COST,
      minMoraleValue: STANDARD_MIN_ARMY_MORALE_VALUE,
      cardsPerInitiative: STANDARD_MIN_ARMY_PER_INITIATIVE_COUNT,
      maxUnitTypeCount: STANDARD_MAX_ARMY_UNIT_TYPE_COUNT,
    },
    mini: {
      maxUnitCost: MINI_MAX_ARMY_UNIT_COST,
      minMoraleValue: MINI_MIN_ARMY_MORALE_VALUE,
      cardsPerInitiative: MINI_MIN_ARMY_PER_INITIATIVE_COUNT,
      maxUnitTypeCount: MINI_MAX_ARMY_UNIT_TYPE_COUNT,
    },
    standard: {
      maxUnitCost: STANDARD_MAX_ARMY_UNIT_COST,
      minMoraleValue: STANDARD_MIN_ARMY_MORALE_VALUE,
      cardsPerInitiative: STANDARD_MIN_ARMY_PER_INITIATIVE_COUNT,
      maxUnitTypeCount: STANDARD_MAX_ARMY_UNIT_TYPE_COUNT,
    },
    epic: {
      maxUnitCost: EPIC_MAX_ARMY_UNIT_COST,
      minMoraleValue: EPIC_MIN_ARMY_MORALE_VALUE,
      cardsPerInitiative: EPIC_MIN_ARMY_PER_INITIATIVE_COUNT,
      maxUnitTypeCount: EPIC_MAX_ARMY_UNIT_TYPE_COUNT,
    },
  };

/** Initiative values used when enforcing cards-per-initiative balance. */
export const armyCompositionInitiatives: readonly number[] = LEGAL_INITIATIVES;
