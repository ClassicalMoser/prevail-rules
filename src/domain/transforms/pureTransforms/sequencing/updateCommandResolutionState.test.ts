import { createEmptyGameState } from '@factories';
import { getCurrentCommandResolutionState } from '@queries';
import {
  createGameStateResolvingCommand,
  createMovementResolutionState,
} from '@testing';

import { updateCommandResolutionState } from './updateCommandResolutionState';

/**
 * In Phase 3 each unit's move or shot is carried out on its own, one at a
 * time (§4.3.9). This writer carries the one under way forward; it does not
 * start one.
 */
describe('updateCommandResolutionState function', () => {
  it('replaces the unit’s move under way with its next state', () => {
    // A black unit's move is under way.
    const empty = createEmptyGameState('standard');
    const moving = createGameStateResolvingCommand(
      createMovementResolutionState(empty),
      empty,
    );

    // The move is carried on: its commander now rides along.
    const carried = createMovementResolutionState(empty, {
      moveCommander: true,
    });
    const after = updateCommandResolutionState(moving, carried);

    // The move under way is the one carried on.
    expect(getCurrentCommandResolutionState(after)).toBe(carried);
  });

  it('throws when no unit’s move or shot is under way, since there is nothing to carry forward', () => {
    // Phase 3, between units: none has been chosen to act yet.
    const between = createGameStateResolvingCommand('pending');
    const move = createMovementResolutionState(
      createEmptyGameState('standard'),
    );

    expect(() => updateCommandResolutionState(between, move)).toThrow(
      'No current command resolution state found',
    );
  });
});
