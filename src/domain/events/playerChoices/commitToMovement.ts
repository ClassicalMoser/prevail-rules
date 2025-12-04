import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { z } from 'zod';

/** An event to commit a card to a unit's movement. */
export interface CommitToMovementEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The player who is committing the card. */
  player: PlayerSide;
  /** The card to commit from the player's hand. */
  committedCard: Card;
  /** The modifier types the card applies. */
  modifierTypes: ('speed' | 'flexibility')[];
}

const _commitToMovementEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The player who is committing the card. */
  player: playerSideSchema,
  /** The card to commit from the player's hand. */
  committedCard: cardSchema,
  /** The modifier types the card applies. */
  modifierTypes: z.array(z.enum(['speed', 'flexibility'])),
});

type CommitToMovementEventSchemaType = z.infer<
  typeof _commitToMovementEventSchemaObject
>;

const _assertExactCommitToMovementEvent: AssertExact<
  CommitToMovementEvent,
  CommitToMovementEventSchemaType
> = true;

/** The schema for a commit to movement event. */
export const commitToMovementEventSchema: z.ZodType<CommitToMovementEvent> =
  _commitToMovementEventSchemaObject;
