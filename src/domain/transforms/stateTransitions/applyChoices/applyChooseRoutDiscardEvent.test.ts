import type { ChooseRoutDiscardEvent } from '@events';
import { throwIfNone, throwIfPending } from '@utils';
import { getIssueCommandsPhaseState } from '@queries';
import { tempCommandCards } from '@sampleValues';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRearEngagementState,
  createRoutState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyChooseRoutDiscardEvent } from './applyChooseRoutDiscardEvent';

/**
 * ChooseRoutDiscard completes an awaiting rout: discard cards, remove units,
 * mark rout complete (and rear engagement complete when applicable).
 */
describe(applyChooseRoutDiscardEvent, () => {
  function createStateInResolveRallyWithRout(
    step: 'firstPlayerResolveRally' | 'secondPlayerResolveRally',
    player: 'white' | 'black',
  ) {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const unit = createTestUnit(player, { attack: 2 });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState(player, unit, { numberToDiscard: 0 }),
    });
    const phaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState:
        step === 'firstPlayerResolveRally' ? rallyState : undefined,
      secondPlayerRallyResolutionState:
        step === 'secondPlayerResolveRally' ? rallyState : undefined,
      step,
    });
    return updatePhaseState(state, phaseState);
  }

  it('given firstPlayerResolveRally rout for white, completes rout and advances cleanup', () => {
    const state = createStateInResolveRallyWithRout(
      'firstPlayerResolveRally',
      'white',
    );
    const event: ChooseRoutDiscardEvent = {
      cardIds: [],
      choiceType: 'chooseRoutDiscard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    const newState = applyChooseRoutDiscardEvent(event, state);
    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('cleanup');
    if (phase.phase !== 'cleanup') {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('secondPlayerChooseRally');
    const rallyState = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    const rout = throwIfPending(rallyState.routState, 'rout');
    expect(rallyState.completed).toBe(true);
    expect(rout.cardsChosen).toBe(true);
    expect(rout.completed).toBe(true);
  });

  it('given secondPlayerResolveRally rout for black, completes rout and advances cleanup', () => {
    const state = createStateInResolveRallyWithRout(
      'secondPlayerResolveRally',
      'black',
    );
    const event: ChooseRoutDiscardEvent = {
      cardIds: [],
      choiceType: 'chooseRoutDiscard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    const newState = applyChooseRoutDiscardEvent(event, state);
    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('cleanup');
    if (phase.phase !== 'cleanup') {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('complete');
    const rallyState = throwIfPending(
      phase.secondPlayerRallyResolutionState,
      'rally',
    );
    expect(rallyState.completed).toBe(true);
    expect(throwIfPending(rallyState.routState, 'rout').cardsChosen).toBe(true);
    expect(throwIfPending(rallyState.routState, 'rout').completed).toBe(true);
  });

  it('given rear engagement rout, discards, removes defender, and completes engagement', () => {
    const defender = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'white',
    });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state.cardState.black.inPlay = createTestCard();
    state = updateCardState(state, {
      ...state.cardState,
      white: {
        ...state.cardState.white,
        inHand: [tempCommandCards[2], tempCommandCards[3]],
      },
    });
    state = updateBoardState(state, addUnitToBoard(state.boardState, defender));
    const routState = createRoutState('white', defender.unit, {
      numberToDiscard: 1,
    });
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: createRearEngagementState({ routState }),
          movingUnit: createUnitWithPlacement({
            coordinate: 'E-6',
            facing: 'north',
            playerSide: 'black',
          }),
          targetPlacement: { coordinate: 'E-6', facing: 'north' },
        }),
      }),
    );

    const next = applyChooseRoutDiscardEvent(
      {
        cardIds: [tempCommandCards[2].id],
        choiceType: 'chooseRoutDiscard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      },
      state,
    );

    const phase = getIssueCommandsPhaseState(next);
    const crs = throwIfPending(phase.currentCommandResolutionState, 'crs');
    if (crs.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(crs.engagementState, 'engagement');
    expect(engagement.completed).toBe(true);
    if (engagement.engagementResolutionState.engagementType !== 'rear') {
      throw new Error('rear');
    }
    expect(engagement.engagementResolutionState.completed).toBe(true);
    expect(engagement.engagementResolutionState.routState.completed).toBe(true);
    expect(next.boardState.board['E-6']?.unitPresence.presenceType).toBe(
      'none',
    );
    expect(next.routedUnits).toContainEqual(defender.unit);
    expect(next.cardState.white.inHand.map((c) => c.id)).toStrictEqual([
      tempCommandCards[3].id,
    ]);
  });

  it('given playCards phase, throws when no rout discard awaits', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const event: ChooseRoutDiscardEvent = {
      cardIds: [],
      choiceType: 'chooseRoutDiscard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(() => applyChooseRoutDiscardEvent(event, stateInPlayCards)).toThrow(
      'No rout discard awaiting choice',
    );
  });

  it('given cleanup discardPlayedCards, throws when no rout discard awaits', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'discardPlayedCards',
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const event: ChooseRoutDiscardEvent = {
      cardIds: [],
      choiceType: 'chooseRoutDiscard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(() => applyChooseRoutDiscardEvent(event, stateInCleanup)).toThrow(
      'No rout discard awaiting choice',
    );
  });
});
