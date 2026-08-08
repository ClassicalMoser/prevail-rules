import type { Phase } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getExpectedEvent } from './getExpectedEvent';

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
describe(getExpectedEvent, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function expectDelegation(
    phase: Phase,
    delegatedMock: ReturnType<typeof vi.fn>,
    delegateReturn: { actionType: 'gameEffect'; effectType: string },
  ) {
    const state = createEmptyGameState();
    // Real phase must not be `'none'` or pre-round setup short-circuits.
    state.currentRoundState.currentPhaseState = {
      phase,
      step: 'complete',
    } as typeof state.currentRoundState.currentPhaseState;
    getCurrentPhaseStateMock.mockReturnValue({ phase });
    delegatedMock.mockReturnValue(delegateReturn);

    const result = getExpectedEvent(state);

    expect(result).toStrictEqual({ ...delegateReturn, expectedEventNumber: 0 });
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
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: 'playCards',
      step: 'complete',
    };
    getCurrentPhaseStateMock.mockReturnValue({ phase: 'invalidPhase' });

    expect(() => getExpectedEvent(state)).toThrow('Invalid phase');
  });

  it('given phase none, delegates to setup units handler', () => {
    const state = createEmptyGameState();
    getExpectedSetupUnitsEventMock.mockReturnValue({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });

    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      expectedEventNumber: 0,
      playerSource: 'white',
    });
    expect(getExpectedSetupUnitsEventMock).toHaveBeenCalledWith(state);
    expect(getCurrentPhaseStateMock).not.toHaveBeenCalled();
  });

  it('given white hand empty, returns gameOver game effect before phase routing', () => {
    const base = createEmptyGameState();
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
      expectedEventNumber: 0,
    });
    expect(getExpectedSetupUnitsEventMock).not.toHaveBeenCalled();
    expect(getCurrentPhaseStateMock).not.toHaveBeenCalled();
  });

  it('given black hand empty, returns gameOver game effect before phase routing', () => {
    const base = createEmptyGameState();
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
      expectedEventNumber: 0,
    });
    expect(getExpectedPlayCardsPhaseEventMock).not.toHaveBeenCalled();
  });

  it('given both hands empty, still returns gameOver game effect', () => {
    const base = createEmptyGameState();
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
      expectedEventNumber: 0,
    });
  });

  it('given unpayable rout discard, returns gameOver game effect before phase routing', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
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
      expectedEventNumber: 0,
    });
    expect(getExpectedCleanupPhaseEventMock).not.toHaveBeenCalled();
  });

  it('throws when winner is already set', () => {
    const state = { ...createEmptyGameState(), winner: 'black' as const };
    expect(() => getExpectedEvent(state)).toThrow('Game is already over');
  });
});
