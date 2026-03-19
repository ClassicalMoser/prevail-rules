import type { StandardBoard } from '@entities';
import type { MoveUnitEvent } from '@events';
import { createEmptyGameState, createUnitWithPlacement } from '@testing';
import { addUnitToBoard, updateBoardState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyMoveUnitEvent } from './applyMoveUnitEvent';

describe('applyMoveUnitEvent', () => {
  it('moves unit from source space to destination and updates board', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = createEmptyGameState();
    const boardWithUnit = addUnitToBoard(state.boardState, unitWithPlacement);
    const stateWithUnit = updateBoardState(state, boardWithUnit);

    const event: MoveUnitEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'moveUnit',
      player: 'black',
      unit: unitWithPlacement,
      to: { coordinate: 'E-7', facing: 'north' },
      moveCommander: false,
    };

    const newState = applyMoveUnitEvent(event, stateWithUnit);

    expect(newState.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'none',
    );
    expect(newState.boardState.board['E-7']?.unitPresence).toBeDefined();
    const presence = newState.boardState.board['E-7']?.unitPresence;
    if (presence?.presenceType !== 'single')
      throw new Error('Expected single unit');
    expect(presence.unit.playerSide).toBe('black');
    expect(presence.facing).toBe('north');
  });
});
