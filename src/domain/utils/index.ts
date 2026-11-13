// Compile-time check that a manual type and its schema infer the same shape.
export type { AssertExact } from './assertExact';

// Compare a value to the strings in each function's signature.
export {
  isPending,
  isResolved,
  isBypassed,
  isApplied,
  isNone,
  isActive,
  throwIfPending,
  throwIfBypassed,
  throwIfNone,
} from './stateSentinels';

// A value two copies of are compared by `===`, needing no rule for sameness.
export type { Literal } from './literal';

// Two lists with the same members, each as many times, in any order.
export { haveSameMembers } from './haveSameMembers';

// An injectable `[0, 1)` draw, so a caller can fix what a procedure rolls.
export type { RandomSource } from './randomSource';

// Narrow away `undefined`, or throw.
export { throwIfUndefined } from './throwIfMissing';

// A choice made a part at a time: what may come next and whether it may stop,
// and the first way a submitted choice is illegal.
export type { OpenChoice, ChoiceRefusal } from './openChoice';
export { findIllegal } from './findIllegal';

// A thrown fault, as the refusal a validator's boundary returns.
export { failFromFault } from './failFromFault';

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
