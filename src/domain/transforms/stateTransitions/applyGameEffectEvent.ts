/**
 * Routes game effect events to their corresponding apply functions.
 */

import type { GameEffectEvent } from '@events';
import type { GameState } from '@game';
import {
  applyCompleteAttackApplyEvent,
  applyRoundEndEvent,
  applyCompleteIssueCommandsPhaseEvent,
  applySkipLostCommanderMoveEvent,
  applyCompleteMeleeResolutionEvent,
  applyCompleteMoveCommandersPhaseEvent,
  applyCompleteMovementCommandEvent,
  applyCompletePlayCardsPhaseEvent,
  applyCompleteRangedAttackCommandEvent,
  applyCompleteRangedAttackEvent,
  applyCompleteResolveMeleePhaseEvent,
  applyCompleteUnitMovementEvent,
  applyCardsLeavePlayEvent,
  applyGameOverEvent,
  applyOpenRetreatFromAttackApplyEvent,
  applyOpenReverseFromAttackApplyEvent,
  applyOpenRoutFromAttackApplyEvent,
  applyOpenRetreatFromEngagementEvent,
  applyResolveEngageRetreatOptionEvent,
  applyResolveFlankEngagementEvent,
  applyResolveInitiativeEvent,
  applyResolveMeleeEvent,
  applyResolveRallyEvent,
  applyResolveRangedAttackEvent,
  applyResolveRetreatEvent,
  applyResolveReverseEvent,
  applyResolveRoutEvent,
  applyRevealCardsEvent,
  applyStartEngagementEvent,
  applyTriggerRoutFromRetreatEvent,
} from './applyEffects';

/**
 * Routes game effect events to their corresponding apply functions.
 * Generic over the game-state **object** (`S extends GameState`): same
 * visibility member out as in — once every leaf is also `<S extends GameState>`.
 * TODO(misleading): every apply below is already generic over `S`, so "once"
 * reads as a condition still to be met. Settle by rewording to say the
 * visibility carries through because every apply is generic.
 *
 * An effect is what the game owes rather than what a player chose: a
 * procedure built it from this same state, so it is trusted and carried out
 * as it stands. `applyEvent` is the one caller.
 *
 * @param event - The effect the game owed, as its procedure built it
 * @param state - The game it was built from, under any visibility
 * @returns The game with that effect carried out, under the same visibility
 * @throws Error when the effect is of no kind the game knows
 */
export function applyGameEffectEvent<S extends GameState>(
  event: GameEffectEvent,
  state: S,
): S {
  // Each kind of effect has one rule that carries it out, and the effect's
  // own kind picks it.
  switch (event.effectType) {
    case 'completeAttackApply': {
      return applyCompleteAttackApplyEvent(event, state);
    }
    case 'roundEnd': {
      return applyRoundEndEvent(event, state);
    }
    case 'completeIssueCommandsPhase': {
      return applyCompleteIssueCommandsPhaseEvent(event, state);
    }
    case 'skipLostCommanderMove': {
      return applySkipLostCommanderMoveEvent(event, state);
    }
    case 'completeMeleeResolution': {
      return applyCompleteMeleeResolutionEvent(event, state);
    }
    case 'completeMoveCommandersPhase': {
      return applyCompleteMoveCommandersPhaseEvent(event, state);
    }
    case 'completeMovementCommand': {
      return applyCompleteMovementCommandEvent(event, state);
    }
    case 'completePlayCardsPhase': {
      return applyCompletePlayCardsPhaseEvent(event, state);
    }
    case 'completeRangedAttack': {
      return applyCompleteRangedAttackEvent(event, state);
    }
    case 'completeRangedAttackCommand': {
      return applyCompleteRangedAttackCommandEvent(event, state);
    }
    case 'completeResolveMeleePhase': {
      // Every engagement has been fought; the effect carries nothing, so its
      // rule needs only the state.
      return applyCompleteResolveMeleePhaseEvent(state);
    }
    case 'completeUnitMovement': {
      return applyCompleteUnitMovementEvent(event, state);
    }
    case 'cardsLeavePlay': {
      return applyCardsLeavePlayEvent(event, state);
    }
    case 'gameOver': {
      return applyGameOverEvent(event, state);
    }
    case 'openRetreatFromAttackApply': {
      return applyOpenRetreatFromAttackApplyEvent(event, state);
    }
    case 'openReverseFromAttackApply': {
      return applyOpenReverseFromAttackApplyEvent(event, state);
    }
    case 'openRoutFromAttackApply': {
      return applyOpenRoutFromAttackApplyEvent(event, state);
    }
    case 'resolveInitiative': {
      return applyResolveInitiativeEvent(event, state);
    }
    case 'resolveRally': {
      return applyResolveRallyEvent(event, state);
    }
    case 'revealCards': {
      return applyRevealCardsEvent(event, state);
    }
    case 'resolveMelee': {
      return applyResolveMeleeEvent(event, state);
    }
    case 'resolveRangedAttack': {
      return applyResolveRangedAttackEvent(event, state);
    }
    case 'resolveRetreat': {
      return applyResolveRetreatEvent(event, state);
    }
    case 'resolveReverse': {
      return applyResolveReverseEvent(event, state);
    }
    case 'resolveRout': {
      return applyResolveRoutEvent(event, state);
    }
    case 'openRetreatFromEngagement': {
      return applyOpenRetreatFromEngagementEvent(event, state);
    }
    case 'resolveEngageRetreatOption': {
      return applyResolveEngageRetreatOptionEvent(event, state);
    }
    case 'resolveFlankEngagement': {
      return applyResolveFlankEngagementEvent(event, state);
    }
    case 'startEngagement': {
      return applyStartEngagementEvent(event, state);
    }
    case 'triggerRoutFromRetreat': {
      return applyTriggerRoutFromRetreatEvent(event, state);
    }
    default: {
      // Adding a kind of effect without routing it fails to compile here;
      // only an effect forged past its type reaches the throw.
      const _exhaustive: never = event;
      throw new Error(
        'Unreachable: unhandled game effect event (effectType not in switch)',
      );
    }
  }
}
