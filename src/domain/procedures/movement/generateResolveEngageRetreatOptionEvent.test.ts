import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { Commitment, GameState } from '@game';
import {
  createBoardWithCommander,
  createBoardWithEngagedUnits,
  createFrontEngagementState,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  createUnitByStat,
  createUnitWithPlacement,
  enemyBlockingStraightBack,
  enemyCuttingOffRetreat,
  placed,
  replaceBoard,
} from '@testing';
import {
  addUnitToBoard,
  applyEvent,
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { generateStartEngagementEvent } from './generateStartEngagementEvent';
import { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';

import {
  createChooseMovingUnitEvent,
  createCommitToMovementEvent,
  createEmptyGameState,
  createMoveUnitEvent,
  createUnitPlacement,
} from '@factories';

/**
 * A front engagement on E-5, at the point the defender's retreat option is
 * worked out: the black engaging unit has stepped north from F-5 into the
 * white defender, which faces south, head-on, and the defender has made its
 * commitment, or declined. The engaging unit's Speed is the one recorded as
 * the engagement started, and may differ from its printed Speed.
 *
 * Kept in this spec: the stage it builds is the one this procedure is asked
 * at, and its options are the facts the procedure reads.
 */
function frontEngagementOnE5(options: {
  defender: UnitInstance;
  recordedEngagingSpeed: number;
  engager?: UnitInstance;
  defensiveCommitment?: Commitment;
  neighbours?: UnitWithPlacement[];
}): GameState {
  // The engaging unit is black's instance 2, so a black neighbour built by
  // a fixture, instance 1, is never the same unit.
  const engager =
    options.engager ?? createTestUnit('black', { instanceNumber: 2 });

  // The two stand engaged on E-5, the defender facing south and the
  // engaging unit facing it; any neighbours stand around them.
  const engaged = createBoardWithEngagedUnits(
    options.defender,
    engager,
    'E-5',
    'south',
  );
  const board = (options.neighbours ?? []).reduce(
    (withSome, neighbour) => addUnitToBoard(withSome, neighbour),
    engaged,
  );
  const withBoard = replaceBoard(createEmptyGameState('standard'), board);

  // The engagement as it stands: the engaging unit's recorded Speed, and the
  // defender's card, declined unless the case commits one.
  const engagement = createFrontEngagementState({
    defensiveCommitment: options.defensiveCommitment ?? {
      commitmentType: 'declined',
    },
    engagingSpeed: options.recordedEngagingSpeed,
  });

  // The move that ended on E-5, facing north; the mover committed nothing.
  const movement = createMovementResolutionState(withBoard, {
    commitment: { commitmentType: 'declined' },
    engagementState: engagement,
    movingUnit: engager,
    targetPlacement: createUnitPlacement('E-5', 'north'),
  });
  const state = createGameStateResolvingCommand(movement, withBoard);
  return state;
}

/**
 * Front engagement: the defender has retreats to make iff its current speed exceeds
 * the engager’s and it has somewhere to go; otherwise the list is empty and it stands. Each player's committed card applies only to their own unit.
 */
describe('generateResolveEngageRetreatOptionEvent function', () => {
  it('records the one retreat open to a faster defender with room behind it', () => {
    // A Speed 4 defender against a recorded Speed of 2, open ground behind.
    const state = frontEngagementOnE5({
      defender: createUnitByStat('white', 'speed', 4),
      recordedEngagingSpeed: 2,
    });

    // §9.1.3: the smallest retreat is one step straight back.
    expect(generateResolveEngageRetreatOptionEvent(state)).toStrictEqual({
      effectType: 'resolveEngageRetreatOption',
      eventType: 'gameEffect',
      retreatPaths: [['step']],
    });
  });

  it('records both equally small retreats when the way straight back is held', () => {
    // The same faster defender, with a black unit on D-5, behind it, facing
    // away.
    const defender = createUnitByStat('white', 'speed', 4);
    const state = frontEngagementOnE5({
      defender,
      neighbours: [enemyBlockingStraightBack(placed(defender, 'E-5', 'south'))],
      recordedEngagingSpeed: 2,
    });

    const event = generateResolveEngageRetreatOptionEvent(state);

    // An enemy behind the defender blocks the step straight back; turning 45°
    // either way and stepping back are the two smallest retreats left
    // (§9.1.3, §9.1.4).
    expect(event.retreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
  });

  it('records no retreat for a faster defender whose way back is cut off', () => {
    // The same faster defender, with a black unit on D-5 facing it.
    const defender = createUnitByStat('white', 'speed', 4);
    const state = frontEngagementOnE5({
      defender,
      neighbours: [enemyCuttingOffRetreat(placed(defender, 'E-5', 'south'))],
      recordedEngagingSpeed: 2,
    });

    // With nowhere to fall back to it is not offered the choice, and stays
    // to fight (§6.3.2, §9.1.5).
    expect(
      generateResolveEngageRetreatOptionEvent(state).retreatPaths,
    ).toStrictEqual([]);
  });

  it('records no retreat for a defender only as fast as the engaging unit', () => {
    // Speed 2 against a recorded Speed of 2.
    const state = frontEngagementOnE5({
      defender: createUnitByStat('white', 'speed', 2),
      recordedEngagingSpeed: 2,
    });

    // It must be strictly the faster to fall back (§6.3.2 step 2).
    expect(
      generateResolveEngageRetreatOptionEvent(state).retreatPaths,
    ).toStrictEqual([]);
  });

  it('compares against the Speed recorded when the engagement started, not one read now', () => {
    // The engaging unit's printed Speed is 2, but the Speed sampled where
    // its move began, a card counted, was 4. The defender's 3 is not faster.
    const state = frontEngagementOnE5({
      defender: createUnitByStat('white', 'speed', 3),
      engager: createUnitByStat('black', 'speed', 2, 2),
      recordedEngagingSpeed: 4,
    });

    const event = generateResolveEngageRetreatOptionEvent(state);

    // Read afresh, 3 against 2 would let it fall back; against the record
    // it stands (§6.3.2, §5.1.4).
    expect(event.retreatPaths).toStrictEqual([]);
  });

  it('counts a speed card only the defender committed, so it may retreat', () => {
    // Speed 3 against a recorded 3; the defender committed a card for +1
    // Speed.
    const state = frontEngagementOnE5({
      defender: createUnitByStat('white', 'speed', 3),
      defensiveCommitment: {
        card: createTestCard({ modifiers: ['speed'] }),
        commitmentType: 'completed',
      },
      recordedEngagingSpeed: 3,
    });

    // 4 against 3: it is the faster, and its way straight back is open.
    expect(
      generateResolveEngageRetreatOptionEvent(state).retreatPaths,
    ).toStrictEqual([['step']]);
  });

  it('counts the card the defender committed toward the retreat it may make', () => {
    // A Speed 3 defender that cannot turn (Flexibility 0), against a
    // recorded 2, with the way straight back held; it committed a card for
    // +1 Flexibility.
    const defender = createUnitByStat('white', 'flexibility', 0);
    const state = frontEngagementOnE5({
      defender,
      defensiveCommitment: {
        card: createTestCard({ modifiers: ['flexibility'] }),
        commitmentType: 'completed',
      },
      neighbours: [enemyBlockingStraightBack(placed(defender, 'E-5', 'south'))],
      recordedEngagingSpeed: 2,
    });

    // With the card it may turn 45° before stepping back, as it could not
    // without it (§6.3.2, §9.1.3, §9.1.4).
    expect(
      generateResolveEngageRetreatOptionEvent(state).retreatPaths,
    ).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
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

    // Black holds the initiative, and its card in play gives +1 Speed to a
    // unit on its commander's space, which is E-5.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withCard = updatePlayerCardState(base, 'black', {
      ...base.cardState.black,
      inPlay: createTestCard({
        roundEffectModifiers: [{ type: 'speed', value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 0 },
      }),
    });
    const withUnits = addUnitToBoard(
      addUnitToBoard(withCard.boardState, engager),
      defender,
    );
    const withCommander = replaceBoard(
      withCard,
      createBoardWithCommander('black', 'E-5', withUnits),
    );

    // Black is carrying out a Move order for the engager.
    const ordered = updatePhaseState(
      withCommander,
      createIssueCommandsPhaseState(withCommander, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [engager.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    // Black names the engager, declines to commit, then steps from E-5 into
    // the enemy on D-5, already head-on.
    const named = applyEvent(
      createChooseMovingUnitEvent({ player: 'black', unit: engager.unit }),
      ordered,
    );
    const committed = applyEvent(
      createCommitToMovementEvent({ committedCard: 'none', player: 'black' }),
      named,
    );
    const moved = applyEvent(
      createMoveUnitEvent({
        moveCommander: false,
        path: ['step'],
        player: 'black',
      }),
      committed,
    );
    const start = generateStartEngagementEvent(moved);
    const engagedState = applyEvent(start, moved);

    // White, defending, declines to commit a card of its own.
    const state = applyEvent(
      createCommitToMovementEvent({ committedCard: 'none', player: 'white' }),
      engagedState,
    );

    const event = generateResolveEngageRetreatOptionEvent(state);

    // Commander is on E-5. Range 0 reaches that hex and not D-5, where the
    // engager now stands; its Speed was sampled on E-5, so 3+1 counts, and
    // is not slower than the defender's 4.
    expect(event.retreatPaths).toStrictEqual([]);
  });

  it('throws when no defender stands in the engaged space', () => {
    // A front engagement on a move into E-6, with nobody on the board.
    const state = createGameStateMovingInto(createFrontEngagementState());

    // Both units stay in the space while the defender decides, so a space
    // without it is a fault upstream.
    expect(() => generateResolveEngageRetreatOptionEvent(state)).toThrow(
      new Error('No defender stands in the engaged space'),
    );
  });
});
