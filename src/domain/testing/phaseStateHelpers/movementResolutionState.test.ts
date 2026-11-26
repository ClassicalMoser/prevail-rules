import { createEmptyGameState } from '@factories';
import { createMovementResolutionState } from './movementResolutionState';

/**
 * CreateMovementResolutionState: Creates a MovementResolutionState with sensible defaults.
 */
describe('createMovementResolutionState function', () => {
  it('given context, returns movement command resolution with unit and commitment', () => {
    const state = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(state);
    expect(resolution.commandResolutionType).toBe('movement');
    expect(resolution.substepType).toBe('commandResolution');
    expect(resolution.movingUnit.playerSide).toBe('black');
    expect(resolution.commitment.commitmentType).toBe('completed');
    expect(resolution.completed).toBe(false);
  });
});
