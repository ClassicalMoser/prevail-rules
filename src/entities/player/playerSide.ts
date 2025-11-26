import type { AssertExact } from "src/utils/assertExact.js";
import { z } from "zod";

export const playerSide = ["black", "white"] as const;

/** The schema for a player's side. */
export const playerSideSchema = z.enum(playerSide);

// Helper type to check match of type against schema
type PlayerSideSchemaType = z.infer<typeof playerSideSchema>;

/** The side of a player. */
export type PlayerSide = (typeof playerSide)[number];

/** Helper function to assert that a value matches the schema. */
const _assertExactPlayerSide: AssertExact<PlayerSide, PlayerSideSchemaType> =
  true;
