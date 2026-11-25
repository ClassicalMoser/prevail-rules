import type { PlayerSide } from '@entities';
import type { Commitment, GameState } from '@game';
import {
  createGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateResolveMeleeEvent } from './generateResolveMeleeEvent';

// The unit placement shorthand `createGameState` reads; the @testing barrel
// does not export its name.
type UnitPlacementSpec = Parameters<typeof createGameState>[0][number];

/**
 * A game fighting the melee on E-5 between the units `units` places, with
 * each player's commitment already made. `createGameStateResolvingMelee` does
 * the same on an empty board; this one keeps the units the case placed.
 *
 * @param units - The two fighters on E-5, and any friends beside them
 * @param commitments - Each player's card to the melee, the first player's first
 * @param initiative - The side holding the initiative, and so committing first
 * @returns The game, with both commitments made and the attack still to count
 */
function fightingOnE5(
  units: UnitPlacementSpec[],
  commitments: { first: Commitment; second: Commitment },
  initiative: PlayerSide,
): GameState {
  // The board, with the initiative where the case puts it.
  const board = createGameState(units, { currentInitiative: initiative });

  // The melee on E-5, both players having committed or declined (§7.2.2).
  const melee = createMeleeResolutionState(board, {
    firstPlayerCommitment: commitments.first,
    secondPlayerCommitment: commitments.second,
  });

  // Phase 4, fighting that melee.
  const fighting = updatePhaseState(
    board,
    createResolveMeleePhaseState(board, { currentMeleeResolutionState: melee }),
  );
  return fighting;
}

/** Neither player commits a card. */
const bothDecline = {
  first: { commitmentType: 'declined' },
  second: { commitmentType: 'declined' },
} as const;

/**
 * `resolveMelee` compares strike vs retreat at a shared cell and sets rout/retreat
 * booleans. Commitments must be resolved first; the board must hold both combatants
 * at the melee coordinate. The event carries only those results; where a
 * retreat may go is worked out when that retreat opens.
 */
// TODO(misleading): each attack value is compared against all three of the
// other unit's thresholds, Reverse included (§7.2.2 step 4), and support adds
// to it, not only "strike vs retreat". Settle by naming the three thresholds.
describe('generateResolveMeleeEvent function', () => {
  it("measures each unit's attack against the other unit's thresholds, both at once", () => {
    // White's cavalry (Attack 4; Retreat 3, Reverse 5, Rout 7) and Black's
    // spearmen (Attack 3; Retreat 6, Reverse 7, Rout 8) fight on E-5, alone.
    const state = fightingOnE5(
      [
        {
          attack: 4,
          coord: 'E-5',
          facing: 'north',
          player: 'white',
          retreat: 3,
          reverse: 5,
          rout: 7,
        },
        {
          attack: 3,
          coord: 'E-5',
          facing: 'south',
          player: 'black',
          retreat: 6,
          reverse: 7,
          rout: 8,
        },
      ],
      bothDecline,
      'white',
    );

    // White's 4 meets none of the spearmen's thresholds; Black's 3 meets the
    // cavalry's Retreat and no more. Each result is recorded by the colour of
    // the unit it struck.
    expect(generateResolveMeleeEvent(state)).toStrictEqual({
      attackResultOnBlackUnit: {
        unitRetreated: false,
        unitReversed: false,
        unitRouted: false,
      },
      attackResultOnWhiteUnit: {
        unitRetreated: true,
        unitReversed: false,
        unitRouted: false,
      },
      effectType: 'resolveMelee',
      eventType: 'gameEffect',
    });
  });

  it("reads each side's own card by who holds the initiative (§7.2.2)", () => {
    // Two cavalry units (Attack 4; Retreat 3, Reverse 5, Rout 7) on E-5.
    // White holds the initiative, so its card is the first committed: a
    // Defence card. Black's, the second, is an Attack card.
    const state = fightingOnE5(
      [
        {
          attack: 4,
          coord: 'E-5',
          facing: 'north',
          player: 'white',
          retreat: 3,
          reverse: 5,
          rout: 7,
        },
        {
          attack: 4,
          coord: 'E-5',
          facing: 'south',
          player: 'black',
          retreat: 3,
          reverse: 5,
          rout: 7,
        },
      ],
      {
        first: {
          card: createTestCard({ modifiers: ['defense'] }),
          commitmentType: 'completed',
        },
        second: {
          card: createTestCard({ modifiers: ['attack'] }),
          commitmentType: 'completed',
        },
      },
      'white',
    );

    const event = generateResolveMeleeEvent(state);

    // White's 4 meets Black's Retreat of 3 only: Black's Attack card adds to
    // Black's blow, not White's.
    expect(event.attackResultOnBlackUnit).toStrictEqual({
      unitRetreated: true,
      unitReversed: false,
      unitRouted: false,
    });
    // Black's 5 meets White's Retreat, raised to 4, but not its Reverse,
    // raised to 6 by White's own Defence card.
    expect(event.attackResultOnWhiteUnit).toStrictEqual({
      unitRetreated: true,
      unitReversed: false,
      unitRouted: false,
    });
  });

  describe('a Defence card committed to the melee (§8.5)', () => {
    /**
     * Two cavalry units engaged on E-5 (Attack 4; Retreat 3, Reverse 5,
     * Rout 7). Black, the first player, commits a card for +1 Attack, so its
     * attack value against white is 5. White commits a card naming `whiteCommits`.
     */
    function cavalryMelee(whiteCommits: ('attack' | 'defense')[]): GameState {
      const fighting = fightingOnE5(
        [
          {
            attack: 4,
            coord: 'E-5',
            facing: 'north',
            player: 'white',
            retreat: 3,
            reverse: 5,
            rout: 7,
          },
          {
            attack: 4,
            coord: 'E-5',
            facing: 'south',
            player: 'black',
            retreat: 3,
            reverse: 5,
            rout: 7,
          },
        ],
        {
          first: {
            card: createTestCard({ modifiers: ['attack'] }),
            commitmentType: 'completed',
          },
          second: {
            card: createTestCard({ modifiers: whiteCommits }),
            commitmentType: 'completed',
          },
        },
        'black',
      );
      return fighting;
    }

    it("without it, an attack that reaches the unit's Reverse turns it", () => {
      // Black's attack value of 5 meets white's Reverse of 5.
      const event = generateResolveMeleeEvent(cavalryMelee(['attack']));

      // It meets White's Retreat as well, and falls short of its Rout.
      expect(event.attackResultOnWhiteUnit).toStrictEqual({
        unitRetreated: true,
        unitReversed: true,
        unitRouted: false,
      });
    });

    it("with it, the unit's thresholds rise by 1 and the same attack does not turn it", () => {
      // White's Reverse is 6 for this fight, above black's attack value of 5. Its
      // Retreat of 4 is still reached.
      const event = generateResolveMeleeEvent(cavalryMelee(['defense']));

      // Retreat only.
      expect(event.attackResultOnWhiteUnit).toStrictEqual({
        unitRetreated: true,
        unitReversed: false,
        unitRouted: false,
      });
    });

    it("does nothing to the enemy's thresholds", () => {
      // White's card names Attack and Defence: its attack value against black is 5, and
      // black's Reverse stays 5, so black turns. Had the Defence reached
      // black, its Reverse would be 6 and the attack would fall short.
      const event = generateResolveMeleeEvent(
        cavalryMelee(['attack', 'defense']),
      );

      expect(event.attackResultOnBlackUnit.unitReversed).toBe(true);
      // The same card still raises white's own Reverse to 6, above black's 5.
      expect(event.attackResultOnWhiteUnit.unitReversed).toBe(false);
    });
  });

  describe('a friend beside the fighter (§7.3.1)', () => {
    /**
     * Two cavalry units engaged on E-5 (Attack 4; Retreat 3, Reverse 5,
     * Rout 7). Black, facing south, may have a cavalry friend on E-6, to its
     * east, facing west and so looking straight at it.
     */
    function cavalryMeleeWithFriend(friend: boolean): GameState {
      // The two fighters.
      const fighters: UnitPlacementSpec[] = [
        {
          attack: 4,
          coord: 'E-5',
          facing: 'north',
          player: 'white',
          retreat: 3,
          reverse: 5,
          rout: 7,
        },
        {
          attack: 4,
          coord: 'E-5',
          facing: 'south',
          player: 'black',
          retreat: 3,
          reverse: 5,
          rout: 7,
        },
      ];

      // Black's friend, another of the same cavalry, when the case asks.
      const blackFriend: UnitPlacementSpec = {
        attack: 4,
        coord: 'E-6',
        facing: 'west',
        player: 'black',
        retreat: 3,
        reverse: 5,
        rout: 7,
      };
      const units = friend ? [...fighters, blackFriend] : fighters;

      const fighting = fightingOnE5(units, bothDecline, 'black');
      return fighting;
    }

    it('without one, an attack value of 4 does not turn the enemy', () => {
      const event = generateResolveMeleeEvent(cavalryMeleeWithFriend(false));

      expect(event.attackResultOnWhiteUnit.unitReversed).toBe(false);
    });

    it('a friend looking straight at the fighter adds 2, so the same attack turns the enemy', () => {
      // 4 + 2 = 6 meets white's Reverse of 5.
      const event = generateResolveMeleeEvent(cavalryMeleeWithFriend(true));

      expect(event.attackResultOnWhiteUnit.unitReversed).toBe(true);
    });

    it("adds to its own side's attack only", () => {
      // The same two cavalry units, and a white friend on E-4, west of
      // White's fighter, facing east and so looking straight at it.
      const state = fightingOnE5(
        [
          {
            attack: 4,
            coord: 'E-5',
            facing: 'north',
            player: 'white',
            retreat: 3,
            reverse: 5,
            rout: 7,
          },
          {
            attack: 4,
            coord: 'E-5',
            facing: 'south',
            player: 'black',
            retreat: 3,
            reverse: 5,
            rout: 7,
          },
          {
            attack: 4,
            coord: 'E-4',
            facing: 'east',
            player: 'white',
            retreat: 3,
            reverse: 5,
            rout: 7,
          },
        ],
        bothDecline,
        'black',
      );

      const event = generateResolveMeleeEvent(state);

      // White's 4 + 2 = 6 meets Black's Retreat and Reverse.
      expect(event.attackResultOnBlackUnit).toStrictEqual({
        unitRetreated: true,
        unitReversed: true,
        unitRouted: false,
      });
      // Black's 4, with no friend of its own, meets White's Retreat only.
      expect(event.attackResultOnWhiteUnit).toStrictEqual({
        unitRetreated: true,
        unitReversed: false,
        unitRouted: false,
      });
    });
  });

  it('refuses to count the attack while the second player may still commit (§7.2.2)', () => {
    // Black, the first player, has declined; White has not answered yet.
    const state = fightingOnE5(
      [
        ['E-5', 'white', 'north'],
        ['E-5', 'black', 'south'],
      ],
      {
        first: { commitmentType: 'declined' },
        second: { commitmentType: 'pending' },
      },
      'black',
    );

    // Both players commit or decline before the attack values are counted.
    expect(() => generateResolveMeleeEvent(state)).toThrow(
      'Second player commitment is still pending',
    );
  });
});
