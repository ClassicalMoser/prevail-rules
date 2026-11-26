import { MOVE_COMMANDERS_PHASE } from '@game';

import { createMoveCommandersPhaseState } from './moveCommandersPhaseState';

/** Phase 2 as it opens, on the first player's commander (§4.2.1). */
describe('createMoveCommandersPhaseState function', () => {
  it('opens Phase 2 on the first player’s commander', () => {
    const phase = createMoveCommandersPhaseState();

    expect(phase).toStrictEqual({
      phase: MOVE_COMMANDERS_PHASE,
      step: 'moveFirstCommander',
    });
  });
});
