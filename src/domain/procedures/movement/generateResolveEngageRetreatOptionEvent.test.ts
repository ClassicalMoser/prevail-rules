import type { StatModifier, UnitWithPlacement } from '@entities';
import type { Commitment, GameState } from '@game';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createUnitByStat,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';

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
  const state = createEmptyGameState();
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
describe(generateResolveEngageRetreatOptionEvent, () => {
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
});
