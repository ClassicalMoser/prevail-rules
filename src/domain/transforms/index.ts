// The writers other layers may call, each changing one slice of the state.
// A game moves on only through `applyEvent`; the writers are here for
// fixtures, for the bot imagining a board, for the view of the game each seat
// is sent, and for packages built on these rules (`src/domain/index.ts`).
export {
  // The game as it stands, a whole slice at a time.
  // The current phase replaced, whatever phase it is.
  updatePhaseState,
  // The round replaced: its number, its phase, what it has recorded.
  updateRoundState,
  // A finished phase added to the round's record.
  addCompletedPhase,
  // A phase moved to its `complete` step.
  markPhaseAsComplete,
  // The side holding the initiative for the round (§4.1.5).
  updateCurrentInitiative,
  // The side that prevailed, once the battle is over (§11).
  updateWinner,

  // Units. Those that take the game change the board and its index
  // together; those that take a board alone are for a board built outright.
  // A unit set on a board.
  addUnitToBoard,
  // A unit lifted off a board.
  removeUnitFromBoard,
  // A unit deployed from reserve onto the board (§3.5).
  deployUnit,
  // A unit moved from where it stands to a new space and facing.
  moveUnitOnBoard,
  // A unit moved into a lone enemy's space, the two engaged (§6.1.1).
  moveUnitIntoEngagement,
  // A unit routed: off the board and out of the game (§9.3.1).
  routUnit,
  // Units ordered this round, so none is ordered twice (§4.3.6).
  addUnitsToCommandedUnits,

  // Commanders, the same way.
  // A commander set on a board.
  addCommanderToBoard,
  // A commander lifted off a board.
  removeCommanderFromBoard,
  // A commander placed at deployment (§3.5.3).
  deployCommander,
  // A commander moved to another space (§4.2).
  moveCommanderOnBoard,
  // A commander defeated with its unit (§4.2.8).
  defeatCommander,

  // Cards, as each seat holds them.
  // The whole card state replaced.
  replaceCardState,
  // One player's cards changed, whether this view sees them or only counts them.
  updatePlayerCards,
  // One player's cards replaced where this view can see them.
  updatePlayerCardState,
  // One player's seen cards written into a card state.
  replaceOwnedPlayerCardState,
  // One player's unseen cards written into a card state.
  replaceHiddenPlayerCardState,
  // A seen hand turned into what a seat that cannot see it holds.
  toHiddenCardState,
  // A face-down card laid from a hand this view cannot see (§4.1.1).
  chooseHiddenCard,
  // A player's face-down card turned over into play (§4.1.2).
  revealCard,
  // An unseen face-down card turned over, its identity from the event.
  revealHiddenCard,
  // Both face-down cards turned over together (§4.1.2).
  revealBothAwaitingCards,
  // A player's card in play put on their played pile (§4.5.1).
  moveCardToPlayed,
  // Both cards in play put on their played piles (§4.5.1).
  moveBothInPlayToPlayed,
  // Cards discarded from a seen hand, for a commitment or a rout (§8, §9.3).
  discardCardsFromHand,
  // A card discarded from an unseen hand, the card shown as it goes.
  discardShownCardFromHiddenHand,
  // A seen player's played card burnt at a rally (§10.3.2).
  burnCardFromPlayed,
  // An unseen player's played card burnt at a rally; the pile is face up.
  burnHiddenCardFromPlayed,
  // A seen player's played and discarded cards back in hand (§10.3.2).
  returnCardsToHand,
  // An unseen player's played and discarded cards back in hand, face down.
  returnHiddenCardsToHand,

  // The steps of each phase.
  // Phase 1 moved to a step.
  updatePlayCardsStep,
  // Phase 2 moved to a step.
  updateMoveCommandersStep,
  // Phase 3 moved to a step.
  updateIssueCommandsStep,
  // Cleanup moved to a step.
  updateCleanupStep,

  // Phase 3: orders issued and carried out.
  // A player's orders issued, and their units to carry out next (§4.3).
  beginResolvingCommands,
  // The units a player still has to carry out.
  updateRemainingUnitsForPlayer,
  // One unit's move or shot begun (§4.3.9).
  openCommandResolution,
  // The move or shot under way replaced.
  updateCommandResolutionState,
  // The move or shot under way ended.
  clearCommandResolution,
  // A player's orders all carried out.
  finishResolvingCommands,
  // A front engagement's settlement changed (§6.3.2).
  updateFrontEngagementResolutionState,
  // A flank engagement's settlement changed (§6.3.4).
  updateFlankEngagementResolutionState,
  // A rear engagement's settlement changed (§6.3.3).
  updateRearEngagementResolutionState,
  // The engagement a move began, finished.
  completeEngagementInMovement,

  // Phase 4: each engagement fought in turn.
  // The melee at a space begun (§4.4.2).
  openMeleeResolution,
  // The melee under way replaced.
  updateMeleeResolutionState,
  // The melee under way ended, so the next may be chosen.
  clearMeleeResolution,

  // What an attack did to a unit, carried out a stage at a time (§7.5).
  // The result of an attack on a unit, as it is carried out.
  updateAttackApplyState,
  // The result of a melee blow on one player's unit.
  updateMeleeAttackApplyState,
  // A retreat under way (§9.1).
  updateRetreatState,
  // The rout a retreat with nowhere to go becomes (§9.1.6).
  updateRetreatRoutState,
  // A reverse under way (§9.2).
  updateReverseState,
  // A rout under way and its Morale owed (§9.3).
  updateRoutState,

  // Cleanup.
  // One player's rally (§10.3).
  updateRallyResolutionState,

  // What each seat may see (§1.4).
  // The game state as one seat or a spectator may see it.
  projectGameStateForVisibility,
  // The whole game, record and state, as one viewer may see it.
  projectGameForVisibility,
  // One event as one viewer may see it.
  projectEventForVisibility,
} from './pureTransforms';
// The engine: an event applied to the state, returning the next state.
export { applyEvent } from './stateTransitions';
