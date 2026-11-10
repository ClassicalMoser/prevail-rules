import {
  createRetreatState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';

import { isOpenSubstep } from './isOpenSubstep';

describe('isOpenSubstep function', () => {
  it('a written outcome is open', () => {
    // A retreat is one written outcome.
    const standing = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
    });
    const retreat = createRetreatState(standing, legalRetreatsOf(standing));

    expect(isOpenSubstep(retreat)).toBe(true);
  });

  it('pending has not been written', () => {
    // The slot still holds the unwritten string.
    expect(isOpenSubstep('pending')).toBe(false);
  });

  it('a bypassed outcome did not happen', () => {
    // The attack reached no threshold here, so there is no substep to read.
    expect(isOpenSubstep('bypassed')).toBe(false);
  });
});
