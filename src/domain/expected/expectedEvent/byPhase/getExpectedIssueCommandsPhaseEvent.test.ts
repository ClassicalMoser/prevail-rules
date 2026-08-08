import type { GameState, IssueCommandsPhaseStep } from '@game';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getExpectedIssueCommandsPhaseEvent } from './getExpectedIssueCommandsPhaseEvent';

/**
 * GetExpectedIssueCommandsPhaseEvent: next event during the issue-commands phase from phase state.
 */
describe(getExpectedIssueCommandsPhaseEvent, () => {
  function createGameStateInIssueCommandsStep(
    step: IssueCommandsPhaseStep,
    currentInitiative: 'black' | 'white' = 'black',
    buildOverrides?: (
      state: GameState,
    ) => Parameters<typeof createIssueCommandsPhaseState>[1],
  ): GameState {
    const state = createEmptyGameState({ currentInitiative });
    state.cardState.black.inPlay = createTestCard();
    state.cardState.white.inPlay = createTestCard();

    const overrides = buildOverrides?.(state);
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending' as const,
        remainingCommandsFirstPlayer: [],
        remainingCommandsSecondPlayer: [],
        remainingUnitsFirstPlayer: [],
        remainingUnitsSecondPlayer: [],
        step,
        ...overrides,
      }),
    );
  }

  it('given remaining commands with no issuable selection, returns doneIssuingCommands', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerIssueCommands',
      'black',
      () => ({
        remainingCommandsFirstPlayer: [createTestCard().command],
      }),
    );

    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'doneIssuingCommands',
      playerSource: 'black',
    });
  });

  it('given remaining commands with an issuable selection, returns issueCommand', () => {
    const command = {
      ...createTestCard().command,
      number: 1,
      restrictions: {
        inspirationRangeRestriction: -1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'units' as const,
    };
    let state = createGameStateInIssueCommandsStep(
      'firstPlayerIssueCommands',
      'black',
      () => ({
        remainingCommandsFirstPlayer: [command],
      }),
    );
    state = updateBoardState(
      state,
      addUnitToBoard(
        state.boardState,
        createUnitWithPlacement({
          coordinate: 'E-5',
          facing: 'north',
          playerSide: 'black',
        }),
      ),
    );

    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'issueCommand',
      playerSource: 'black',
    });
  });

  it('given when first player commands are exhausted but step did not advance, throws', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerIssueCommands',
    );

    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'All first player commands issued but step not advanced to firstPlayerResolveCommands',
    );
  });

  it('given the first player, returns the current command resolution event', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
      'black',
      (state) => ({
        currentCommandResolutionState: createMovementResolutionState(state, {
          commitment: {
            commitmentType: 'pending' as const,
          },
        }),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
  });

  it('given start command resolution for the first player when units remain', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
      'black',
      () => ({
        remainingUnitsFirstPlayer: [createTestUnit('black', { attack: 3 })],
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
  });

  it('given when first player units are exhausted but step did not advance, throws', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
    );

    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'All first player units resolved but step not advanced to secondPlayerIssueCommands',
    );
  });

  it('given ranged card and remaining units with no legal target, expects completeRangedAttackCommand', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
      'black',
      () => ({
        remainingUnitsFirstPlayer: [createTestUnit('black', { range: 2 })],
      }),
    );
    state.cardState.black.inPlay = {
      ...createTestCard(),
      command: {
        ...createTestCard().command,
        type: 'rangedAttack',
      },
    };

    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    });
  });

  it('given they have remaining commands, returns issueCommand for the second player', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerIssueCommands',
      'black',
      () => ({
        remainingCommandsSecondPlayer: [createTestCard().command],
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
  });

  it('given when second player commands are exhausted but step did not advance, throws', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerIssueCommands',
    );

    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'All second player commands issued but step not advanced to secondPlayerResolveCommands',
    );
  });

  it('given the second player, returns the current command resolution event', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerResolveCommands',
      'black',
      (state) => ({
        currentCommandResolutionState: createMovementResolutionState(state, {
          commitment: {
            commitmentType: 'pending' as const,
          },
        }),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
  });

  it('given start command resolution for the second player when units remain', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerResolveCommands',
      'black',
      () => ({
        remainingUnitsSecondPlayer: [createTestUnit('white', { attack: 3 })],
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
  });

  it('given when second player units are exhausted but step did not advance, throws', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerResolveCommands',
    );

    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'All second player units resolved but step not advanced to complete',
    );
  });

  it('given context, returns completeIssueCommandsPhase game effect', () => {
    const state = createGameStateInIssueCommandsStep('complete');

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
  });

  it('given for invalid step, throws', () => {
    const state = createGameStateInIssueCommandsStep('complete');
    // Force an invalid issue commands step to hit the default branch.
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState !== 'none') {
      state.currentRoundState.currentPhaseState = {
        ...phaseState,
        step: 'invalidStep',
      } as any;
    }

    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'Invalid issueCommands phase state: invalidStep',
    );
  });
});
