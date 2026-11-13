import { z } from 'zod';

/**
 * The turns of 45° to one side: the unit's own left or right, as it faces at
 * that point in the move. A retreat may make only these (§9.1.4).
 */
export const sideTurns = ['turnLeft', 'turnRight'] as const;

/** One of the two turns of 45° to one side (§5.2.1). */
export type SideTurn = (typeof sideTurns)[number];

/** Every turn: 45° to one side, or 180° about (§5.2.1). */
export const moveTurns: readonly [...typeof sideTurns, 'turnAbout'] = [
  ...sideTurns,
  'turnAbout',
];

/** One of the three ways a unit may turn, each for 1 Flexibility (§5.2.1). */
export type MoveTurn = (typeof moveTurns)[number];

/**
 * Every move is a run of steps and turns, and nothing else (§5.1–§5.2). A
 * step goes one space the way the unit faces, or behind it in a retreat, for
 * 1 Speed. So a path cannot describe a jump or a free wheel; only whether it
 * is allowed is left to the rules.
 */
export const moveDeltas: readonly ['step', ...typeof moveTurns] = [
  'step',
  ...moveTurns,
];

/** One step or one turn of a move. */
export type MoveDelta = (typeof moveDeltas)[number];

/** The schema for one step or turn of a move. */
export const moveDeltaSchema: z.ZodType<MoveDelta> = z.enum(moveDeltas);
