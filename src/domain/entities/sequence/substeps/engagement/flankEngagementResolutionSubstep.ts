import type { AssertExact } from '@utils';
import { z } from 'zod';

/** The resolution state of an engagement from the flank. */
export interface FlankEngagementResolutionState {
  /** The type of engagement. */
  engagementType: 'flank';
  /** Whether the defending unit has been rotated. */
  defenderRotated: boolean;
}

const _flankEngagementResolutionStateSchemaObject = z.object({
  /** The type of engagement. */
  engagementType: z.literal('flank'),
  /** Whether the defending unit has been rotated. */
  defenderRotated: z.boolean(),
});

type FlankEngagementResolutionStateSchemaType = z.infer<
  typeof _flankEngagementResolutionStateSchemaObject
>;

const _assertExactFlankEngagementResolutionState: AssertExact<
  FlankEngagementResolutionState,
  FlankEngagementResolutionStateSchemaType
> = true;

/** The schema for the flank engagement resolution state. */
export const flankEngagementResolutionStateSchema: z.ZodObject<{
  engagementType: z.ZodLiteral<'flank'>;
  defenderRotated: z.ZodType<boolean>;
}> = _flankEngagementResolutionStateSchemaObject;
