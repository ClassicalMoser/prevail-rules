import { z } from "zod";
import { boardSchema } from "./board/board.js";
import { cardStateSchema } from "./card/cardState.js";
import { commandSchema } from "./card/command.js";
import { playerSideSchema } from "./player/playerSide.js";
import { phaseSchema } from "./sequence/phases.js";
import { unitInstanceSchema } from "./unit/unitInstance.js";
import { engagedUnitPresenceSchema } from "./unitPresence/engagedUnitPresence.js";
/** The schema for a game state. */
export const gameStateSchema = z.object({
    /** The current round number of the game. */
    currentRound: z.number().int().min(0),
    /** The current phase of the game. */
    currentPhase: phaseSchema,
    /** Which player currently has initiative. */
    initiative: playerSideSchema,
    /** Which player is currently taking their turn. */
    playerTurn: playerSideSchema.nullable(),
    /** The ranged attacks that are still due to be resolved this phase. */
    remainingRangedAttacks: z.set(unitInstanceSchema),
    /** The commands that are still due to be resolved this phase. */
    remainingCommands: z.set(commandSchema),
    /** The units that are still eligible to be moved this phase. */
    remainingMovements: z.set(unitInstanceSchema),
    /** The engagements that are still due to be resolved this phase. */
    remainingEngagements: z.set(engagedUnitPresenceSchema),
    /** The state of the board. */
    boardState: boardSchema,
    /** The state of both players' cards. */
    cardState: cardStateSchema,
});
/** Helper function to assert that a value matches the schema. */
const _assertExactGameState = true;
