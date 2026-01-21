import type { AssertExact } from '@utils';
import { gameEffects } from '@events';
import { z } from 'zod';

/** Type for all valid game effect types. */
export type GameEffectType = (typeof gameEffects)[number];

/**
 * Expected event is a game effect (deterministic action).
 */
export interface ExpectedGameEffect {
  /** Discriminator for the union. */
  actionType: 'gameEffect';
  /** The specific effect type expected (e.g., 'resolveRally', 'revealCards'). */
  effectType: GameEffectType;
}

const _expectedGameEffectSchemaObject = z.object({
  actionType: z.literal('gameEffect'),
  effectType: z.enum(gameEffects),
});

type ExpectedGameEffectSchemaType = z.infer<
  typeof _expectedGameEffectSchemaObject
>;

const _assertExactExpectedGameEffect: AssertExact<
  ExpectedGameEffect,
  ExpectedGameEffectSchemaType
> = true;

/** The schema for expected game effect. */
export const expectedGameEffectSchema: z.ZodObject<{
  actionType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodType<GameEffectType>;
}> = _expectedGameEffectSchemaObject;
