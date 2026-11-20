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
import { commitToMeleeEventSchema } from './commitToMelee';
import { commitToMovementEventSchema } from './commitToMovement';
import { commitToRangedAttackEventSchema } from './commitToRangedAttack';
import { commitToRangedDefenseEventSchema } from './commitToRangedDefense';
import { assignUnitSupportEventSchema } from './assignUnitSupport';
import { issueCommandsEventSchema } from './issueCommands';
import { moveCommanderEventSchema } from './moveCommander';
import { chooseMovingUnitEventSchema } from './chooseMovingUnit';
import { chooseShooterEventSchema } from './chooseShooter';
import { moveUnitEventSchema } from './moveUnit';
import { performRangedAttackEventSchema } from './performRangedAttack';
import type { PlayerChoiceEvent } from './playerChoice';
import { setupUnitsEventSchema } from './setupUnit';

/**
 * A choose card event as one player sees it. Cards are chosen face down
 * (§4.1.1), so the opponent's card shows as `'hidden'`.
 * `projectEventForVisibility` writes it.
 */
export interface ProjectedChooseCardEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_CARD_CHOICE_TYPE;
  /** The player choosing. */
  player: PlayerSide;
  /** The card chosen, or `'hidden'` when it is the opponent's. */
  card: CommandCard | HiddenCard;
}

const _projectedChooseCardEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_CARD_CHOICE_TYPE),
    /** The player choosing. */
    player: playerSideSchema,
    /** The card chosen, or `'hidden'` when it is the opponent's. */
    card: z.union([commandCardSchema, hiddenCardSchema]),
  })
  .strict();

type ProjectedChooseCardEventSchemaType = z.infer<
  typeof _projectedChooseCardEventSchemaObject
>;

const _assertExactProjectedChooseCardEvent: AssertExact<
  ProjectedChooseCardEvent,
  ProjectedChooseCardEventSchemaType
> = true;

/** The schema for a choose card event as one player sees it. */
export const projectedChooseCardEventSchema: z.ZodType<ProjectedChooseCardEvent> =
  _projectedChooseCardEventSchemaObject;

/**
 * A player choice as one player sees it. It is the same as
 * {@link PlayerChoiceEvent}, except that the opponent's chosen card is
 * `'hidden'`. Commitments are public, so they keep the real card.
 */
export type ProjectedPlayerChoiceEvent =
  | Exclude<PlayerChoiceEvent, ChooseCardEvent>
  | ProjectedChooseCardEvent;

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
  ],
);

type ProjectedPlayerChoiceEventSchemaType = z.infer<
  typeof _projectedPlayerChoiceEventSchemaObject
>;

// Dropping a choice from the schema list above must not compile, or the wire
// schema would refuse that choice at runtime while the type still allows it.
const _assertExactProjectedPlayerChoiceEvent: AssertExact<
  ProjectedPlayerChoiceEvent,
  ProjectedPlayerChoiceEventSchemaType
> = true;

/** The schema for any player choice as one player sees it. */
export const projectedPlayerChoiceEventSchema: z.ZodType<ProjectedPlayerChoiceEvent> =
  _projectedPlayerChoiceEventSchemaObject;
