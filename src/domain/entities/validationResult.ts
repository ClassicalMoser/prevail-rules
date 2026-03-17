import type { AssertExact } from '@utils';
import { z } from 'zod';

export interface PassValidationResult {
  result: true;
}

const passValidationResultSchemaObject = z.object({
  result: z.literal(true) as z.ZodLiteral<true>,
});

type PassValidationResultSchemaType = z.infer<
  typeof passValidationResultSchemaObject
>;

export const passValidationResultSchema: z.ZodType<PassValidationResult> =
  passValidationResultSchemaObject;

const _assertExactPassValidationResult: AssertExact<
  PassValidationResult,
  PassValidationResultSchemaType
> = true;

export interface FailValidationResult {
  result: false;
  errorReason: string;
}

const failValidationResultSchemaObject = z.object({
  result: z.literal(false) as z.ZodLiteral<false>,
  errorReason: z.string(),
});

type FailValidationResultSchemaType = z.infer<
  typeof failValidationResultSchemaObject
>;

export const failValidationResultSchema: z.ZodType<FailValidationResult> =
  failValidationResultSchemaObject;

const _assertExactFailValidationResult: AssertExact<
  FailValidationResult,
  FailValidationResultSchemaType
> = true;

export type ValidationResult = PassValidationResult | FailValidationResult;

const validationResultSchemaObject = z.discriminatedUnion('result', [
  passValidationResultSchemaObject,
  failValidationResultSchemaObject,
]) as z.ZodType<ValidationResult>;

type ValidationResultSchemaType = z.infer<typeof validationResultSchemaObject>;

export const validationResultSchema: z.ZodType<ValidationResult> =
  validationResultSchemaObject;

const _assertExactValidationResult: AssertExact<
  ValidationResult,
  ValidationResultSchemaType
> = true;
