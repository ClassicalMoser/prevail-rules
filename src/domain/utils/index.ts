// Compile-time check that a manual type and its schema infer the same shape.
export type { AssertExact } from './assertExact';

// Compare a value to the strings in each function's signature.
export {
  isPending,
  isResolved,
  isNone,
  isActive,
  throwIfPending,
  throwIfNone,
} from './stateSentinels';

// An injectable `[0, 1)` draw, so a caller can fix what a procedure rolls.
export { defaultRandom } from './randomSource';
export type { RandomSource } from './randomSource';

// Narrow away `undefined`, or throw.
export { throwIfUndefined } from './throwIfMissing';

// Pass, fail, and the union. Validators return this and do not throw.
export {
  failValidationResultSchema,
  passValidationResultSchema,
  validationResultSchema,
} from './validationResult';
export type {
  FailValidationResult,
  PassValidationResult,
  ValidationResult,
} from './validationResult';
