import type { GameState, StandardBoard } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import { createEmptyGameState } from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyCompleteAttackApplyEvent,
  applyCompleteCleanupPhaseEvent,
  applyCompleteIssueCommandsPhaseEvent,
  applyCompleteMeleeResolutionEvent,
  applyCompleteMoveCommandersPhaseEvent,
  applyCompletePlayCardsPhaseEvent,
  applyCompleteRangedAttackCommandEvent,
  applyCompleteResolveMeleePhaseEvent,
  applyCompleteUnitMovementEvent,
  applyDiscardPlayedCardsEvent,
  applyResolveEngageRetreatOptionEvent,
  applyResolveFlankEngagementEvent,
  applyResolveInitiativeEvent,
  applyResolveMeleeEvent,
  applyResolveRallyEvent,
  applyResolveRangedAttackEvent,
  applyResolveRetreatEvent,
  applyResolveReverseEvent,
  applyResolveRoutEvent,
  applyResolveUnitsBrokenEvent,
  applyRevealCardsEvent,
  applyStartEngagementEvent,
  applyTriggerRoutFromRetreatEvent,
} from './applyEffects';
import { applyGameEffectEvent } from './applyGameEffectEvent';

vi.mock('./applyEffects', () => ({
  applyCompleteAttackApplyEvent: vi.fn(),
  applyCompleteCleanupPhaseEvent: vi.fn(),
  applyCompleteIssueCommandsPhaseEvent: vi.fn(),
  applyCompleteMeleeResolutionEvent: vi.fn(),
  applyCompleteMoveCommandersPhaseEvent: vi.fn(),
  applyCompletePlayCardsPhaseEvent: vi.fn(),
  applyCompleteRangedAttackCommandEvent: vi.fn(),
  applyCompleteResolveMeleePhaseEvent: vi.fn(),
  applyCompleteUnitMovementEvent: vi.fn(),
  applyDiscardPlayedCardsEvent: vi.fn(),
  applyResolveEngageRetreatOptionEvent: vi.fn(),
  applyResolveFlankEngagementEvent: vi.fn(),
  applyResolveInitiativeEvent: vi.fn(),
  applyResolveMeleeEvent: vi.fn(),
  applyResolveRallyEvent: vi.fn(),
  applyResolveRangedAttackEvent: vi.fn(),
  applyResolveRetreatEvent: vi.fn(),
  applyResolveReverseEvent: vi.fn(),
  applyResolveRoutEvent: vi.fn(),
  applyResolveUnitsBrokenEvent: vi.fn(),
  applyRevealCardsEvent: vi.fn(),
  applyStartEngagementEvent: vi.fn(),
  applyTriggerRoutFromRetreatEvent: vi.fn(),
}));

/** Router passes (event, state); handlers share this signature. */
type ApplyGameEffectHandler = (
  event: GameEffectEvent<StandardBoard, GameEffectType>,
  state: GameState<StandardBoard>,
) => GameState<StandardBoard>;

const gameEffectCases: ReadonlyArray<[GameEffectType, ApplyGameEffectHandler]> =
  [
    ['completeAttackApply', applyCompleteAttackApplyEvent],
    ['completeCleanupPhase', applyCompleteCleanupPhaseEvent],
    ['completeIssueCommandsPhase', applyCompleteIssueCommandsPhaseEvent],
    ['completeMeleeResolution', applyCompleteMeleeResolutionEvent],
    ['completeMoveCommandersPhase', applyCompleteMoveCommandersPhaseEvent],
    ['completePlayCardsPhase', applyCompletePlayCardsPhaseEvent],
    ['completeRangedAttackCommand', applyCompleteRangedAttackCommandEvent],
    ['completeResolveMeleePhase', applyCompleteResolveMeleePhaseEvent],
    ['completeUnitMovement', applyCompleteUnitMovementEvent],
    ['discardPlayedCards', applyDiscardPlayedCardsEvent],
    ['resolveEngageRetreatOption', applyResolveEngageRetreatOptionEvent],
    ['resolveFlankEngagement', applyResolveFlankEngagementEvent],
    ['resolveInitiative', applyResolveInitiativeEvent],
    ['resolveMelee', applyResolveMeleeEvent],
    ['resolveRally', applyResolveRallyEvent],
    ['resolveRangedAttack', applyResolveRangedAttackEvent],
    ['resolveRetreat', applyResolveRetreatEvent],
    ['resolveReverse', applyResolveReverseEvent],
    ['resolveRout', applyResolveRoutEvent],
    ['resolveUnitsBroken', applyResolveUnitsBrokenEvent],
    ['revealCards', applyRevealCardsEvent],
    ['startEngagement', applyStartEngagementEvent],
    ['triggerRoutFromRetreat', applyTriggerRoutFromRetreatEvent],
  ] as ReadonlyArray<[GameEffectType, ApplyGameEffectHandler]>;

/**
 * `applyGameEffectEvent` is a typed switch: every `GameEffectType` routes to exactly one
 * `applyEffects/*` handler, all invoked as `(event, state) => nextState`.
 */
describe('applyGameEffectEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(gameEffectCases)(
    'given gameEffect with effectType %s, delegates to matching handler and returns its state',
    (effectType, handler) => {
      const state = createEmptyGameState();
      const event = {
        eventType: 'gameEffect',
        effectType,
      } as GameEffectEvent<StandardBoard, GameEffectType>;
      vi.mocked(handler).mockReturnValue(state);

      const result = applyGameEffectEvent(event, state);

      expect(handler).toHaveBeenCalledWith(event, state);
      expect(result).toBe(state);
    },
  );

  it('given gameEffect with bogus effectType cast, throws unhandled game effect', () => {
    const state = createEmptyGameState();
    const event = {
      eventType: 'gameEffect',
      effectType: 'unknown',
    } as unknown as GameEffectEvent<StandardBoard, GameEffectType>;

    expect(() => applyGameEffectEvent(event, state)).toThrow(
      'Unreachable: unhandled game effect event (effectType not in switch)',
    );
  });
});
