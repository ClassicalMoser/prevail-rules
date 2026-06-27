import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
} from '@testing';
import { updatePhaseState } from '../';
import { throwIfNone, throwIfPending } from '@utils';

import { updateCommandResolutionState } from './updateCommandResolutionState';

/**
 * UpdateCommandResolutionState: Creates a new game state with the command resolution state updated in the issue commands phase.
 */
describe(updateCommandResolutionState, () => {
  it('given update the command resolution state in issue commands phase', () => {
    const state = createEmptyGameState();
    const commandResolution = createMovementResolutionState(state);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: commandResolution,
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    const updatedResolution = createMovementResolutionState(state, {
      completed: true,
    });
    const newState = updateCommandResolutionState(
      stateInPhase,
      updatedResolution,
    );

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('issueCommands');
    if (phase.phase !== 'issueCommands') {
      throw new Error('phase');
    }
    const commandState = throwIfPending(
      phase.currentCommandResolutionState,
      'command',
    );
    expect(commandState.completed).toBeTruthy();
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState();
    const commandResolution = createMovementResolutionState(state);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: commandResolution,
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const origPhase = throwIfNone(
      stateInPhase.currentRoundState.currentPhaseState,
      'phase',
    );
    const originalResolution =
      origPhase.phase === 'issueCommands'
        ? throwIfPending(origPhase.currentCommandResolutionState, 'command')
        : undefined;

    updateCommandResolutionState(stateInPhase, {
      ...commandResolution,
      completed: true,
    });

    const checkPhase = throwIfNone(
      stateInPhase.currentRoundState.currentPhaseState,
      'phase',
    );
    const currentResolution =
      checkPhase.phase === 'issueCommands'
        ? throwIfPending(checkPhase.currentCommandResolutionState, 'command')
        : undefined;
    expect(currentResolution).toBe(originalResolution);
  });

  it('given when no current command resolution state is set, throws', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: 'pending',
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const commandResolution = createMovementResolutionState(state);

    expect(() =>
      updateCommandResolutionState(stateInPhase, commandResolution),
    ).toThrow('No current command resolution state found');
  });
});
