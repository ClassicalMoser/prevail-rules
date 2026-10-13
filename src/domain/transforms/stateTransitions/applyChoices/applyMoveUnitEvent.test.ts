import type { MoveUnitEvent } from '@events';
import { getLegalMoveUnits } from '@legality';
import { generateStartEngagementEvent } from '@procedures';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createTestCard,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';
import { applyCompleteUnitMovementEvent } from '../applyEffects/movement/applyCompleteUnitMovementEvent';

import { applyMoveUnitEvent } from './applyMoveUnitEvent';

import { createEmptyGameState } from '@factories';
/**
 * During command resolution, a commanded unit’s `moveUnit` choice rewrites board
 * presence and opens a movement CRS (mover commitment declined) while removing
 * the unit from remaining resolve units.
 */
describe('applyMoveUnitEvent function', () => {
  it('moves the unit on the board, starts movement CRS, and clears it from remaining', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState('standard');
    state = updateBoardState(
      state,
      addUnitToBoard(state.boardState, unitWithPlacement),
    );
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [unitWithPlacement.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const event: MoveUnitEvent = {
      choiceType: 'moveUnit',
      eventNumber: 0,
      eventType: 'playerChoice',
      moveCommander: false,
      player: 'black',
      to: {
        coordinate: 'E-7',
        facing: 'north',
      },
      unit: unitWithPlacement,
    };

    const newState = applyMoveUnitEvent(event, state);

    expect(newState.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'none',
    );
    expect(newState.boardState.board['E-7']?.unitPresence).toBeDefined();
    const presence = newState.boardState.board['E-7']?.unitPresence;
    if (presence?.presenceType !== 'single') {
      throw new Error('Expected single unit');
    }
    expect(presence.unit.playerSide).toBe('black');
    expect(presence.facing).toBe('north');

    const phase = getIssueCommandsPhaseState(newState);
    expect(phase.remainingUnitsFirstPlayer).toStrictEqual([]);
    expect(phase.currentCommandResolutionState).not.toBe('pending');
    if (phase.currentCommandResolutionState === 'pending') {
      throw new Error('Expected movement CRS');
    }
    const crs = phase.currentCommandResolutionState;
    if (crs.commandResolutionType !== 'movement') {
      throw new Error('Expected movement CRS');
    }
    expect(crs.commitment.commitmentType).toBe('declined');
    expect(crs.targetPlacement).toStrictEqual(event.to);
  });

  it('entering an enemy hex leaves the mover on its current hex and the defender alone', () => {
    const engager = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { speed: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    let state = createEmptyGameState('standard');
    state = updateBoardState(
      state,
      addUnitToBoard(addUnitToBoard(state.boardState, engager), defender),
    );
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [engager.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    state = applyMoveUnitEvent(
      {
        choiceType: 'moveUnit',
        eventNumber: 0,
        eventType: 'playerChoice',
        moveCommander: false,
        player: 'black',
        to: { coordinate: 'D-5', facing: 'north' },
        unit: engager,
      },
      state,
    );

    expect(state.boardState.board['E-5']?.unitPresence).toMatchObject({
      facing: 'north',
      presenceType: 'single',
      unit: engager.unit,
    });
    expect(state.boardState.board['D-5']?.unitPresence).toMatchObject({
      facing: 'south',
      presenceType: 'single',
      unit: defender.unit,
    });

    const phase = getIssueCommandsPhaseState(state);
    if (phase.currentCommandResolutionState === 'pending') {
      throw new Error('Expected movement CRS');
    }
    const crs = phase.currentCommandResolutionState;
    if (crs.commandResolutionType !== 'movement') {
      throw new Error('Expected movement CRS');
    }
    expect(crs.movingUnit.placement).toStrictEqual(engager.placement);
    expect(crs.targetPlacement).toStrictEqual({
      coordinate: 'D-5',
      facing: 'north',
    });

    const start = generateStartEngagementEvent(state, 1);
    expect(start.engagementType).toBe('front');
    expect(start.defenderWithPlacement.unit).toStrictEqual(defender.unit);
  });

  it('after movement completes, the moved unit is not a legal move candidate again', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { speed: 2 },
    });
    const other = createUnitWithPlacement({
      coordinate: 'E-3',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2, speed: 2 },
    });
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: createTestCard({ id: 'movement' }),
      },
    });
    state = updateBoardState(
      state,
      addUnitToBoard(
        addUnitToBoard(state.boardState, unitWithPlacement),
        other,
      ),
    );
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [unitWithPlacement.unit, other.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const event: MoveUnitEvent = {
      choiceType: 'moveUnit',
      eventNumber: 0,
      eventType: 'playerChoice',
      moveCommander: false,
      player: 'black',
      to: { coordinate: 'E-7', facing: 'north' },
      unit: unitWithPlacement,
    };

    state = applyMoveUnitEvent(event, state);
    state = applyCompleteUnitMovementEvent(
      {
        effectType: 'completeUnitMovement',
        eventNumber: 1,
        eventType: 'gameEffect',
      },
      state,
    );

    const legal = getLegalMoveUnits(state);
    expect(legal?.units.map((u) => u.unit.instanceNumber)).toStrictEqual([2]);
    expect(legal?.units.some((u) => u.unit.instanceNumber === 1)).toBe(false);
  });
});
