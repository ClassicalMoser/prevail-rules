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
  it('given empty assignments while a slot could cover a unit, is invalid (not maximal)', () => {
    const { state } = awaitingSupportState();
    const event: AssignUnitSupportEvent = {
      assignments: [],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('given covering every unit a grant can cover, leaving uncoverable units, is valid', () => {
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

  it('given empty assignments when no grants can cover anyone, is valid (all rout)', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const unit = createTestUnit('white', { attack: 3 });
    base.cardState.white.inHand = [
      createTestCard({ unitSupport: { count: 0, supportType: 'generic' } }),
    ];
    const withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, {
        placement: { coordinate: 'E-5', facing: 'south' },
        unit,
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
      assignments: [],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(true);
  });

  it('given generic slot left unused while a unit is uncovered, is invalid', () => {
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
    // Cover nobody — spare generic slot could cover either unit.
    const event: AssignUnitSupportEvent = {
      assignments: [],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('given one generic slot covering one of two units, is valid (excess must rout)', () => {
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
