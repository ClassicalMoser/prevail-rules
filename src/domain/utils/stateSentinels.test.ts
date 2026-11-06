import {
  isActive,
  isNone,
  isPending,
  isResolved,
  throwIfNone,
  throwIfPending,
} from './stateSentinels';

describe('isPending function', () => {
  it("matches the string 'pending'", () => {
    // The comparison is equality with that string.
    expect(isPending('pending')).toBe(true);
  });

  it('does not match a different value', () => {
    // This string is not 'pending'.
    expect(isPending('other')).toBe(false);
  });
});

describe('isResolved function', () => {
  it("matches a value other than 'pending'", () => {
    // The comparison is inequality with that string.
    expect(isResolved('other')).toBe(true);
  });

  it("does not match the string 'pending'", () => {
    // That string fails the inequality.
    expect(isResolved('pending')).toBe(false);
  });
});

describe('isNone function', () => {
  it("matches the string 'none'", () => {
    // The comparison is equality with that string.
    expect(isNone('none')).toBe(true);
  });

  it('does not match a different value', () => {
    // This string is not 'none'.
    expect(isNone('other')).toBe(false);
  });
});

describe('isActive function', () => {
  it("matches a value other than 'none'", () => {
    // The comparison is inequality with that string.
    expect(isActive('other')).toBe(true);
  });

  it("does not match the string 'none'", () => {
    // That string fails the inequality.
    expect(isActive('none')).toBe(false);
  });
});

describe('throwIfPending function', () => {
  it("returns a value other than 'pending'", () => {
    // The value is not that string, so it is returned.
    expect(throwIfPending('other', 'message')).toBe('other');
  });

  it("throws the given message for 'pending'", () => {
    // The error text is the message argument.
    expect(() => throwIfPending('pending', 'pending message')).toThrow(
      new Error('pending message'),
    );
  });
});

describe('throwIfNone function', () => {
  it("returns a value other than 'none'", () => {
    // The value is not that string, so it is returned.
    expect(throwIfNone('other', 'message')).toBe('other');
  });

  it("throws the given message for 'none'", () => {
    // The error text is the message argument.
    expect(() => throwIfNone('none', 'none message')).toThrow(
      new Error('none message'),
    );
  });
});
