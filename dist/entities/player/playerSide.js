import { z } from "zod";
export const playerSide = ["black", "white"];
/** The schema for a player's side. */
export const playerSideSchema = z.enum(playerSide);
/** Helper function to assert that a value matches the schema. */
const _assertExactPlayerSide = true;
