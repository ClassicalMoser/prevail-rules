import { createRallyResolutionState } from './rallyResolutionState';

/** A rally as it begins: whether the player rallied is chosen, nothing else done (§10.3). */
describe('createRallyResolutionState function', () => {
  it('begins with the player declining and nothing resolved', () => {
    const rally = createRallyResolutionState();

    expect(rally.playerRallied).toBe(false);
    expect(rally.rallyResolved).toBe(false);
    expect(rally.completed).toBe(false);
  });

  it('records a rally the spec says went ahead', () => {
    const rally = createRallyResolutionState({ playerRallied: true });

    expect(rally.playerRallied).toBe(true);
  });
});
