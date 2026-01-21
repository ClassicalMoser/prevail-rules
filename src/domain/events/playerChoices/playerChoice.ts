import type { Board} from '@entities';
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
import { chooseCardEventSchema } from './chooseCard';
import { chooseMeleeResolutionEventSchema } from './chooseMeleeResolution';
import { chooseRallyEventSchema } from './chooseRally';
import { chooseRoutDiscardEventSchema } from './chooseRoutDiscard';
import { commitToMeleeEventSchema } from './commitToMelee';
import { commitToMovementEventSchema } from './commitToMovement';
import { commitToRangedAttackEventSchema } from './commitToRangedAttack';
import { issueCommandEventSchema } from './issueCommand';
import { moveCommanderEventSchema } from './moveCommander';
import { moveUnitEventSchema } from './moveUnit';
import { performRangedAttackEventSchema } from './performRangedAttack';
import { setupUnitsEventSchema } from './setupUnit';

/** Iterable list of valid player choices. */
export const playerChoices = [
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
] as const;

export type PlayerChoiceType = (typeof playerChoices)[number];


/** The type of the choose card event. */
export const CHOOSE_CARD_CHOICE_TYPE = 'chooseCard';
/** The type of the choose melee resolution event. */
export const CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE = 'chooseMeleeResolution';
/** The type of the choose rally event. */
export const CHOOSE_RALLY_CHOICE_TYPE = 'chooseRally';
/** The type of the choose rout discard event. */
export const CHOOSE_ROUT_DISCARD_CHOICE_TYPE = 'chooseRoutDiscard';
/** The type of the commit to melee event. */
export const COMMIT_TO_MELEE_CHOICE_TYPE = 'commitToMelee';
/** The type of the commit to movement event. */
export const COMMIT_TO_MOVEMENT_CHOICE_TYPE = 'commitToMovement';
/** The type of the commit to ranged attack event. */
export const COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE = 'commitToRangedAttack';
/** The type of the issue command event. */
export const ISSUE_COMMAND_CHOICE_TYPE = 'issueCommand';
/** The type of the move commander event. */
export const MOVE_COMMANDER_CHOICE_TYPE = 'moveCommander';
/** The type of the move unit event. */
export const MOVE_UNIT_CHOICE_TYPE = 'moveUnit';
/** The type of the perform ranged attack event. */
export const PERFORM_RANGED_ATTACK_CHOICE_TYPE = 'performRangedAttack';
/** The type of the setup units event. */
export const SETUP_UNITS_CHOICE_TYPE = 'setupUnits';

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