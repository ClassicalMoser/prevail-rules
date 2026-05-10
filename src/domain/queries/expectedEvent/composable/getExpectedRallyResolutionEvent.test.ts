import {
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';

import { getExpectedRallyResolutionEvent } from './getExpectedRallyResolutionEvent';

/**
 * GetExpectedRallyResolutionEvent: next rally-resolution step as choice or effect from rally state.
 */
describe(getExpectedRallyResolutionEvent, () => {
  it('given resolve rally when the rally has not yet been resolved', () => {
    const rallyState = createRallyResolutionState();

    expect(getExpectedRallyResolutionEvent(rallyState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRally',
    });
  });

  it('given resolve routs when the rally is resolved and support was lost', () => {
    const unit = createTestUnit('black');
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      routState: createRoutState('black', unit),
      unitsLostSupport: new Set([unit]),
    });

    expect(getExpectedRallyResolutionEvent(rallyState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('given resolve broken units when the rally is resolved and no support was lost yet', () => {
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: undefined,
    });

    expect(getExpectedRallyResolutionEvent(rallyState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveUnitsBroken',
    });
  });

  it('given when support was lost but no rout state exists, throws', () => {
    const unit = createTestUnit('black');
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      routState: undefined,
      unitsLostSupport: new Set([unit]),
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      'Rout state is required when units lost support',
    );
  });

  it('given when the rally is resolved but no units lost support and the state is incomplete, throws', () => {
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      routState: undefined,
      unitsLostSupport: new Set(),
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      'Rally resolution complete but step not advanced',
    );
  });

  it('given when the rally is already complete, throws', () => {
    const rallyState = createRallyResolutionState({
      completed: true,
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      'Rally resolution state is already complete',
    );
  });

  it('given when support was lost and rout is complete but rally is still incomplete, throws', () => {
    const unit = createTestUnit('black');
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      routState: createRoutState('black', unit, {
        cardsChosen: true,
        completed: true,
        numberToDiscard: 1,
      }),
      unitsLostSupport: new Set([unit]),
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      'Rally resolution complete but step not advanced',
    );
  });
});
