import { z } from 'zod';

/** Iterable list of valid player sides. */
export const playerSides = ['black', 'white'] as const;

/** The side of a player. */
export type PlayerSide = (typeof playerSides)[number];

/** The schema for a player's side. */
export const playerSideSchema: z.ZodType<PlayerSide> = z.enum(playerSides);
