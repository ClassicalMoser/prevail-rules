import type { Board, UnitCount } from '@entities';
import { createEmptySmallBoard, createUnitInstance } from '@factories';
import { createBoardWithUnits, getUnitByStatValue, placed } from '@testing';

import { eachUnitPresentOnce } from './eachUnitPresentOnce';

// Two sample unit types: the first with Attack 2 (Velites) and the first
// with Attack 3 (Punic Citizen Spearmen). The check tells units apart only by
// side, type and number, so any two types will do.
const velites = getUnitByStatValue('attack', 2);
const spearmen = getUnitByStatValue('attack', 3);

// White brought two Velites and Black one. Spearmen are a type neither army
// brought.
const whiteArmy = new Set<UnitCount>([{ count: 2, unitType: velites }]);
const blackArmy = new Set<UnitCount>([{ count: 1, unitType: velites }]);

// Each army's pieces, numbered from 1 within their type.
const whiteVelites1 = createUnitInstance('white', velites, 1);
const whiteVelites2 = createUnitInstance('white', velites, 2);
const blackVelites1 = createUnitInstance('black', velites, 1);

/**
 * EachUnitPresentOnce: eachUnitPresentOnce.
 *
 * Every piece an army brings stands on one space of the board, alone or
 * locked with an enemy, until it routs and leaves the battle for good
 * (§9.3.1). So every unit both armies brought is in exactly one place, and no
 * other unit is anywhere.
 */
describe('eachUnitPresentOnce function', () => {
  it('accepts both armies each standing once on the board', () => {
    // White's two Velites face Black's one across the field.
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(whiteVelites2, 'E-6', 'north'),
      placed(blackVelites1, 'C-5', 'south'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // White's first Velites and Black's are two pieces, one per side.
    expect(validation).toStrictEqual({ result: true });
  });

  it('counts both units locked in an engaged space', () => {
    // Black's Velites has walked into White's first, head on, and the two
    // share E-5 (§6.1.1).
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(blackVelites1, 'E-5', 'south'),
      placed(whiteVelites2, 'E-6', 'north'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // Both units in the engaged space are on the board.
    expect(validation).toStrictEqual({ result: true });
  });

  it('accepts units that have routed, beside those still standing', () => {
    // White's second Velites and Black's have routed; White's first stands.
    const board = createBoardWithUnits([placed(whiteVelites1, 'E-5', 'north')]);
    const routed = new Set([whiteVelites2, blackVelites1]);

    const validation = eachUnitPresentOnce(whiteArmy, blackArmy, board, routed);

    // A routed unit has left the battle, but the record still names it.
    expect(validation).toStrictEqual({ result: true });
  });

  it('refuses a unit standing on two spaces', () => {
    // White's first Velites is recorded on E-5 and again on E-7.
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(whiteVelites2, 'E-6', 'north'),
      placed(whiteVelites1, 'E-7', 'north'),
      placed(blackVelites1, 'C-5', 'south'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // Refused as one piece recorded twice, not as a piece no army brought.
    expect(validation).toStrictEqual({
      errorReason: 'Duplicate unit on board',
      result: false,
    });
  });

  it('refuses an engaged unit already met standing on an earlier space', () => {
    // White's first Velites stands on D-5, and is also locked with Black's
    // Velites on E-5, the next row down.
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'D-5', 'north'),
      placed(whiteVelites1, 'E-5', 'north'),
      placed(blackVelites1, 'E-5', 'south'),
      placed(whiteVelites2, 'E-6', 'north'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // The unit standing in the engaged space was already met.
    expect(validation).toStrictEqual({
      errorReason: 'Duplicate unit on board',
      result: false,
    });
  });

  it('refuses the enemy in an engaged space when it was already met on an earlier space', () => {
    // Black's Velites stands on D-5, and is also the unit that walked into
    // White's first Velites on E-5.
    const board = createBoardWithUnits([
      placed(blackVelites1, 'D-5', 'south'),
      placed(whiteVelites1, 'E-5', 'north'),
      placed(blackVelites1, 'E-5', 'south'),
      placed(whiteVelites2, 'E-6', 'north'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // The unit that walked in was already met.
    expect(validation).toStrictEqual({
      errorReason: 'Duplicate unit on board',
      result: false,
    });
  });

  it('refuses a unit standing on a later space after an engagement counted it', () => {
    // White's first Velites is locked with Black's on E-5, and is also
    // recorded on F-5, the next row down.
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(blackVelites1, 'E-5', 'south'),
      placed(whiteVelites2, 'E-6', 'north'),
      placed(whiteVelites1, 'F-5', 'north'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // Both units of an engagement are remembered as met.
    expect(validation).toStrictEqual({
      errorReason: 'Duplicate unit on board',
      result: false,
    });
  });

  it('refuses a unit numbered beyond the count its army brought', () => {
    // White brought two Velites, but a third stands on E-7.
    const whiteVelites3 = createUnitInstance('white', velites, 3);
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(whiteVelites2, 'E-6', 'north'),
      placed(whiteVelites3, 'E-7', 'north'),
      placed(blackVelites1, 'C-5', 'south'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // Units are numbered from 1 within their type, so no army brought it.
    expect(validation).toStrictEqual({
      errorReason: 'Unexpected unit on board',
      result: false,
    });
  });

  it('refuses a unit in an engaged space of a type its army never brought', () => {
    // White Spearmen stand on E-5 where Black's Velites walked into them;
    // White brought no Spearmen.
    const whiteSpearmen1 = createUnitInstance('white', spearmen, 1);
    const board = createBoardWithUnits([
      placed(whiteSpearmen1, 'E-5', 'north'),
      placed(blackVelites1, 'E-5', 'south'),
      placed(whiteVelites1, 'E-6', 'north'),
      placed(whiteVelites2, 'E-7', 'north'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // The unit standing in the engaged space is no army's.
    expect(validation).toStrictEqual({
      errorReason: 'Unexpected unit on board',
      result: false,
    });
  });

  it('refuses the enemy in an engaged space when its army never brought that type', () => {
    // Black Spearmen walked into White's first Velites on E-5; Black brought
    // no Spearmen.
    const blackSpearmen1 = createUnitInstance('black', spearmen, 1);
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(blackSpearmen1, 'E-5', 'south'),
      placed(whiteVelites2, 'E-6', 'north'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // The unit that walked in is no army's.
    expect(validation).toStrictEqual({
      errorReason: 'Unexpected unit on board',
      result: false,
    });
  });

  it('refuses an army whose unit is neither on the board nor routed', () => {
    // White's second Velites is nowhere.
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(blackVelites1, 'C-5', 'south'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set(),
    );

    // The record has lost a piece.
    expect(validation).toStrictEqual({
      errorReason: 'One or more units missing from game state',
      result: false,
    });
  });

  it('refuses a routed unit its army never brought', () => {
    // Every unit both armies brought stands on the board, and a third White
    // Velites is recorded as routed.
    const whiteVelites3 = createUnitInstance('white', velites, 3);
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(whiteVelites2, 'E-6', 'north'),
      placed(blackVelites1, 'C-5', 'south'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set([whiteVelites3]),
    );

    // The reason names the board though the unit was found routed (see the
    // TODO(misleading) mark in the source).
    expect(validation).toStrictEqual({
      errorReason: 'Unexpected unit on board',
      result: false,
    });
  });

  it('refuses a routed unit still standing on the board', () => {
    // White's first Velites stands on E-5 and is also recorded as routed.
    const board = createBoardWithUnits([
      placed(whiteVelites1, 'E-5', 'north'),
      placed(whiteVelites2, 'E-6', 'north'),
      placed(blackVelites1, 'C-5', 'south'),
    ]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      board,
      new Set([whiteVelites1]),
    );

    // A routed unit has left the battle for good (§9.3.1); the board already
    // counted this one.
    expect(validation).toStrictEqual({
      errorReason: 'Unexpected unit on board',
      result: false,
    });
  });

  it('refuses a board missing a space, rather than throwing', () => {
    // A small board read from outside with its far corner, H-12, taken away.
    // Every unit has routed, so the hole is the record's only fault.
    const { 'H-12': _farCorner, ...withoutFarCorner } =
      createEmptySmallBoard().board;
    const boardWithHole: Board = {
      board: withoutFarCorner,
      boardType: 'small',
    };
    const routed = new Set([whiteVelites1, whiteVelites2, blackVelites1]);

    const validation = eachUnitPresentOnce(
      whiteArmy,
      blackArmy,
      boardWithHole,
      routed,
    );

    // Reading the missing space throws, and the entry point keeps its
    // message under what it was checking.
    expect(validation).toStrictEqual({
      errorReason:
        'Error checking each unit is present once: Coordinate H-12 does not exist on small board.',
      result: false,
    });
  });
});
