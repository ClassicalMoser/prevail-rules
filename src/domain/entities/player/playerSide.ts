import type { AssertExact } from '@utils';
import { z } from 'zod';

/** Iterable list of valid player sides. */
export const playerSides = ['black', 'white'] as const;

/** The side of a player. */
export type PlayerSide = (typeof playerSides)[number];

const _playerSideSchemaObject = z.enum(playerSides);

type PlayerSideSchemaType = z.infer<typeof _playerSideSchemaObject>;

/** The schema for a player's side. */
export const playerSideSchema: z.ZodType<PlayerSide> = _playerSideSchemaObject;

// Verify manual type matches schema inference
const _assertExactPlayerSide: AssertExact<PlayerSide, PlayerSideSchemaType> =
  true;
