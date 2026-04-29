import type { Board, LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { GameStateBase } from "./gameStateShared";
import type { LargeGameState } from "./largeGameState";
import type { SmallGameState } from "./smallGameState";
import type { StandardGameState } from "./standardGameState";

import { z } from "zod";
import { gameStateSchemaForLargeBoard } from "./largeGameState";
import { gameStateSchemaForSmallBoard } from "./smallGameState";
import { gameStateSchemaForStandardBoard } from "./standardGameState";

export type { GameStateBase } from "./gameStateShared";
export type { LargeGameState } from "./largeGameState";
export { gameStateSchemaForLargeBoard } from "./largeGameState";
export type { SmallGameState } from "./smallGameState";
export { gameStateSchemaForSmallBoard } from "./smallGameState";
export type { StandardGameState } from "./standardGameState";
export { gameStateSchemaForStandardBoard } from "./standardGameState";

/** `boardType` literal aligned with {@link StandardBoard} / {@link SmallBoard} / {@link LargeBoard}. */
type BoardTypeForBoard<TBoard extends Board> = TBoard extends StandardBoard
  ? "standard"
  : TBoard extends SmallBoard
    ? "small"
    : TBoard extends LargeBoard
      ? "large"
      : never;

/**
 * All game states, discriminated by root {@link StandardGameState.boardType} /
 * {@link SmallGameState.boardType} / {@link LargeGameState.boardType} (same values as
 * `boardState.boardType`, enforced by Zod and narrowing without generics).
 */
export type GameState = StandardGameState | SmallGameState | LargeGameState;

/**
 * Game state correlated with a generic `TBoard` (e.g. procedure/transform type parameters).
 * `boardType` and `boardState` stay in lockstep with `TBoard` under a naked
 * `TBoard extends Board` type parameter.
 *
 * Prefer {@link GameState} when you mean “any board”.
 */
export type GameStateWithBoard<TBoard extends Board = Board> = GameStateBase & {
  boardType: BoardTypeForBoard<TBoard>;
  boardState: TBoard;
};

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

// Branch exports are `z.ZodType<…>` for `.d.ts`; runtime values are ZodObject — cast for discriminatedUnion.
const _gameStateDiscriminatedUnion = z.discriminatedUnion("boardType", [
  gameStateSchemaForStandardBoard,
  gameStateSchemaForSmallBoard,
  gameStateSchemaForLargeBoard,
] as unknown as Parameters<typeof z.discriminatedUnion>[1]);

const _gameStateSchemaObject = _gameStateDiscriminatedUnion.superRefine((state, ctx) => {
  const s = state as GameState;
  if (s.boardType !== s.boardState.boardType) {
    ctx.addIssue({
      code: "custom",
      message: "boardType must equal boardState.boardType (root literal must match nested board)",
      path: ["boardState", "boardType"],
    });
  }
});

/** Wide schema: discriminated on root `boardType` (must match nested `boardState.boardType`). */
export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject as z.ZodType<GameState>;
