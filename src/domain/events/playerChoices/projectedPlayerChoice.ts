import type { CommandCard, HiddenCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import {
  commandCardSchema,
  hiddenCardSchema,
  playerSideSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';
import type { ChooseCardEvent } from './chooseCard';
import { CHOOSE_CARD_CHOICE_TYPE } from './chooseCard';
import { chooseMeleeResolutionEventSchema } from './chooseMeleeResolution';
import { chooseRallyEventSchema } from './chooseRally';
import { chooseRetreatOptionEventSchema } from './chooseRetreatOption';
import { chooseRoutDiscardEventSchema } from './chooseRoutDiscard';
import { chooseWhetherToRetreatEventSchema } from './chooseWhetherToRetreat';
import type { CommitToMeleeEvent } from './commitToMelee';
import { commitToMeleeEventSchema } from './commitToMelee';
import type { CommitToMovementEvent } from './commitToMovement';
import { commitToMovementEventSchema } from './commitToMovement';
import type { CommitToRangedAttackEvent } from './commitToRangedAttack';
import { commitToRangedAttackEventSchema } from './commitToRangedAttack';
import { assignUnitSupportEventSchema } from './assignUnitSupport';
import { doneIssuingCommandsEventSchema } from './doneIssuingCommands';
import { issueCommandEventSchema } from './issueCommand';
import { moveCommanderEventSchema } from './moveCommander';
import { moveUnitEventSchema } from './moveUnit';
import { performRangedAttackEventSchema } from './performRangedAttack';
import type { PlayerChoiceEvent } from './playerChoice';
import { setupUnitsEventSchema } from './setupUnit';

/** Choose-card event as seen on the wire for a seat (may redact card identity). */
export interface ProjectedChooseCardEvent {
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  choiceType: typeof CHOOSE_CARD_CHOICE_TYPE;
  eventNumber: number;
  player: PlayerSide;
  card: CommandCard | HiddenCard;
}

const _projectedChooseCardEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_CARD_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  card: z.union([commandCardSchema, hiddenCardSchema]),
});

type ProjectedChooseCardEventSchemaType = z.infer<
  typeof _projectedChooseCardEventSchemaObject
>;

const _assertExactProjectedChooseCardEvent: AssertExact<
  ProjectedChooseCardEvent,
  ProjectedChooseCardEventSchemaType
> = true;

export const projectedChooseCardEventSchema: z.ZodType<ProjectedChooseCardEvent> =
  _projectedChooseCardEventSchemaObject;

/**
 * Commit events may redact `committedCard` for the opposing seat.
 * Defined as three members (not `Omit` over a union) so `choiceType` stays a
 * discriminant for switch narrowing.
 */
export type ProjectedCommitToMeleeEvent = Omit<
  CommitToMeleeEvent,
  'committedCard'
> & {
  committedCard: CommandCard | HiddenCard | null;
};

export type ProjectedCommitToMovementEvent = Omit<
  CommitToMovementEvent,
  'committedCard'
> & {
  committedCard: CommandCard | HiddenCard | null;
};

export type ProjectedCommitToRangedAttackEvent = Omit<
  CommitToRangedAttackEvent,
  'committedCard'
> & {
  committedCard: CommandCard | HiddenCard | null;
};

export type ProjectedCommitEvent =
  | ProjectedCommitToMeleeEvent
  | ProjectedCommitToMovementEvent
  | ProjectedCommitToRangedAttackEvent;

const cardHiddenOrNull = z.union([
  commandCardSchema,
  hiddenCardSchema,
  z.null(),
]);

const projectedCommitToMeleeEventSchema = commitToMeleeEventSchema.extend({
  committedCard: cardHiddenOrNull,
});
const projectedCommitToMovementEventSchema = commitToMovementEventSchema.extend(
  {
    committedCard: cardHiddenOrNull,
  },
);
const projectedCommitToRangedAttackEventSchema =
  commitToRangedAttackEventSchema.extend({
    committedCard: cardHiddenOrNull,
  });

/**
 * Player choice as delivered to a seated client after visibility projection.
 * Same as {@link PlayerChoiceEvent} except card-bearing fields may be `'hidden'`.
 */
export type ProjectedPlayerChoiceEvent =
  | Exclude<
      PlayerChoiceEvent,
      | ChooseCardEvent
      | CommitToMeleeEvent
      | CommitToMovementEvent
      | CommitToRangedAttackEvent
    >
  | ProjectedChooseCardEvent
  | ProjectedCommitEvent;

const _projectedPlayerChoiceEventSchemaObject = z.discriminatedUnion(
  'choiceType',
  [
    assignUnitSupportEventSchema,
    _projectedChooseCardEventSchemaObject,
    chooseMeleeResolutionEventSchema,
    chooseRallyEventSchema,
    chooseRetreatOptionEventSchema,
    chooseRoutDiscardEventSchema,
    chooseWhetherToRetreatEventSchema,
    projectedCommitToMeleeEventSchema,
    projectedCommitToMovementEventSchema,
    projectedCommitToRangedAttackEventSchema,
    doneIssuingCommandsEventSchema,
    issueCommandEventSchema,
    moveCommanderEventSchema,
    moveUnitEventSchema,
    performRangedAttackEventSchema,
    setupUnitsEventSchema,
  ],
);

export const projectedPlayerChoiceEventSchema: z.ZodType<ProjectedPlayerChoiceEvent> =
  _projectedPlayerChoiceEventSchemaObject;
