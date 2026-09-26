// Empty large board: plain spaces, no units.
export { createEmptyLargeBoard } from './board';

// Empty small board: plain spaces, no units.
export { createEmptySmallBoard } from './board';

// Empty standard board: plain spaces, no units.
export { createEmptyStandardBoard } from './board';

// Blank game for a mode: mode-sized board, empty piles, initiative black.
export { createEmptyGameState } from './game';

// New game from both armies: empty shell, dealt hands, reserved instances.
export { createInitialGameState } from './game';

// Unit instance from side, unit type, and instance number.
export { createUnitInstance } from './unit';
