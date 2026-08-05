import type { RangedAttackResolutionState } from './rangedAttackResolutionSubstep';
import type { AssertExact } from '@utils';

import type { MovementResolutionState } from './movementResolutionSubstep';
import { movementResolutionStateSchema } from './movementResolutionSubstep';
import { rangedAttackResolutionStateSchema } from './rangedAttackResolutionSubstep';
import { z } from 'zod';

/** Command resolution while issuing commands: movement or ranged attack. */
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

const _assertExactCommandResolutionState: AssertExact<
  CommandResolutionState,
  CommandResolutionStateSchemaType
> = true;

export const commandResolutionStateSchema: z.ZodType<CommandResolutionState> =
  _commandResolutionStateSchemaObject;
