import type { AuthoritativeGameState } from '@game';
import { createCommitToMovementEvent, createMoveUnitEvent } from '@factories';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  readyToWriteMove,
  resolvingMoveOrder,
} from '@testing';
import { applyEvent } from '@transforms';

/**
 * Engaging a faster unit from the front (§6.3.1), played through the
 * engines: a defender faster than its attacker may fall back instead of
 * standing to fight — but only where it has somewhere to fall back to
 * (§9.1.5). With nowhere to go there is nothing to offer, and the two units
 * stand engaged.
 *
 * White on A-9 faces south, its back to the board's edge. Black, slower,
 * marches north from C-9 into white's front. Each side keeps a second unit
 * far from the fight, so neither army is down to its last unit (§11.4).
 */
function slowerAttackerEngagesFromC9(): AuthoritativeGameState {
  const game = createPlayableGame(
    [
      { coord: 'C-9', facing: 'north', player: 'black', speed: 2 },
      { coord: 'A-9', facing: 'south', player: 'white', speed: 3 },
      { coord: 'I-1', facing: 'north', instanceNumber: 2, player: 'black' },
      { coord: 'E-1', facing: 'south', instanceNumber: 2, player: 'white' },
    ],
    { initiative: 'black' },
  );
  const attacker = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'C-9',
  );
  const resolving = resolvingMoveOrder(game, [attacker.unit]);

  // Black names its attacker, declines to commit, and marches two spaces
  // north into white's front.
  const ready = readyToWriteMove(resolving, attacker, null);
  const moved = applyEvent(
    createMoveUnitEvent({
      moveCommander: false,
      path: ['step', 'step'],
      player: 'black',
    }),
    ready,
  );
  return moved;
}

describe('a front engagement on a faster defender', () => {
  it('offers no retreat to a defender with its back to the board edge', () => {
    const { state: engaging, next: commitment } = applyEffectsUntilChoice(
      slowerAttackerEngagesFromC9(),
    );
    if (commitment === 'gameOver') {
      throw new Error('The game should not have ended');
    }

    // White may first commit a card for Speed; it declines, and is the
    // faster unit without one.
    const declined = applyEvent(
      createCommitToMovementEvent({
        committedCard: null,
        player: 'white',
      }),
      engaging,
    );
    const { state, next } = applyEffectsUntilChoice(declined);

    // White's unit is the faster, but every space behind it is off the
    // board, so it has no retreat to choose and is not asked.
    expect(next).not.toMatchObject({ choiceType: 'chooseWhetherToRetreat' });
    // The two units stand engaged on A-9, to be fought out in melee.
    expect(state.boardState.board['A-9']?.unitPresence.presenceType).toBe(
      'engaged',
    );
  });
});
