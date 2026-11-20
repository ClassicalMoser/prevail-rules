import { createEmptyStandardBoard } from '@factories';
import { getDiagonalCornerSpaces } from './getDiagonalCornerSpaces';

/**
 * The two spaces a diagonal step cuts between: the orthogonal neighbours the
 * two ends share. Both diagonal rules (§2.4.4, §5.4.5) ask about these.
 */
describe('getDiagonalCornerSpaces function', () => {
  // An empty standard board; only where spaces sit matters here.
  const board = createEmptyStandardBoard();

  it('gives the two shared neighbours of a step south-east', () => {
    // From E-5 to F-6 the step cuts between E-6 and F-5.
    expect(getDiagonalCornerSpaces(board, 'E-5', 'F-6')).toStrictEqual([
      'E-6',
      'F-5',
    ]);
  });

  it('gives the same two spaces whichever way the diagonal is walked', () => {
    // From F-6 back to E-5 cuts between the same two spaces.
    expect(
      [...getDiagonalCornerSpaces(board, 'F-6', 'E-5')].toSorted(),
    ).toStrictEqual(['E-6', 'F-5']);
  });

  it('gives the corners of a step at the board edge', () => {
    // From A-1 to B-2, from the north-west corner: A-2 and B-1.
    expect(getDiagonalCornerSpaces(board, 'A-1', 'B-2')).toStrictEqual([
      'A-2',
      'B-1',
    ]);
  });

  it('refuses a target that is an orthogonal neighbour', () => {
    // E-6 is beside E-5, not diagonal to it: there are no corners.
    expect(() => getDiagonalCornerSpaces(board, 'E-5', 'E-6')).toThrow(
      'Target space E-6 is not diagonally adjacent to E-5',
    );
  });

  it('refuses a target that is not adjacent at all', () => {
    // G-7 is two steps from E-5 along the diagonal.
    expect(() => getDiagonalCornerSpaces(board, 'E-5', 'G-7')).toThrow(
      'Target space G-7 is not diagonally adjacent to E-5',
    );
  });
});
