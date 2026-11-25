import type { UnitFacing } from '@entities';
import type { Commitment, GameState } from '@game';
import {
  createGameStateResolvingCommand,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  createUnitByStat,
  placed,
  replaceBoard,
} from '@testing';
import { addUnitToBoard } from '@transforms';

import { generateStartEngagementEvent } from './generateStartEngagementEvent';

import { createEmptyGameState, createUnitPlacement } from '@factories';
/**
 * Start of engagement: from movement resolution, classify rear vs flank vs front from
 * defender facing on the board vs engaging facing on targetPlacement.
 * Geometry here: engager at E-5 facing east, defender at E-6 (adjacent east); facings vary per case.
 */
describe('generateStartEngagementEvent function', () => {
  // The white defender standing on E-6.
  const defender = createTestUnit('white');

  /**
   * A black mover on E-5, facing east, whose move one step east into the
   * defender on E-6 is written. Which of the defender's sides it comes from
   * is the defender's facing. The mover's Speed and the card it committed
   * are the case's to choose; by default it is Speed 2 and declined.
   */
  function stateEnteringDefenderAt(options: {
    defenderFacing: UnitFacing;
    moverSpeed?: number;
    moverCommitment?: Commitment;
  }): GameState {
    // The mover still stands where its move began; the defender stands on
    // E-6, facing as the case says.
    const mover = createUnitByStat('black', 'speed', options.moverSpeed ?? 2);
    const empty = createEmptyGameState('standard');
    const board = addUnitToBoard(
      addUnitToBoard(empty.boardState, placed(mover, 'E-5', 'east')),
      placed(defender, 'E-6', options.defenderFacing),
    );
    const withBoard = replaceBoard(empty, board);

    // The move into E-6 is written, with the card the mover committed.
    const movement = createMovementResolutionState(withBoard, {
      commitment: options.moverCommitment ?? { commitmentType: 'declined' },
      movingUnit: mover,
      targetPlacement: createUnitPlacement('E-6', 'east'),
    });
    const state = createGameStateResolvingCommand(movement, withBoard);
    return state;
  }

  it('names the defender by who it is, and meets it head-on as a front engagement', () => {
    // The mover steps east into a defender facing west.
    const state = stateEnteringDefenderAt({ defenderFacing: 'west' });

    // The defender is named; where it stands and faces is the board's to
    // say. Facing each other is a front engagement (§6.3.1), and the mover's
    // Speed 2 is recorded.
    expect(generateStartEngagementEvent(state)).toStrictEqual({
      defendingUnit: defender,
      effectType: 'startEngagement',
      engagementType: 'front',
      engagingSpeed: 2,
      eventType: 'gameEffect',
    });
  });

  it('is a rear engagement when the mover faces the way the defender does', () => {
    // Both face east: the mover came from behind (§6.3.1).
    const state = stateEnteringDefenderAt({ defenderFacing: 'east' });
    expect(generateStartEngagementEvent(state).engagementType).toBe('rear');
  });

  it('is a flank engagement when the mover faces across the defender', () => {
    // The mover faces east across a defender facing south: 90° off (§6.3.1).
    const state = stateEnteringDefenderAt({ defenderFacing: 'south' });
    expect(generateStartEngagementEvent(state).engagementType).toBe('flank');
  });

  it('throws for facings 45° off head-on, which a front approach never ends in', () => {
    // East against north-west: neither rear, flank nor front. E-5 is one of
    // that defender's front spaces, and a move closing from the front
    // squares up (§6.2.3), so it would have ended facing south-east.
    const state = stateEnteringDefenderAt({ defenderFacing: 'northWest' });
    expect(() => generateStartEngagementEvent(state)).toThrow(
      'Unable to determine engagement type. Engaging facing: east, Defending facing: northWest',
    );
  });

  it('records the engaging unit’s Speed, sampled where its move began', () => {
    // A black mover of Speed 3, no card counted, enters white head-on.
    const state = stateEnteringDefenderAt({
      defenderFacing: 'west',
      moverSpeed: 3,
    });

    // Its Speed as it stood on E-5, before the engagement sets it down.
    expect(generateStartEngagementEvent(state).engagingSpeed).toBe(3);
  });

  it('counts the card the mover committed in the Speed it records', () => {
    // The same mover committed a card for +1 Speed before it moved (§4.3.10).
    const state = stateEnteringDefenderAt({
      defenderFacing: 'west',
      moverCommitment: {
        card: createTestCard({ modifiers: ['speed'] }),
        commitmentType: 'completed',
      },
      moverSpeed: 3,
    });

    // The card counts toward the mover's own Speed, and only its own.
    expect(generateStartEngagementEvent(state).engagingSpeed).toBe(4);
  });

  it('throws while the move is not yet written, before anyone is engaged', () => {
    // The mover is named and its card settled, but its path is not written.
    const empty = createEmptyGameState('standard');
    const state = createGameStateResolvingCommand(
      createMovementResolutionState(empty, {
        commitment: { commitmentType: 'declined' },
        targetPlacement: 'pending',
      }),
      empty,
    );

    // An engagement starts only from a move into an enemy (§6.1.1).
    expect(() => generateStartEngagementEvent(state)).toThrow(
      new Error('The move has not been written yet'),
    );
  });
});
