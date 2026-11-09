import { z } from 'zod';

/**
 * Every move is a run of these, and nothing else (§5.1–§5.2): a step into
 * the space the unit faces — or, in a retreat, the space behind it — for
 * 1 Speed, or a turn for 1 Flexibility, 45° to the unit's left or right, or
 * 180° about. A step is always one space; a turn is one of three. So a path
 * written as these cannot describe a teleport or a free wheel: any list of
 * them is a move the board can at least picture, and only the rules remain
 * to say whether it is allowed.
 *
 * Left and right are the unit's own, relative to the way it faces at that
 * point in the move.
 */
export const moveDeltas = [
  'step',
  'turnLeft',
  'turnRight',
  'turnAbout',
] as const;

/** One step or one turn of a move. */
export type MoveDelta = (typeof moveDeltas)[number];

/** The three ways a unit may turn, each for 1 Flexibility (§5.2.1). */
export type MoveTurn = Exclude<MoveDelta, 'step'>;

/** The schema for one step or turn of a move. */
export const moveDeltaSchema: z.ZodType<MoveDelta> = z.enum(moveDeltas);
