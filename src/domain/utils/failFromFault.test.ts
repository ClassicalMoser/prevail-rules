import { failFromFault } from './failFromFault';

/**
 * A validator returns a failed result rather than throwing, so a fault that
 * surfaces while checking a choice becomes a failed result, still naming its
 * cause.
 */
describe('failFromFault function', () => {
  it('keeps the fault’s own message under what was being done', () => {
    // The fault names its cause where it happened; the failed result keeps
    // that and says what was being validated when it surfaced.
    const failure = failFromFault(
      new Error('Game is already over'),
      'validating player choice',
    );

    expect(failure).toStrictEqual({
      errorReason: 'Error validating player choice: Game is already over',
      result: false,
    });
  });

  it('still names what was being done when the fault is not an error', () => {
    // Anything can be thrown; only an Error carries a message.
    const failure = failFromFault('boom', 'validating player choice');

    // With no message to keep, it names only what was being done.
    expect(failure).toStrictEqual({
      errorReason: 'Unknown error validating player choice',
      result: false,
    });
  });
});
