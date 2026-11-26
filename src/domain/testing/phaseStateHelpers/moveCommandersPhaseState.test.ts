import { MOVE_COMMANDERS_PHASE } from '@game';
import { createMoveCommandersPhaseState } from './moveCommandersPhaseState';

describe('createMoveCommandersPhaseState function', () => {
  it('given context, returns move commanders phase with default step', () => {
    expect.hasAssertions();
    const state = createMoveCommandersPhaseState();
    expect(state.phase).toBe(MOVE_COMMANDERS_PHASE);
    expect(state.step).toBe('moveFirstCommander');
  });
});
