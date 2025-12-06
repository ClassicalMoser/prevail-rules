import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { z } from 'zod';
import { PLAYER_CHOICE_EVENT_TYPE } from '../eventType';
import { COMMIT_TO_MELEE_CHOICE_TYPE } from './playerChoice';


/** An event to commit a card to a unit's melee. */
export interface CommitToMeleeEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_MELEE_CHOICE_TYPE;
  /** The player who is committing the card. */
  player: PlayerSide;
  /** The card to commit from the player's hand. */
  committedCard: Card;
  /** The modifier types the card applies. */
  modifierTypes: ('attack' | 'defense' | 'flexibility')[];
}

const _commitToMeleeEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(COMMIT_TO_MELEE_CHOICE_TYPE),
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
export const commitToMeleeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof COMMIT_TO_MELEE_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  committedCard: typeof cardSchema;
  modifierTypes: z.ZodArray<
    z.ZodEnum<{
      attack: 'attack';
      defense: 'defense';
      flexibility: 'flexibility';
    }>
  >;
}> = _commitToMeleeEventSchemaObject;
