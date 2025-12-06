import type { AssertExact } from '@utils';
import type { ResolveEngagementEvent } from './resolveEngagement';
import type { ResolveInitiativeEvent } from './resolveInitiative';
import type { ResolveMeleeEvent } from './resolveMelee';
import type { ResolveRallyEvent } from './resolveRally';
import type { ResolveRangedAttackEvent } from './resolveRangedAttack';
import type { ResolveRetreatEvent } from './resolveRetreat';
import type { ResolveReverseEvent } from './resolveReverse';
import type { ResolveRoutEvent } from './resolveRout';
import type { ResolveUnitsBrokenEvent } from './resolveUnitsBroken';

import { z } from 'zod';
import { resolveEngagementEventSchema } from './resolveEngagement';
import { resolveInitiativeEventSchema } from './resolveInitiative';
import { resolveMeleeEventSchema } from './resolveMelee';
import { resolveRallyEventSchema } from './resolveRally';
import { resolveRangedAttackEventSchema } from './resolveRangedAttack';
import { resolveRetreatEventSchema } from './resolveRetreat';
import { resolveReverseEventSchema } from './resolveReverse';
import { resolveRoutEventSchema } from './resolveRout';
import { resolveUnitsBrokenEventSchema } from './resolveUnitsBroken';


/** Iterable list of valid game effects. */
export const gameEffects = [
  'resolveEngagement',
  'resolveInitiative',
  'resolveMelee',
  'resolveRally',
  'resolveRangedAttack',
  'resolveRetreat',
  'resolveReverse',
  'resolveRout',
  'resolveUnitsBroken',
] as const;

/** The type of the resolve engagement game effect. */
export const RESOLVE_ENGAGEMENT_EFFECT_TYPE: 'resolveEngagement' =
  gameEffects[0];
/** The type of the resolve initiative game effect. */
export const RESOLVE_INITIATIVE_EFFECT_TYPE: 'resolveInitiative' =
  gameEffects[1];
/** The type of the resolve melee game effect. */
export const RESOLVE_MELEE_EFFECT_TYPE: 'resolveMelee' = gameEffects[2];
/** The type of the resolve rally game effect. */
export const RESOLVE_RALLY_EFFECT_TYPE: 'resolveRally' = gameEffects[3];
/** The type of the resolve ranged attack game effect. */
export const RESOLVE_RANGED_ATTACK_EFFECT_TYPE: 'resolveRangedAttack' =
  gameEffects[4];
/** The type of the resolve retreat game effect. */
export const RESOLVE_RETREAT_EFFECT_TYPE: 'resolveRetreat' = gameEffects[5];
/** The type of the resolve reverse game effect. */
export const RESOLVE_REVERSE_EFFECT_TYPE: 'resolveReverse' = gameEffects[6];
/** The type of the resolve rout game effect. */
export const RESOLVE_ROUT_EFFECT_TYPE: 'resolveRout' = gameEffects[7];
/** The type of the resolve units broken game effect. */
export const RESOLVE_UNITS_BROKEN_EFFECT_TYPE: 'resolveUnitsBroken' =
  gameEffects[8];

export type GameEffectEvent =
  | ResolveEngagementEvent
  | ResolveInitiativeEvent
  | ResolveMeleeEvent
  | ResolveRallyEvent
  | ResolveRangedAttackEvent
  | ResolveRetreatEvent
  | ResolveReverseEvent
  | ResolveRoutEvent
  | ResolveUnitsBrokenEvent;

const _gameEffectEventSchemaObject = z.discriminatedUnion('effectType', [
  resolveEngagementEventSchema,
  resolveInitiativeEventSchema,
  resolveMeleeEventSchema,
  resolveRallyEventSchema,
  resolveRangedAttackEventSchema,
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  resolveUnitsBrokenEventSchema,
]);

type GameEffectEventSchemaType = z.infer<typeof _gameEffectEventSchemaObject>;

const _assertExactGameEffectEvent: AssertExact<
  GameEffectEvent,
  GameEffectEventSchemaType
> = true;

/** The schema for a game effect event. */
export const gameEffectEventSchema: z.ZodType<GameEffectEvent> =
  _gameEffectEventSchemaObject;
