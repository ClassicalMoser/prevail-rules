import { throwIfUndefined } from './throwIfMissing';

/**
 * A lookup that may find nothing answers undefined; a caller that cannot go
 * on without the value uses this guard to throw its own message instead.
 */
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

  it('returns a defined value even when it is falsy', () => {
    // Only undefined counts as missing. Null, zero, an empty string and false
    // are all values a caller may have asked for.
    expect(throwIfUndefined<string | null>(null, 'missing')).toBeNull();
    expect(throwIfUndefined<number>(0, 'missing')).toBe(0);
    expect(throwIfUndefined<string>('', 'missing')).toBe('');
    expect(throwIfUndefined<boolean>(false, 'missing')).toBe(false);
  });
});
