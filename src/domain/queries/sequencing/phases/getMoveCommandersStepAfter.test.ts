import { getMoveCommandersStepAfter } from './getMoveCommandersStepAfter';

/**
 * The first player moves their commander, then the second, and then the
 * phase is done (§4.2.1).
 */
describe('getMoveCommandersStepAfter function', () => {
  it("passes the first player's turn to the second player", () => {
    expect(getMoveCommandersStepAfter('moveFirstCommander')).toBe(
      'moveSecondCommander',
    );
  });

  it("ends the phase after the second player's turn", () => {
    expect(getMoveCommandersStepAfter('moveSecondCommander')).toBe('complete');
  });

  it('throws once the phase is complete, where no turn follows', () => {
    // Nothing asks for a turn after the last.
    expect(() => getMoveCommandersStepAfter('complete')).toThrow(
      new Error('Move Commanders is complete; no turn follows'),
    );
  });
});
