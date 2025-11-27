import { z } from "zod";
import { playerCardStateSchema } from "./playerCardState.js";
/** The schema for the state of all cards in the game. */
export const cardStateSchema = z.object({
    /** The state of the cards for the black player. */
    blackPlayer: playerCardStateSchema,
    /** The state of the cards for the white player. */
    whitePlayer: playerCardStateSchema,
});
/** Helper function to assert that a value matches the schema. */
const _assertExactCardState = true;
