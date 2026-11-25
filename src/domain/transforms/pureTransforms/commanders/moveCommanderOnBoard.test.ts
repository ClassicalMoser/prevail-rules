import { createEmptyGameState } from '@factories';

import { deployCommander } from './deployCommander';
import { moveCommanderOnBoard } from './moveCommanderOnBoard';

/**
 * A commander changes spaces: black's stands on E-5 and moves to C-5, its
 * space and its entry in the index changing in one write.
 */
describe('moveCommanderOnBoard function', () => {
  // Black's commander stands on E-5; white's is not yet placed.
  const state = deployCommander(
    createEmptyGameState('standard'),
    'black',
    'E-5',
  );

  it('the commander leaves its space and stands on the new one', () => {
    // Black's commander goes from E-5 to C-5.
    const moved = moveCommanderOnBoard(state, 'black', 'C-5');

    // Off E-5, onto C-5, and filed at C-5.
    expect(moved.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(moved.boardState.board['C-5']?.commanders).toStrictEqual(['black']);
    expect(moved.index.commanders.black).toBe('C-5');
  });

  it('the other side’s commander in the same space stays put', () => {
    // Both commanders may share a space (§2.2.3); only black's is moved.
    // TODO(misleading): §2.2.3 is the rule that nothing enters an engaged
    // space; commanders sharing a space is §2.2.2. Settle by citing §2.2.2.
    const shared = deployCommander(state, 'white', 'E-5');

    const moved = moveCommanderOnBoard(shared, 'black', 'C-5');

    // White's stays on E-5, and its entry with it.
    expect(moved.boardState.board['E-5']?.commanders).toStrictEqual(['white']);
    expect(moved.index.commanders.white).toBe('E-5');
  });

  it('throws when the commander is not on the board', () => {
    // White's commander has not been placed.
    expect(() => moveCommanderOnBoard(state, 'white', 'C-5')).toThrow(
      'The white commander is not on the board',
    );
  });
});
