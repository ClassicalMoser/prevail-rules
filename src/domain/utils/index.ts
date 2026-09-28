// Compile-time check that a manual type and its schema infer the same shape.
export type { AssertExact } from './assertExact';

// Narrow `'none'` and `'pending'` sentinels, or throw.
export { throwIfNone, throwIfPending } from './serializationSentinels';

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
