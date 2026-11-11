import type { CompleteRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createTestCommand,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteRangedAttackEvent } from './applyCompleteRangedAttackEvent';

import { createEmptyGameState } from '@factories';

const event = {
  effectType: 'completeRangedAttack' as const,
  eventType: 'gameEffect' as const,
} satisfies CompleteRangedAttackEvent;

/** The order being carried out is a Shoot order. */
const rangedCard = {
  ...createTestCard(),
  command: createTestCommand({ type: 'rangedAttack' }),
};

/**
 * One shot of a Shoot order is done (§4.3.11): the shot is cleared and the
 * next shooter may be chosen. The order ends when no ordered unit is left.
 */
describe('applyCompleteRangedAttackEvent function', () => {
  /** Black resolving a Shoot order with these units still to act, and a shot under way. */
  function resolvingWithShotUnderWay(
    remaining: ReturnType<typeof createUnitWithPlacement>[],
  ): GameState {
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: rangedCard },
      white: { ...state.cardState.white, inPlay: createTestCard() },
    });
    for (const unit of remaining) {
      state = updateBoardState(state, addUnitToBoard(state.boardState, unit));
    }
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createRangedAttackResolutionState(state),
        remainingUnitsFirstPlayer: remaining.map((entry) => entry.unit),
        step: 'firstPlayerResolveCommands',
      }),
    );
  }

  it('clears the shot and keeps a unit still to act, even one with no target now', () => {
    // A unit with no enemy in reach is not dropped from the order: a later
    // shot may give it a target.
    const waiting = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    const state = resolvingWithShotUnderWay([waiting]);

    const next = applyCompleteRangedAttackEvent(event, state);

    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'issueCommands') {
      throw new Error('issue');
    }
    expect(phase.currentCommandResolutionState).toBe('pending');
    expect(phase.step).toBe('firstPlayerResolveCommands');
    expect(phase.remainingUnitsFirstPlayer).toStrictEqual([waiting.unit]);
  });

  it('ends the player’s orders when no ordered unit is left to act', () => {
    const state = resolvingWithShotUnderWay([]);

    const next = applyCompleteRangedAttackEvent(event, state);

    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'issueCommands') {
      throw new Error('issue');
    }
    // The first player is done, and the second player's orders come next.
    expect(phase.step).toBe('secondPlayerIssueCommands');
    expect(phase.currentCommandResolutionState).toBe('pending');
  });
});
