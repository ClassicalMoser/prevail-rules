import { tempUnits } from '@sampleValues';
import { CLEANUP_PHASE } from '@game';
import { createTestCard, createTestUnit, placed } from '@testing';

import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';
import { throwIfUndefined } from '@utils';

import { isValidAssignUnitSupportEvent } from './isValidAssignUnitSupportEvent';

import { createAssignUnitSupportEvent, createEmptyGameState } from '@factories';

function awaitingSupportState() {
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'white',
  );
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
    addUnitToBoard(base.boardState, placed(unit, 'E-5', 'south')),
  );
  withBoard = updateBoardState(
    withBoard,
    addUnitToBoard(withBoard.boardState, placed(other, 'E-6', 'south')),
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
  return { other, state, unit };
}

describe('isValidAssignUnitSupportEvent function', () => {
  it('given empty assignments while a slot could cover a unit, is invalid (not maximal)', () => {
    const { state } = awaitingSupportState();
    const event = createAssignUnitSupportEvent({
      assignments: [],
      player: 'white',
    });
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('given covering every unit a unit support can cover, leaving uncoverable units, is valid', () => {
    const { state, unit } = awaitingSupportState();
    const event = createAssignUnitSupportEvent({
      assignments: [
        {
          unitSupport: {
            count: 1,
            supportType: 'unitType',
            unitTypeId: unit.unitType.id,
          },
          unit,
        },
      ],
      player: 'white',
    });
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(true);
  });

  it('given empty assignments when no unit support can cover anyone, is valid (all rout)', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit('white', { attack: 3 });
    base.cardState.white.inHand = [
      createTestCard({ unitSupport: { count: 0, supportType: 'generic' } }),
    ];
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
    const event = createAssignUnitSupportEvent({
      assignments: [],
      player: 'white',
    });
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(true);
  });

  it('given generic slot left unused while a unit is uncovered, is invalid', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const other = createTestUnit('white', { attack: 2, instanceNumber: 1 });
    const card = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    base.cardState.white.inHand = [card];
    let withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, placed(unit, 'E-5', 'south')),
    );
    withBoard = updateBoardState(
      withBoard,
      addUnitToBoard(withBoard.boardState, placed(other, 'E-6', 'south')),
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
    const event = createAssignUnitSupportEvent({
      assignments: [],
      player: 'white',
    });
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('given one generic slot covering one of two units, is valid (excess must rout)', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const other = createTestUnit('white', { attack: 2, instanceNumber: 1 });
    const card = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    base.cardState.white.inHand = [card];
    let withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, placed(unit, 'E-5', 'south')),
    );
    withBoard = updateBoardState(
      withBoard,
      addUnitToBoard(withBoard.boardState, placed(other, 'E-6', 'south')),
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
    const event = createAssignUnitSupportEvent({
      assignments: [
        {
          unitSupport: { count: 1, supportType: 'generic' },
          unit,
        },
      ],
      player: 'white',
    });
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(true);
  });

  it('given exceeding support count, is invalid', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const other = createTestUnit('white', { attack: 2, instanceNumber: 1 });
    const card = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    base.cardState.white.inHand = [card];
    let withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, placed(unit, 'E-5', 'south')),
    );
    withBoard = updateBoardState(
      withBoard,
      addUnitToBoard(withBoard.boardState, placed(other, 'E-6', 'south')),
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
    const event = createAssignUnitSupportEvent({
      assignments: [
        { unit, unitSupport: { count: 1, supportType: 'generic' } },
        { unit: other, unitSupport: { count: 1, supportType: 'generic' } },
      ],
      player: 'white',
    });
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('given unit that does not match support type, is invalid', () => {
    const { other, state, unit } = awaitingSupportState();
    const event = createAssignUnitSupportEvent({
      assignments: [
        {
          unitSupport: {
            count: 1,
            supportType: 'unitType',
            unitTypeId: unit.unitType.id,
          },
          unit: other,
        },
      ],
      player: 'white',
    });
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(false);
  });

  it('refuses the same unit given the same place twice, since a unit takes only one place', () => {
    const { state, unit } = awaitingSupportState();
    const unitSupport = {
      count: 1,
      supportType: 'unitType' as const,
      unitTypeId: unit.unitType.id,
    };
    // The unit is listed twice under the one unit support (§10.4.4).
    const event = createAssignUnitSupportEvent({
      assignments: [
        { unit, unitSupport },
        { unit, unitSupport },
      ],
      player: 'white',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      errorReason: 'Unit is assigned support more than once',
      result: false,
    });
  });

  it('given suboptimal trait-on-type while type slot idles and another unit dies, is valid', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    // Two different formation rows: one fills a unit-type slot, the other a trait slot.
    const formationTypes = tempUnits.filter((unit) =>
      unit.traits.includes('formation'),
    );
    const typedType = throwIfUndefined(
      formationTypes[0],
      'expected a formation unit',
    );
    const traitOnlyType = throwIfUndefined(
      formationTypes[1],
      'expected a second formation unit',
    );
    const typed = createTestUnit('white', {
      instanceNumber: 1,
      unitType: typedType,
    });
    const traitOnly = createTestUnit('white', {
      instanceNumber: 1,
      unitType: traitOnlyType,
    });
    expect(typed.unitType.traits).toContain('formation');
    expect(traitOnly.unitType.traits).toContain('formation');

    base.cardState.white.inHand = [
      createTestCard({
        unitSupport: {
          count: 1,
          supportType: 'unitType',
          unitTypeId: typed.unitType.id,
        },
      }),
      createTestCard({
        unitSupport: {
          count: 1,
          supportType: 'trait',
          trait: 'formation',
        },
      }),
    ];
    let withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, placed(typed, 'E-5', 'south')),
    );
    withBoard = updateBoardState(
      withBoard,
      addUnitToBoard(withBoard.boardState, placed(traitOnly, 'E-6', 'south')),
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

    // Burn trait on typed; leave the unit-type support unused; traitOnly uncovered and
    // no remaining capacity matches them → legal but not globally optimal.
    const event = createAssignUnitSupportEvent({
      assignments: [
        {
          unitSupport: {
            count: 1,
            supportType: 'trait',
            trait: 'formation',
          },
          unit: typed,
        },
      ],
      player: 'white',
    });
    expect(isValidAssignUnitSupportEvent(event, state).result).toBe(true);
  });

  it('throws when asked where no rally awaits unit support, which the expected check rules out first', () => {
    const event = createAssignUnitSupportEvent({
      assignments: [],
      player: 'white',
    });

    // Support sent with no round under way is refused by the expected check
    // before membership is asked; reaching here is a fault.
    expect(() =>
      isValidAssignUnitSupportEvent(event, createEmptyGameState('standard')),
    ).toThrow('No current phase state found');
  });
});
