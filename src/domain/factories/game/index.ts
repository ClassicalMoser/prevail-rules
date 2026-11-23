// Authoritative card state from up to two players' piles, black first.
export { createCardState } from './createCardState';

// A player's own card piles, every pile empty unless named.
export { createOwnedCardState } from './createOwnedCardState';

// Blank game for a mode: mode-sized board, empty piles, initiative black.
// TODO(misleading): says initiative black, but `createEmptyGameState` gives
// white the initiative (§3.3.2). Settled by correcting this line.
export { createEmptyGameState } from './createEmptyGameState';

// New game from both armies: that shell, dealt hands, reserved instances.
export { createInitialGameState } from './createInitialGameState';
