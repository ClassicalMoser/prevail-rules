import {
  isActive,
  isApplied,
  isBypassed,
  isNone,
  isPending,
  isResolved,
  throwIfBypassed,
  throwIfNone,
  throwIfPending,
} from './stateSentinels';

/**
 * Each guard compares a value with one string, `'pending'`, `'bypassed'` or
 * `'none'`, and nothing more. What the string means is up to the field that
 * holds it, so the other two strings are just values to each guard.
 */
describe('state sentinel guards', () => {
  // A value that is none of the three strings.
  const value = 'other';

  it("isPending and isResolved split on 'pending' alone", () => {
    // Only the string itself is pending.
    expect(isPending('pending')).toBe(true);
    expect(isResolved('pending')).toBe(false);

    // Everything else is resolved, the other two strings included.
    for (const other of [value, 'bypassed', 'none']) {
      expect(isPending(other)).toBe(false);
      expect(isResolved(other)).toBe(true);
    }
  });

  it("isBypassed and isApplied split on 'bypassed' alone", () => {
    // Only the string itself is bypassed.
    expect(isBypassed('bypassed')).toBe(true);
    expect(isApplied('bypassed')).toBe(false);

    // Everything else is applied, the other two strings included.
    for (const other of [value, 'pending', 'none']) {
      expect(isBypassed(other)).toBe(false);
      expect(isApplied(other)).toBe(true);
    }
  });

  it("isNone and isActive split on 'none' alone", () => {
    // Only the string itself is none.
    expect(isNone('none')).toBe(true);
    expect(isActive('none')).toBe(false);

    // Everything else is active, the other two strings included.
    for (const other of [value, 'pending', 'bypassed']) {
      expect(isNone(other)).toBe(false);
      expect(isActive(other)).toBe(true);
    }
  });

  it('each throwIf guard throws the given message on its own string', () => {
    // The caller supplies the message; the guard only decides when to throw.
    expect(() => throwIfPending('pending', 'still pending')).toThrow(
      new Error('still pending'),
    );
    expect(() => throwIfBypassed('bypassed', 'was bypassed')).toThrow(
      new Error('was bypassed'),
    );
    expect(() => throwIfNone('none', 'is none')).toThrow(new Error('is none'));
  });

  it('each throwIf guard returns anything else unchanged', () => {
    // Any other value comes back as it was, the other two strings included.
    for (const other of [value, 'bypassed', 'none']) {
      expect(throwIfPending(other, 'still pending')).toBe(other);
    }
    for (const other of [value, 'pending', 'none']) {
      expect(throwIfBypassed(other, 'was bypassed')).toBe(other);
    }
    for (const other of [value, 'pending', 'bypassed']) {
      expect(throwIfNone(other, 'is none')).toBe(other);
    }
  });
});
