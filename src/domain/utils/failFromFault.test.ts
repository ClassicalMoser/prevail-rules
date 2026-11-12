import { failFromFault } from './failFromFault';

/**
 * A validator returns a refusal rather than throwing, so a fault that
 * surfaces while checking a choice becomes one, still naming its cause.
 */
describe('failFromFault function', () => {
  it('keeps the fault’s own message under what was being done', () => {
    // The fault names its cause where it happened; the refusal keeps that
    // and says what was being validated when it surfaced.
    const refusal = failFromFault(
      new Error('Game is already over'),
      'validating player choice',
    );

    expect(refusal).toStrictEqual({
      errorReason: 'Error validating player choice: Game is already over',
      result: false,
    });
  });

  it('still names what was being done when the fault is not an error', () => {
    // Anything can be thrown; only an Error carries a message.
    const refusal = failFromFault('boom', 'validating player choice');

    expect(refusal).toStrictEqual({
      errorReason: 'Unknown error validating player choice',
      result: false,
    });
  });
});
