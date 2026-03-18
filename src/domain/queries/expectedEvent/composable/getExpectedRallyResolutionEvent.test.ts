import {
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedRallyResolutionEvent } from './getExpectedRallyResolutionEvent';

describe('getExpectedRallyResolutionEvent', () => {
  it('should resolve rally when the rally has not yet been resolved', () => {
    const rallyState = createRallyResolutionState();

    expect(getExpectedRallyResolutionEvent(rallyState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRally',
    });
  });

  it('should resolve routs when the rally is resolved and support was lost', () => {
    const unit = createTestUnit('black');
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: new Set([unit]),
      routState: createRoutState('black', unit),
    });

    expect(getExpectedRallyResolutionEvent(rallyState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('should resolve broken units when the rally is resolved and no support was lost yet', () => {
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: undefined,
    });

    expect(getExpectedRallyResolutionEvent(rallyState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveUnitsBroken',
    });
  });

  it('should throw when support was lost but no rout state exists', () => {
    const unit = createTestUnit('black');
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: new Set([unit]),
      routState: undefined,
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      'Rout state is required when units lost support',
    );
  });

  it('should throw when the rally is resolved but no units lost support and the state is incomplete', () => {
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      'Rally resolution complete but step not advanced',
    );
  });

  it('should throw when the rally is already complete', () => {
    const rallyState = createRallyResolutionState({
      completed: true,
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      'Rally resolution state is already complete',
    );
  });

  it('should throw when support was lost and rout is complete but rally is still incomplete', () => {
    const unit = createTestUnit('black');
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: new Set([unit]),
      routState: createRoutState('black', unit, {
        completed: true,
        numberToDiscard: 1,
        cardsChosen: true,
      }),
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      'Rally resolution complete but step not advanced',
    );
  });
});
