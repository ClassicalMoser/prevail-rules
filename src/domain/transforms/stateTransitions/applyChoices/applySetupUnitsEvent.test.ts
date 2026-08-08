import type { SetupUnitsEvent } from '@events';
import { createEmptyGameState, createUnitWithPlacement } from '@testing';

import { applySetupUnitsEvent } from './applySetupUnitsEvent';

/**
 * Pre-game setup: each `setupUnits` choice merges unit placements and the
 * commander into `boardState`, clears those units from reserve, and starts
 * round 1 playCards when reserve is empty.
 */
describe(applySetupUnitsEvent, () => {
  it('given one black unit E-5 north, board shows unit and black commander and starts round 1', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = {
      ...createEmptyGameState(),
      reservedUnits: [unitWithPlacement.unit],
    };

    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'E-5',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      unitPlacements: [unitWithPlacement],
    };

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
    expect(newState.currentRoundNumber).toBe(1);
    expect(newState.currentRoundState.roundNumber).toBe(1);
    expect(newState.currentRoundState.currentPhaseState).toStrictEqual({
      phase: 'playCards',
      step: 'chooseCards',
    });
    expect(newState.currentRoundState.events).toStrictEqual([]);
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
      ...createEmptyGameState(),
      reservedUnits: [blackUnit.unit, whiteUnit.unit],
    };

    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'E-5',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      unitPlacements: [blackUnit],
    };

    const newState = applySetupUnitsEvent(event, state);

    expect(newState.reservedUnits).toStrictEqual([whiteUnit.unit]);
    expect(newState.currentRoundState.currentPhaseState).toBe('none');
    expect(newState.currentRoundNumber).toBe(0);
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
      ...createEmptyGameState(),
      reservedUnits: [unit.unit],
    };

    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'L-4',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      unitPlacements: [unit],
    };

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
      ...createEmptyGameState(),
      reservedUnits: [unitWithPlacement.unit],
    };
    const originalBoardRef = state.boardState;

    const event: SetupUnitsEvent = {
      choiceType: 'setupUnits',
      commanderCoordinate: 'E-5',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      unitPlacements: [unitWithPlacement],
    };

    applySetupUnitsEvent(event, state);

    expect(state.boardState).toBe(originalBoardRef);
    expect(state.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'none',
    );
  });
});
