import type { GameState, IssueCommandsPhaseStep } from '@game';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
  replaceBoard,
} from '@testing';
import {
  addUnitToBoard,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';

import { getExpectedIssueCommandsPhaseEvent } from './getExpectedIssueCommandsPhaseEvent';

import { createEmptyGameState } from '@factories';
/**
 * GetExpectedIssueCommandsPhaseEvent: next event during the issue-commands phase from phase state.
 */
describe('getExpectedIssueCommandsPhaseEvent function', () => {
  function createGameStateInIssueCommandsStep(
    step: IssueCommandsPhaseStep,
    currentInitiative: 'black' | 'white' = 'black',
    buildOverrides?: (
      state: GameState,
    ) => Parameters<typeof createIssueCommandsPhaseState>[1],
  ): GameState {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      currentInitiative,
    );
    state.cardState.black.inPlay = createTestCard();
    state.cardState.white.inPlay = createTestCard();

    const overrides = buildOverrides?.(state);
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending' as const,
        remainingUnitsFirstPlayer: [],
        remainingUnitsSecondPlayer: [],
        step,
        ...overrides,
      }),
    );
  }

  it('given no unit the order could take, still asks for the allocation', () => {
    // Black is issuing, but no unit of its stands on the board.
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerIssueCommands',
    );

    // Ordering nobody is always a legal allocation (§4.3.2), so the player is
    // asked all the same, and the phase cannot stall.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'issueCommands',
      playerSource: 'black',
    });
  });

  it('given a unit the order may take, asks the issuing player for the allocation', () => {
    // Black is issuing, with one of its units on the board.
    let state = createGameStateInIssueCommandsStep('firstPlayerIssueCommands');
    state = replaceBoard(
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

    // Black is asked for all its orders at once (§4.3).
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'issueCommands',
      playerSource: 'black',
    });
  });

  it('given the first player, returns the current command resolution event', () => {
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
      'black',
      (gameState) => ({
        currentCommandResolutionState: createMovementResolutionState(
          gameState,
          {
            commitment: {
              commitmentType: 'pending' as const,
            },
          },
        ),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
  });

  it('given start command resolution for the first player when units remain', () => {
    const onBoard = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { attack: 3 },
    });
    let state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
      'black',
      () => ({
        remainingUnitsFirstPlayer: [onBoard.unit],
      }),
    );
    state = replaceBoard(state, addUnitToBoard(state.boardState, onBoard));

    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseMovingUnit',
      playerSource: 'black',
    });
  });

  it("given the first player's last ordered unit has moved, expects completeMovementCommand", () => {
    // Black is carrying out a Move order with no unit left to move.
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
    );

    // Ending the order is asked for as its own effect.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeMovementCommand',
    });
  });

  it("given the first player's last ordered unit has shot, expects completeRangedAttackCommand", () => {
    // Black is carrying out a Shoot order with no unit left to shoot.
    const state = createGameStateInIssueCommandsStep(
      'firstPlayerResolveCommands',
    );
    state.cardState.black.inPlay = {
      ...createTestCard(),
      command: {
        ...createTestCard().command,
        type: 'rangedAttack',
      },
    };

    // Ending the order is asked for as its own effect.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    });
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

  it('given movement card and remaining units that cannot move, expects completeMovementCommand', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerResolveCommands',
      'black',
      () => ({
        remainingUnitsSecondPlayer: [createTestUnit('white', { attack: 2 })],
      }),
    );
    state.cardState.white.inPlay = {
      ...createTestCard(),
      command: {
        ...createTestCard().command,
        type: 'movement',
      },
    };

    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeMovementCommand',
    });
  });

  it('given the second player is issuing, asks them for the allocation', () => {
    // Black has the initiative, so White issues second.
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerIssueCommands',
    );

    // White is asked for all its orders at once (§4.3).
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'issueCommands',
      playerSource: 'white',
    });
  });

  it('given the second player, returns the current command resolution event', () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerResolveCommands',
      'black',
      (gameState) => ({
        currentCommandResolutionState: createMovementResolutionState(
          gameState,
          {
            commitment: {
              commitmentType: 'pending' as const,
            },
          },
        ),
      }),
    );

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
  });

  it('given start command resolution for the second player when units remain', () => {
    const onBoard = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'south',
      playerSide: 'white',
      unitOptions: { attack: 3 },
    });
    let state = createGameStateInIssueCommandsStep(
      'secondPlayerResolveCommands',
      'black',
      () => ({
        remainingUnitsSecondPlayer: [onBoard.unit],
      }),
    );
    state = replaceBoard(state, addUnitToBoard(state.boardState, onBoard));

    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseMovingUnit',
      playerSource: 'white',
    });
  });

  it("given the second player's last ordered unit has moved, expects completeMovementCommand", () => {
    const state = createGameStateInIssueCommandsStep(
      'secondPlayerResolveCommands',
    );

    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeMovementCommand',
    });
  });

  it('given context, returns completeIssueCommandsPhase game effect', () => {
    const state = createGameStateInIssueCommandsStep('complete');

    const expectedEvent = getExpectedIssueCommandsPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
  });

  it('given for invalid step, throws', () => {
    const state = createGameStateInIssueCommandsStep('complete');
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState === 'none') {
      throw new Error('expected issueCommands phase state');
    }
    phaseState.step = 'invalidStep' as unknown as typeof phaseState.step; // Intentionally bad type cast to test error path

    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'Invalid issueCommands phase state: invalidStep',
    );
  });
});
