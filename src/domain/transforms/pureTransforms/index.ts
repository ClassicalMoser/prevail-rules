// One unit's or one commander's entry in the index, overwritten: shared
// steps of the piece writers.
export { fileCommanderInIndex, fileUnitInIndex } from './gameStateIndex';
// Cards: one step of a card's way through a round, for a hand in view and
// for one held face down, and the writers that put the result back.
export {
  chooseCard,
  chooseHiddenCard,
  revealCard,
  revealHiddenCard,
  revealBothAwaitingCards,
  discardCardsFromHand,
  discardShownCardFromHiddenHand,
  moveCardToPlayed,
  moveBothInPlayToPlayed,
  burnCardFromPlayed,
  burnHiddenCardFromPlayed,
  returnCardsToHand,
  returnHiddenCardsToHand,
  toHiddenCardState,
  replaceOwnedPlayerCardState,
  replaceHiddenPlayerCardState,
  replaceCardState,
  updatePlayerCards,
  updatePlayerCardState,
} from './cards';
// What one viewer may see of the game, its events and its state.
export {
  projectEventForVisibility,
  projectGameForVisibility,
  projectGameStateForVisibility,
} from './visibility';
// Commanders: placed, moved, carried with a unit and defeated, with the
// board and the index kept in step.
export {
  addCommanderToBoard,
  carryRidingCommander,
  defeatCommander,
  defeatCommanderWithRoutedUnit,
  deployCommander,
  moveCommanderOnBoard,
  removeCommanderFromBoard,
} from './commanders';
// Where the game is in its sequence: each phase step and each substep
// opened, written and closed.
export {
  updateAttackApplyState,
  updateCommandResolutionState,
  updateEngagementStateInMovement,
  updateMeleeAttackApplyState,
  updateMeleeResolutionState,
  updateRetreatRoutState,
  updateRetreatState,
  updateCleanupStep,
  updatePlayCardsStep,
  updateRallyResolutionState,
  updateReverseState,
  settleRout,
  updateRoutState,
  updateFrontEngagementResolutionState,
  updateFlankEngagementResolutionState,
  updateRearEngagementResolutionState,
  completeEngagementInMovement,
  openMeleeResolution,
  clearMeleeResolution,
  updateMoveCommandersStep,
  updateRemainingUnitsForPlayer,
  updateIssueCommandsStep,
  openCommandResolution,
  clearCommandResolution,
  beginResolvingCommands,
  finishResolvingCommands,
} from './sequencing';
// The game state's top-level slots: phase, round, initiative and winner.
export {
  addCompletedPhase,
  markPhaseAsComplete,
  updateCurrentInitiative,
  updatePhaseState,
  updateRoundState,
  updateWinner,
} from './state';
// Units: placed, moved, engaged and routed, with the board and the index
// kept in step.
export {
  addUnitsToCommandedUnits,
  addUnitToBoard,
  addEngagingUnitToBoard,
  deployUnit,
  moveUnitIntoEngagement,
  moveUnitOnBoard,
  removeUnitFromBoard,
  removeUnitsLeavingUnderRout,
  routUnit,
} from './units';
