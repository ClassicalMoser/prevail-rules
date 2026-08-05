import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import type { ChooseCardEvent } from './chooseCard';
import type { ChooseRallyEvent } from './chooseRally';
import type { ChooseRoutDiscardEvent } from './chooseRoutDiscard';
import type { ChooseRetreatOptionEvent } from './chooseRetreatOption';
import type { ChooseMeleeResolutionEvent } from './chooseMeleeResolution';
import type { ChooseWhetherToRetreatEvent } from './chooseWhetherToRetreat';
import type { CommitToMeleeEvent } from './commitToMelee';
import type { CommitToMovementEvent } from './commitToMovement';
import type { CommitToRangedAttackEvent } from './commitToRangedAttack';
import type { IssueCommandEvent } from './issueCommand';
import type { MoveCommanderEvent } from './moveCommander';
import type { MoveUnitEvent } from './moveUnit';
import type { PerformRangedAttackEvent } from './performRangedAttack';
import type { SetupUnitsEvent } from './setupUnit';
import type { PlayerChoiceType } from './playerChoiceTypes';

import { z } from 'zod';
import { chooseCardEventSchema } from './chooseCard';
import { chooseMeleeResolutionEventSchema } from './chooseMeleeResolution';
import { chooseRallyEventSchema } from './chooseRally';
import { chooseRetreatOptionEventSchema } from './chooseRetreatOption';
import { chooseRoutDiscardEventSchema } from './chooseRoutDiscard';
import { chooseWhetherToRetreatEventSchema } from './chooseWhetherToRetreat';
import { commitToMeleeEventSchema } from './commitToMelee';
import { commitToMovementEventSchema } from './commitToMovement';
import { commitToRangedAttackEventSchema } from './commitToRangedAttack';
import { issueCommandEventSchema } from './issueCommand';
import { moveCommanderEventSchema } from './moveCommander';
import { moveUnitEventSchema } from './moveUnit';
import { performRangedAttackEventSchema } from './performRangedAttack';
import { setupUnitsEventSchema } from './setupUnit';

export type { PlayerChoiceType } from './playerChoiceTypes';
export { playerChoices, playerChoiceTypeSchema } from './playerChoiceTypes';

/** An event that represents a player choice. */
export type PlayerChoiceEvent =
  | ChooseCardEvent
  | ChooseMeleeResolutionEvent
  | ChooseRallyEvent
  | ChooseRoutDiscardEvent
  | ChooseRetreatOptionEvent
  | ChooseWhetherToRetreatEvent
  | CommitToMeleeEvent
  | CommitToMovementEvent
  | CommitToRangedAttackEvent
  | IssueCommandEvent
  | MoveCommanderEvent
  | MoveUnitEvent
  | PerformRangedAttackEvent
  | SetupUnitsEvent;

/**
 * Player choice event type filtered by choice type.
 * Extracts only the event type that matches the specified choiceType.
 */
export type PlayerChoiceEventOfType<
  TPlayerChoiceType extends PlayerChoiceType = PlayerChoiceType,
> = Extract<PlayerChoiceEvent, { choiceType: TPlayerChoiceType }>;

/**
 * @deprecated Board size is not on player-choice events. Prefer
 * {@link PlayerChoiceEvent} / {@link PlayerChoiceEventOfType}.
 */
export type PlayerChoiceEventForBoard<
  _TBoard extends Board = Board,
  TPlayerChoiceType extends PlayerChoiceType = PlayerChoiceType,
> = PlayerChoiceEventOfType<TPlayerChoiceType>;

const _playerChoiceEventSchemaObject = z.discriminatedUnion('choiceType', [
  chooseCardEventSchema,
  chooseMeleeResolutionEventSchema,
  chooseRallyEventSchema,
  chooseRoutDiscardEventSchema,
  chooseRetreatOptionEventSchema,
  chooseWhetherToRetreatEventSchema,
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

const _assertExactPlayerChoiceEvent: AssertExact<
  PlayerChoiceEvent,
  PlayerChoiceEventSchemaType
> = true;

export const playerChoiceEventSchema: z.ZodType<PlayerChoiceEvent> =
  _playerChoiceEventSchemaObject;
