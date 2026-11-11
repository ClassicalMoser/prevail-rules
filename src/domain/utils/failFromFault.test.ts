import { failFromFault } from './failFromFault';

describe('failFromFault function', () => {
  it('keeps the fault’s own message under what was being done', () => {
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
