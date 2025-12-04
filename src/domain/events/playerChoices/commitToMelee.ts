import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { z } from 'zod';

/** An event to commit a card to a unit's melee. */
export interface CommitToMeleeEvent {
  /** The type of the event. */
  eventType: 'playerChoice';
  /** The player who is committing the card. */
  player: PlayerSide;
  /** The card to commit from the player's hand. */
  committedCard: Card;
  /** The modifier types the card applies. */
  modifierTypes: ('attack' | 'defense' | 'flexibility')[];
}

const _commitToMeleeEventSchemaObject = z.object({
  eventType: z.literal('playerChoice' as const),
  player: playerSideSchema,
  committedCard: cardSchema,
  modifierTypes: z.array(z.enum(['attack', 'defense', 'flexibility'])),
});

type CommitToMeleeEventSchemaType = z.infer<
  typeof _commitToMeleeEventSchemaObject
>;

const _assertExactCommitToMeleeEvent: AssertExact<
  CommitToMeleeEvent,
  CommitToMeleeEventSchemaType
> = true;

/** The schema for a commit to melee event. */
export const commitToMeleeEventSchema: z.ZodType<CommitToMeleeEvent> =
  _commitToMeleeEventSchemaObject;
