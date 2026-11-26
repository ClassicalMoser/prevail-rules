import { createOpenedMoveCommandersPhaseState } from './createOpenedMoveCommandersPhaseState';

/** Phase 2 as it opens. */
describe('createOpenedMoveCommandersPhaseState function', () => {
  it('opens on the first player’s commander moving', () => {
    expect(createOpenedMoveCommandersPhaseState()).toStrictEqual({
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });
  });
});
