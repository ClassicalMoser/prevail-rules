import type { Board, LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { MovementResolutionStateForBoard } from "./movementResolutionSubstep";
import type { RangedAttackResolutionStateForBoard } from "./rangedAttackResolutionSubstep";
import type { AssertExact } from "@utils";

import {
  largeMovementResolutionStateSchema,
  smallMovementResolutionStateSchema,
  standardMovementResolutionStateSchema,
} from "./movementResolutionSubstep";
import {
  largeRangedAttackResolutionStateSchema,
  smallRangedAttackResolutionStateSchema,
  standardRangedAttackResolutionStateSchema,
} from "./rangedAttackResolutionSubstep";
import { z } from "zod";

/** Command resolution while issuing commands: movement or ranged attack (each discriminated on `boardType`). */
export type CommandResolutionStateForBoard<TBoard extends Board> =
  | MovementResolutionStateForBoard<TBoard>
  | RangedAttackResolutionStateForBoard<TBoard>;

/** Command resolution state (any board) */
export type CommandResolutionState =
  | CommandResolutionStateForBoard<SmallBoard>
  | CommandResolutionStateForBoard<StandardBoard>
  | CommandResolutionStateForBoard<LargeBoard>;

const _standardCommandResolutionStateSchemaObject = z.union([
  standardMovementResolutionStateSchema,
  standardRangedAttackResolutionStateSchema,
]);

type StandardCommandResolutionStateSchemaType = z.infer<
  typeof _standardCommandResolutionStateSchemaObject
>;

const _assertExactStandardCommandResolutionState: AssertExact<
  CommandResolutionStateForBoard<StandardBoard>,
  StandardCommandResolutionStateSchemaType
> = true;

export const standardCommandResolutionStateSchema: z.ZodType<
  CommandResolutionStateForBoard<StandardBoard>
> = _standardCommandResolutionStateSchemaObject;

const _smallCommandResolutionStateSchemaObject = z.union([
  smallMovementResolutionStateSchema,
  smallRangedAttackResolutionStateSchema,
]);

type SmallCommandResolutionStateSchemaType = z.infer<
  typeof _smallCommandResolutionStateSchemaObject
>;

const _assertExactSmallCommandResolutionState: AssertExact<
  CommandResolutionStateForBoard<SmallBoard>,
  SmallCommandResolutionStateSchemaType
> = true;

export const smallCommandResolutionStateSchema: z.ZodType<
  CommandResolutionStateForBoard<SmallBoard>
> = _smallCommandResolutionStateSchemaObject;

const _largeCommandResolutionStateSchemaObject = z.union([
  largeMovementResolutionStateSchema,
  largeRangedAttackResolutionStateSchema,
]);

type LargeCommandResolutionStateSchemaType = z.infer<
  typeof _largeCommandResolutionStateSchemaObject
>;

const _assertExactLargeCommandResolutionState: AssertExact<
  CommandResolutionStateForBoard<LargeBoard>,
  LargeCommandResolutionStateSchemaType
> = true;

export const largeCommandResolutionStateSchema: z.ZodType<
  CommandResolutionStateForBoard<LargeBoard>
> = _largeCommandResolutionStateSchemaObject;

const _commandResolutionStateSchemaObject = z.union([
  _standardCommandResolutionStateSchemaObject,
  _smallCommandResolutionStateSchemaObject,
  _largeCommandResolutionStateSchemaObject,
]);

type CommandResolutionStateSchemaType = z.infer<typeof _commandResolutionStateSchemaObject>;

const _assertExactCommandResolutionState: AssertExact<
  CommandResolutionState,
  CommandResolutionStateSchemaType
> = true;

export const commandResolutionStateSchema: z.ZodType<CommandResolutionState> =
  _commandResolutionStateSchemaObject;
