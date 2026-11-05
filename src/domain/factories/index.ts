// Empty small board: plain spaces, no units.
export { createEmptySmallBoard } from './board';

// Empty standard board: plain spaces, no units.
export { createEmptyStandardBoard } from './board';

// Empty large board: plain spaces, no units.
export { createEmptyLargeBoard } from './board';

// Blank game for a mode: mode-sized board, empty piles, initiative black.
export { createEmptyGameState } from './game';

// New game from both armies: empty shell, dealt hands, reserved instances.
export { createInitialGameState } from './game';

// A player's own card piles, every pile empty unless named.
export { createOwnedCardState } from './game';

// Authoritative card state from up to two players' piles, black first.
export { createCardState } from './game';

// Placement from a coordinate and a facing.
export { createUnitPlacement } from './unitLocation';

// Unit instance from side, unit type, and instance number.
export { createUnitInstance } from './unit';
