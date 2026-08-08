import type { AssignUnitSupportEvent } from '@events';
import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState, createTestCard, createTestUnit } from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { isValidAssignUnitSupportEvent } from './isValidAssignUnitSupportEvent';

function awaitingSupportState() {
  const base = createEmptyGameState({ currentInitiative: 'white' });
  const unit = createTestUnit('white', { attack: 3 });
  const other = createTestUnit('white', { attack: 2, instanceNumber: 1 });
  const card = createTestCard({
    unitSupport: {
      count: 1,
      supportType: 'unitType',
      unitTypeId: unit.unitType.id,
    },
  });
  base.cardState.white.inHand = [card];
  let withBoard = updateBoardState(
    base,
    addUnitToBoard(base.boardState, {
      placement: { coordinate: 'E-5', facing: 'south' },
      unit,
    }),
  );
  withBoard = updateBoardState(
    withBoard,
    addUnitToBoard(withBoard.boardState, {
      placement: { coordinate: 'E-6', facing: 'south' },
      unit: other,
    }),
  );
  const state = updatePhaseState(withBoard, {
    firstPlayerRallyResolutionState: {
      completed: false,
      playerRallied: true,
      rallyResolved: true,
      routState: 'pending',
      unitsLostSupport: 'pending',
    },
    phase: CLEANUP_PHASE,
    secondPlayerRallyResolutionState: 'pending',
    step: 'firstPlayerResolveRally',
  });
  return { card, other, state, unit };
}

describe(isValidAssignUnitSupportEvent, () => {
  it('given empty assignments when awaiting support, is valid', () => {
    const { state } = awaitingSupportState();
    const event: AssignUnitSupportEvent = {
      assignments: [],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('given covering an eligible unit within count, is valid', () => {
    const { card, state, unit } = awaitingSupportState();
    const event: AssignUnitSupportEvent = {
      assignments: [{ cardId: card.id, units: [unit] }],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(true);
  });

  it('given exceeding support count, is invalid', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const unit = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const other = createTestUnit('white', { attack: 2, instanceNumber: 1 });
    const card = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    base.cardState.white.inHand = [card];
    let withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, {
        placement: { coordinate: 'E-5', facing: 'south' },
        unit,
      }),
    );
    withBoard = updateBoardState(
      withBoard,
      addUnitToBoard(withBoard.boardState, {
        placement: { coordinate: 'E-6', facing: 'south' },
        unit: other,
      }),
    );
    const state = updatePhaseState(withBoard, {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: true,
        routState: 'pending',
        unitsLostSupport: 'pending',
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending',
      step: 'firstPlayerResolveRally',
    });
    const event: AssignUnitSupportEvent = {
      assignments: [{ cardId: card.id, units: [unit, other] }],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('given unit that does not match support type, is invalid', () => {
    const { card, other, state } = awaitingSupportState();
    const event: AssignUnitSupportEvent = {
      assignments: [{ cardId: card.id, units: [other] }],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('given duplicate card assignments, is invalid', () => {
    const { card, state, unit } = awaitingSupportState();
    const event: AssignUnitSupportEvent = {
      assignments: [
        { cardId: card.id, units: [unit] },
        { cardId: card.id, units: [] },
      ],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('given wrong phase, is invalid', () => {
    const event: AssignUnitSupportEvent = {
      assignments: [],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(
      isValidAssignUnitSupportEvent(event, createEmptyGameState()).result,
    ).toBe(false);
  });
});
