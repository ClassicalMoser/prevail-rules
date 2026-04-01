import type { MovementResolutionState } from './movementResolutionSubstep';
import type { RangedAttackResolutionState } from './rangedAttackResolutionSubstep';
import { z } from 'zod';
import { movementResolutionStateSchema } from './movementResolutionSubstep';
import { rangedAttackResolutionStateSchema } from './rangedAttackResolutionSubstep';

/** Command resolution while issuing commands: movement or ranged attack (each discriminated on `boardType`). */
export type CommandResolutionState =
  | MovementResolutionState
  | RangedAttackResolutionState;

/**
 * Movement vs ranged is a flat union (Zod 4: nested discriminated unions are not valid
 * `discriminatedUnion` branches). Each branch remains `boardType`-discriminated internally.
 * Wide union: no AssertExact (inference vs manual union).
 */
const _commandResolutionStateSchemaObject = z.union([
  movementResolutionStateSchema,
  rangedAttackResolutionStateSchema,
]);

/** The schema for the command resolution state. */
export const commandResolutionStateSchema: z.ZodType<CommandResolutionState> =
  _commandResolutionStateSchemaObject;
