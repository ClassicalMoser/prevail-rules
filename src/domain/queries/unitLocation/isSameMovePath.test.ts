import { isSameMovePath } from './isSameMovePath';

/**
 * Two paths are the same move only when every step and turn matches, in
 * order.
 */
describe('isSameMovePath function', () => {
  it('the same moves in the same order are the same path', () => {
    // A left turn and then a step, both times.
    expect(isSameMovePath(['turnLeft', 'step'], ['turnLeft', 'step'])).toBe(
      true,
    );
  });

  it('the same moves in another order are a different path', () => {
    // Turning before the step heads somewhere else than turning after it.
    expect(isSameMovePath(['turnLeft', 'step'], ['step', 'turnLeft'])).toBe(
      false,
    );
  });

  it('a path that goes further is a different path', () => {
    // One step against two: the second ends a space further on.
    expect(isSameMovePath(['step'], ['step', 'step'])).toBe(false);
  });
});
