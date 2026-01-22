import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import type { CompleteCleanupPhaseEvent } from './completeCleanupPhase';
import type { CompleteIssueCommandsPhaseEvent } from './completeIssueCommandsPhase';
import type { CompleteMoveCommandersPhaseEvent } from './completeMoveCommandersPhase';
import type { CompletePlayCardsPhaseEvent } from './completePlayCardsPhase';
import type { CompleteResolveMeleePhaseEvent } from './completeResolveMeleePhase';
import type { CompleteUnitMovementEvent } from './completeUnitMovement';
import type { DiscardPlayedCardsEvent } from './discardPlayedCards';
import type { ResolveEngagementTypeEvent } from './resolveEngagementType';
import type { ResolveEngageRetreatOptionEvent } from './resolveEngageRetreatOption';
import type { ResolveFlankEngagementEvent } from './resolveFlankEngagement';
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
import type { StartEngagementEvent } from './startEngagement';

import { z } from 'zod';
import { completeCleanupPhaseEventSchema } from './completeCleanupPhase';
import { completeIssueCommandsPhaseEventSchema } from './completeIssueCommandsPhase';
import { completeMoveCommandersPhaseEventSchema } from './completeMoveCommandersPhase';
import { completePlayCardsPhaseEventSchema } from './completePlayCardsPhase';
import { completeResolveMeleePhaseEventSchema } from './completeResolveMeleePhase';
import { completeUnitMovementEventSchema } from './completeUnitMovement';
import { discardPlayedCardsEventSchema } from './discardPlayedCards';
import { resolveEngagementTypeEventSchema } from './resolveEngagementType';
import { resolveEngageRetreatOptionEventSchema } from './resolveEngageRetreatOption';
import { resolveFlankEngagementEventSchema } from './resolveFlankEngagement';
import { resolveInitiativeEventSchema } from './resolveInitiative';
import { resolveMeleeEventSchema } from './resolveMelee';
import { resolveRallyEventSchema } from './resolveRally';
import { resolveRangedAttackEventSchema } from './resolveRangedAttack';
import { resolveRetreatEventSchema } from './resolveRetreat';
import { resolveReverseEventSchema } from './resolveReverse';
import { resolveRoutEventSchema } from './resolveRout';
import { resolveRoutDiscardEventSchema } from './resolveRoutDiscard';
import { resolveUnitsBrokenEventSchema } from './resolveUnitsBroken';
import { revealCardsEventSchema } from './revealCards';
import { startEngagementEventSchema } from './startEngagement';

/** Iterable list of valid game effects. Built from individual event constants. */
export const gameEffects = [
  'completeCleanupPhase',
  'completeIssueCommandsPhase',
  'completeMoveCommandersPhase',
  'completePlayCardsPhase',
  'completeResolveMeleePhase',
  'discardPlayedCards',
  'resolveEngagementType',
  'resolveEngageRetreatOption',
  'resolveFlankEngagement',
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
  'completeUnitMovement',
  'startEngagement',
] as const;

/** Type for all valid game effect types. */
export type GameEffectType = (typeof gameEffects)[number];

/** The schema for a game effect type. */
export const gameEffectTypeSchema: z.ZodType<GameEffectType> =
  z.enum(gameEffects);

/**
 * Base union of all game effect events (unfiltered).
 * Used internally to create filtered types.
 */
type GameEffectEventUnion<TBoard extends Board> =
  | CompleteCleanupPhaseEvent<TBoard, 'completeCleanupPhase'>
  | CompleteIssueCommandsPhaseEvent<TBoard, 'completeIssueCommandsPhase'>
  | CompleteMoveCommandersPhaseEvent<TBoard, 'completeMoveCommandersPhase'>
  | CompletePlayCardsPhaseEvent<TBoard, 'completePlayCardsPhase'>
  | CompleteResolveMeleePhaseEvent<TBoard, 'completeResolveMeleePhase'>
  | DiscardPlayedCardsEvent<TBoard, 'discardPlayedCards'>
  | ResolveEngagementTypeEvent<TBoard, 'resolveEngagementType'>
  | ResolveEngageRetreatOptionEvent<TBoard, 'resolveEngageRetreatOption'>
  | ResolveFlankEngagementEvent<TBoard, 'resolveFlankEngagement'>
  | ResolveInitiativeEvent<TBoard, 'resolveInitiative'>
  | ResolveMeleeEvent<TBoard, 'resolveMelee'>
  | ResolveRallyEvent<TBoard, 'resolveRally'>
  | ResolveRangedAttackEvent<TBoard, 'resolveRangedAttack'>
  | ResolveRetreatEvent<TBoard, 'resolveRetreat'>
  | ResolveReverseEvent<TBoard, 'resolveReverse'>
  | ResolveRoutEvent<TBoard, 'resolveRout'>
  | ResolveRoutDiscardEvent<TBoard, 'resolveRoutDiscard'>
  | ResolveUnitsBrokenEvent<TBoard, 'resolveUnitsBroken'>
  | RevealCardsEvent<TBoard, 'revealCards'>
  | CompleteUnitMovementEvent<TBoard, 'completeUnitMovement'>
  | StartEngagementEvent<TBoard, 'startEngagement'>;

/**
 * Game effect event type filtered by effect type.
 * Extracts only the event type that matches the specified effectType.
 * This ensures type safety - GameEffectEvent<TBoard, 'resolveRally'> is ONLY ResolveRallyEvent.
 */
export type GameEffectEvent<
  TBoard extends Board,
  TGameEffectType extends GameEffectType,
> = Extract<GameEffectEventUnion<TBoard>, { effectType: TGameEffectType }>;

const _gameEffectEventSchemaObject = z.discriminatedUnion('effectType', [
  completeCleanupPhaseEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
  discardPlayedCardsEventSchema,
  resolveEngageRetreatOptionEventSchema,
  resolveFlankEngagementEventSchema,
  resolveInitiativeEventSchema,
  resolveMeleeEventSchema,
  resolveRallyEventSchema,
  resolveRangedAttackEventSchema,
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  resolveRoutDiscardEventSchema,
  resolveEngagementTypeEventSchema,
  resolveUnitsBrokenEventSchema,
  revealCardsEventSchema,
  completeUnitMovementEventSchema,
  startEngagementEventSchema,
]);

type GameEffectEventSchemaType = z.infer<typeof _gameEffectEventSchemaObject>;

// Verify manual type matches schema inference
const _assertExactGameEffect: AssertExact<
  GameEffectEvent<Board, GameEffectType>,
  GameEffectEventSchemaType
> = true;

/** The schema for a game effect event. */
export const gameEffectEventSchema: z.ZodType<
  GameEffectEvent<Board, GameEffectType>
> = _gameEffectEventSchemaObject;
