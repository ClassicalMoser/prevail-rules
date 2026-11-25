import type { GameEffectEvent, GameEffectType } from '@events';
import type { RandomSource } from '@utils';
import type { AuthoritativeGameState } from '@game';
import {
  generateCardsLeavePlayEvent,
  generateGameOverEvent,
  generateResolveInitiativeEvent,
  generateResolveRallyEvent,
  generateRevealCardsEvent,
} from './cards';
import {
  generateRoundEndEvent,
  generateCompleteIssueCommandsPhaseEvent,
  generateSkipLostCommanderMoveEvent,
  generateCompleteMoveCommandersPhaseEvent,
  generateCompletePlayCardsPhaseEvent,
  generateCompleteResolveMeleePhaseEvent,
} from './sequencing';
import {
  generateOpenRetreatFromAttackApplyEvent,
  generateOpenReverseFromAttackApplyEvent,
  generateOpenRoutFromAttackApplyEvent,
  generateResolveRetreatEvent,
  generateResolveReverseEvent,
  generateResolveRoutEvent,
  generateTriggerRoutFromRetreatEvent,
} from './defenseResult';
import {
  generateCompleteMovementCommandEvent,
  generateCompleteUnitMovementEvent,
  generateOpenRetreatFromEngagementEvent,
  generateResolveEngageRetreatOptionEvent,
  generateResolveFlankEngagementEvent,
  generateStartEngagementEvent,
} from './movement';
import {
  generateCompleteAttackApplyEvent,
  generateCompleteMeleeResolutionEvent,
  generateCompleteRangedAttackCommandEvent,
  generateCompleteRangedAttackEvent,
  generateResolveMeleeEvent,
  generateResolveRangedAttackEvent,
} from './resolveAttack';

/**
 * Generates a game effect event using the appropriate procedure
 * based on the effect type.
 * Procedures are not strictly deterministic (some draw at random); the event
 * (with results) is what makes it deterministically replayable. The draw is
 * taken from `random`, so a caller that fixes the source fixes the game.
 *
 * @param state - The current game state
 * @param effectType - The type of game effect to generate
 * @param random - The source any drawing procedure takes its draw from
 * @returns The generated game effect event with the specific type for the effect
 * @throws Error if the effect type doesn't have a procedure
 *
 * WARNING: Game state is trusted as internally consistent for this function.
 */
export function generateEventFromProcedure(
  state: AuthoritativeGameState,
  effectType: GameEffectType,
  random: RandomSource,
): GameEffectEvent {
  // One case per game effect, in the order a round meets them. Each hands the
  // state to the one procedure that builds that effect's event.
  switch (effectType) {
    // Round 0 and every round close here, and the next begins with Phase 1
    // (§4.5.4).
    case 'roundEnd': {
      const roundEnd = generateRoundEndEvent(state);
      return roundEnd;
    }

    // Phase 1: both face-down cards are turned over together (§4.1.2).
    // The cards go on the event, since a seat could not see the other's.
    case 'revealCards': {
      const revealCards = generateRevealCardsEvent(state);
      return revealCards;
    }

    // Phase 1: the lower revealed initiative takes the initiative, a tie
    // staying put (§4.1.3, §4.1.4).
    case 'resolveInitiative': {
      const resolveInitiative = generateResolveInitiativeEvent(state);
      return resolveInitiative;
    }

    // Phase 1 ends and the commanders move (§4.2).
    case 'completePlayCardsPhase': {
      const completePlayCardsPhase = generateCompletePlayCardsPhaseEvent(state);
      return completePlayCardsPhase;
    }

    // Phase 2: a player whose commander has fallen has nothing to move, so
    // their turn passes (§4.2.8).
    case 'skipLostCommanderMove': {
      const skipLostCommanderMove = generateSkipLostCommanderMoveEvent(state);
      return skipLostCommanderMove;
    }

    // Phase 2 ends and the orders begin, the first player first (§4.3).
    case 'completeMoveCommandersPhase': {
      const completeMoveCommandersPhase =
        generateCompleteMoveCommandersPhaseEvent(state);
      return completeMoveCommandersPhase;
    }

    // Phase 3: one unit's move is done, before the next unit begins (§4.3.9).
    // Nothing is measured, so the procedure reads no state.
    case 'completeUnitMovement': {
      const completeUnitMovement = generateCompleteUnitMovementEvent();
      return completeUnitMovement;
    }

    // Phase 3: a Move order is done once none of its units is left to move
    // (§4.3.9).
    case 'completeMovementCommand': {
      const completeMovementCommand = generateCompleteMovementCommandEvent();
      return completeMovementCommand;
    }

    // A move ended in an enemy's space, and the facings decide the kind of
    // engagement (§6.1.1, §6.3.1).
    case 'startEngagement': {
      const startEngagement = generateStartEngagementEvent(state);
      return startEngagement;
    }

    // A front engagement: whether the defender may fall back, and where to
    // (§6.3.2).
    case 'resolveEngageRetreatOption': {
      const resolveEngageRetreatOption =
        generateResolveEngageRetreatOptionEvent(state);
      return resolveEngageRetreatOption;
    }

    // A front-engaged defender chose to fall back; its retreats were recorded
    // when the option was worked out (§6.3.2).
    case 'openRetreatFromEngagement': {
      const openRetreatFromEngagement =
        generateOpenRetreatFromEngagementEvent();
      return openRetreatFromEngagement;
    }

    // A flank engagement turns the defender to face its attacker (§6.3.4).
    case 'resolveFlankEngagement': {
      const resolveFlankEngagement = generateResolveFlankEngagementEvent(state);
      return resolveFlankEngagement;
    }

    // Phase 3: a shot is measured against its target's thresholds (§4.3.11).
    case 'resolveRangedAttack': {
      const resolveRangedAttack = generateResolveRangedAttackEvent(state);
      return resolveRangedAttack;
    }

    // Phase 3: one shot of a Shoot order is done (§4.3.11).
    case 'completeRangedAttack': {
      const completeRangedAttack = generateCompleteRangedAttackEvent();
      return completeRangedAttack;
    }

    // Phase 3: a Shoot order is done once none of its units is left to shoot
    // (§4.3.11).
    case 'completeRangedAttackCommand': {
      const completeRangedAttackCommand =
        generateCompleteRangedAttackCommandEvent();
      return completeRangedAttackCommand;
    }

    // Phase 3 ends, and the event records every engaged space that will
    // fight in Phase 4 (§4.4.1).
    case 'completeIssueCommandsPhase': {
      const completeIssueCommandsPhase =
        generateCompleteIssueCommandsPhaseEvent(state);
      return completeIssueCommandsPhase;
    }

    // Phase 4: a melee is fought, each unit's attack against the other's
    // thresholds (§7.2.2).
    case 'resolveMelee': {
      const resolveMelee = generateResolveMeleeEvent(state);
      return resolveMelee;
    }

    // An attack's results are carried out a stage at a time: retreat, then
    // reverse, then rout (§7.5.2). These open each stage when its turn comes.
    case 'openRetreatFromAttackApply': {
      const openRetreatFromAttackApply =
        generateOpenRetreatFromAttackApplyEvent(state);
      return openRetreatFromAttackApply;
    }
    case 'openReverseFromAttackApply': {
      const openReverseFromAttackApply =
        generateOpenReverseFromAttackApplyEvent(state);
      return openReverseFromAttackApply;
    }
    case 'openRoutFromAttackApply': {
      const openRoutFromAttackApply =
        generateOpenRoutFromAttackApplyEvent(state);
      return openRoutFromAttackApply;
    }

    // A unit that must retreat and has nowhere to go routs instead (§9.1.6).
    case 'triggerRoutFromRetreat': {
      const triggerRoutFromRetreat = generateTriggerRoutFromRetreatEvent(state);
      return triggerRoutFromRetreat;
    }

    // A retreat is carried out along its path, with any commander in the
    // space (§9.1, §9.1.8).
    case 'resolveRetreat': {
      const resolveRetreat = generateResolveRetreatEvent(state);
      return resolveRetreat;
    }

    // A reversed unit turns about where it stands (§9.2).
    case 'resolveReverse': {
      const resolveReverse = generateResolveReverseEvent(state);
      return resolveReverse;
    }

    // A rout costs its owner Morale in cards from hand (§9.3.2, §9.3.3).
    case 'resolveRout': {
      const resolveRout = generateResolveRoutEvent(state);
      return resolveRout;
    }

    // Every stage an attack reached has been carried out, and its results
    // close (§7.5.2).
    case 'completeAttackApply': {
      const completeAttackApply = generateCompleteAttackApplyEvent(state);
      return completeAttackApply;
    }

    // Phase 4: one melee is fought out, and the first player names the next
    // (§4.4.2).
    case 'completeMeleeResolution': {
      const completeMeleeResolution = generateCompleteMeleeResolutionEvent();
      return completeMeleeResolution;
    }

    // Phase 4 ends once no engagement is left, and Cleanup begins (§4.5).
    case 'completeResolveMeleePhase': {
      const completeResolveMeleePhase =
        generateCompleteResolveMeleePhaseEvent(state);
      return completeResolveMeleePhase;
    }

    // Phase 5: both cards in play go to the played piles (§4.5.1).
    case 'cardsLeavePlay': {
      const cardsLeavePlay = generateCardsLeavePlayEvent(state);
      return cardsLeavePlay;
    }

    // Phase 5: a rally burns one played card at random (§10.3.2). This is
    // the one procedure that draws, so the only one handed the source.
    case 'resolveRally': {
      const resolveRally = generateResolveRallyEvent(state, random);
      return resolveRally;
    }

    // A hand has given out, a rout cannot be paid for, or an army is gone,
    // and the event names who prevailed (§11).
    case 'gameOver': {
      const gameOver = generateGameOverEvent(state);
      return gameOver;
    }

    default: {
      // Every game effect has a procedure, so the type leaves nothing here;
      // only a value the type forbids arrives.
      const _exhaustive: never = effectType;
      throw new Error(`No procedure exists for effect type: ${_exhaustive}`);
    }
  }
}
