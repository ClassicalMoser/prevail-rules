import type { Board, LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { AssertExact } from "@utils";
import type { ChooseCardEvent } from "./chooseCard";
import type { ChooseRallyEvent } from "./chooseRally";
import type { ChooseRoutDiscardEvent } from "./chooseRoutDiscard";
import type { ChooseRetreatOptionEventForBoard } from "./chooseRetreatOption";
import type { ChooseMeleeResolutionEventForBoard } from "./chooseMeleeResolution";
import type { ChooseWhetherToRetreatEvent } from "./chooseWhetherToRetreat";
import type { CommitToMeleeEvent } from "./commitToMelee";
import type { CommitToMovementEvent } from "./commitToMovement";
import type { CommitToRangedAttackEvent } from "./commitToRangedAttack";
import type { IssueCommandEvent } from "./issueCommand";
import type { MoveCommanderEventForBoard } from "./moveCommander";
import type { MoveUnitEventForBoard } from "./moveUnit";
import type { PerformRangedAttackEventForBoard } from "./performRangedAttack";
import type { SetupUnitsEventForBoard } from "./setupUnit";
import type { PlayerChoiceType } from "./playerChoiceTypes";

import { z } from "zod";
import { chooseCardEventSchema } from "./chooseCard";
import {
  largeChooseMeleeResolutionEventSchema,
  smallChooseMeleeResolutionEventSchema,
  standardChooseMeleeResolutionEventSchema,
} from "./chooseMeleeResolution";
import { chooseRallyEventSchema } from "./chooseRally";
import {
  largeChooseRetreatOptionEventSchema,
  smallChooseRetreatOptionEventSchema,
  standardChooseRetreatOptionEventSchema,
} from "./chooseRetreatOption";
import { chooseRoutDiscardEventSchema } from "./chooseRoutDiscard";
import { chooseWhetherToRetreatEventSchema } from "./chooseWhetherToRetreat";
import { commitToMeleeEventSchema } from "./commitToMelee";
import { commitToMovementEventSchema } from "./commitToMovement";
import { commitToRangedAttackEventSchema } from "./commitToRangedAttack";
import { issueCommandEventSchema } from "./issueCommand";
import {
  largeMoveCommanderEventSchema,
  smallMoveCommanderEventSchema,
  standardMoveCommanderEventSchema,
} from "./moveCommander";
import {
  largeMoveUnitEventSchema,
  smallMoveUnitEventSchema,
  standardMoveUnitEventSchema,
} from "./moveUnit";
import {
  largePerformRangedAttackEventSchema,
  smallPerformRangedAttackEventSchema,
  standardPerformRangedAttackEventSchema,
} from "./performRangedAttack";
import {
  largeSetupUnitsEventSchema,
  smallSetupUnitsEventSchema,
  standardSetupUnitsEventSchema,
} from "./setupUnit";

export type { PlayerChoiceType } from "./playerChoiceTypes";
export { playerChoices, playerChoiceTypeSchema } from "./playerChoiceTypes";

/** An event that represents a player choice. */
export type PlayerChoiceEventUnionForBoard<TBoard extends Board> =
  | ChooseCardEvent
  | ChooseMeleeResolutionEventForBoard<TBoard>
  | ChooseRallyEvent
  | ChooseRoutDiscardEvent
  | ChooseRetreatOptionEventForBoard<TBoard>
  | ChooseWhetherToRetreatEvent
  | CommitToMeleeEvent
  | CommitToMovementEvent
  | CommitToRangedAttackEvent
  | IssueCommandEvent
  | MoveCommanderEventForBoard<TBoard>
  | MoveUnitEventForBoard<TBoard>
  | PerformRangedAttackEventForBoard<TBoard>
  | SetupUnitsEventForBoard<TBoard>;

/**
 * Player choice event type filtered by choice type.
 * Extracts only the event type that matches the specified choiceType.
 * This ensures type safety - PlayerChoiceEvent<TBoard, 'chooseCard'> is ONLY ChooseCardEvent.
 */
export type PlayerChoiceEventForBoard<
  TBoard extends Board,
  TPlayerChoiceType extends PlayerChoiceType = PlayerChoiceType,
> = Extract<PlayerChoiceEventUnionForBoard<TBoard>, { choiceType: TPlayerChoiceType }>;

export type PlayerChoiceEvent =
  | PlayerChoiceEventForBoard<StandardBoard>
  | PlayerChoiceEventForBoard<SmallBoard>
  | PlayerChoiceEventForBoard<LargeBoard>;

const _smallPlayerChoiceEventSchemaObject = z.discriminatedUnion("choiceType", [
  chooseCardEventSchema,
  smallChooseMeleeResolutionEventSchema,
  chooseRallyEventSchema,
  chooseRoutDiscardEventSchema,
  smallChooseRetreatOptionEventSchema,
  chooseWhetherToRetreatEventSchema,
  commitToMeleeEventSchema,
  commitToMovementEventSchema,
  commitToRangedAttackEventSchema,
  issueCommandEventSchema,
  smallMoveCommanderEventSchema,
  smallMoveUnitEventSchema,
  smallPerformRangedAttackEventSchema,
  smallSetupUnitsEventSchema,
]);

const _assertExactSmallPlayerChoiceEvent: AssertExact<
  PlayerChoiceEventForBoard<SmallBoard>,
  SmallPlayerChoiceEventSchemaType
> = true;

type SmallPlayerChoiceEventSchemaType = z.infer<typeof _smallPlayerChoiceEventSchemaObject>;

export const smallPlayerChoiceEventSchema: z.ZodType<PlayerChoiceEventForBoard<SmallBoard>> =
  _smallPlayerChoiceEventSchemaObject;

const _standardPlayerChoiceEventSchemaObject = z.discriminatedUnion("choiceType", [
  chooseCardEventSchema,
  standardChooseMeleeResolutionEventSchema,
  chooseRallyEventSchema,
  chooseRoutDiscardEventSchema,
  standardChooseRetreatOptionEventSchema,
  chooseWhetherToRetreatEventSchema,
  commitToMeleeEventSchema,
  commitToMovementEventSchema,
  commitToRangedAttackEventSchema,
  issueCommandEventSchema,
  standardMoveCommanderEventSchema,
  standardMoveUnitEventSchema,
  standardPerformRangedAttackEventSchema,
  standardSetupUnitsEventSchema,
]);

type StandardPlayerChoiceEventSchemaType = z.infer<typeof _standardPlayerChoiceEventSchemaObject>;

const _assertExactStandardPlayerChoiceEvent: AssertExact<
  PlayerChoiceEventForBoard<StandardBoard>,
  StandardPlayerChoiceEventSchemaType
> = true;

export const standardPlayerChoiceEventSchema: z.ZodType<PlayerChoiceEventForBoard<StandardBoard>> =
  _standardPlayerChoiceEventSchemaObject;

const _largePlayerChoiceEventSchemaObject = z.discriminatedUnion("choiceType", [
  chooseCardEventSchema,
  largeChooseMeleeResolutionEventSchema,
  chooseRallyEventSchema,
  chooseRoutDiscardEventSchema,
  largeChooseRetreatOptionEventSchema,
  chooseWhetherToRetreatEventSchema,
  commitToMeleeEventSchema,
  commitToMovementEventSchema,
  commitToRangedAttackEventSchema,
  issueCommandEventSchema,
  largeMoveCommanderEventSchema,
  largeMoveUnitEventSchema,
  largePerformRangedAttackEventSchema,
  largeSetupUnitsEventSchema,
]);

type LargePlayerChoiceEventSchemaType = z.infer<typeof _largePlayerChoiceEventSchemaObject>;

const _assertExactLargePlayerChoiceEvent: AssertExact<
  PlayerChoiceEventForBoard<LargeBoard>,
  LargePlayerChoiceEventSchemaType
> = true;

export const largePlayerChoiceEventSchema: z.ZodType<PlayerChoiceEventForBoard<LargeBoard>> =
  _largePlayerChoiceEventSchemaObject;

export const playerChoiceEventSchema: z.ZodType<PlayerChoiceEvent> = z.union([
  smallPlayerChoiceEventSchema,
  standardPlayerChoiceEventSchema,
  largePlayerChoiceEventSchema,
]);

type PlayerChoiceEventSchemaType = z.infer<typeof playerChoiceEventSchema>;

const _assertExactPlayerChoiceEvent: AssertExact<PlayerChoiceEvent, PlayerChoiceEventSchemaType> =
  true;
