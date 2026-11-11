// Empty small board: plain spaces, no units.
export { createEmptySmallBoard } from './board';

// Empty standard board: plain spaces, no units.
export { createEmptyStandardBoard } from './board';

// Empty large board: plain spaces, no units.
export { createEmptyLargeBoard } from './board';

// Each board size's rows, columns, and the spaces they name.
export {
  largeCoordinateLayout,
  smallCoordinateLayout,
  standardCoordinateLayout,
} from './board';

// The layout for a board's size.
export { getCoordinateLayout } from './board';

// Blank game for a mode: mode-sized board, empty piles, initiative black.
export { createEmptyGameState } from './game';

// New game from both armies: empty shell, dealt hands, reserved instances.
export { createInitialGameState } from './game';

// A player's own card piles, every pile empty unless named.
export { createOwnedCardState } from './game';

// Authoritative card state from up to two players' piles, black first.
export { createCardState } from './game';

// Player choice events, each with its fixed eventType and choiceType filled in.
export { createAssignUnitSupportEvent } from './playerChoices';
export { createChooseCardEvent } from './playerChoices';
export { createChooseMeleeResolutionEvent } from './playerChoices';
export { createChooseRallyEvent } from './playerChoices';
export { createChooseRetreatOptionEvent } from './playerChoices';
export { createChooseRoutDiscardEvent } from './playerChoices';
export { createChooseWhetherToRetreatEvent } from './playerChoices';
export { createCommitToMeleeEvent } from './playerChoices';
export { createCommitToMovementEvent } from './playerChoices';
export { createCommitToRangedAttackEvent } from './playerChoices';
export { createCommitToRangedDefenseEvent } from './playerChoices';
export { createDoneIssuingCommandsEvent } from './playerChoices';
export { createIssueCommandEvent } from './playerChoices';
export { createMoveCommanderEvent } from './playerChoices';
export { createChooseMovingUnitEvent } from './playerChoices';
export { createMoveUnitEvent } from './playerChoices';
export { createChooseShooterEvent } from './playerChoices';
export { createPerformRangedAttackEvent } from './playerChoices';
export { createSetupUnitsEvent } from './playerChoices';

// Placement from a coordinate and a facing.
export { createUnitPlacement } from './unitLocation';

// Unit instance from side, unit type, and instance number.
export { createUnitInstance } from './unit';

// The attack-apply an attack leaves behind, with each outcome due or bypassed.
export {
  createAttackApplyState,
  createOpenedMeleeResolutionState,
  createOpenedRetreatState,
  createOpenedRoutState,
} from './substeps';
