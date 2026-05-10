import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * List of valid unit presence types.
 */
export const unitPresenceType = ['none', 'single', 'engaged'] as const;

/**
 * The type of unit presence in a space.
 */
export type UnitPresenceType = (typeof unitPresenceType)[number];

/** The none unit presence type. */
export const NONE_UNIT_PRESENCE_TYPE: 'none' = unitPresenceType[0];

/** The single unit presence type. */
export const SINGLE_UNIT_PRESENCE_TYPE: 'single' = unitPresenceType[1];

/** The engaged unit presence type. */
export const ENGAGED_UNIT_PRESENCE_TYPE: 'engaged' = unitPresenceType[2];

const _unitPresenceTypeSchemaObject = z.enum(unitPresenceType);
type UnitPresenceTypeSchemaType = z.infer<typeof _unitPresenceTypeSchemaObject>;

/**
 * The schema for the type of unit presence in a space.
 */
export const unitPresenceTypeSchema: z.ZodType<UnitPresenceType> =
  _unitPresenceTypeSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitPresenceType: AssertExact<
  UnitPresenceType,
  UnitPresenceTypeSchemaType
> = true;
