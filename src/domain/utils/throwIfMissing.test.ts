import { throwIfFalsy, throwIfUndefined } from './throwIfMissing';

describe(throwIfUndefined, () => {
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

describe(throwIfFalsy, () => {
  it('returns the same reference when truthy', () => {
    const value = { tag: 'kept' };
    expect(throwIfFalsy(value, 'missing')).toBe(value);
  });

  it('returns a non-empty string', () => {
    expect(throwIfFalsy('hello', 'missing')).toBe('hello');
  });

  it('throws with the given message when undefined', () => {
    expect(() => throwIfFalsy<string>(undefined, 'no value here')).toThrow(
      'no value here',
    );
  });

  it('throws with the given message when null', () => {
    expect(() => throwIfFalsy<string>(null, 'no value here')).toThrow(
      'no value here',
    );
  });

  it('throws when 0', () => {
    expect(() => throwIfFalsy<number>(0, 'no value here')).toThrow(
      'no value here',
    );
  });

  it('throws when empty string', () => {
    expect(() => throwIfFalsy<string>('', 'no value here')).toThrow(
      'no value here',
    );
  });

  it('throws when false', () => {
    expect(() => throwIfFalsy<boolean>(false, 'no value here')).toThrow(
      'no value here',
    );
  });
});
