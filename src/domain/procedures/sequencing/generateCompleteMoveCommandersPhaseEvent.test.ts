import { generateCompleteMoveCommandersPhaseEvent } from './generateCompleteMoveCommandersPhaseEvent';

/**
 * Move Commanders complete: the round moves on to issuing orders. Each
 * player's orders are the command on their card in play, which the state
 * holds, so the effect records nothing more.
 */
describe('generateCompleteMoveCommandersPhaseEvent function', () => {
  it('ends Move Commanders with an effect that carries nothing', () => {
    expect(generateCompleteMoveCommandersPhaseEvent()).toStrictEqual({
      effectType: 'completeMoveCommandersPhase',
      eventType: 'gameEffect',
    });
  });
});
