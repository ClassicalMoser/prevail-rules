import type { StatModifier, UnitWithPlacement } from '@entities';
import type { Commitment, GameState } from '@game';
import {
  createBoardWithCommander,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createUnitByStat,
  createUnitWithPlacement,
} from '@testing';
import {
  addUnitToBoard,
  applyEvent,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { generateStartEngagementEvent } from './generateStartEngagementEvent';
import { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';

import { createEmptyGameState } from '@factories';
/**
 * Minimal front-engagement stack: defender on `createFrontEngagementState` default cell (E-5),
 * engager speeds swapped via createUnitByStat; black.inPlay feeds the mover's commitment factory.
 */
function buildStateWithFrontEngagement(options: {
  defendingSpeed: number;
  engagingSpeed: number;
  engagingCardModifiers?: StatModifier[];
  defensiveCommitment?: Commitment;
}): GameState {
  const state = createEmptyGameState('standard');
  state.cardState.black.inPlay = createTestCard({
    modifiers: options.engagingCardModifiers ?? [],
  });
  const defender = createUnitByStat('white', 'speed', options.defendingSpeed);
  const front = createFrontEngagementState(
    options.defensiveCommitment
      ? { defensiveCommitment: options.defensiveCommitment }
      : undefined,
  );
  const engagementState = {
    ...front,
    engagingUnit: createUnitByStat('black', 'speed', options.engagingSpeed),
  };
  const defenderWithPlacement: UnitWithPlacement = {
    placement: {
      coordinate: engagementState.targetPlacement.coordinate,
      facing: 'south',
    },
    unit: defender,
  };
  const withBoard = {
    ...state,
    boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
  };
  const movement = createMovementResolutionState(withBoard, {
    engagementState,
    targetPlacement: engagementState.targetPlacement,
  });
  return updatePhaseState(
    withBoard,
    createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    }),
  );
}

/**
 * Front engagement: defendingUnitCanRetreat is true iff defender’s current speed exceeds
 * engager’s. Each player's committed card applies only to their own unit.
 */
describe('generateResolveEngageRetreatOptionEvent function', () => {
  it('given defender speed 4 and engager speed 2, defendingUnitCanRetreat is true', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 4,
      engagingSpeed: 2,
    });
    const event = generateResolveEngageRetreatOptionEvent(full, 0);
    expect(event.defendingUnitCanRetreat).toBe(true);
  });

  it('given defender speed 2 and engager speed 4, defendingUnitCanRetreat is false', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 2,
      engagingSpeed: 4,
    });
    const event = generateResolveEngageRetreatOptionEvent(full, 0);
    expect(event.defendingUnitCanRetreat).toBe(false);
  });

  it('given the mover committed +1 speed, does not apply that card to the defender', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 4,
      defensiveCommitment: { commitmentType: 'declined' },
      engagingCardModifiers: ['speed'],
      engagingSpeed: 3,
    });
    const event = generateResolveEngageRetreatOptionEvent(full, 0);
    expect(event.defendingUnitCanRetreat).toBe(false);
  });

  it('given only the defender committed +1 speed, defendingUnitCanRetreat is true', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 3,
      defensiveCommitment: {
        card: createTestCard({ modifiers: ['speed'] }),
        commitmentType: 'completed',
      },
      engagingSpeed: 3,
    });
    const event = generateResolveEngageRetreatOptionEvent(full, 0);
    expect(event.defendingUnitCanRetreat).toBe(true);
  });

  it('a speed round effect in inspiration range uses the engager hex it has not left yet', () => {
    const engager = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { speed: 3 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
      unitOptions: { speed: 4 },
    });
    let state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard({
      roundEffectModifiers: [{ type: 'speed', value: 1 }],
      roundEffectRestrictions: { inspirationRangeRestriction: 0 },
    });
    const withUnits = addUnitToBoard(
      addUnitToBoard(state.boardState, engager),
      defender,
    );
    const withCommander = createBoardWithCommander('black', 'E-5', withUnits);
    state = updateBoardState(state, withCommander);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [engager.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );
    state = applyEvent(
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
    const start = generateStartEngagementEvent(state, 1);
    state = applyEvent(start, state);

    const event = generateResolveEngageRetreatOptionEvent(state, 2);

    // Commander is on E-5. Range 0 reaches that hex and not D-5.
    // Engager 3+1 is not slower than defender 4.
    expect(event.defendingUnitCanRetreat).toBe(false);
  });
});
