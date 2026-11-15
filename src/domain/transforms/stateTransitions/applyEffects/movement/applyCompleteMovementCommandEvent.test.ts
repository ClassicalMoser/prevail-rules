import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getIssueCommandsPhaseState } from '@queries';
import { tempCommandCards } from '@sampleValues';
import {
  createIssueCommandsPhaseState,
  createTestUnit,
  updateCardState,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteMovementCommandEvent } from './applyCompleteMovementCommandEvent';

/**
 * A Move order ends once none of the units it ordered is left to move
 * (§4.3.9). The expected engine asks for this effect only then, so applying
 * it finishes the player's orders: the units still listed are dropped, and
 * the issue-commands step moves on.
 */
describe('applyCompleteMovementCommandEvent function', () => {
  const event = {
    effectType: 'completeMovementCommand' as const,
    eventType: 'gameEffect' as const,
  };

  /**
   * Black holds the initiative and plays a Move card. The step and the units
   * still listed for each side are the case's own.
   */
  function stateResolvingMoves(
    step: 'firstPlayerResolveCommands' | 'secondPlayerResolveCommands',
    leftovers: { black: UnitInstance[]; white: UnitInstance[] },
  ): GameState {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: tempCommandCards[0] },
      white: { ...base.cardState.white, inPlay: tempCommandCards[0] },
    });
    const state = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        remainingUnitsFirstPlayer: leftovers.black,
        remainingUnitsSecondPlayer: leftovers.white,
        step,
      }),
    );
    return state;
  }

  it('ends the first player Move order and hands the issuing to the second player', () => {
    // Black's order still lists a unit, but it is not on the board, so it
    // cannot move.
    const stranded = createTestUnit('black', { attack: 2 });
    const state = stateResolvingMoves('firstPlayerResolveCommands', {
      black: [stranded],
      white: [],
    });

    const completed = applyCompleteMovementCommandEvent(event, state);

    // Black's orders are finished, the stranded unit dropped, and White
    // gives their orders next.
    expect(getIssueCommandsPhaseState(completed)).toMatchObject({
      currentCommandResolutionState: 'pending',
      remainingUnitsFirstPlayer: [],
      step: 'secondPlayerIssueCommands',
    });
  });

  it('ends the second player Move order and completes the phase', () => {
    // White's order lists nothing left to move.
    const state = stateResolvingMoves('secondPlayerResolveCommands', {
      black: [],
      white: [],
    });

    const completed = applyCompleteMovementCommandEvent(event, state);

    // With both sides' orders carried out, the phase is complete.
    expect(getIssueCommandsPhaseState(completed)).toMatchObject({
      remainingUnitsSecondPlayer: [],
      step: 'complete',
    });
  });
});
