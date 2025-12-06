import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { z } from 'zod';
import { PLAYER_CHOICE_EVENT_TYPE } from '../eventType';
import { COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE } from './playerChoice';


/** An event to commit a card to a ranged attack. */
export interface CommitToRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE;
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
  /** The type of player choice. */
  choiceType: z.literal(COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE),
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
export const commitToRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  committedCard: typeof cardSchema;
  modifierTypes: z.ZodArray<
    z.ZodEnum<{ range: 'range'; attack: 'attack'; flexibility: 'flexibility' }>
  >;
}> = _commitToRangedAttackEventSchemaObject;
