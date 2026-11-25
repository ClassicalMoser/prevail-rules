import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  findPlayerUnitWithPosition,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import { throwIfUndefined } from '@utils';
import { createGameState, createTestUnit, placed } from '@testing';

import { getLegalRetreats } from './getLegalRetreats';

/**
 * GetLegalRetreats: legal retreat paths for an engaged unit given speed, flexibility, and board occupancy.
 */
describe('getLegalRetreats function', () => {
  /**
   * One side's unit on G-8, which may share the space with an enemy. Only
   * the side-aware lookup can pick one unit out of an engaged space.
   */
  function unitOnG8(gameState: GameState, side: PlayerSide): UnitWithPlacement {
    const found = throwIfUndefined(
      findPlayerUnitWithPosition(gameState.boardState, 'G-8', side),
      `No ${side} unit on G-8`,
    );
    return found;
  }

  // In most cases a black unit on G-8 faces west, locked with a white unit
  // facing east. Black's back is to the east, so it falls back towards G-9;
  // white's is to the west, towards G-7.

  describe('falling back', () => {
    it('either unit of an engaged space falls straight back a single step', () => {
      // Nothing stands behind either: the smallest retreat is no turn and
      // one step (§9.1.3).
      const gameState = createGameState([
        { coord: 'G-8', facing: 'west', flexibility: 2, player: 'black' },
        ['G-8', 'white', 'east'],
      ]);

      const black = getLegalRetreats(unitOnG8(gameState, 'black'), gameState);
      const white = getLegalRetreats(unitOnG8(gameState, 'white'), gameState);

      // Each steps straight back, black towards G-9 and white towards G-7.
      expect(black).toStrictEqual([['step']]);
      expect(white).toStrictEqual([['step']]);
    });

    it('an enemy behind looking away bars the straight step, leaving a 45° turn either way', () => {
      // The white unit on G-9 faces east, away from the black unit: it does
      // not cut the retreat (§9.1.5), but its space may not be entered
      // (§9.1.7). A turn and a step to either back corner tie for smallest,
      // and the owner chooses (§9.1.3).
      const gameState = createGameState([
        { coord: 'G-8', facing: 'west', flexibility: 2, player: 'black' },
        ['G-8', 'white', 'east'],
        ['G-9', 'white', 'east'],
      ]);

      const unit = unitOnG8(gameState, 'black');
      const retreats = getLegalRetreats(unit, gameState);

      // Turned left it falls back to F-9; turned right, to H-9.
      expect(retreats).toStrictEqual([
        ['turnLeft', 'step'],
        ['turnRight', 'step'],
      ]);
    });

    it('a friend loose enough to pass is fallen back through', () => {
      // A lone black unit of Flexibility 4 with a friend of Flexibility 4 on
      // G-9: 4 and 4 make the 6 needed to pass (§5.4.2), so it goes straight
      // back through G-9 to G-10, turning nowhere.
      const gameState = createGameState([
        { coord: 'G-8', facing: 'west', flexibility: 4, player: 'black' },
        { coord: 'G-9', facing: 'west', flexibility: 4, player: 'black' },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'G-8',
      );

      const retreats = getLegalRetreats(unit, gameState);

      // Two steps back, the first through the friend.
      expect(retreats).toStrictEqual([['step', 'step']]);
    });

    it('a card committed for Speed counts towards the retreat', () => {
      // A Speed-2 black unit with loose friends on G-9 and G-10 cannot end
      // straight back: both spaces it reaches hold friends. Without a card it
      // must turn and step to a back corner. With +1 Speed committed, as a
      // defender may before falling back from a front engagement (§6.3.2),
      // it passes both and stands on G-11, turning nowhere.
      const gameState = createGameState([
        {
          coord: 'G-8',
          facing: 'west',
          flexibility: 4,
          player: 'black',
          speed: 2,
        },
        ['G-8', 'white', 'east'],
        { coord: 'G-9', facing: 'west', flexibility: 4, player: 'black' },
        { coord: 'G-10', facing: 'west', flexibility: 4, player: 'black' },
      ]);
      const unit = unitOnG8(gameState, 'black');

      const uncommitted = getLegalRetreats(unit, gameState);
      const committed = getLegalRetreats(unit, gameState, [
        { type: 'speed', value: 1 },
      ]);

      // Without the card: the two back corners, a turn and a step each.
      expect(uncommitted).toStrictEqual([
        ['turnLeft', 'step'],
        ['turnRight', 'step'],
      ]);
      // With it: three steps straight back.
      expect(committed).toStrictEqual([['step', 'step', 'step']]);
    });
  });

  describe('cut off', () => {
    it('an enemy behind, facing the unit, leaves it no retreat at all', () => {
      // The white unit on G-9 faces west, straight at the black unit's back:
      // its line of withdrawal is cut, however much room lies beyond
      // (§9.1.5), so it would rout (§9.1.6).
      const gameState = createGameState([
        { coord: 'G-8', facing: 'west', flexibility: 2, player: 'black' },
        ['G-8', 'white', 'east'],
        ['G-9', 'white', 'west'],
      ]);

      const unit = unitOnG8(gameState, 'black');
      const retreats = getLegalRetreats(unit, gameState);

      // No path at all, not even a long one.
      expect(retreats).toStrictEqual([]);
    });
  });

  describe('error cases', () => {
    // The caller names where the unit stands. A board that disagrees is a
    // faulty question, not the rules saying "no retreat".
    it('throws when no unit of that side stands at the placement', () => {
      const gameState = createGameState([]);
      const unitWithPlacement = placed(createTestUnit('black'), 'G-8', 'west');

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'No friendly unit at coordinate',
      );
    });

    it('throws when another unit of that side stands at the placement', () => {
      const gameState = createGameState([
        ['G-8', 'black', 'west'],
        ['G-8', 'white', 'east'],
      ]);
      // A black unit of another instance number than the one on G-8.
      const differentUnit = createTestUnit('black', { instanceNumber: 12 });
      const unitWithPlacement = placed(differentUnit, 'G-8', 'west');

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'Unit is not at the placement',
      );
    });

    it('throws when the unit faces another way than the placement says', () => {
      const gameState = createGameState([
        ['G-8', 'black', 'west'],
        ['G-8', 'white', 'east'],
      ]);
      const unit = unitOnG8(gameState, 'black');
      const unitWithPlacement = placed(unit.unit, 'G-8', 'north');

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'Declared facing does not match facing of unit present',
      );
    });
  });
});
