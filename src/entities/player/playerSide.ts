import type { AssertExact } from '@utils';
import { z } from 'zod';

export const playerSide = ['black', 'white'] as const;

/** The side of a player. */
export type PlayerSide = (typeof playerSide)[number];

const _playerSideSchemaObject = z.enum(playerSide);

type PlayerSideSchemaType = z.infer<typeof _playerSideSchemaObject>;

/** The schema for a player's side. */
export const playerSideSchema: z.ZodType<PlayerSide> = _playerSideSchemaObject;

// Verify manual type matches schema inference
const _assertExactPlayerSide: AssertExact<PlayerSide, PlayerSideSchemaType> =
  true;
