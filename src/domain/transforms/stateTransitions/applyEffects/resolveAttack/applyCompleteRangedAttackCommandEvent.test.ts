import type { CompleteRangedAttackCommandEvent } from '@events';
import {
  createIssueCommandsPhaseState,
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

import { applyCompleteRangedAttackCommandEvent } from './applyCompleteRangedAttackCommandEvent';

import { createEmptyGameState } from '@factories';

const event = {
  effectType: 'completeRangedAttackCommand' as const,
  eventType: 'gameEffect' as const,
} satisfies CompleteRangedAttackCommandEvent;

/** In-play command must be rangedAttack for this complete-effect path. */
const rangedCard = {
  ...createTestCard(),
  command: createTestCommand({ type: 'rangedAttack' }),
};

/**
 * A Shoot order ends when no shooter can be chosen (§4.3.11 step 1): the units
 * left are skipped, the player's remaining orders are finished, and the resolve
 * step advances.
 */
describe('applyCompleteRangedAttackCommandEvent function', () => {
  it('ends the order of a player whose remaining units have no legal target, and advances to the second player', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: rangedCard },
      white: { ...state.cardState.white, inPlay: createTestCard() },
    });
    state = updateBoardState(state, addUnitToBoard(state.boardState, attacker));
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [attacker.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const next = applyCompleteRangedAttackCommandEvent(event, state);

    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'issueCommands') {
      throw new Error('issue');
    }
    // The unit had no target, so it is skipped, and its owner's orders are done.
    expect(phase.step).toBe('secondPlayerIssueCommands');
    expect(phase.remainingUnitsFirstPlayer).toStrictEqual([]);
  });
});
