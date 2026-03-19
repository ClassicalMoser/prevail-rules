import type { StandardBoard } from '@entities';
import type { SetupUnitsEvent } from '@events';
import { createEmptyGameState, createUnitWithPlacement } from '@testing';
import { describe, expect, it } from 'vitest';
import { applySetupUnitsEvent } from './applySetupUnitsEvent';

describe('applySetupUnitsEvent', () => {
  it('places a single unit on the board', () => {
    const state = createEmptyGameState();
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });

    const event: SetupUnitsEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'setupUnits',
      player: 'black',
      unitPlacements: new Set([unitWithPlacement]),
    };

    const newState = applySetupUnitsEvent(event, state);

    const presence = newState.boardState.board['E-5']?.unitPresence;
    expect(presence?.presenceType).toBe('single');
    if (presence?.presenceType !== 'single') return;
    expect(presence.unit.playerSide).toBe('black');
    expect(presence.facing).toBe('north');
  });

  it('places multiple units on the board', () => {
    const state = createEmptyGameState();
    const blackUnit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const whiteUnit = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'south',
      playerSide: 'white',
    });

    const event: SetupUnitsEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'setupUnits',
      player: 'black',
      unitPlacements: new Set([blackUnit, whiteUnit]),
    };

    const newState = applySetupUnitsEvent(event, state);

    const atE5 = newState.boardState.board['E-5']?.unitPresence;
    const atE6 = newState.boardState.board['E-6']?.unitPresence;
    expect(atE5?.presenceType).toBe('single');
    expect(atE6?.presenceType).toBe('single');
    if (atE5?.presenceType === 'single') expect(atE5.unit.playerSide).toBe('black');
    if (atE6?.presenceType === 'single') expect(atE6.unit.playerSide).toBe('white');
  });

  it('does not mutate the original state', () => {
    const state = createEmptyGameState();
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const originalBoardRef = state.boardState;

    const event: SetupUnitsEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'setupUnits',
      player: 'black',
      unitPlacements: new Set([unitWithPlacement]),
    };

    applySetupUnitsEvent(event, state);

    expect(state.boardState).toBe(originalBoardRef);
    expect(state.boardState.board['E-5']?.unitPresence.presenceType).toBe('none');
  });

  it('leaves board unchanged when unitPlacements is empty', () => {
    const state = createEmptyGameState();

    const event: SetupUnitsEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'setupUnits',
      player: 'black',
      unitPlacements: new Set(),
    };

    const newState = applySetupUnitsEvent(event, state);

    expect(newState.boardState).toBe(state.boardState);
  });
});
