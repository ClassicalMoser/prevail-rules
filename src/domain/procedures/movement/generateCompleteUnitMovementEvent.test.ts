import { generateCompleteUnitMovementEvent } from './generateCompleteUnitMovementEvent';

/**
 * Signals that the active unit’s movement command is fully resolved on the board.
 * Fixed `completeUnitMovement` effect only; apply layer finalizes movement bookkeeping.
 * Generator does not inspect board or phase beyond accepting GameState.
 * TODO(misleading): the generator does not accept a GameState; it takes no
 * argument at all. Settle by dropping the last sentence.
 */
describe('generateCompleteUnitMovementEvent function', () => {
  it('ends one unit’s move with an effect that carries nothing', () => {
    // The unit already stands where its move ends, which the board holds;
    // the effect names only itself.
    expect(generateCompleteUnitMovementEvent()).toStrictEqual({
      effectType: 'completeUnitMovement',
      eventType: 'gameEffect',
    });
  });
});
