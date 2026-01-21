import type { Board } from '@entities';
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
import type { ResolveRoutDiscardEvent } from './resolveRoutDiscard';
import type { ResolveUnitsBrokenEvent } from './resolveUnitsBroken';
import type { RevealCardsEvent } from './revealCards';

import { z } from 'zod';
import {
  COMPLETE_CLEANUP_PHASE_EFFECT_TYPE,
  completeCleanupPhaseEventSchema,
} from './completeCleanupPhase';
import {
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  completeIssueCommandsPhaseEventSchema,
} from './completeIssueCommandsPhase';
import {
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  completeMoveCommandersPhaseEventSchema,
} from './completeMoveCommandersPhase';
import {
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  completePlayCardsPhaseEventSchema,
} from './completePlayCardsPhase';
import {
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  completeResolveMeleePhaseEventSchema,
} from './completeResolveMeleePhase';
import {
  DISCARD_PLAYED_CARDS_EFFECT_TYPE,
  discardPlayedCardsEventSchema,
} from './discardPlayedCards';
import {
  RESOLVE_ENGAGEMENT_EFFECT_TYPE,
  resolveEngagementEventSchema,
} from './resolveEngagement';
import {
  RESOLVE_INITIATIVE_EFFECT_TYPE,
  resolveInitiativeEventSchema,
} from './resolveInitiative';
import {
  RESOLVE_MELEE_EFFECT_TYPE,
  resolveMeleeEventSchema,
} from './resolveMelee';
import {
  RESOLVE_RALLY_EFFECT_TYPE,
  resolveRallyEventSchema,
} from './resolveRally';
import {
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
  resolveRangedAttackEventSchema,
} from './resolveRangedAttack';
import {
  RESOLVE_RETREAT_EFFECT_TYPE,
  resolveRetreatEventSchema,
} from './resolveRetreat';
import {
  RESOLVE_REVERSE_EFFECT_TYPE,
  resolveReverseEventSchema,
} from './resolveReverse';
import {
  RESOLVE_ROUT_EFFECT_TYPE,
  resolveRoutEventSchema,
} from './resolveRout';
import {
  RESOLVE_ROUT_DISCARD_EFFECT_TYPE,
  resolveRoutDiscardEventSchema,
} from './resolveRoutDiscard';
import {
  RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
  resolveUnitsBrokenEventSchema,
} from './resolveUnitsBroken';
import {
  REVEAL_CARDS_EFFECT_TYPE,
  revealCardsEventSchema,
} from './revealCards';

/** Iterable list of valid game effects. Built from individual event constants. */
export const gameEffects: readonly [
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
  'resolveRoutDiscard',
  'resolveUnitsBroken',
  'revealCards',
] = [
  COMPLETE_CLEANUP_PHASE_EFFECT_TYPE,
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  DISCARD_PLAYED_CARDS_EFFECT_TYPE,
  RESOLVE_ENGAGEMENT_EFFECT_TYPE,
  RESOLVE_INITIATIVE_EFFECT_TYPE,
  RESOLVE_MELEE_EFFECT_TYPE,
  RESOLVE_RALLY_EFFECT_TYPE,
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
  RESOLVE_RETREAT_EFFECT_TYPE,
  RESOLVE_REVERSE_EFFECT_TYPE,
  RESOLVE_ROUT_EFFECT_TYPE,
  RESOLVE_ROUT_DISCARD_EFFECT_TYPE,
  RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
  REVEAL_CARDS_EFFECT_TYPE,
] as const;

// Re-export constants for backwards compatibility
export { COMPLETE_CLEANUP_PHASE_EFFECT_TYPE };
export { COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE };
export { COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE };
export { COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE };
export { COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE };
export { DISCARD_PLAYED_CARDS_EFFECT_TYPE };
export { RESOLVE_ENGAGEMENT_EFFECT_TYPE };
export { RESOLVE_INITIATIVE_EFFECT_TYPE };
export { RESOLVE_MELEE_EFFECT_TYPE };
export { RESOLVE_RALLY_EFFECT_TYPE };
export { RESOLVE_RANGED_ATTACK_EFFECT_TYPE };
export { RESOLVE_RETREAT_EFFECT_TYPE };
export { RESOLVE_REVERSE_EFFECT_TYPE };
export { RESOLVE_ROUT_EFFECT_TYPE };
export { RESOLVE_ROUT_DISCARD_EFFECT_TYPE };
export { RESOLVE_UNITS_BROKEN_EFFECT_TYPE };
export { REVEAL_CARDS_EFFECT_TYPE };

export type GameEffectEvent<TBoard extends Board> =
  | CompleteCleanupPhaseEvent<TBoard>
  | CompleteIssueCommandsPhaseEvent<TBoard>
  | CompleteMoveCommandersPhaseEvent<TBoard>
  | CompletePlayCardsPhaseEvent<TBoard>
  | CompleteResolveMeleePhaseEvent<TBoard>
  | DiscardPlayedCardsEvent<TBoard>
  | ResolveEngagementEvent<TBoard>
  | ResolveInitiativeEvent<TBoard>
  | ResolveMeleeEvent<TBoard>
  | ResolveRallyEvent<TBoard>
  | ResolveRangedAttackEvent<TBoard>
  | ResolveRetreatEvent<TBoard>
  | ResolveReverseEvent<TBoard>
  | ResolveRoutEvent<TBoard>
  | ResolveRoutDiscardEvent<TBoard>
  | ResolveUnitsBrokenEvent<TBoard>
  | RevealCardsEvent<TBoard>;

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
  resolveRoutDiscardEventSchema,
  resolveUnitsBrokenEventSchema,
  revealCardsEventSchema,
]);

type GameEffectEventSchemaType = z.infer<typeof _gameEffectEventSchemaObject>;

// Verify manual type matches schema inference
const _assertExactGameEffect: AssertExact<
  GameEffectEvent<Board>,
  GameEffectEventSchemaType
> = true;

/** The schema for a game effect event. */
export const gameEffectEventSchema: z.ZodType<GameEffectEvent<Board>> =
  _gameEffectEventSchemaObject;
