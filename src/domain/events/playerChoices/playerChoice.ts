import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import type { ChooseCardEvent } from './chooseCard';
import type { ChooseMeleeResolutionEvent } from './chooseMeleeResolution';
import type { ChooseRallyEvent } from './chooseRally';
import type { ChooseRoutDiscardEvent } from './chooseRoutDiscard';
import type { CommitToMeleeEvent } from './commitToMelee';
import type { CommitToMovementEvent } from './commitToMovement';
import type { CommitToRangedAttackEvent } from './commitToRangedAttack';
import type { IssueCommandEvent } from './issueCommand';
import type { MoveCommanderEvent } from './moveCommander';
import type { MoveUnitEvent } from './moveUnit';
import type { PerformRangedAttackEvent } from './performRangedAttack';
import type { SetupUnitsEvent } from './setupUnit';

import { z } from 'zod';
import { CHOOSE_CARD_CHOICE_TYPE, chooseCardEventSchema } from './chooseCard';
import {
  CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE,
  chooseMeleeResolutionEventSchema,
} from './chooseMeleeResolution';
import {
  CHOOSE_RALLY_CHOICE_TYPE,
  chooseRallyEventSchema,
} from './chooseRally';
import {
  CHOOSE_ROUT_DISCARD_CHOICE_TYPE,
  chooseRoutDiscardEventSchema,
} from './chooseRoutDiscard';
import {
  COMMIT_TO_MELEE_CHOICE_TYPE,
  commitToMeleeEventSchema,
} from './commitToMelee';
import {
  COMMIT_TO_MOVEMENT_CHOICE_TYPE,
  commitToMovementEventSchema,
} from './commitToMovement';
import {
  COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE,
  commitToRangedAttackEventSchema,
} from './commitToRangedAttack';
import {
  ISSUE_COMMAND_CHOICE_TYPE,
  issueCommandEventSchema,
} from './issueCommand';
import {
  MOVE_COMMANDER_CHOICE_TYPE,
  moveCommanderEventSchema,
} from './moveCommander';
import { MOVE_UNIT_CHOICE_TYPE, moveUnitEventSchema } from './moveUnit';
import {
  PERFORM_RANGED_ATTACK_CHOICE_TYPE,
  performRangedAttackEventSchema,
} from './performRangedAttack';
import { SETUP_UNITS_CHOICE_TYPE, setupUnitsEventSchema } from './setupUnit';

/** Iterable list of valid player choices. Built from individual event constants. */
export const playerChoices: readonly [
  'chooseCard',
  'chooseMeleeResolution',
  'chooseRally',
  'chooseRoutDiscard',
  'commitToMelee',
  'commitToMovement',
  'commitToRangedAttack',
  'issueCommand',
  'moveCommander',
  'moveUnit',
  'performRangedAttack',
  'setupUnits',
] = [
  CHOOSE_CARD_CHOICE_TYPE,
  CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE,
  CHOOSE_RALLY_CHOICE_TYPE,
  CHOOSE_ROUT_DISCARD_CHOICE_TYPE,
  COMMIT_TO_MELEE_CHOICE_TYPE,
  COMMIT_TO_MOVEMENT_CHOICE_TYPE,
  COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE,
  ISSUE_COMMAND_CHOICE_TYPE,
  MOVE_COMMANDER_CHOICE_TYPE,
  MOVE_UNIT_CHOICE_TYPE,
  PERFORM_RANGED_ATTACK_CHOICE_TYPE,
  SETUP_UNITS_CHOICE_TYPE,
] as const;

export type PlayerChoiceType = (typeof playerChoices)[number];

const _playerChoiceTypeSchemaObject = z.enum(playerChoices);

type PlayerChoiceTypeSchemaType = z.infer<typeof _playerChoiceTypeSchemaObject>;

const _assertExactPlayerChoiceType: AssertExact<
  PlayerChoiceType,
  PlayerChoiceTypeSchemaType
> = true;

/** The schema for a player choice type. */
export const playerChoiceTypeSchema: z.ZodType<PlayerChoiceType> =
  _playerChoiceTypeSchemaObject;

// Re-export constants for backwards compatibility
export { CHOOSE_CARD_CHOICE_TYPE } from './chooseCard';
export { CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE } from './chooseMeleeResolution';
export { CHOOSE_RALLY_CHOICE_TYPE } from './chooseRally';
export { CHOOSE_ROUT_DISCARD_CHOICE_TYPE } from './chooseRoutDiscard';
export { COMMIT_TO_MELEE_CHOICE_TYPE } from './commitToMelee';
export { COMMIT_TO_MOVEMENT_CHOICE_TYPE } from './commitToMovement';
export { COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE } from './commitToRangedAttack';
export { ISSUE_COMMAND_CHOICE_TYPE } from './issueCommand';
export { MOVE_COMMANDER_CHOICE_TYPE } from './moveCommander';
export { MOVE_UNIT_CHOICE_TYPE } from './moveUnit';
export { PERFORM_RANGED_ATTACK_CHOICE_TYPE } from './performRangedAttack';
export { SETUP_UNITS_CHOICE_TYPE } from './setupUnit';

/** An event that represents a player choice. */
export type PlayerChoiceEvent<TBoard extends Board> =
  | ChooseCardEvent<TBoard>
  | ChooseMeleeResolutionEvent<TBoard>
  | ChooseRallyEvent<TBoard>
  | ChooseRoutDiscardEvent<TBoard>
  | CommitToMeleeEvent<TBoard>
  | CommitToMovementEvent<TBoard>
  | CommitToRangedAttackEvent<TBoard>
  | IssueCommandEvent<TBoard>
  | MoveCommanderEvent<TBoard>
  | MoveUnitEvent<TBoard>
  | PerformRangedAttackEvent<TBoard>
  | SetupUnitsEvent<TBoard>;

const _playerChoiceEventSchemaObject = z.discriminatedUnion('choiceType', [
  chooseCardEventSchema,
  chooseMeleeResolutionEventSchema,
  chooseRallyEventSchema,
  chooseRoutDiscardEventSchema,
  commitToMeleeEventSchema,
  commitToMovementEventSchema,
  commitToRangedAttackEventSchema,
  issueCommandEventSchema,
  moveCommanderEventSchema,
  moveUnitEventSchema,
  performRangedAttackEventSchema,
  setupUnitsEventSchema,
]);

type PlayerChoiceEventSchemaType = z.infer<
  typeof _playerChoiceEventSchemaObject
>;

/** The schema for a player choice event. */
export const playerChoiceEventSchema: z.ZodType<PlayerChoiceEvent<Board>> =
  _playerChoiceEventSchemaObject;

// Verify manual type matches schema inference
const _assertExactPlayerChoiceEvent: AssertExact<
  PlayerChoiceEvent<Board>,
  PlayerChoiceEventSchemaType
> = true;
