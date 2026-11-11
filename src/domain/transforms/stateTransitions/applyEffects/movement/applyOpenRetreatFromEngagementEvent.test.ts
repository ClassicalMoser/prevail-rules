import type { MoveDelta } from '@entities';
import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getFrontEngagementStateFromMovement } from '@queries';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyOpenRetreatFromEngagementEvent } from './applyOpenRetreatFromEngagementEvent';

/**
 * Opens the retreat of a defender engaged from the front that chose to fall
 * back (§6.3.2), writing the retreats its procedure recorded on the event.
 * The transform does not judge them, so each case varies the event to show
 * one branch.
 *
 * White's defender stands on E-5 facing north, where it was engaged.
 */
describe('applyOpenRetreatFromEngagementEvent function', () => {
  const defender = placed(createTestUnit('white'), 'E-5', 'north');

  function defenderChoseToRetreat(): GameState {
    const state = createEmptyGameState('standard');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defender),
    };
    // The defender could get away, and chose to; its retreat is not open.
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

  /** Opens the retreat with the given recorded paths and reads it back. */
  function openedWith(retreatPaths: MoveDelta[][]) {
    const next = applyOpenRetreatFromEngagementEvent(
      {
        effectType: 'openRetreatFromEngagement',
        eventType: 'gameEffect',
        retreatPaths,
      },
      defenderChoseToRetreat(),
    );
    const { retreatState } =
      getFrontEngagementStateFromMovement(next).engagementResolutionState;
    if (retreatState === 'pending') {
      throw new Error('The retreat should be open');
    }
    return retreatState;
  }

  it('a lone retreat is opened already chosen, for the defender standing there', () => {
    // On an empty board the defender's one retreat is a step straight back.
    const retreat = openedWith([['step']]);

    expect(retreat.retreatingUnit).toStrictEqual(defender);
    // One legal retreat is no choice (§9.1.3), and one that can be made
    // never turns into a rout (§9.1.6).
    expect(retreat.chosenRetreatPath).toStrictEqual(['step']);
    expect(retreat.routState).toBe('bypassed');
  });

  it('a tie is opened for the defender to choose', () => {
    // Two equally small retreats, as the procedure finds them when an enemy
    // stands behind the defender.
    const retreat = openedWith([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);

    expect(retreat.legalRetreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
    expect(retreat.chosenRetreatPath).toBe('pending');
  });

  it('throws when no retreat is recorded, since a defender with nowhere to go stands', () => {
    // A front-engaged defender may fall back only where there is somewhere to
    // fall back to (§9.1.5); with nowhere it stands and the units fight on, so
    // no retreat is ever opened for it.
    expect(() => openedWith([])).toThrow(
      'A defender with nowhere to retreat stands; no retreat opens',
    );
  });
});
