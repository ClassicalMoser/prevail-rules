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

  it("does not match 'bypassed'", () => {
    // Bypassed is not pending, since the outcome has already been decided.
    expect(isPending('bypassed')).toBe(false);
  });

  it("does not match 'none'", () => {
    // Absence is not pending, since nothing will be filled.
    expect(isPending('none')).toBe(false);
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
    // Bypassed has already been decided.
    expect(isResolved('bypassed')).toBe(true);
  });

  it("treats 'none' as resolved", () => {
    // Absence has already been decided.
    expect(isResolved('none')).toBe(true);
  });
});

describe('isBypassed function', () => {
  it("matches the string 'bypassed'", () => {
    // An outcome that did not happen is stored as this string.
    expect(isBypassed('bypassed')).toBe(true);
  });

  it('does not match a different value', () => {
    // An open outcome object, or another sentinel, is not a skip.
    expect(isBypassed('other')).toBe(false);
  });

  it("does not match 'pending'", () => {
    // Pending is not a skip, since it implies that it will be resolved.
    expect(isBypassed('pending')).toBe(false);
  });

  it("does not match 'none'", () => {
    // Absence is not a skip, since nothing was opened to skip.
    expect(isBypassed('none')).toBe(false);
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

  it("treats 'pending' as applied", () => {
    // Pending implies that it will be resolved.
    expect(isApplied('pending')).toBe(true);
  });

  it("treats 'none' as applied", () => {
    // Absence is not a skip.
    expect(isApplied('none')).toBe(true);
  });
});

describe('isNone function', () => {
  it("matches the string 'none'", () => {
    // Slots and other facts that reuse the word both hit this.
    expect(isNone('none')).toBe(true);
  });

  it('does not match a different value', () => {
    // A present value, or another sentinel, is not absent.
    expect(isNone('other')).toBe(false);
  });

  it("does not match 'pending'", () => {
    // Pending is not absence, since it implies that it will be filled.
    expect(isNone('pending')).toBe(false);
  });

  it("does not match 'bypassed'", () => {
    // Bypassed is not absence, since it has already been decided.
    expect(isNone('bypassed')).toBe(false);
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

  it("treats 'pending' as active", () => {
    // Pending implies that it will be filled.
    expect(isActive('pending')).toBe(true);
  });

  it("treats 'bypassed' as active", () => {
    // Bypassed has already been filled.
    expect(isActive('bypassed')).toBe(true);
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
    // Bypassed is not pending, since the outcome has already been decided.
    expect(throwIfPending('bypassed', 'pending message')).toBe('bypassed');
  });

  it("returns 'none' without throwing", () => {
    // Absence is not pending, since nothing will be filled.
    expect(throwIfPending('none', 'pending message')).toBe('none');
  });
});

describe('throwIfBypassed function', () => {
  it("returns a value other than 'bypassed'", () => {
    // The caller asked for the value and has one.
    expect(throwIfBypassed('other', 'message')).toBe('other');
  });

  it("throws the given message for 'bypassed'", () => {
    // The caller supplies the reason; the guard only refuses the skip string.
    expect(() => throwIfBypassed('bypassed', 'bypassed message')).toThrow(
      new Error('bypassed message'),
    );
  });

  it("returns 'pending' without throwing", () => {
    // Pending is not a skip, since it implies that it will be resolved.
    expect(throwIfBypassed('pending', 'bypassed message')).toBe('pending');
  });

  it("returns 'none' without throwing", () => {
    // Absence is not a skip, since nothing was opened to skip.
    expect(throwIfBypassed('none', 'bypassed message')).toBe('none');
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

  it("returns 'pending' without throwing", () => {
    // Pending is not absence, since it implies that it will be filled.
    expect(throwIfNone('pending', 'none message')).toBe('pending');
  });

  it("returns 'bypassed' without throwing", () => {
    // Bypassed is not absence, since it has already been decided.
    expect(throwIfNone('bypassed', 'none message')).toBe('bypassed');
  });
});
