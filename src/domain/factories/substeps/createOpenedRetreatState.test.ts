import { createUnitWithPlacement } from '@testing';

import { createOpenedRetreatState } from './createOpenedRetreatState';

/**
 * A retreat is the smallest legal backward move (§9.1.3). One legal path is
 * carried out as it stands; several are the owner's to choose among; none
 * means the unit routs instead (§9.1.6).
 */
describe('createOpenedRetreatState function', () => {
  const unit = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'south',
    playerSide: 'white',
  });

  it('carries out the only retreat as it stands, and bypasses the rout', () => {
    const only = createOpenedRetreatState(unit, [['step']]);

    expect(only.chosenRetreatPath).toStrictEqual(['step']);
    expect(only.routState).toBe('bypassed');
    expect(only.completed).toBe(false);
  });

  it('leaves the choice to the owner when there are several retreats, and bypasses the rout', () => {
    const several = createOpenedRetreatState(unit, [
      ['step'],
      ['turnLeft', 'step'],
    ]);

    expect(several.chosenRetreatPath).toBe('pending');
    expect(several.routState).toBe('bypassed');
  });

  it('leaves the rout pending when there is nowhere to fall back to', () => {
    const nowhere = createOpenedRetreatState(unit, []);

    expect(nowhere.chosenRetreatPath).toBe('pending');
    expect(nowhere.routState).toBe('pending');
  });
});
