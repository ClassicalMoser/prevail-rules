import { createEmptyGameState } from '@factories';
import {
  createMovementResolutionState,
  createRangedAttackResolutionState,
} from '@testing';
import { getExpectedCommandResolutionEvent } from './getExpectedCommandResolutionEvent';

/**
 * While an order is carried out, the next event depends on which kind of
 * order it is: a unit's move or a shot. Each kind decides its own next step.
 */
describe('getExpectedCommandResolutionEvent function', () => {
  it('while a unit is moving, asks what the move expects', () => {
    // A unit has committed and written its move onto open ground.
    const gameState = createEmptyGameState('standard');
    const resolutionState = createMovementResolutionState(gameState);

    // No enemy stands where it ends, so the move finishes.
    expect(
      getExpectedCommandResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeUnitMovement',
    });
  });

  it('while a unit is shooting, asks what the shot expects', () => {
    // A shot has been aimed, and both sides have made their commitments.
    const gameState = createEmptyGameState('standard');
    const resolutionState = createRangedAttackResolutionState(gameState);

    // The shot is measured next (§4.3.11).
    expect(
      getExpectedCommandResolutionEvent(gameState, resolutionState, 'white'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    });
  });

  it('throws when no order is being carried out', () => {
    // Nothing is resolving; asking is the caller's mistake.
    const gameState = createEmptyGameState('standard');

    expect(() =>
      getExpectedCommandResolutionEvent(gameState, 'pending', 'black'),
    ).toThrow('No command resolution state found');
  });

  it('throws for a kind of order the game does not have', () => {
    // An order kind no card gives; the type forbids it, so it is forced past
    // to stand for a corrupt state.
    const gameState = createEmptyGameState('standard');
    const resolutionState = {
      ...createMovementResolutionState(gameState),
      commandResolutionType: 'invalid',
    } as never;

    expect(() =>
      getExpectedCommandResolutionEvent(gameState, resolutionState, 'black'),
    ).toThrow('Invalid command resolution type: invalid');
  });
});
