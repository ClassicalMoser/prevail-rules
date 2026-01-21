import type { Board, Card, PlayerSide, StatModifier } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the commit to ranged attack event. */
export const COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE =
  'commitToRangedAttack' as const;

const rangedAttackModifierTypes = ['range', 'attack', 'flexibility'] as const;
type RangedAttackModifier = (typeof rangedAttackModifierTypes)[number];

// Type-level guarantee that RangedAttackModifier extends StatModifier
const _assertRangedAttackModifierExtendsStatModifier: [
  RangedAttackModifier,
] extends [StatModifier]
  ? true
  : never = true;

/** An event to commit a card to a ranged attack. */
export interface CommitToRangedAttackEvent<_TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE;
  /** The player who is committing the card. */
  player: PlayerSide;
  /** The card to commit from the player's hand. */
  committedCard: Card;
  /** The modifier types the card applies. */
  modifierTypes: RangedAttackModifier[];
}

const rangedAttackModifierTypesEnum: z.ZodEnum<{
  range: 'range';
  attack: 'attack';
  flexibility: 'flexibility';
}> = z.enum(rangedAttackModifierTypes);

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
  modifierTypes: z.array(rangedAttackModifierTypesEnum),
});

type CommitToRangedAttackEventSchemaType = z.infer<
  typeof _commitToRangedAttackEventSchemaObject
>;

const _assertExactCommitToRangedAttackEvent: AssertExact<
  CommitToRangedAttackEvent<Board>,
  CommitToRangedAttackEventSchemaType
> = true;

/** The schema for a commit to ranged attack event. */
export const commitToRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToRangedAttack'>;
  player: typeof playerSideSchema;
  committedCard: typeof cardSchema;
  modifierTypes: z.ZodArray<typeof rangedAttackModifierTypesEnum>;
}> = _commitToRangedAttackEventSchemaObject;
