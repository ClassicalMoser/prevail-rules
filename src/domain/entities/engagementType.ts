import { z } from 'zod';

/** Iterable list of valid engagement types. */
export const engagementType = ['front', 'flank', 'rear'] as const;

/** Type for all valid engagement types. */
export type EngagementType = (typeof engagementType)[number];

/** The shape of the engagement type. */
export const engagementTypeSchema: z.ZodType<EngagementType> =
  z.enum(engagementType);
