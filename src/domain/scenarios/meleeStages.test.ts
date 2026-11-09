import type { GameStateForVisibility } from '@game';
import { getPlayerUnitWithPosition } from '@queries';
import {
  applyEffectsUntilChoice,
  createMeleeResolutionState,
  createPlayableGame,
  createResolveMeleePhaseState,
  createTestCard,
} from '@testing';
import {
  applyEvent,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

/**
 * A melee carries its results out a stage at a time (§7.5.6), played through
 * the engines: every retreat, then every reverse, then every rout. What the
 * order changes is whether a unit that is only hit to reverse is still engaged
 * when its turn comes (§7.5.5).
 *
 * Black, the first player, stands on E-5 facing north, engaged with white
 * facing south on the same space. Both have committed their cards.
 */
function meleeResolvedWith(results: {
  blackRetreated: boolean;
  blackReversed: boolean;
  whiteReversed: boolean;
}): GameStateForVisibility<'authoritative'> {
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black' },
      { coord: 'E-5', facing: 'south', player: 'white' },
    ],
    { initiative: 'black' },
  );
  // Both sides have a card in play, the commitments the melee opens on.
  const blackPlayed = updatePlayerCardState(game, 'black', {
    ...game.cardState.black,
    inPlay: createTestCard(),
  });
  const bothPlayed = updatePlayerCardState(blackPlayed, 'white', {
    ...blackPlayed.cardState.white,
    inPlay: createTestCard(),
  });
  const melee = updatePhaseState(
    bothPlayed,
    createResolveMeleePhaseState(bothPlayed, {
      currentMeleeResolutionState: createMeleeResolutionState(bothPlayed),
      remainingEngagements: [],
    }),
  );

  const black = getPlayerUnitWithPosition(melee.boardState, 'E-5', 'black');
  const white = getPlayerUnitWithPosition(melee.boardState, 'E-5', 'white');
  if (black === undefined || white === undefined) {
    throw new Error('Both units should stand on E-5');
  }
  // The stand-in units cannot be hit to reverse alone (no unit has a Reverse
  // threshold under its Retreat threshold, with an attack to reach it), so the
  // measured results are written as the melee's own effect would, and the
  // engines play everything that follows.
  const resolved = applyEvent(
    {
      blackUnitRetreated: results.blackRetreated,
      blackUnitReversed: results.blackReversed,
      blackUnitRouted: false,
      blackUnitWithPlacement: black,
      effectType: 'resolveMelee',
      eventNumber: 0,
      eventType: 'gameEffect',
      location: 'E-5',
      whiteUnitRetreated: false,
      whiteUnitReversed: results.whiteReversed,
      whiteUnitRouted: false,
      whiteUnitWithPlacement: white,
    },
    melee,
  );
  const { state } = applyEffectsUntilChoice(resolved);
  return state;
}

describe('a melee carried out a stage at a time', () => {
  it('turns a unit that is only hit to reverse once its enemy has fallen back', () => {
    // Black's unit is hit to retreat; white's only to reverse. The retreats
    // come first, so black has left E-5 by the time white's reverse is due.
    const state = meleeResolvedWith({
      blackReversed: false,
      blackRetreated: true,
      whiteReversed: true,
    });

    // Black fell back one space, still facing the way it did.
    const black = getPlayerUnitWithPosition(state.boardState, 'F-5', 'black');
    expect(black?.placement.facing).toBe('north');
    // White is no longer engaged, so it turns about where it stood (§7.5.5).
    const white = getPlayerUnitWithPosition(state.boardState, 'E-5', 'white');
    expect(white?.placement.facing).toBe('north');
  });

  it('leaves two engaged units as they are when both are only hit to reverse', () => {
    // Neither unit has fallen back, so each is still engaged when its reverse
    // is due, and each stays as it is (§7.5.5).
    const state = meleeResolvedWith({
      blackReversed: true,
      blackRetreated: false,
      whiteReversed: true,
    });

    const black = getPlayerUnitWithPosition(state.boardState, 'E-5', 'black');
    const white = getPlayerUnitWithPosition(state.boardState, 'E-5', 'white');
    expect(black?.placement.facing).toBe('north');
    expect(white?.placement.facing).toBe('south');
  });
});
