// Cards: played, revealed, put away, rallied; and the end of the battle.
export {
  // Both face-down cards turned over into play (§4.1.2).
  applyRevealCardsEvent,
  // The side that won the initiative recorded (§4.1.3).
  applyResolveInitiativeEvent,
  // Both cards in play put on their played piles (§4.5.1).
  applyCardsLeavePlayEvent,
  // A rally's burn, and every other card back in hand (§10.3.2).
  applyResolveRallyEvent,
  // The side that prevailed, recorded (§11).
  applyGameOverEvent,
} from './cards';
// The round moving from one phase to the next.
export {
  // Phase 1 done, and the commanders to move.
  applyCompletePlayCardsPhaseEvent,
  // A defeated commander's turn passed over (§4.2.8).
  applySkipLostCommanderMoveEvent,
  // Phase 2 done, and orders to issue.
  applyCompleteMoveCommandersPhaseEvent,
  // Phase 3 done, and every engaged space to fight.
  applyCompleteIssueCommandsPhaseEvent,
  // Phase 4 done, and Cleanup to begin.
  applyCompleteResolveMeleePhaseEvent,
  // The round over, and the next begun.
  applyRoundEndEvent,
} from './sequencing';
// A move carried out, and the engagement it may start (§5, §6).
export {
  // A unit's move finished where it ends.
  applyCompleteUnitMovementEvent,
  // An engagement begun as a move enters an enemy's space (§6.1).
  applyStartEngagementEvent,
  // A flank engagement settled: the defender turned to face (§6.3.4).
  applyResolveFlankEngagementEvent,
  // The retreats a front-engaged defender may make, recorded (§6.3.2).
  applyResolveEngageRetreatOptionEvent,
  // The retreat of a defender that chose to fall back, opened (§6.3.2).
  applyOpenRetreatFromEngagementEvent,
  // A Move order ended once none of its units is left to move.
  applyCompleteMovementCommandEvent,
} from './movement';
// An attack measured, its results carried out, and the attack closed (§7).
export {
  // A shot measured against its target (§7.4).
  applyResolveRangedAttackEvent,
  // A melee measured, both blows at once (§7.2).
  applyResolveMeleeEvent,
  // An attack's results all carried out on a unit.
  applyCompleteAttackApplyEvent,
  // One shot of a Shoot order finished.
  applyCompleteRangedAttackEvent,
  // A Shoot order ended once no shooter can be chosen.
  applyCompleteRangedAttackCommandEvent,
  // A melee finished, so the next may be chosen (§4.4.2).
  applyCompleteMeleeResolutionEvent,
} from './resolveAttack';
// What an attack did to a unit: retreat, reverse, rout (§9).
export {
  // A retreat opened on a unit the attack reached (§9.1).
  applyOpenRetreatFromAttackApplyEvent,
  // A retreat carried out along its path (§9.1).
  applyResolveRetreatEvent,
  // A retreat with nowhere to go turned into a rout (§9.1.6).
  applyTriggerRoutFromRetreatEvent,
  // A reverse opened on a unit the attack reached (§9.2).
  applyOpenReverseFromAttackApplyEvent,
  // A reverse carried out (§9.2.1).
  applyResolveReverseEvent,
  // A rout opened on a unit the attack reached (§9.3).
  applyOpenRoutFromAttackApplyEvent,
  // A rout's Morale owed, recorded (§9.3.2).
  applyResolveRoutEvent,
} from './defenseResult';
