import { z } from 'zod';

export interface PassValidationResult {
  result: true;
}

const passValidationResultSchemaObject = z
  .object({
    result: z.literal(true),
  })
  .strict();

export const passValidationResultSchema: z.ZodType<PassValidationResult> =
  passValidationResultSchemaObject;

export interface FailValidationResult {
  result: false;
  errorReason: string;
}

const failValidationResultSchemaObject = z
  .object({
    errorReason: z.string(),
    result: z.literal(false),
  })
  .strict();

export const failValidationResultSchema: z.ZodType<FailValidationResult> =
  failValidationResultSchemaObject;

export type ValidationResult = PassValidationResult | FailValidationResult;

const validationResultSchemaObject = z.discriminatedUnion('result', [
  passValidationResultSchemaObject,
  failValidationResultSchemaObject,
]);

export const validationResultSchema: z.ZodType<ValidationResult> =
  validationResultSchemaObject;
