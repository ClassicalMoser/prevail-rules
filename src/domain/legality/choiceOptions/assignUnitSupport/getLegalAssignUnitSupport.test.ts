import { CLEANUP_PHASE } from '@game';
import { createTestCard, createTestUnit, placed } from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';

import { getLegalAssignUnitSupport } from './getLegalAssignUnitSupport';

import { createEmptyGameState } from '@factories';

describe('getLegalAssignUnitSupport function', () => {
  it('throws when no round is under way, where nothing asks', () => {
    expect(() =>
      getLegalAssignUnitSupport(createEmptyGameState('standard')),
    ).toThrow('No current phase state found');
  });

  it('given awaiting support assignment, returns categories with eligible units', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit('white', { attack: 3 });
    const cardA = createTestCard({
      id: 'a',
      unitSupport: {
        count: 1,
        supportType: 'unitType',
        unitTypeId: unit.unitType.id,
      },
    });
    const cardB = createTestCard({
      id: 'b',
      unitSupport: {
        count: 1,
        supportType: 'unitType',
        unitTypeId: unit.unitType.id,
      },
    });
    base.cardState.white.inHand = [cardA, cardB];
    const withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, placed(unit, 'E-5', 'south')),
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

    const legal = getLegalAssignUnitSupport(state);
    expect(legal).not.toBeNull();
    expect(legal?.player).toBe('white');
    expect(legal?.categories).toHaveLength(1);
    expect(legal?.categories[0]?.unitSupport).toStrictEqual({
      count: 2,
      supportType: 'unitType',
      unitTypeId: unit.unitType.id,
    });
    expect(legal?.categories[0]?.eligibleUnits).toContainEqual(unit);
  });

  it('given generic support, all board units are eligible', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unitA = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const unitB = createTestUnit('white', { attack: 2, instanceNumber: 1 });
    const card = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    base.cardState.white.inHand = [card];
    let withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, placed(unitA, 'E-5', 'south')),
    );
    withBoard = updateBoardState(
      withBoard,
      addUnitToBoard(withBoard.boardState, placed(unitB, 'E-6', 'south')),
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

    const legal = getLegalAssignUnitSupport(state);
    expect(legal?.categories[0]?.eligibleUnits).toContainEqual(unitA);
    expect(legal?.categories[0]?.eligibleUnits).toContainEqual(unitB);
  });
});
