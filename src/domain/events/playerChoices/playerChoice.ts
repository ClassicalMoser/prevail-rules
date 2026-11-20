import type { AssertExact } from '@utils';
import type { AssignUnitSupportEvent } from './assignUnitSupport';
import type { ChooseCardEvent } from './chooseCard';
import type { ChooseRallyEvent } from './chooseRally';
import type { ChooseRoutDiscardEvent } from './chooseRoutDiscard';
import type { ChooseRetreatOptionEvent } from './chooseRetreatOption';
import type { ChooseMeleeResolutionEvent } from './chooseMeleeResolution';
import type { ChooseWhetherToRetreatEvent } from './chooseWhetherToRetreat';
import type { CommitToMeleeEvent } from './commitToMelee';
import type { CommitToMovementEvent } from './commitToMovement';
import type { CommitToRangedAttackEvent } from './commitToRangedAttack';
import type { CommitToRangedDefenseEvent } from './commitToRangedDefense';
import type { IssueCommandsEvent } from './issueCommands';
import type { MoveCommanderEvent } from './moveCommander';
import type { ChooseMovingUnitEvent } from './chooseMovingUnit';
import type { ChooseShooterEvent } from './chooseShooter';
import type { MoveUnitEvent } from './moveUnit';
import type { PerformRangedAttackEvent } from './performRangedAttack';
import type { SetupUnitsEvent } from './setupUnit';
import type { PlayerChoiceType } from './playerChoiceTypes';

import { z } from 'zod';
import { assignUnitSupportEventSchema } from './assignUnitSupport';
import { chooseCardEventSchema } from './chooseCard';
import { chooseMeleeResolutionEventSchema } from './chooseMeleeResolution';
import { chooseRallyEventSchema } from './chooseRally';
import { chooseRetreatOptionEventSchema } from './chooseRetreatOption';
import { chooseRoutDiscardEventSchema } from './chooseRoutDiscard';
import { chooseWhetherToRetreatEventSchema } from './chooseWhetherToRetreat';
import { commitToMeleeEventSchema } from './commitToMelee';
import { commitToMovementEventSchema } from './commitToMovement';
import { commitToRangedAttackEventSchema } from './commitToRangedAttack';
import { commitToRangedDefenseEventSchema } from './commitToRangedDefense';
import { issueCommandsEventSchema } from './issueCommands';
import { moveCommanderEventSchema } from './moveCommander';
import { chooseMovingUnitEventSchema } from './chooseMovingUnit';
import { chooseShooterEventSchema } from './chooseShooter';
import { moveUnitEventSchema } from './moveUnit';
import { performRangedAttackEventSchema } from './performRangedAttack';
import { setupUnitsEventSchema } from './setupUnit';

export type { PlayerChoiceType } from './playerChoiceTypes';
export { playerChoices, playerChoiceTypeSchema } from './playerChoiceTypes';

/**
 * Any decision the rules leave to a player. What the game does in response
 * is recorded separately, as game effects.
 */
export type PlayerChoiceEvent =
  | AssignUnitSupportEvent
  | ChooseCardEvent
  | ChooseMeleeResolutionEvent
  | ChooseRallyEvent
  | ChooseRoutDiscardEvent
  | ChooseRetreatOptionEvent
  | ChooseWhetherToRetreatEvent
  | CommitToMeleeEvent
  | CommitToMovementEvent
  | CommitToRangedAttackEvent
  | CommitToRangedDefenseEvent
  | IssueCommandsEvent
  | MoveCommanderEvent
  | ChooseMovingUnitEvent
  | MoveUnitEvent
  | ChooseShooterEvent
  | PerformRangedAttackEvent
  | SetupUnitsEvent;

const _playerChoiceEventSchemaObject = z.discriminatedUnion('choiceType', [
  assignUnitSupportEventSchema,
  chooseCardEventSchema,
  chooseMeleeResolutionEventSchema,
  chooseRallyEventSchema,
  chooseRoutDiscardEventSchema,
  chooseRetreatOptionEventSchema,
  chooseWhetherToRetreatEventSchema,
  commitToMeleeEventSchema,
  commitToMovementEventSchema,
  commitToRangedAttackEventSchema,
  commitToRangedDefenseEventSchema,
  issueCommandsEventSchema,
  moveCommanderEventSchema,
  chooseMovingUnitEventSchema,
  moveUnitEventSchema,
  chooseShooterEventSchema,
  performRangedAttackEventSchema,
  setupUnitsEventSchema,
]);

type PlayerChoiceEventSchemaType = z.infer<
  typeof _playerChoiceEventSchemaObject
>;

const _assertExactPlayerChoiceEvent: AssertExact<
  PlayerChoiceEvent,
  PlayerChoiceEventSchemaType
> = true;

// The list of choice types and the union of events name the same choices: a
// choice added to one and not the other must not compile.
const _assertChoiceTypesMatchEvents: AssertExact<
  PlayerChoiceEvent['choiceType'],
  PlayerChoiceType
> = true;

/** The schema for any player choice. */
export const playerChoiceEventSchema: z.ZodType<PlayerChoiceEvent> =
  _playerChoiceEventSchemaObject;
