import type { Commitment, GameState } from '@game';
import {
  createBoardWithCommander,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  createUnitByStat,
  createUnitWithPlacement,
  placed,
  replaceBoard,
} from '@testing';
import { addUnitToBoard, applyEvent, updatePhaseState } from '@transforms';

import { generateStartEngagementEvent } from './generateStartEngagementEvent';
import { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';

import {
  createChooseMovingUnitEvent,
  createCommitToMovementEvent,
  createEmptyGameState,
  createMoveUnitEvent,
} from '@factories';
/**
 * Minimal front-engagement stack: defender on `createFrontEngagementState` default cell (E-5),
 * engager speeds swapped via createUnitByStat; black.inPlay feeds the mover's commitment factory.
 * The engaging unit's Speed is recorded on the engagement, as it was sampled
 * where its move began; `recordedEngagingSpeed` sets a record apart from the
 * unit's printed Speed.
 */
function buildStateWithFrontEngagement(options: {
  defendingSpeed: number;
  engagingSpeed: number;
  recordedEngagingSpeed?: number;
  defensiveCommitment?: Commitment;
  enemyBehindDefender?: boolean;
}): GameState {
  const state = createEmptyGameState('standard');
  state.cardState.black.inPlay = createTestCard();
  const defender = createUnitByStat('white', 'speed', options.defendingSpeed);
  const front = createFrontEngagementState({
    engagingSpeed: options.recordedEngagingSpeed ?? options.engagingSpeed,
    ...(options.defensiveCommitment
      ? { defensiveCommitment: options.defensiveCommitment }
      : {}),
  });
  const engagementState = {
    ...front,
    engagingUnit: createUnitByStat('black', 'speed', options.engagingSpeed),
  };
  const defenderWithPlacement = placed(
    defender,
    engagementState.targetPlacement.coordinate,
    'south',
  );
  const withDefender = addUnitToBoard(state.boardState, defenderWithPlacement);
  // An enemy behind a south-facing defender stands on the space north of it,
  // facing away, so it holds the way straight back without cutting off every
  // retreat (§9.1.5).
  const boardState = options.enemyBehindDefender
    ? addUnitToBoard(
        withDefender,
        placed(createTestUnit('black', { instanceNumber: 7 }), 'D-5', 'north'),
      )
    : withDefender;
  const withBoard = replaceBoard(state, boardState);
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
 * Front engagement: the defender has retreats to make iff its current speed exceeds
 * the engager’s and it has somewhere to go; otherwise the list is empty and it stands. Each player's committed card applies only to their own unit.
 */
describe('generateResolveEngageRetreatOptionEvent function', () => {
  it('records the one retreat open to a faster defender with room behind it', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 4,
      engagingSpeed: 2,
    });
    const event = generateResolveEngageRetreatOptionEvent(full);
    // §9.1.3: the smallest retreat is one step straight back.
    expect(event.retreatPaths).toStrictEqual([['step']]);
  });

  it('records both equally small retreats when the way straight back is held', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 4,
      enemyBehindDefender: true,
      engagingSpeed: 2,
    });

    const event = generateResolveEngageRetreatOptionEvent(full);

    // An enemy behind the defender blocks the step straight back; turning 45°
    // either way and stepping back are the two smallest retreats left
    // (§9.1.3, §9.1.4).
    expect(event.retreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
  });

  it('records no retreat for a defender that is not the faster', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 2,
      engagingSpeed: 4,
    });
    const event = generateResolveEngageRetreatOptionEvent(full);
    expect(event.retreatPaths).toStrictEqual([]);
  });

  it('compares against the Speed recorded when the engagement started, not one read now', () => {
    // The engaging unit's printed Speed is 2, but the Speed sampled where
    // its move began, a card counted, was 4. The defender's 3 is not faster.
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 3,
      engagingSpeed: 2,
      recordedEngagingSpeed: 4,
    });

    const event = generateResolveEngageRetreatOptionEvent(full);

    // Read afresh, 3 against 2 would let it fall back; against the record
    // it stands (§6.3.2, §5.1.4).
    expect(event.retreatPaths).toStrictEqual([]);
  });

  it('counts a speed card only the defender committed, so it may retreat', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 3,
      defensiveCommitment: {
        card: createTestCard({ modifiers: ['speed'] }),
        commitmentType: 'completed',
      },
      engagingSpeed: 3,
    });
    const event = generateResolveEngageRetreatOptionEvent(full);
    expect(event.retreatPaths.length).toBeGreaterThan(0);
  });

  it('a speed round effect counts if its inspiration range reached the engager where its move began', () => {
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
    state = replaceBoard(state, withCommander);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [engager.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );
    // Black names the engager, declines to commit, then steps from E-5 into
    // the enemy on D-5, already head-on.
    state = applyEvent(
      createChooseMovingUnitEvent({
        player: 'black',
        unit: engager.unit,
      }),
      state,
    );
    state = applyEvent(
      createCommitToMovementEvent({
        committedCard: 'none',
        player: 'black',
      }),
      state,
    );
    state = applyEvent(
      createMoveUnitEvent({
        moveCommander: false,
        path: ['step'],
        player: 'black',
      }),
      state,
    );
    const start = generateStartEngagementEvent(state);
    state = applyEvent(start, state);

    const event = generateResolveEngageRetreatOptionEvent(state);

    // Commander is on E-5. Range 0 reaches that hex and not D-5, where the
    // engager now stands; its Speed was sampled on E-5, so 3+1 counts, and
    // is not slower than the defender's 4.
    expect(event.retreatPaths).toStrictEqual([]);
  });
});
