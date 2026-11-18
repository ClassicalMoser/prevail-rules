import { throwIfPending } from '@utils';
import type { ResolveFlankEngagementEvent } from '@events';
import type { GameState } from '@game';
import {
  createFlankEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyResolveFlankEngagementEvent } from './applyResolveFlankEngagementEvent';

import { createEmptyGameState } from '@factories';
/** A defender engaged from the flank is turned to face its attacker (§6.3.4). */
describe('applyResolveFlankEngagementEvent function', () => {
  it('sets the attacker down with the defender, the defender turned to face it (§6.3.4)', () => {
    // White stands at E-5 facing east; Black's move ends on its flank,
    // facing north, and has waited on F-5 until the engagement places it.
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit('white');
    const attacker = createTestUnit('black', { attack: 2 });
    const flank = createFlankEngagementState();
    const start = placed(attacker, 'F-5', 'north');
    const boardState = addUnitToBoard(
      addUnitToBoard(state.boardState, placed(defender, 'E-5', 'east')),
      start,
    );
    const withBoard = { ...state, boardState };
    const movement = createMovementResolutionState(withBoard, {
      engagementState: flank,
      movingUnit: start,
      targetPlacement: flank.targetPlacement,
    });
    const full: GameState = updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );
    const event: ResolveFlankEngagementEvent = {
      defenderWithPlacement: placed(defender, 'E-5', 'east'),
      effectType: 'resolveFlankEngagement',
      eventType: 'gameEffect',
      newFacing: 'south',
    };

    const next = applyResolveFlankEngagementEvent(event, full);

    // The two are engaged in E-5: Black facing north, so White faces south.
    expect(next.boardState.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'north',
      primaryUnit: attacker,
      secondaryUnit: defender,
    });
    // Black has left the space it waited on.
    expect(next.boardState.board['F-5']?.unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    // The movement records Black where it now stands.
    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'issueCommands') {
      throw new Error('Expected Issue Commands');
    }
    const resolution = throwIfPending(
      phase.currentCommandResolutionState,
      'command',
    );
    if (resolution.commandResolutionType !== 'movement') {
      throw new Error('Expected a Move order');
    }
    expect(resolution.movingUnit).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: attacker,
    });
    // And the engagement is over: the defender has turned.
    const engagement = throwIfPending(resolution.engagementState, 'engagement');
    expect(engagement.completed).toBe(true);
    expect(engagement.engagementResolutionState).toStrictEqual({
      defenderRotated: true,
      engagementType: 'flank',
    });
  });
});
