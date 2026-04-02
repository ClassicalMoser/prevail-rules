import type { GameEffectType } from '@ruleValues';
import type { AssertExact } from '@utils';
/**
 * **Do not import `@events` here** (main barrel). Use `@ruleValues/gameEffectTypes` (zero imports).
 */
import { gameEffects } from '@ruleValues';
import { z } from 'zod';

/**
 * Expected event is a game effect (deterministic action).
 * Board-agnostic: spatial payloads live on {@link GameEffectEvent}, not here (Layer 4).
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

/** The schema for expected game effect. */
export const expectedGameEffectSchema: z.ZodObject<{
  actionType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodType<GameEffectType>;
}> = _expectedGameEffectSchemaObject;

const _assertExactExpectedGameEffect: AssertExact<
  ExpectedGameEffect,
  ExpectedGameEffectSchemaType
> = true;
