import type { AssertExact } from '@utils';
import type { LinesAllocation } from './linesAllocation';
import type { UnitsAllocation } from './unitsAllocation';

import { z } from 'zod';
import { linesAllocationSchema } from './linesAllocation';
import { unitsAllocationSchema } from './unitsAllocation';

/**
 * How a player spends the command on their card in play (§4.3): a units
 * command or a lines command, as the card's command size says.
 */
export type CommandAllocation = UnitsAllocation | LinesAllocation;

const _commandAllocationSchemaObject = z.discriminatedUnion('allocationType', [
  unitsAllocationSchema,
  linesAllocationSchema,
]);

type CommandAllocationSchemaType = z.infer<
  typeof _commandAllocationSchemaObject
>;

/** The schema for how a player spends the command on their card in play. */
export const commandAllocationSchema: z.ZodType<CommandAllocation> =
  _commandAllocationSchemaObject;

// Verify manual type matches schema inference
const _assertExactCommandAllocation: AssertExact<
  CommandAllocation,
  CommandAllocationSchemaType
> = true;
