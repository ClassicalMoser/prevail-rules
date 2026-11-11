import { createEmptyGameState } from '@factories';
import { getCleanupPhaseState } from '@queries';
import { createCleanupPhaseState } from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { updateCleanupStep } from './updateCleanupStep';

describe('updateCleanupStep function', () => {
  it('moves cleanup to the step given and leaves the rallies as they were', () => {
    const before = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );

    const after = getCleanupPhaseState(
      updateCleanupStep(before, 'secondPlayerChooseRally'),
    );

    expect(after).toStrictEqual({
      ...getCleanupPhaseState(before),
      step: 'secondPlayerChooseRally',
    });
  });

  it('throws outside cleanup', () => {
    expect(() =>
      updateCleanupStep(createEmptyGameState('standard'), 'complete'),
    ).toThrow('No current phase state found');
  });
});
