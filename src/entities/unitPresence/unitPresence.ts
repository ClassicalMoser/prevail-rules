import type {
  EngagedUnitPresence,
  NoneUnitPresence,
  SingleUnitPresence,
} from '@entities';
import type { AssertExact } from '@utils';
import { z } from 'zod';
import { engagedUnitPresenceSchema } from './engagedUnitPresence';
import { noneUnitPresenceSchema } from './noneUnitPresence';
import { singleUnitPresenceSchema } from './singleUnitPresence';

/**
 * The schema for unit presence in a space.
 *
 * Uses a discriminated union based on the `presenceType` field to represent
 * three possible states:
 * - `"none"`: No unit in the space
 * - `"single"`: One unit in the space
 * - `"engaged"`: Two units engaged in combat
 *
 * Type guards are available in `@validation`:
 * - `hasNoUnit()` - checks for none
 * - `hasSingleUnit()` - checks for single
 * - `hasEngagedUnits()` - checks for engaged
 *
 * @example
 * ```typescript
 * const unitPresence = boardSpace.unitPresence;
 *
 * if (hasNoUnit(unitPresence)) {
 *   // TypeScript knows unitPresence is NoneUnitPresence
 *   // Space is empty
 * } else if (hasSingleUnit(unitPresence)) {
 *   // TypeScript knows unitPresence is SingleUnitPresence
 *   const unit = unitPresence.unit; // ✅ Type-safe access
 *   const facing = unitPresence.facing;
 * } else if (hasEngagedUnits(unitPresence)) {
 *   // TypeScript knows unitPresence is EngagedUnitPresence
 *   const primary = unitPresence.primaryUnit;
 *   const secondary = unitPresence.secondaryUnit;
 * }
 * ```
 */
export const unitPresenceSchema = z.discriminatedUnion('presenceType', [
  noneUnitPresenceSchema,
  singleUnitPresenceSchema,
  engagedUnitPresenceSchema,
]);

// Helper type to check match of type against schema
type UnitPresenceTypeSchemaType = z.infer<typeof unitPresenceSchema>;

/**
 * Unit presence in a space.
 */
export type UnitPresence =
  | NoneUnitPresence
  | SingleUnitPresence
  | EngagedUnitPresence;

const _assertExactUnitPresence: AssertExact<
  UnitPresence,
  UnitPresenceTypeSchemaType
> = true;
