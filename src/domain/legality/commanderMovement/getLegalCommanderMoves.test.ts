import { createEmptyGameState } from '@factories';
import { deployCommander } from '@transforms';

import { getLegalCommanderMoves } from './getLegalCommanderMoves';

/**
 * GetLegalCommanderMoves: legal commander destination coordinates within the move square.
 *
 * Where a side's commander may go in Phase 2, asked from the space it stands
 * on. The walk itself is `exploreCommanderMoves`'s; this sets its distance and
 * insists the commander is where the caller says.
 */
describe('getLegalCommanderMoves function', () => {
  it('lets a commander go up to four spaces', () => {
    // White's commander stands alone at E-5, well clear of every edge.
    const gameState = deployCommander(
      createEmptyGameState('standard'),
      'white',
      'E-5',
    );

    const legalMoves = getLegalCommanderMoves('white', gameState, 'E-5');

    // Four steps, diagonals counting as one (§4.2.2), reach a square nine
    // spaces on a side: 81, its own space among them.
    expect(legalMoves.size).toBe(81);
  });

  it('throws when no commander stands where the move is asked from', () => {
    // Nobody has placed a commander yet.
    const gameState = createEmptyGameState('standard');

    expect(() => getLegalCommanderMoves('white', gameState, 'E-5')).toThrow(
      'Starting position does not contain specified commander',
    );
  });

  it("throws when only the other side's commander stands there", () => {
    // Black's commander is at E-5; White's move is asked from there.
    const gameState = deployCommander(
      createEmptyGameState('standard'),
      'black',
      'E-5',
    );

    expect(() => getLegalCommanderMoves('white', gameState, 'E-5')).toThrow(
      'Starting position does not contain specified commander',
    );
  });
});
