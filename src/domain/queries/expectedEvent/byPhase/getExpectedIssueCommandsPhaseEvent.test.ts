import type {
  GameState,
  IssueCommandsPhaseStep,
  StandardBoard,
} from '@entities';
import { expectedGameEffectSchema, expectedPlayerInputSchema } from '@entities';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getExpectedIssueCommandsPhaseEvent } from './getExpectedIssueCommandsPhaseEvent';

/**
 * getExpectedIssueCommandsPhaseEvent: next event during the issue-commands phase from phase state.
 */
describe('getExpectedIssueCommandsPhaseEvent', () => {
  function createGameStateInIssueCommandsStep(
    step: IssueCommandsPhaseStep,
    currentInitiative: 'black' | 'white' = 'black',
    buildOverrides?: (
      state: GameState<StandardBoard>,
    ) => Parameters<typeof createIssueCommandsPhaseState>[1],
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative });
    state.cardState.black.inPlay = createTestCard();
    state.cardState.white.inPlay = createTestCard();

    const overrides = buildOverrides?.(state);
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        step,
        remainingCommandsFirstPlayer: new Set(),
        remainingUnitsFirstPlayer: new Set(),
        remainingCommandsSecondPlayer: new Set(),
        remainingUnitsSecondPlayer: new Set(),
        currentCommandResolutionState: undefined,
        ...overrides,
      }),
    );
  }

  it('given they have remaining commands, returns issueCommand for the first player', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerIssueCommands',
      'black',
      () => ({
        remainingCommandsFirstPlayer: new Set([createTestCard().command]),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('black');
    expect(parsed.data?.choiceType).toBe('issueCommand');
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
            commitmentType: 'pending',
          },
        }),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('black');
    expect(parsed.data?.choiceType).toBe('commitToMovement');
  });

  it('given start command resolution for the first player when units remain', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
      'black',
      () => ({
        remainingUnitsFirstPlayer: new Set([
          createTestUnit('black', { attack: 3 }),
        ]),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('black');
    expect(parsed.data?.choiceType).toBe('moveUnit');
  });

  it('given when first player units are exhausted but step did not advance, throws', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
    );

    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'All first player units resolved but step not advanced to secondPlayerIssueCommands',
    );
  });

  it('given they have remaining commands, returns issueCommand for the second player', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerIssueCommands',
      'black',
      () => ({
        remainingCommandsSecondPlayer: new Set([createTestCard().command]),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('white');
    expect(parsed.data?.choiceType).toBe('issueCommand');
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
            commitmentType: 'pending',
          },
        }),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('white');
    expect(parsed.data?.choiceType).toBe('commitToMovement');
  });

  it('given start command resolution for the second player when units remain', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerResolveCommands',
      'black',
      () => ({
        remainingUnitsSecondPlayer: new Set([
          createTestUnit('white', { attack: 3 }),
        ]),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('white');
    expect(parsed.data?.choiceType).toBe('moveUnit');
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
    const parsed = expectedGameEffectSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.effectType).toBe('completeIssueCommandsPhase');
  });

  it('given for invalid step, throws', () => {
    const state = createGameStateInIssueCommandsStep('complete');
    // Force an invalid issue commands step to hit the default branch.
    state.currentRoundState.currentPhaseState = {
      ...state.currentRoundState.currentPhaseState,
      step: 'invalidStep',
    } as any;

    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'Invalid issueCommands phase state: invalidStep',
    );
  });
});
