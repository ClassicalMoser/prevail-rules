import type { Army, GameModeName } from '@entities';
import type { GameState } from '@game';

import { createEmptyGameState } from '@transforms/initializations';
import { createUnitInstance } from '@factories';

/**
 * Builds a {@link GameState} for a new game: empty board and round state,
 * unit instances from each {@link Army} in {@link GameState.reservedUnits},
 * and each army's command cards dealt into that side's `inHand`.
 *
 * Instance numbers are 1-indexed (`1..count`) to match {@link eachUnitPresentOnce}.
 */
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
      reservedUnits.push(createUnitInstance('white', unit.unitType, i));
    }
  }
  for (const unit of blackArmy.units) {
    for (let i = 1; i <= unit.count; i++) {
      reservedUnits.push(createUnitInstance('black', unit.unitType, i));
    }
  }

  if (emptyGameState.cardState.visibility !== 'authoritative') {
    throw new Error('createInitialGameState requires authoritative card state');
  }

  return {
    ...emptyGameState,
    cardState: {
      visibility: 'authoritative',
      black: {
        ...emptyGameState.cardState.black,
        inHand: [...blackArmy.commandCards],
      },
      white: {
        ...emptyGameState.cardState.white,
        inHand: [...whiteArmy.commandCards],
      },
    },
    reservedUnits,
  };
}
