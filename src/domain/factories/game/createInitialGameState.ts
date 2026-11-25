import type { Army, PlayerSide, UnitInstance } from '@entities';
import type { GameModeName } from '@ruleValues';
import type {
  AuthoritativeGameState,
  UnitIndexEntry,
  UnitIndexKey,
} from '@game';

import { createUnitIndexKey, createUnitInstance } from '@factories/unit';
import { createCardState } from './createCardState';
import { createEmptyGameState } from './createEmptyGameState';
import { createOwnedCardState } from './createOwnedCardState';

/**
 * One army's units as pieces to place: an instance of each, numbered from 1
 * within its type.
 */
function reserveArmy(playerSide: PlayerSide, army: Army): UnitInstance[] {
  const pieces: UnitInstance[] = [];

  // Each entry is one unit type, with how many of it the army brings.
  for (const { count, unitType } of army.units) {
    // Every one of those is its own piece on the table, numbered from 1
    // within its type.
    for (let instanceNumber = 1; instanceNumber <= count; instanceNumber++) {
      pieces.push(createUnitInstance(playerSide, unitType, instanceNumber));
    }
  }

  // Every piece the army brought, ready to wait in reserve.
  return pieces;
}

/**
 * Builds a `GameState` for a new game: empty board and round state,
 * unit instances from each {@link Army} in reserve,
 * and each army's command cards dealt into that side's hand.
 *
 * Instance numbers are 1-indexed (`1..count`) since instance
 * numbers may face users.
 */
export function createInitialGameState(options: {
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
}): AuthoritativeGameState {
  const { whiteArmy, blackArmy } = options;

  // The mode catalog says which board a mode is played on, and an unknown mode
  // is refused there, so every mode starts from the same empty game: that
  // board with empty piles. Hands and reserves are filled below.
  const emptyGameState = createEmptyGameState(options.gameMode);

  // An army is a list of unit types with a count of each. Every one of those
  // units is a separate piece to be placed, so each gets its own instance.
  // Numbering from 1 per type is how a unit of that type is told apart from
  // its siblings, and `eachUnitPresentOnce` rebuilds the same list to check
  // that every unit is accounted for.
  const reservedUnits = [
    ...reserveArmy('white', whiteArmy),
    ...reserveArmy('black', blackArmy),
  ];

  // Every one of those units is in reserve, and the index says so by name.
  // Nothing is on the board yet, and the commanders are still in reserve as
  // the empty game has them.
  const unitsInReserve: Record<UnitIndexKey, UnitIndexEntry> = {};
  for (const unit of reservedUnits) {
    unitsInReserve[createUnitIndexKey(unit)] = 'reserved';
  }

  // The army's command cards are the hand it takes into battle, and the
  // hand is its will to fight: a side whose hand is empty has lost. Each side's
  // cards go into its own hand; every other pile starts empty.
  const cardState = createCardState({
    black: createOwnedCardState({ inHand: [...blackArmy.commandCards] }),
    white: createOwnedCardState({ inHand: [...whiteArmy.commandCards] }),
  });

  // The empty game's index, with every unit now filed as reserved.
  const index = { ...emptyGameState.index, units: unitsInReserve };

  // All units start out in reserve, awaiting setup. Neither side has a unit
  // on the board until it is placed in the setup phase.
  const initialGameState: AuthoritativeGameState = {
    ...emptyGameState,
    cardState,
    index,
    reservedUnits,
  };
  return initialGameState;
}
