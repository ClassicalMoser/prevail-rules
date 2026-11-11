import { tempCommandCards } from '@sampleValues';
import type { GameState, Phase, PhaseState } from '@game';
import {
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getExpectedEvent } from './getExpectedEvent';

import { createEmptyGameState } from '@factories';

const {
  getCurrentPhaseStateMock,
  getExpectedCleanupPhaseEventMock,
  getExpectedIssueCommandsPhaseEventMock,
  getExpectedMoveCommandersPhaseEventMock,
  getExpectedPlayCardsPhaseEventMock,
  getExpectedResolveMeleePhaseEventMock,
  getExpectedSetupUnitsEventMock,
} = vi.hoisted(() => ({
  getCurrentPhaseStateMock: vi.fn(),
  getExpectedCleanupPhaseEventMock: vi.fn(),
  getExpectedIssueCommandsPhaseEventMock: vi.fn(),
  getExpectedMoveCommandersPhaseEventMock: vi.fn(),
  getExpectedPlayCardsPhaseEventMock: vi.fn(),
  getExpectedResolveMeleePhaseEventMock: vi.fn(),
  getExpectedSetupUnitsEventMock: vi.fn(),
}));

vi.mock(import('@queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCurrentPhaseState: getCurrentPhaseStateMock,
  };
});

vi.mock(import('./byPhase'), () => ({
  getExpectedCleanupPhaseEvent: getExpectedCleanupPhaseEventMock,
  getExpectedIssueCommandsPhaseEvent: getExpectedIssueCommandsPhaseEventMock,
  getExpectedMoveCommandersPhaseEvent: getExpectedMoveCommandersPhaseEventMock,
  getExpectedPlayCardsPhaseEvent: getExpectedPlayCardsPhaseEventMock,
  getExpectedResolveMeleePhaseEvent: getExpectedResolveMeleePhaseEventMock,
  getExpectedSetupUnitsEvent: getExpectedSetupUnitsEventMock,
}));

/**
 * GetExpectedEvent: top-level router to the next expected event from full game state.
 */
describe('getExpectedEvent function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** Both hands hold a card so empty-hand game over does not short-circuit. */
  function gameStillGoing() {
    const state = createEmptyGameState('standard');
    return updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [createTestCard()],
      },
      white: {
        ...state.cardState.white,
        inHand: [createTestCard()],
      },
    });
  }

  /** A real phase whose rout slice is not open, so the win check continues. */
  function phaseWithNoOpenRout(phase: Phase, state: GameState): PhaseState {
    if (phase === 'playCards') {
      return createPlayCardsPhaseState();
    }
    if (phase === 'moveCommanders') {
      return createMoveCommandersPhaseState();
    }
    if (phase === 'issueCommands') {
      return createIssueCommandsPhaseState(state);
    }
    if (phase === 'resolveMelee') {
      return createResolveMeleePhaseState(state);
    }
    return createCleanupPhaseState();
  }

  function expectDelegation(
    phase: Phase,
    delegatedMock: ReturnType<typeof vi.fn>,
    delegateReturn: { actionType: 'gameEffect'; effectType: string },
  ) {
    const going = gameStillGoing();
    // The win check reads this phase. No rout slice is open, so it continues
    // and the mock still selects the handler.
    const state = updatePhaseState(going, phaseWithNoOpenRout(phase, going));
    getCurrentPhaseStateMock.mockReturnValue({ phase });
    delegatedMock.mockReturnValue(delegateReturn);

    const result = getExpectedEvent(state);

    expect(result).toStrictEqual(delegateReturn);
    expect(getCurrentPhaseStateMock).toHaveBeenCalledWith(state);
    expect(delegatedMock).toHaveBeenCalledWith(state);
  }

  it('given delegate playCards to the play cards phase handler', () => {
    expectDelegation('playCards', getExpectedPlayCardsPhaseEventMock, {
      actionType: 'gameEffect',
      effectType: 'playCardsEvent',
    });
  });

  it('given delegate moveCommanders to the move commanders phase handler', () => {
    expectDelegation(
      'moveCommanders',
      getExpectedMoveCommandersPhaseEventMock,
      {
        actionType: 'gameEffect',
        effectType: 'moveCommandersEvent',
      },
    );
  });

  it('given delegate issueCommands to the issue commands phase handler', () => {
    expectDelegation('issueCommands', getExpectedIssueCommandsPhaseEventMock, {
      actionType: 'gameEffect',
      effectType: 'issueCommandsEvent',
    });
  });

  it('given delegate resolveMelee to the resolve melee phase handler', () => {
    expectDelegation('resolveMelee', getExpectedResolveMeleePhaseEventMock, {
      actionType: 'gameEffect',
      effectType: 'resolveMeleeEvent',
    });
  });

  it('given delegate cleanup to the cleanup phase handler', () => {
    expectDelegation('cleanup', getExpectedCleanupPhaseEventMock, {
      actionType: 'gameEffect',
      effectType: 'cleanupEvent',
    });
  });

  it('given for an invalid phase, throws', () => {
    const state = gameStillGoing();
    state.currentRoundState.currentPhaseState = {
      phase: 'playCards',
      step: 'complete',
    };
    getCurrentPhaseStateMock.mockReturnValue({ phase: 'invalidPhase' });

    expect(() => getExpectedEvent(state)).toThrow('Invalid phase');
  });

  it('given phase none, delegates to setup units handler', () => {
    const state = gameStillGoing();
    getExpectedSetupUnitsEventMock.mockReturnValue({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });

    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
    expect(getExpectedSetupUnitsEventMock).toHaveBeenCalledWith(state);
    expect(getCurrentPhaseStateMock).not.toHaveBeenCalled();
  });

  it('given white hand empty, returns gameOver game effect before phase routing', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
    expect(getExpectedSetupUnitsEventMock).not.toHaveBeenCalled();
    expect(getCurrentPhaseStateMock).not.toHaveBeenCalled();
  });

  it('given black hand empty, returns gameOver game effect before phase routing', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
    });
    state.currentRoundState.currentPhaseState = {
      phase: 'playCards',
      step: 'complete',
    };

    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
    expect(getExpectedPlayCardsPhaseEventMock).not.toHaveBeenCalled();
  });

  it('given both hands empty, still returns gameOver game effect', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
  });

  it('given unpayable rout discard, returns gameOver game effect before phase routing', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
        inPlay: null,
      },
    });
    const state = updatePhaseState(
      withCards,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          playerRallied: true,
          rallyResolved: true,
          routState: createRoutState('white', createTestUnit('white'), {
            cardsChosen: false,
            numberToDiscard: 2,
          }),
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
    expect(getExpectedCleanupPhaseEventMock).not.toHaveBeenCalled();
  });

  it('throws when winner is already set', () => {
    const state = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };
    expect(() => getExpectedEvent(state)).toThrow('Game is already over');
  });
});
