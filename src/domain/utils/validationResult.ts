import type { AssertExact } from './assertExact';

import { z } from 'zod';

/** Successful validation — no error payload. */
export interface PassValidationResult {
  /** Discriminant: validation passed. */
  result: true;
}

const _passValidationResultSchemaObject = z
  .object({
    /** Discriminant: validation passed. */
    result: z.literal(true),
  })
  .strict();

type PassValidationResultSchemaType = z.infer<
  typeof _passValidationResultSchemaObject
>;

/** Schema for a passing {@link PassValidationResult}. */
export const passValidationResultSchema: z.ZodObject<{
  result: z.ZodLiteral<true>;
}> = _passValidationResultSchemaObject;

const _assertExactPassValidationResult: AssertExact<
  PassValidationResult,
  PassValidationResultSchemaType
> = true;

/** Failed validation — carries a human-readable reason. */
export interface FailValidationResult {
  /** Discriminant: validation failed. */
  result: false;
  /** Why the value or choice was rejected. */
  errorReason: string;
}

const _failValidationResultSchemaObject = z
  .object({
    /** Discriminant: validation failed. */
    result: z.literal(false),
    /** Why the value or choice was rejected. */
    errorReason: z.string(),
  })
  .strict();

type FailValidationResultSchemaType = z.infer<
  typeof _failValidationResultSchemaObject
>;

/** Schema for a failing {@link FailValidationResult}. */
export const failValidationResultSchema: z.ZodObject<{
  result: z.ZodLiteral<false>;
  errorReason: z.ZodString;
}> = _failValidationResultSchemaObject;

const _assertExactFailValidationResult: AssertExact<
  FailValidationResult,
  FailValidationResultSchemaType
> = true;

/**
 * Outcome of a validation check (e.g. player-choice legality).
 * Discriminated on {@link ValidationResult.result}; never throws.
 */
export type ValidationResult = PassValidationResult | FailValidationResult;

const _validationResultSchemaObject = z.discriminatedUnion('result', [
  passValidationResultSchema,
  failValidationResultSchema,
]);

type ValidationResultSchemaType = z.infer<typeof _validationResultSchemaObject>;

/** Schema for {@link ValidationResult}. */
export const validationResultSchema: z.ZodType<ValidationResult> =
  _validationResultSchemaObject;

const _assertExactValidationResult: AssertExact<
  ValidationResult,
  ValidationResultSchemaType
> = true;
