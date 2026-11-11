import type { AuthoritativeGameState } from '@game';
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
 * the engines: every retreat, then every reverse, then every rout. In each
 * stage the first player's blow lands first, so the second player's unit
 * suffers first. What the order changes is whether a unit that is only hit
 * to reverse is still engaged when its turn comes (§7.5.5), and whose Morale
 * is paid first when both rout (§9.3.3).
 *
 * Black, the first player, stands on E-5 facing north, engaged with white
 * facing south on the same space. Both units have Morale 2. Each side has a
 * second unit far from the fight, so losing this one does not leave it with
 * no units (§11.4). Both have committed their cards; each holds three more
 * unless a case says otherwise. A case may stand further units on the board,
 * for instance to cut a unit's line of withdrawal.
 */
function meleeResolvedWith(
  results: {
    blackRetreated?: boolean;
    blackReversed?: boolean;
    blackRouted?: boolean;
    whiteRetreated?: boolean;
    whiteReversed?: boolean;
    whiteRouted?: boolean;
  },
  whiteHand = 3,
  extraUnits: Parameters<typeof createPlayableGame>[0] = [],
): {
  state: AuthoritativeGameState;
  next: ReturnType<typeof applyEffectsUntilChoice>['next'];
} {
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', morale: 2, player: 'black' },
      { coord: 'E-5', facing: 'south', morale: 2, player: 'white' },
      { coord: 'I-1', facing: 'north', instanceNumber: 2, player: 'black' },
      { coord: 'A-9', facing: 'south', instanceNumber: 2, player: 'white' },
      ...extraUnits,
    ],
    { hands: { white: whiteHand }, initiative: 'black' },
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
      blackUnitRetreated: results.blackRetreated ?? false,
      blackUnitReversed: results.blackReversed ?? false,
      blackUnitRouted: results.blackRouted ?? false,
      blackUnitWithPlacement: black,
      effectType: 'resolveMelee',
      eventType: 'gameEffect',
      location: 'E-5',
      whiteUnitRetreated: results.whiteRetreated ?? false,
      whiteUnitReversed: results.whiteReversed ?? false,
      whiteUnitRouted: results.whiteRouted ?? false,
      whiteUnitWithPlacement: white,
    },
    melee,
  );
  const played = applyEffectsUntilChoice(resolved);
  return played;
}

describe('a melee carried out a stage at a time', () => {
  it('turns a unit that is only hit to reverse once its enemy has fallen back', () => {
    // Black's unit is hit to retreat; white's only to reverse. The retreats
    // come first, so black has left E-5 by the time white's reverse is due.
    const { state } = meleeResolvedWith({
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
    const { state } = meleeResolvedWith({
      blackReversed: true,
      blackRetreated: false,
      whiteReversed: true,
    });

    const black = getPlayerUnitWithPosition(state.boardState, 'E-5', 'black');
    const white = getPlayerUnitWithPosition(state.boardState, 'E-5', 'white');
    expect(black?.placement.facing).toBe('north');
    expect(white?.placement.facing).toBe('south');
  });

  it('when both units rout, the second player pays its Morale first', () => {
    // Each blow reached the other's Rout. Black's blow lands first, so white's
    // unit routs first, and white is the first asked to discard (§9.3.3).
    const { next } = meleeResolvedWith({
      blackRouted: true,
      whiteRouted: true,
    });

    expect(next).toMatchObject({
      choiceType: 'chooseRoutDiscard',
      playerSource: 'white',
    });
  });

  it('when both units rout and the second player cannot pay, the game ends before the first player’s rout', () => {
    // White holds two cards against a Morale debt of 2: paying with its last
    // card is already a loss (§11.2).
    const { state, next } = meleeResolvedWith(
      { blackRouted: true, whiteRouted: true },
      2,
    );

    // White's rout came first, and white loses on it.
    expect(next).toBe('gameOver');
    expect(state.winner).toBe('black');
    // Black's unit was never routed: its turn never came.
    const black = getPlayerUnitWithPosition(state.boardState, 'E-5', 'black');
    expect(black?.unit.playerSide).toBe('black');
  });

  it('a second-player unit that cannot fall back routs in the retreat stage, before the first player’s unit falls back', () => {
    // Both blows reach the other's Retreat. A third black unit stands on D-5,
    // behind white's unit and facing it, so white's line of withdrawal is cut
    // (§9.1.5); black's own unit has open ground behind it on F-5.
    const { state, next } = meleeResolvedWith(
      { blackRetreated: true, whiteRetreated: true },
      3,
      [{ coord: 'D-5', facing: 'south', instanceNumber: 3, player: 'black' }],
    );

    // White's unit suffers first in the retreat stage, and a retreat it
    // cannot make becomes a rout in its place (§7.5.6), so white is the one
    // asked for Morale.
    expect(next).toMatchObject({
      choiceType: 'chooseRoutDiscard',
      playerSource: 'white',
    });
    // Black's unit has not fallen back yet: its retreat comes after white's.
    const black = getPlayerUnitWithPosition(state.boardState, 'E-5', 'black');
    expect(black?.unit.playerSide).toBe('black');
  });

  it('a first-player unit that cannot fall back routs after the second player’s unit has fallen back', () => {
    // Both blows reach the other's Retreat. A third white unit stands on F-5,
    // behind black's unit and facing it, so black's line of withdrawal is cut
    // (§9.1.5); white's own unit has open ground behind it on D-5.
    const { state, next } = meleeResolvedWith(
      { blackRetreated: true, whiteRetreated: true },
      3,
      [{ coord: 'F-5', facing: 'north', instanceNumber: 3, player: 'white' }],
    );

    // White's unit falls back first, out of E-5.
    const white = getPlayerUnitWithPosition(state.boardState, 'E-5', 'white');
    expect(white).toBeUndefined();
    // Black's retreat comes second, and it cannot make it, so black's unit
    // routs in its place and black is the one asked for Morale (§7.5.6) —
    // not white, whose retreat was already done.
    expect(next).toMatchObject({
      choiceType: 'chooseRoutDiscard',
      playerSource: 'black',
    });
  });
});
