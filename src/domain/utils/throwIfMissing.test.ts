import { throwIfUndefined } from './throwIfMissing';

describe('throwIfUndefined function', () => {
  it('returns the same reference when defined', () => {
    // Navigation that found a sub-shape keeps that object.
    const value = { tag: 'kept' };
    expect(throwIfUndefined(value, 'missing')).toBe(value);
  });

  it('throws with the given message when undefined', () => {
    // Absence is the caller's fault to name; the guard only refuses undefined.
    expect(() => throwIfUndefined<string>(undefined, 'no value here')).toThrow(
      'no value here',
    );
  });

  it('returns null (null is not undefined)', () => {
    // A defined null is still a value the caller may have asked for.
    expect(throwIfUndefined<string | null>(null, 'missing')).toBeNull();
  });

  it('returns 0 when defined but falsy', () => {
    // Zero is present; this is not a falsy check.
    expect(throwIfUndefined<number>(0, 'missing')).toBe(0);
  });

  it('returns empty string when defined but falsy', () => {
    // An empty string is present; this is not a falsy check.
    expect(throwIfUndefined<string>('', 'missing')).toBe('');
  });

  it('returns false when defined but falsy', () => {
    // False is present; this is not a falsy check.
    expect(throwIfUndefined<boolean>(false, 'missing')).toBe(false);
  });
});
