import type { GameModeName } from '@entities/gameModes';
import {
  LEGAL_INITIATIVES,
  MAX_ARMY_UNIT_COST,
  MAX_ARMY_UNIT_TYPE_COUNT,
  MIN_ARMY_MORALE_VALUE,
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
      maxUnitCost: null,
      minMoraleValue: null,
      cardsPerInitiative: null,
      maxUnitTypeCount: MAX_ARMY_UNIT_TYPE_COUNT,
    },
    mini: {
      maxUnitCost: 100,
      minMoraleValue: 6,
      cardsPerInitiative: 3,
      maxUnitTypeCount: 4,
    },
    standard: {
      maxUnitCost: MAX_ARMY_UNIT_COST,
      minMoraleValue: MIN_ARMY_MORALE_VALUE,
      cardsPerInitiative: 3,
      maxUnitTypeCount: MAX_ARMY_UNIT_TYPE_COUNT,
    },
    epic: {
      maxUnitCost: 300,
      minMoraleValue: 18,
      cardsPerInitiative: 3,
      maxUnitTypeCount: MAX_ARMY_UNIT_TYPE_COUNT,
    },
  };

/** Initiative values used when enforcing cards-per-initiative balance. */
export const armyCompositionInitiatives: readonly number[] = LEGAL_INITIATIVES;
