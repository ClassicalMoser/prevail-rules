import type { Board } from '@entities/board';
import type { AssertExact } from '@utils';
import type { MovementResolutionState } from './movementResolutionSubstep';
import type { RangedAttackResolutionState } from './rangedAttackResolutionSubstep';
import { z } from 'zod';
import { movementResolutionStateSchema } from './movementResolutionSubstep';
import { rangedAttackResolutionStateSchema } from './rangedAttackResolutionSubstep';

/** The type of the command resolution state. */
export type CommandResolutionState<TBoard extends Board> =
  | MovementResolutionState<TBoard>
  | RangedAttackResolutionState<TBoard>;

/** The shape of the command resolution state schema. */
const _commandResolutionStateSchemaObject = z.discriminatedUnion(
  'commandResolutionType',
  [movementResolutionStateSchema, rangedAttackResolutionStateSchema],
);

// Inference type for the command resolution state schema.
type CommandResolutionStateSchemaType = z.infer<
  typeof _commandResolutionStateSchemaObject
>;

// Verify manual type matches schema inference
const _assertExactCommandResolutionState: AssertExact<
  CommandResolutionState<Board>,
  CommandResolutionStateSchemaType
> = true;

/** The schema for the command resolution state. */
export const commandResolutionStateSchema: z.ZodType<
  CommandResolutionState<Board>
> = _commandResolutionStateSchemaObject;
