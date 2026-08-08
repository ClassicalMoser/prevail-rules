import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState, createTestCard, createTestUnit } from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getLegalUnitSupportGrants } from './getLegalUnitSupportGrants';

describe(getLegalUnitSupportGrants, () => {
  it('given not on resolve-rally awaiting support, returns null', () => {
    expect(getLegalUnitSupportGrants(createEmptyGameState())).toBeNull();
  });

  it('given awaiting support assignment, returns grants with eligible units', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const unit = createTestUnit('white', { attack: 3 });
    const card = createTestCard({
      unitSupport: {
        count: 2,
        supportType: 'unitType',
        unitTypeId: unit.unitType.id,
      },
    });
    base.cardState.white.inHand = [card];
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

    const legal = getLegalUnitSupportGrants(state);
    expect(legal).not.toBeNull();
    expect(legal?.player).toBe('white');
    expect(legal?.grants).toHaveLength(1);
    expect(legal?.grants[0]?.card.id).toBe(card.id);
    expect(legal?.grants[0]?.eligibleUnits).toContainEqual(unit);
  });

  it('given generic support, all board units are eligible', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const unitA = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const unitB = createTestUnit('white', { attack: 2, instanceNumber: 1 });
    const card = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    base.cardState.white.inHand = [card];
    let withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, {
        placement: { coordinate: 'E-5', facing: 'south' },
        unit: unitA,
      }),
    );
    withBoard = updateBoardState(
      withBoard,
      addUnitToBoard(withBoard.boardState, {
        placement: { coordinate: 'E-6', facing: 'south' },
        unit: unitB,
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

    const legal = getLegalUnitSupportGrants(state);
    expect(legal?.grants[0]?.eligibleUnits).toHaveLength(2);
  });
});
