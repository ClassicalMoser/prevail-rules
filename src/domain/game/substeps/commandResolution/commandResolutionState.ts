import type { RangedAttackResolutionState } from './rangedAttackResolutionSubstep';
import type { AssertExact } from '@utils';

import type { MovementResolutionState } from './movementResolutionSubstep';
import { movementResolutionStateSchema } from './movementResolutionSubstep';
import { rangedAttackResolutionStateSchema } from './rangedAttackResolutionSubstep';
import { z } from 'zod';

/** One unit carrying out its order: a move or a shot. */
export type CommandResolutionState =
  | MovementResolutionState
  | RangedAttackResolutionState;

const _commandResolutionStateSchemaObject = z.union([
  movementResolutionStateSchema,
  rangedAttackResolutionStateSchema,
]);

type CommandResolutionStateSchemaType = z.infer<
  typeof _commandResolutionStateSchemaObject
>;

/** The schema for one unit carrying out its order: a move or a shot. */
export const commandResolutionStateSchema: z.ZodType<CommandResolutionState> =
  _commandResolutionStateSchemaObject;

const _assertExactCommandResolutionState: AssertExact<
  CommandResolutionState,
  CommandResolutionStateSchemaType
> = true;
