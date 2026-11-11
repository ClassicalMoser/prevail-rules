import type { OpenChoice } from './openChoice';
import { findRefusal } from './findRefusal';

/**
 * A choice made a part at a time is checked against the same offers a client
 * was shown: each part must have been offered after the ones before it, and
 * the choice must be allowed to end where it does.
 *
 * The stand-in choice here counts up by one or two from zero, and may stop
 * only on an even total, which is enough to show each refusal.
 */
function countingOffer(soFar: readonly number[]): OpenChoice<number> {
  const total = soFar.reduce((sum, part) => sum + part, 0);
  const offer: OpenChoice<number> = {
    mayStop: total % 2 === 0,
    next: total < 6 ? [1, 2] : [],
  };
  return offer;
}

describe('findRefusal function', () => {
  it('accepts a choice whose every part was offered and which may stop where it ends', () => {
    // 2 + 1 + 1 = 4: each part was offered, and an even total may stop.
    expect(findRefusal([2, 1, 1], countingOffer)).toBeUndefined();
  });

  it('accepts the empty choice when the offer may stop before anything is chosen', () => {
    // Choosing nothing is a choice too, when the offer allows it.
    expect(findRefusal([], countingOffer)).toBeUndefined();
  });

  it('names the first part that was not offered, and what was offered there', () => {
    // A 3 is never offered; it is the second part.
    expect(findRefusal([1, 3, 3], countingOffer)).toStrictEqual({
      index: 1,
      offered: { mayStop: false, next: [1, 2] },
      refusal: 'notOffered',
    });
  });

  it('refuses a choice that ends where it may not stop, and says what was still offered', () => {
    // 2 + 1 = 3: every part was offered, but an odd total may not stop.
    expect(findRefusal([2, 1], countingOffer)).toStrictEqual({
      offered: { mayStop: false, next: [1, 2] },
      refusal: 'mayNotStop',
    });
  });

  it('refuses a part offered nowhere once nothing more is offered', () => {
    // 2 + 2 + 2 = 6 offers nothing more, so a fourth part is refused.
    expect(findRefusal([2, 2, 2, 1], countingOffer)).toMatchObject({
      index: 3,
      refusal: 'notOffered',
    });
  });

  it('compares parts that are not literals only by the rule it is given', () => {
    // Two parts with equal contents are separate objects, so they match only
    // by a rule that reads their contents.
    const offerA = (): OpenChoice<{ name: string }> => ({
      mayStop: true,
      next: [{ name: 'a' }],
    });

    expect(
      findRefusal([{ name: 'a' }], offerA, (x, y) => x.name === y.name),
    ).toBeUndefined();
  });
});
