import { generateRoundEndEvent } from './generateRoundEndEvent';

/**
 * A round ends, after Cleanup or after setup, and the next begins at Play
 * Cards. Nothing carries over but what is on the table, so the effect carries
 * nothing.
 */
describe('generateRoundEndEvent function', () => {
  it('ends the round with an effect that carries nothing', () => {
    expect(generateRoundEndEvent()).toStrictEqual({
      effectType: 'roundEnd',
      eventType: 'gameEffect',
    });
  });
});
