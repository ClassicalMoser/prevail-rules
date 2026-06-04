import type {
  Army,
  GameModeName,
  LargeBoard,
  SmallBoard,
  StandardBoard,
} from '@entities';
import type { GameState, GameStateForBoard } from '@game';

import {
  createEmptyGameState,
  createUnitInstance,
} from '@transforms/initializations';

/**
 * Builds a {@link GameState} for a new game: empty board and round state, white initiative,
 * units from each {@link Army} in {@link GameState.reservedUnits}, and each army's command
 * cards in that player's hand (`cardState.*.inHand`).
 */
export function createInitialGameState(
  options:
    | {
        gameMode: 'tutorial';
        whiteArmy: Army;
        blackArmy: Army;
      }
    | {
        gameMode: 'mini';
        whiteArmy: Army;
        blackArmy: Army;
      },
): GameStateForBoard<SmallBoard>;
export function createInitialGameState(options: {
  gameMode: 'standard';
  whiteArmy: Army;
  blackArmy: Army;
}): GameStateForBoard<StandardBoard>;
export function createInitialGameState(options: {
  gameMode: 'epic';
  whiteArmy: Army;
  blackArmy: Army;
}): GameStateForBoard<LargeBoard>;
export function createInitialGameState(options: {
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
}): GameState {
  const { whiteArmy, blackArmy } = options;

  let emptyGameState;
  switch (options.gameMode) {
    case 'tutorial': {
      emptyGameState = createEmptyGameState(options.gameMode);
      break;
    }
    case 'mini': {
      emptyGameState = createEmptyGameState(options.gameMode);
      break;
    }
    case 'standard': {
      emptyGameState = createEmptyGameState(options.gameMode);
      break;
    }
    case 'epic': {
      emptyGameState = createEmptyGameState(options.gameMode);
      break;
    }
    default: {
      const _exhaustive: never = options.gameMode;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }

  const reservedUnits = [];
  for (const unit of whiteArmy.units) {
    for (let i = 1; i <= unit.count; i++) {
      reservedUnits.push(createUnitInstance('white', unit.unitType, i + 1));
    }
  }
  for (const unit of blackArmy.units) {
    for (let i = 1; i <= unit.count; i++) {
      reservedUnits.push(createUnitInstance('black', unit.unitType, i + 1));
    }
  }

  const gameStateWithReservedUnits = {
    ...emptyGameState,
    reservedUnits,
  };

  return gameStateWithReservedUnits;
}
