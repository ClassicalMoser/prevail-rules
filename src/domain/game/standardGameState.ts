import type { CardState, PlayerSide, StandardBoard, UnitInstance } from "@entities";
import type { AssertExact } from "@utils";
import type { RoundState } from "./roundState";

import {
  cardStateSchema,
  playerSideSchema,
  standardBoardSchema,
  unitInstanceSchema,
} from "@entities";
import { z } from "zod";
import { roundStateSchema } from "./roundState";

/**
 * Game state on a **standard** board.
 * Every field is documented here so IDE hover does not depend on {@link GameStateBase}.
 */
export interface StandardGameState {
  /**
   * Root discriminator for {@link GameState}; must match `boardState.boardType` (`'standard'`).
   * One literal for TS narrowing and Zod — no extra type parameters.
   */
  boardType: "standard";
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundState;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** The state of both players' cards. */
  cardState: CardState;
  /** Units not yet placed on the board. */
  reservedUnits: Set<UnitInstance>;
  /** The units that have been routed during the game. */
  routedUnits: Set<UnitInstance>;
  /** The commanders that have been lost during the game. */
  lostCommanders: Set<PlayerSide>;
  /** Board and piece layout for the standard size. */
  boardState: StandardBoard;
}

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _standardGameStateSchemaObject = z.object({
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  currentRoundNumber: z.int().min(0),
  currentRoundState: roundStateSchema,
  currentInitiative: playerSideSchema,
  cardState: cardStateSchema,
  reservedUnits: z.set(unitInstanceSchema),
  routedUnits: z.set(unitInstanceSchema),
  lostCommanders: z.set(playerSideSchema),
  boardState: standardBoardSchema,
});

type StandardGameStateSchemaType = z.infer<typeof _standardGameStateSchemaObject>;

const _assertExactStandardGameState: AssertExact<StandardGameState, StandardGameStateSchemaType> =
  true;

/** {@link StandardGameState} */
export const gameStateSchemaForStandardBoard: z.ZodType<StandardGameState> =
  _standardGameStateSchemaObject;
