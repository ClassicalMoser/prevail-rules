import type { AssertExact } from "@utils";
import { z } from "zod";

/**
 * Choice-type literals and schema only — no per-choice event imports.
 * Kept separate from `playerChoice.ts` so `@entities` (via `expectedPlayerInput`) can import
 * `playerChoiceTypeSchema` without circular init while `playerChoice.ts` builds `z.union(...)`.
 */

/** Iterable list of valid player choices. Built from individual event constants. */
export const playerChoices = [
  "chooseCard",
  "chooseMeleeResolution",
  "chooseRally",
  "chooseRoutDiscard",
  "chooseRetreatOption",
  "commitToMelee",
  "commitToMovement",
  "chooseWhetherToRetreat",
  "commitToRangedAttack",
  "issueCommand",
  "moveCommander",
  "moveUnit",
  "performRangedAttack",
  "setupUnits",
] as const;

export type PlayerChoiceType = (typeof playerChoices)[number];

const _playerChoiceTypeSchemaObject = z.enum(playerChoices);

type PlayerChoiceTypeSchemaType = z.infer<typeof _playerChoiceTypeSchemaObject>;

const _assertExactPlayerChoiceType: AssertExact<PlayerChoiceType, PlayerChoiceTypeSchemaType> =
  true;

/** The schema for a player choice type. */
export const playerChoiceTypeSchema: z.ZodType<PlayerChoiceType> = _playerChoiceTypeSchemaObject;
