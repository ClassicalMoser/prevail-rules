import { throwIfUndefined } from './throwIfMissing';

describe('throwIfUndefined function', () => {
  it('returns the same reference when defined', () => {
    // The caller asked for a defined value and has one.
    const value = { tag: 'kept' };
    expect(throwIfUndefined(value, 'missing')).toBe(value);
  });

  it('throws with the given message when undefined', () => {
    // The caller supplies the reason; the guard only refuses undefined.
    expect(() => throwIfUndefined<string>(undefined, 'no value here')).toThrow(
      'no value here',
    );
  });

  it('returns null (defined but falsy)', () => {
    // A defined null is still a value the caller may have asked for.
    expect(throwIfUndefined<string | null>(null, 'missing')).toBeNull();
  });

  it('returns 0 (defined but falsy)', () => {
    // Zero is present; this is not a falsy check.
    expect(throwIfUndefined<number>(0, 'missing')).toBe(0);
  });

  it('returns empty string (defined but falsy)', () => {
    // An empty string is present; this is not a falsy check.
    expect(throwIfUndefined<string>('', 'missing')).toBe('');
  });

  it('returns false (defined but falsy)', () => {
    // False is present; this is not a falsy check.
    expect(throwIfUndefined<boolean>(false, 'missing')).toBe(false);
  });
});
