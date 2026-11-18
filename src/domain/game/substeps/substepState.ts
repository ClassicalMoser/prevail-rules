import type { AssertExact } from '@utils';
import type {
  AttackApplyState,
  RetreatState,
  ReverseState,
  RoutState,
} from './combatOutcomes';
import type { CommandResolutionState } from './commandResolution';
import type { EngagementState } from './engagement';
import type { MeleeResolutionState } from './meleeResolution';
import type { RallyResolutionState } from './rallyResolution';
import type { SubstepType } from './substepType';

/**
 * Any substep play can be inside, told apart by its `substepType` (and a
 * command's by its `commandResolutionType` as well).
 */
export type SubstepState =
  | CommandResolutionState
  | MeleeResolutionState
  | RallyResolutionState
  | EngagementState
  | AttackApplyState
  | ReverseState
  | RetreatState
  | RoutState;

/** Every substep type the list names has a substep, and no other. */
const _assertSubstepTypesMatchStates: AssertExact<
  SubstepType,
  SubstepState['substepType']
> = true;
