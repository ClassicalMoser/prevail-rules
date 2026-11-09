import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateOpenRetreatFromEngagementEvent } from './generateOpenRetreatFromEngagementEvent';

/**
 * A defender engaged from the front that chose to fall back (§6.3.2): the
 * effect that opens its retreat records where it may go, worked out from the
 * board as it stands (§9.1).
 *
 * White's defender stands on E-5 facing north; the engaging unit waits on
 * its own start space until the engagement places it, so it is not here.
 */
describe('generateOpenRetreatFromEngagementEvent function', () => {
  function defenderChoseToRetreat(enemyBehind = false): GameState {
    const state = createEmptyGameState('standard');
    const defender = placed(createTestUnit('white'), 'E-5', 'north');
    const withDefender = addUnitToBoard(state.boardState, defender);
    // With `enemyBehind`, a black unit on F-5 faces the defender from behind.
    const board = enemyBehind
      ? addUnitToBoard(
          withDefender,
          placed(createTestUnit('black'), 'F-5', 'south'),
        )
      : withDefender;
    const withBoard = { ...state, boardState: board };
    // The defender could get away, and chose to.
    const front = createFrontEngagementState({
      defendingUnitCanRetreat: true,
      defendingUnitRetreats: true,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: createMovementResolutionState(withBoard, {
        engagementState: front,
        targetPlacement: front.targetPlacement,
      }),
    });
    return updatePhaseState(withBoard, phase);
  }

  it('records the one retreat open to a defender with room behind it', () => {
    // §9.1.3: the smallest retreat is one step straight back.
    const event = generateOpenRetreatFromEngagementEvent(
      defenderChoseToRetreat(),
      4,
    );

    expect(event).toStrictEqual({
      effectType: 'openRetreatFromEngagement',
      eventNumber: 4,
      eventType: 'gameEffect',
      retreatPaths: [['step']],
    });
  });

  it('records both equally small retreats when the way straight back is held', () => {
    // An enemy on F-5 blocks the step straight back; turning 45° either way
    // and stepping back are the two smallest retreats left (§9.1.3, §9.1.4).
    const event = generateOpenRetreatFromEngagementEvent(
      defenderChoseToRetreat(true),
      4,
    );

    expect(event.retreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
  });
});
