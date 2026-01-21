import type { Board, Card, PlayerSide, StatModifier } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the commit to melee event. */
export const COMMIT_TO_MELEE_CHOICE_TYPE = 'commitToMelee' as const;

const meleeModifierTypes = ['attack', 'defense', 'flexibility'] as const;
type MeleeModifier = (typeof meleeModifierTypes)[number];

// Type-level guarantee that MeleeModifier extends StatModifier
const _assertMeleeModifierExtendsStatModifier: [MeleeModifier] extends [
  StatModifier,
]
  ? true
  : never = true;

/** An event to commit a card to a unit's melee. */
export interface CommitToMeleeEvent<_TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_MELEE_CHOICE_TYPE;
  /** The player who is committing the card. */
  player: PlayerSide;
  /** The card to commit from the player's hand. */
  committedCard: Card;
  /** The modifier types the card applies. */
  modifierTypes: MeleeModifier[];
}

const meleeModifierTypesEnum: z.ZodEnum<{
  attack: 'attack';
  defense: 'defense';
  flexibility: 'flexibility';
}> = z.enum(meleeModifierTypes);

const _commitToMeleeEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(COMMIT_TO_MELEE_CHOICE_TYPE),
  player: playerSideSchema,
  committedCard: cardSchema,
  modifierTypes: z.array(meleeModifierTypesEnum),
});

type CommitToMeleeEventSchemaType = z.infer<
  typeof _commitToMeleeEventSchemaObject
>;

const _assertExactCommitToMeleeEvent: AssertExact<
  CommitToMeleeEvent<Board>,
  CommitToMeleeEventSchemaType
> = true;

/** The schema for a commit to melee event. */
export const commitToMeleeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToMelee'>;
  player: typeof playerSideSchema;
  committedCard: typeof cardSchema;
  modifierTypes: z.ZodArray<typeof meleeModifierTypesEnum>;
}> = _commitToMeleeEventSchemaObject;
