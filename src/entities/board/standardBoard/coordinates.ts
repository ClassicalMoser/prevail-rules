import type { AssertExact } from "../../../assertExact.js";
import { z } from "zod";
import { boardRowLetters } from "./rowLetters.js";

/**
 * All valid board coordinates (A1 through L18), generated from row letters and column numbers.
 */
export const boardCoordinates = boardRowLetters.flatMap((row) =>
  Array.from({ length: 18 }, (_, i) => `${row}${i + 1}`),
) as unknown as readonly string[];

export const boardCoordinatesSchema = z.enum(
  boardCoordinates as [string, ...string[]] as [string, ...string[]],
);

// Helper type to check match of type against schema
type boardCoordinatesSchemaType = z.infer<typeof boardCoordinatesSchema>;

/**
 * A board coordinate (A1 through L18).
 */
export type BoardCoordinate = (typeof boardCoordinates)[number];

// assert that the type matches the schema
const _boardCoordinatesAssertExact: AssertExact<
  BoardCoordinate,
  boardCoordinatesSchemaType
> = true;
