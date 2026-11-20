import type { GameState } from '@game';
import type { z } from 'zod';
import { playerSides } from '@entities';
import { deriveGameStateIndex, listPiecePlaces } from '@queries';

/**
 * Adds Zod issues when a game state's index says anything its record does
 * not, or when the record itself holds a piece in two places.
 *
 * The board and the reserve, routed and lost lists are the record of where
 * every piece is; the index is a convenience kept beside them. Every write
 * keeps the two in step, so a state built in play always agrees. A state read
 * from outside is checked here, so a finder reading the index can trust it.
 *
 * A piece in two places (a unit both in reserve and on the board, a commander
 * both standing and lost) is never a whole state, whatever the index says, so
 * it is refused too.
 *
 * @param state - The game state to check
 * @param ctx - Where to add each issue
 * @param pathPrefix - Where the state sits in a larger value, such as
 * `['gameState']` in a game, so each issue points at it
 */
export function refineGameStateIndex(
  state: GameState,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  // Every place the record puts each piece, by piece.
  const unitPlaces = new Map<string, string[]>();
  const commanderPlaces = new Map<string, string[]>();
  for (const place of listPiecePlaces(state)) {
    const [places, name] =
      place.piece === 'unit'
        ? [unitPlaces, place.key]
        : [commanderPlaces, place.side];
    places.set(name, [...(places.get(name) ?? []), place.entry]);
  }

  // A unit the record holds in more than one place.
  for (const [key, places] of unitPlaces) {
    if (places.length > 1) {
      ctx.addIssue({
        code: 'custom',
        message: `Unit ${key} is held in more than one place: ${places.join(', ')}.`,
        path: [...pathPrefix, 'index', 'units', key],
      });
    }
  }

  // A commander the record holds in more than one place.
  for (const [side, places] of commanderPlaces) {
    if (places.length > 1) {
      ctx.addIssue({
        code: 'custom',
        message: `The ${side} commander is held in more than one place: ${places.join(', ')}.`,
        path: [...pathPrefix, 'index', 'commanders', side],
      });
    }
  }

  // What the index should say, read from the record.
  const expected = deriveGameStateIndex(state);

  // Each unit the index names or the record holds, compared one by one. A
  // unit on only one side of the two is "nowhere" on the other.
  // Both are read by plain name here, as any key either holds is compared.
  const saidUnits: Readonly<Record<string, string>> = state.index.units;
  const heldUnits: Readonly<Record<string, string>> = expected.units;
  const unitKeys = new Set([
    ...Object.keys(saidUnits),
    ...Object.keys(heldUnits),
  ]);
  for (const key of unitKeys) {
    const said = Object.hasOwn(saidUnits, key) ? saidUnits[key] : 'nowhere';
    const held = Object.hasOwn(heldUnits, key) ? heldUnits[key] : 'nowhere';
    if (said !== held) {
      ctx.addIssue({
        code: 'custom',
        message: `The index puts unit ${key} at ${said}, but the record has it ${held === 'nowhere' ? 'nowhere' : `at ${held}`}.`,
        path: [...pathPrefix, 'index', 'units', key],
      });
    }
  }

  // Each side's commander, compared.
  for (const side of playerSides) {
    const said = state.index.commanders[side];
    const held = expected.commanders[side];
    if (said !== held) {
      ctx.addIssue({
        code: 'custom',
        message: `The index puts the ${side} commander at ${said}, but the record has it at ${held}.`,
        path: [...pathPrefix, 'index', 'commanders', side],
      });
    }
  }
}
