import type { AssertExact } from '@utils';
import type { CompleteCleanupPhaseEvent } from './completeCleanupPhase';
import type { CompleteIssueCommandsPhaseEvent } from './completeIssueCommandsPhase';
import type { CompleteMoveCommandersPhaseEvent } from './completeMoveCommandersPhase';
import type { CompletePlayCardsPhaseEvent } from './completePlayCardsPhase';
import type { CompleteResolveMeleePhaseEvent } from './completeResolveMeleePhase';
import type { DiscardPlayedCardsEvent } from './discardPlayedCards';
import type { ResolveEngagementEvent } from './resolveEngagement';
import type { ResolveInitiativeEvent } from './resolveInitiative';
import type { ResolveMeleeEvent } from './resolveMelee';
import type { ResolveRallyEvent } from './resolveRally';
import type { ResolveRangedAttackEvent } from './resolveRangedAttack';
import type { ResolveRetreatEvent } from './resolveRetreat';
import type { ResolveReverseEvent } from './resolveReverse';
import type { ResolveRoutEvent } from './resolveRout';
import type { ResolveUnitsBrokenEvent } from './resolveUnitsBroken';
import type { RevealCardsEvent } from './revealCards';

import { z } from 'zod';
import { completeCleanupPhaseEventSchema } from './completeCleanupPhase';
import { completeIssueCommandsPhaseEventSchema } from './completeIssueCommandsPhase';
import { completeMoveCommandersPhaseEventSchema } from './completeMoveCommandersPhase';
import { completePlayCardsPhaseEventSchema } from './completePlayCardsPhase';
import { completeResolveMeleePhaseEventSchema } from './completeResolveMeleePhase';
import { discardPlayedCardsEventSchema } from './discardPlayedCards';
import { resolveEngagementEventSchema } from './resolveEngagement';
import { resolveInitiativeEventSchema } from './resolveInitiative';
import { resolveMeleeEventSchema } from './resolveMelee';
import { resolveRallyEventSchema } from './resolveRally';
import { resolveRangedAttackEventSchema } from './resolveRangedAttack';
import { resolveRetreatEventSchema } from './resolveRetreat';
import { resolveReverseEventSchema } from './resolveReverse';
import { resolveRoutEventSchema } from './resolveRout';
import { resolveUnitsBrokenEventSchema } from './resolveUnitsBroken';
import { revealCardsEventSchema } from './revealCards';

/** Iterable list of valid game effects. */
export const gameEffects = [
  'completeCleanupPhase',
  'completeIssueCommandsPhase',
  'completeMoveCommandersPhase',
  'completePlayCardsPhase',
  'completeResolveMeleePhase',
  'discardPlayedCards',
  'resolveEngagement',
  'resolveInitiative',
  'resolveMelee',
  'resolveRally',
  'resolveRangedAttack',
  'resolveRetreat',
  'resolveReverse',
  'resolveRout',
  'resolveUnitsBroken',
  'revealCards',
] as const;

/** The type of the complete cleanup phase game effect. */
export const COMPLETE_CLEANUP_PHASE_EFFECT_TYPE: 'completeCleanupPhase' =
  gameEffects[0];
/** The type of the complete issue commands phase game effect. */
export const COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE: 'completeIssueCommandsPhase' =
  gameEffects[1];
/** The type of the complete move commanders phase game effect. */
export const COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE: 'completeMoveCommandersPhase' =
  gameEffects[2];
/** The type of the complete play cards phase game effect. */
export const COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE: 'completePlayCardsPhase' =
  gameEffects[3];
/** The type of the complete resolve melee phase game effect. */
export const COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE: 'completeResolveMeleePhase' =
  gameEffects[4];
/** The type of the discard played cards game effect. */
export const DISCARD_PLAYED_CARDS_EFFECT_TYPE: 'discardPlayedCards' =
  gameEffects[5];
/** The type of the resolve engagement game effect. */
export const RESOLVE_ENGAGEMENT_EFFECT_TYPE: 'resolveEngagement' =
  gameEffects[6];
/** The type of the resolve initiative game effect. */
export const RESOLVE_INITIATIVE_EFFECT_TYPE: 'resolveInitiative' =
  gameEffects[7];
/** The type of the resolve melee game effect. */
export const RESOLVE_MELEE_EFFECT_TYPE: 'resolveMelee' = gameEffects[8];
/** The type of the resolve rally game effect. */
export const RESOLVE_RALLY_EFFECT_TYPE: 'resolveRally' = gameEffects[9];
/** The type of the resolve ranged attack game effect. */
export const RESOLVE_RANGED_ATTACK_EFFECT_TYPE: 'resolveRangedAttack' =
  gameEffects[10];
/** The type of the resolve retreat game effect. */
export const RESOLVE_RETREAT_EFFECT_TYPE: 'resolveRetreat' = gameEffects[11];
/** The type of the resolve reverse game effect. */
export const RESOLVE_REVERSE_EFFECT_TYPE: 'resolveReverse' = gameEffects[12];
/** The type of the resolve rout game effect. */
export const RESOLVE_ROUT_EFFECT_TYPE: 'resolveRout' = gameEffects[13];
/** The type of the resolve units broken game effect. */
export const RESOLVE_UNITS_BROKEN_EFFECT_TYPE: 'resolveUnitsBroken' =
  gameEffects[14];
/** The type of the reveal cards game effect. */
export const REVEAL_CARDS_EFFECT_TYPE: 'revealCards' = gameEffects[15];

export type GameEffectEvent =
  | CompleteCleanupPhaseEvent
  | CompleteIssueCommandsPhaseEvent
  | CompleteMoveCommandersPhaseEvent
  | CompletePlayCardsPhaseEvent
  | CompleteResolveMeleePhaseEvent
  | DiscardPlayedCardsEvent
  | ResolveEngagementEvent
  | ResolveInitiativeEvent
  | ResolveMeleeEvent
  | ResolveRallyEvent
  | ResolveRangedAttackEvent
  | ResolveRetreatEvent
  | ResolveReverseEvent
  | ResolveRoutEvent
  | ResolveUnitsBrokenEvent
  | RevealCardsEvent;

const _gameEffectEventSchemaObject = z.discriminatedUnion('effectType', [
  completeCleanupPhaseEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
  discardPlayedCardsEventSchema,
  resolveEngagementEventSchema,
  resolveInitiativeEventSchema,
  resolveMeleeEventSchema,
  resolveRallyEventSchema,
  resolveRangedAttackEventSchema,
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  resolveUnitsBrokenEventSchema,
  revealCardsEventSchema,
]);

type GameEffectEventSchemaType = z.infer<typeof _gameEffectEventSchemaObject>;

const _assertExactGameEffectEvent: AssertExact<
  GameEffectEvent,
  GameEffectEventSchemaType
> = true;

/** The schema for a game effect event. */
export const gameEffectEventSchema: z.ZodType<GameEffectEvent> =
  _gameEffectEventSchemaObject;
