import type { AssignUnitSupportEvent } from '@events';
import { throwIfNone, throwIfPending } from '@utils';
import { CLEANUP_PHASE } from '@game';
import { getBoardSpace } from '@queries';
import { createEmptyGameState, createTestCard, createTestUnit } from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyAssignUnitSupportEvent } from './applyAssignUnitSupportEvent';

function awaitingSupportState() {
  const base = createEmptyGameState({ currentInitiative: 'white' });
  const covered = createTestUnit('white', { attack: 3, instanceNumber: 1 });
  // attack 4 → positive morale (rout discard seeded); attack 2 units have morale 0.
  const uncovered = createTestUnit('white', { attack: 4, instanceNumber: 1 });
  const card = createTestCard({
    unitSupport: {
      count: 1,
      supportType: 'unitType',
      unitTypeId: covered.unitType.id,
    },
  });
  base.cardState.white.inHand = [card];
  let withBoard = updateBoardState(
    base,
    addUnitToBoard(base.boardState, {
      placement: { coordinate: 'E-5', facing: 'south' },
      unit: covered,
    }),
  );
  withBoard = updateBoardState(
    withBoard,
    addUnitToBoard(withBoard.boardState, {
      placement: { coordinate: 'E-6', facing: 'south' },
      unit: uncovered,
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
  return { card, covered, state, uncovered };
}

describe(applyAssignUnitSupportEvent, () => {
  it('given partial cover, only uncovered units rout and routState is seeded', () => {
    const { card, covered, state, uncovered } = awaitingSupportState();
    const event: AssignUnitSupportEvent = {
      assignments: [{ cardId: card.id, units: [covered] }],
      choiceType: 'assignUnitSupport',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    const next = applyAssignUnitSupportEvent(event, state);

    expect(
      getBoardSpace(next.boardState, 'E-5').unitPresence.presenceType,
    ).not.toBe('none');
    expect(
      getBoardSpace(next.boardState, 'E-6').unitPresence.presenceType,
    ).toBe('none');
    expect(next.routedUnits).toContainEqual(uncovered);
    expect(next.routedUnits).not.toContainEqual(covered);

    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== CLEANUP_PHASE) {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('firstPlayerResolveRally');
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(throwIfPending(rally.unitsLostSupport, 'lost')).toContainEqual(
      uncovered,
    );
    expect(throwIfPending(rally.routState, 'rout').completed).toBe(false);
  });

  it('given empty board and empty assignments, advances cleanup with no rout', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const state = updatePhaseState(base, {
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

    const next = applyAssignUnitSupportEvent(event, state);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== CLEANUP_PHASE) {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('secondPlayerChooseRally');
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(throwIfPending(rally.unitsLostSupport, 'lost')).toStrictEqual([]);
    expect(rally.routState).toBe('pending');
  });
});
