import type { OpenChoice } from './openChoice';
import { findIllegal } from './findIllegal';

/**
 * A stand-in for a choice made one part at a time: adding up 1s and 2s.
 * It has no game meaning; it only needs a few simple rules to break.
 */
function countingOptions(soFar: readonly number[]): OpenChoice<number> {
  // The running total of the parts chosen so far.
  const total = soFar.reduce((sum, part) => sum + part, 0);

  // A 1 or a 2 may come next, until the total reaches 6; then nothing may.
  // The choice may stop only on an even total.
  const options: OpenChoice<number> = {
    mayStop: total % 2 === 0,
    next: total < 6 ? [1, 2] : [],
  };

  // The legal options after these parts.
  return options;
}

/**
 * A choice made one part at a time is legal when each part was among the
 * legal options after the parts before it, and the choice may stop where it
 * ends. Otherwise `findIllegal` reports the first way it is illegal.
 */
describe('findIllegal function', () => {
  it('accepts a choice whose every part was enumerated and which may stop where it ends', () => {
    // 2 + 1 + 1 = 4: each part was enumerated, and an even total may stop.
    expect(findIllegal([2, 1, 1], countingOptions)).toBeUndefined();
  });

  it('accepts the empty choice when the legal options may stop before anything is chosen', () => {
    // Choosing nothing is a choice too, when the legal options allow it.
    expect(findIllegal([], countingOptions)).toBeUndefined();
  });

  it('names the first part that was not enumerated, and the legal options there', () => {
    // A 3 is never enumerated; it is the second part.
    // After the first part the total is 1: a 1 or a 2 may follow, and an odd
    // total may not stop.
    expect(findIllegal([1, 3, 3], countingOptions)).toStrictEqual({
      index: 1,
      options: { mayStop: false, next: [1, 2] },
      refusal: 'notEnumerated',
    });
  });

  it('refuses a choice that ends where it may not stop, and gives the legal options remaining', () => {
    // 2 + 1 = 3: every part was enumerated, but an odd total may not stop.
    // A 1 or a 2 could still have followed.
    expect(findIllegal([2, 1], countingOptions)).toStrictEqual({
      options: { mayStop: false, next: [1, 2] },
      refusal: 'mayNotStop',
    });
  });

  it('refuses a part once nothing more is enumerated', () => {
    // 2 + 2 + 2 = 6 enumerates nothing more, so a fourth part is refused.
    expect(findIllegal([2, 2, 2, 1], countingOptions)).toMatchObject({
      index: 3,
      refusal: 'notEnumerated',
    });
  });

  it('compares parts that are not literals only by the rule it is given', () => {
    // Two parts with equal contents are separate objects, so they match only
    // by a rule that reads their contents.
    // The one legal option is an object named `a`, and the choice may stop
    // after it.
    const optionsA = (): OpenChoice<{ name: string }> => ({
      mayStop: true,
      next: [{ name: 'a' }],
    });

    // A separate object named `a` matches by name.
    expect(
      findIllegal([{ name: 'a' }], optionsA, (x, y) => x.name === y.name),
    ).toBeUndefined();
  });
});
