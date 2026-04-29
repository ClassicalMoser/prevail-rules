import type { Army } from "@entities";
import type { AssertExact } from "@utils";
import type { SmallGameState } from "./smallGameState";

import { armySchema } from "@entities";
import { z } from "zod";
import { gameStateSchemaForSmallBoard } from "./smallGameState";

/**
 * A **mini** game (`gameType === 'mini'`).
 * Every field is documented here so IDE hover does not jump through a shared base interface.
 */
export interface MiniGame {
  gameType: "mini";
  gameState: SmallGameState;
  /** The unique identifier of the game. */
  id: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The army brought by the black player. */
  blackArmy: Army;
  /** The army brought by the white player. */
  whiteArmy: Army;
}

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _miniGameSchemaObject: z.ZodType<MiniGame> = z.object({
  gameType: z.literal("mini"),
  gameState: gameStateSchemaForSmallBoard,
  id: z.uuid(),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
}) as z.ZodType<MiniGame>;

type MiniGameSchemaType = z.infer<typeof _miniGameSchemaObject>;

const _assertExactMiniGame: AssertExact<MiniGame, MiniGameSchemaType> = true;

/** Validates a {@link Game} when `gameType` is known to be `mini`. */
export const miniGameSchema: z.ZodType<MiniGame> = _miniGameSchemaObject;
