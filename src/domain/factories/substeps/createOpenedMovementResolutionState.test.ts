import { createTestUnit } from '@testing';
import { createOpenedMovementResolutionState } from './createOpenedMovementResolutionState';

/** A unit's move as it opens (§4.3.10). */
describe('createOpenedMovementResolutionState function', () => {
  it('owes the mover’s commitment and has nothing of the move written', () => {
    const mover = createTestUnit('black');

    expect(createOpenedMovementResolutionState(mover)).toStrictEqual({
      commandResolutionType: 'movement',
      commitment: { commitmentType: 'pending' },
      engagementState: 'pending',
      moveCommander: 'pending',
      movingUnit: mover,
      substepType: 'commandResolution',
      targetPlacement: 'pending',
    });
  });
});
