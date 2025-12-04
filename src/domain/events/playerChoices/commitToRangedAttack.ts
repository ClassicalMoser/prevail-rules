import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { z } from 'zod';

/** An event to commit a card to a ranged attack. */
export interface CommitToRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The player who is committing the card. */
  player: PlayerSide;
  /** The card to commit from the player's hand. */
  committedCard: Card;
  /** The modifier types the card applies. */
  modifierTypes: ('range' | 'attack' | 'flexibility')[];
}

const _commitToRangedAttackEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The player who is committing the card. */
  player: playerSideSchema,
  /** The card to commit from the player's hand. */
  committedCard: cardSchema,
  /** The modifier types the card applies. */
  modifierTypes: z.array(z.enum(['range', 'attack', 'flexibility'])),
});

type CommitToRangedAttackEventSchemaType = z.infer<
  typeof _commitToRangedAttackEventSchemaObject
>;

const _assertExactCommitToRangedAttackEvent: AssertExact<
  CommitToRangedAttackEvent,
  CommitToRangedAttackEventSchemaType
> = true;

/** The schema for a commit to ranged attack event. */
export const commitToRangedAttackEventSchema: z.ZodType<CommitToRangedAttackEvent> =
  _commitToRangedAttackEventSchemaObject;
