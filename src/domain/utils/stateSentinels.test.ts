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

describe('isPending function', () => {
  it("matches the string 'pending'", () => {
    // Waiting slots and other facts that reuse the word both hit this.
    expect(isPending('pending')).toBe(true);
  });

  it('does not match a different value', () => {
    // A filled value, or another sentinel, is not waiting.
    expect(isPending('other')).toBe(false);
  });
});

describe('isResolved function', () => {
  it("matches a value other than 'pending'", () => {
    // Any non-waiting value counts as filled for this guard.
    expect(isResolved('other')).toBe(true);
  });

  it("does not match the string 'pending'", () => {
    // The waiting string is the only negative case.
    expect(isResolved('pending')).toBe(false);
  });

  it("treats 'bypassed' as resolved", () => {
    // A skipped combat outcome is a different string; this guard does not know it.
    expect(isResolved('bypassed')).toBe(true);
  });
});

describe('isBypassed function', () => {
  it("matches the string 'bypassed'", () => {
    // A combat outcome that did not happen is stored as this string.
    expect(isBypassed('bypassed')).toBe(true);
  });

  it('does not match a different value', () => {
    // An open outcome object, or another sentinel, is not a skip.
    expect(isBypassed('other')).toBe(false);
  });
});

describe('isApplied function', () => {
  it("matches a value other than 'bypassed'", () => {
    // Anything but the skip string is the outcome object to read.
    expect(isApplied('other')).toBe(true);
  });

  it("does not match the string 'bypassed'", () => {
    // The skip string is the only negative case.
    expect(isApplied('bypassed')).toBe(false);
  });
});

describe('isNone function', () => {
  it("matches the string 'none'", () => {
    // Phase absence and other facts that reuse the word both hit this.
    expect(isNone('none')).toBe(true);
  });

  it('does not match a different value', () => {
    // A present value, or another sentinel, is not absent.
    expect(isNone('other')).toBe(false);
  });
});

describe('isActive function', () => {
  it("matches a value other than 'none'", () => {
    // Any non-absent value counts as present for this guard.
    expect(isActive('other')).toBe(true);
  });

  it("does not match the string 'none'", () => {
    // The absent string is the only negative case.
    expect(isActive('none')).toBe(false);
  });
});

describe('throwIfPending function', () => {
  it("returns a value other than 'pending'", () => {
    // The caller asked for the filled value and has one.
    expect(throwIfPending('other', 'message')).toBe('other');
  });

  it("throws the given message for 'pending'", () => {
    // The caller supplies the reason; the guard only refuses the waiting string.
    expect(() => throwIfPending('pending', 'pending message')).toThrow(
      new Error('pending message'),
    );
  });

  it("returns 'bypassed' without throwing", () => {
    // A skipped outcome is not waiting; this throw does not police that string.
    expect(throwIfPending('bypassed', 'pending message')).toBe('bypassed');
  });
});

describe('throwIfBypassed function', () => {
  it("returns a value other than 'bypassed'", () => {
    // The caller asked for the outcome object and has one.
    expect(throwIfBypassed('other', 'message')).toBe('other');
  });

  it("throws the given message for 'bypassed'", () => {
    // The caller supplies the reason; the guard only refuses the skip string.
    expect(() => throwIfBypassed('bypassed', 'bypassed message')).toThrow(
      new Error('bypassed message'),
    );
  });
});

describe('throwIfNone function', () => {
  it("returns a value other than 'none'", () => {
    // The caller asked for the present value and has one.
    expect(throwIfNone('other', 'message')).toBe('other');
  });

  it("throws the given message for 'none'", () => {
    // The caller supplies the reason; the guard only refuses the absent string.
    expect(() => throwIfNone('none', 'none message')).toThrow(
      new Error('none message'),
    );
  });
});
