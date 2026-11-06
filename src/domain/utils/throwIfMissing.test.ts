import { throwIfUndefined } from './throwIfMissing';

describe('throwIfUndefined function', () => {
  it('returns the same reference when defined', () => {
    const value = { tag: 'kept' };
    expect(throwIfUndefined(value, 'missing')).toBe(value);
  });

  it('throws with the given message when undefined', () => {
    expect(() => throwIfUndefined<string>(undefined, 'no value here')).toThrow(
      'no value here',
    );
  });

  it('returns null (null is not undefined)', () => {
    expect(throwIfUndefined<string | null>(null, 'missing')).toBeNull();
  });

  it('returns 0 when defined but falsy', () => {
    expect(throwIfUndefined<number>(0, 'missing')).toBe(0);
  });

  it('returns empty string when defined but falsy', () => {
    expect(throwIfUndefined<string>('', 'missing')).toBe('');
  });

  it('returns false when defined but falsy', () => {
    expect(throwIfUndefined<boolean>(false, 'missing')).toBe(false);
  });
});
