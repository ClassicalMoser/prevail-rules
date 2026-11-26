import { createRallyResolutionState } from './rallyResolutionState';

describe('createRallyResolutionState function', () => {
  it('given context, returns rally resolution with defaults', () => {
    const state = createRallyResolutionState();
    expect(state.playerRallied).toBe(false);
    expect(state.rallyResolved).toBe(false);
    expect(state.completed).toBe(false);
  });

  it('given accept overrides', () => {
    const state = createRallyResolutionState({ playerRallied: true });
    expect(state.playerRallied).toBe(true);
  });
});
