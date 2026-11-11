import { createOpenedRallyResolutionState } from './createOpenedRallyResolutionState';

/** Each player in turn chooses whether to rally, and one who does resolves it (§10.3). */
describe('createOpenedRallyResolutionState function', () => {
  it('begins a rally that was chosen, with nothing yet burnt, assigned or routed', () => {
    expect(createOpenedRallyResolutionState(true)).toStrictEqual({
      completed: false,
      playerRallied: true,
      rallyResolved: false,
      routState: 'pending',
      unitsLostSupport: 'pending',
    });
  });

  it('records a rally that was declined', () => {
    expect(createOpenedRallyResolutionState(false).playerRallied).toBe(false);
  });
});
