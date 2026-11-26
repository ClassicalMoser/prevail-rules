import { generateSkipLostCommanderMoveEvent } from './generateSkipLostCommanderMoveEvent';

/**
 * A fallen commander's Move Commanders turn is passed over (§4.2.8). Whose
 * turn it is, and that their commander is lost, are the state's, so the
 * effect carries nothing.
 */
describe('generateSkipLostCommanderMoveEvent function', () => {
  it('passes the turn over with an effect that carries nothing', () => {
    expect(generateSkipLostCommanderMoveEvent()).toStrictEqual({
      effectType: 'skipLostCommanderMove',
      eventType: 'gameEffect',
    });
  });
});
