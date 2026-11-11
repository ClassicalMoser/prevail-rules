import { createUnitWithPlacement } from '@testing';

import { applySetupUnitsEvent } from './applySetupUnitsEvent';

import { createEmptyGameState, createSetupUnitsEvent } from '@factories';
/**
 * Pre-game setup: each `setupUnits` choice merges unit placements and the
 * commander into `boardState`, and clears those units from reserve. Round 0
 * ends with its own `roundEnd`, not here.
 */
describe('applySetupUnitsEvent function', () => {
  it('places a side’s last reserved unit and its commander, and leaves round 0 for its roundEnd', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = {
      ...createEmptyGameState('standard'),
      reservedUnits: [unitWithPlacement.unit],
    };

    const event = createSetupUnitsEvent({
      commanderCoordinate: 'E-5',
      player: 'black',
      unitPlacements: [unitWithPlacement],
    });

    const newState = applySetupUnitsEvent(event, state);

    const presence = newState.boardState.board['E-5']?.unitPresence;
    expect(presence?.presenceType).toBe('single');
    if (presence?.presenceType !== 'single') {
      return;
    }
    expect(presence.unit.playerSide).toBe('black');
    expect(presence.facing).toBe('north');
    expect(newState.boardState.board['E-5']?.commanders).toStrictEqual([
      'black',
    ]);
    expect(newState.reservedUnits).toStrictEqual([]);
    // Setup stays round 0, with no phase begun, until round 0 ends with its
    // own roundEnd.
    expect(newState.currentRoundState.roundNumber).toBe(0);
    expect(newState.currentRoundState.currentPhaseState).toBe('none');
  });

  it('given black placement while white still reserved, stays in setup phase none', () => {
    const blackUnit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const whiteUnit = createUnitWithPlacement({
      coordinate: 'A-5',
      facing: 'south',
      playerSide: 'white',
    });
    const state = {
      ...createEmptyGameState('standard'),
      reservedUnits: [blackUnit.unit, whiteUnit.unit],
    };

    const event = createSetupUnitsEvent({
      commanderCoordinate: 'E-5',
      player: 'black',
      unitPlacements: [blackUnit],
    });

    const newState = applySetupUnitsEvent(event, state);

    expect(newState.reservedUnits).toStrictEqual([whiteUnit.unit]);
    expect(newState.currentRoundState.currentPhaseState).toBe('none');
    // Setup is still round 0.
    expect(newState.currentRoundState.roundNumber).toBe(0);
    expect(newState.boardState.board['E-5']?.commanders).toStrictEqual([
      'black',
    ]);
  });

  it('given commander alone on empty setup cell, places commander without stacking on unit', () => {
    const unit = createUnitWithPlacement({
      coordinate: 'L-3',
      facing: 'north',
      playerSide: 'black',
    });
    const state = {
      ...createEmptyGameState('standard'),
      reservedUnits: [unit.unit],
    };

    const event = createSetupUnitsEvent({
      commanderCoordinate: 'L-4',
      player: 'black',
      unitPlacements: [unit],
    });

    const newState = applySetupUnitsEvent(event, state);

    expect(newState.boardState.board['L-3']?.commanders).toStrictEqual([]);
    expect(newState.boardState.board['L-4']?.commanders).toStrictEqual([
      'black',
    ]);
  });

  it('given empty board ref before apply, input boardState identity and E-5 still none after apply', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = {
      ...createEmptyGameState('standard'),
      reservedUnits: [unitWithPlacement.unit],
    };
    const originalBoardRef = state.boardState;

    const event = createSetupUnitsEvent({
      commanderCoordinate: 'E-5',
      player: 'black',
      unitPlacements: [unitWithPlacement],
    });

    applySetupUnitsEvent(event, state);

    expect(state.boardState).toBe(originalBoardRef);
    expect(state.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'none',
    );
  });
});
