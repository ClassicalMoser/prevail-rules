import { createEmptyGameState, createSetupUnitsEvent } from '@factories';
import { getCommanderSpace, getUnitWithPlacementOnBoard } from '@queries';
import { createUnitWithPlacement, withReservedUnits } from '@testing';

import { applySetupUnitsEvent } from './applySetupUnitsEvent';

/**
 * Pre-game setup: each `setupUnits` choice merges unit placements and the
 * commander into `boardState`, and clears those units from reserve. Round 0
 * ends with its own `roundEnd`, not here.
 */
describe('applySetupUnitsEvent function', () => {
  // White holds the initiative in a new game and so deploys first; black
  // deploys second (§3.5.4). Each has one unit waiting in reserve.
  const whiteUnit = createUnitWithPlacement({
    coordinate: 'B-5',
    facing: 'south',
    playerSide: 'white',
  });
  const blackUnit = createUnitWithPlacement({
    coordinate: 'K-5',
    facing: 'north',
    playerSide: 'black',
  });

  it('places a side’s last reserved unit and its commander, and leaves round 0 for its roundEnd', () => {
    // Black's unit is the last in reserve.
    const state = withReservedUnits(createEmptyGameState('standard'), [
      blackUnit.unit,
    ]);

    // Black deploys its unit, with its commander on the same space (§3.5.3).
    const newState = applySetupUnitsEvent(
      createSetupUnitsEvent({
        commanderCoordinate: 'K-5',
        player: 'black',
        unitPlacements: [blackUnit],
      }),
      state,
    );

    // The unit stands where black put it, facing the way black chose
    // (§3.5.1), and the reserve is empty…
    expect(getUnitWithPlacementOnBoard(newState, blackUnit.unit)).toStrictEqual(
      blackUnit,
    );
    expect(newState.reservedUnits).toStrictEqual([]);
    // …the commander shares the unit's space…
    expect(getCommanderSpace('black', newState)).toBe('K-5');
    // Setup stays round 0, with no phase begun, until round 0 ends with its
    // own roundEnd.
    expect(newState.currentRoundState.roundNumber).toBe(0);
    expect(newState.currentRoundState.currentPhaseState).toBe('none');
  });

  it("deploys only the deploying side's units, and leaves the other side's in reserve", () => {
    // Both armies wait; white deploys first.
    const state = withReservedUnits(createEmptyGameState('standard'), [
      whiteUnit.unit,
      blackUnit.unit,
    ]);

    // White's commander stands on a space of its own.
    const newState = applySetupUnitsEvent(
      createSetupUnitsEvent({
        commanderCoordinate: 'B-6',
        player: 'white',
        unitPlacements: [whiteUnit],
      }),
      state,
    );

    // Black's army still waits to deploy; setup is still round 0.
    expect(newState.reservedUnits).toStrictEqual([blackUnit.unit]);
    expect(newState.currentRoundState.roundNumber).toBe(0);
    expect(newState.currentRoundState.currentPhaseState).toBe('none');
    // White's commander is on its own space, not on its unit's.
    expect(getCommanderSpace('white', newState)).toBe('B-6');
  });

  it('leaves the state it was given unchanged', () => {
    const state = withReservedUnits(createEmptyGameState('standard'), [
      blackUnit.unit,
    ]);
    const originalBoardRef = state.boardState;

    applySetupUnitsEvent(
      createSetupUnitsEvent({
        commanderCoordinate: 'K-5',
        player: 'black',
        unitPlacements: [blackUnit],
      }),
      state,
    );

    // The original board is the same object, and the unit still waits in
    // reserve.
    expect(state.boardState).toBe(originalBoardRef);
    expect(state.reservedUnits).toStrictEqual([blackUnit.unit]);
  });
});
