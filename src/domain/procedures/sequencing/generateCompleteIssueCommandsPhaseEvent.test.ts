import { createEmptyGameState } from '@factories';
import {
  createBoardWithEngagedUnits,
  createGameStateWithEngagedUnits,
  createIssueCommandsPhaseState,
  createTestUnit,
  placed,
  replaceBoard,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateCompleteIssueCommandsPhaseEvent } from './generateCompleteIssueCommandsPhaseEvent';

/**
 * Issue-commands phase is done: emit `completeIssueCommandsPhase` with `remainingEngagements`
 * — a set of board coordinates that still hold engaged units (from live board scan).
 */
describe('generateCompleteIssueCommandsPhaseEvent function', () => {
  it('records an engaged space as a fight Phase 4 owes', () => {
    // A black unit and a white unit stand engaged on E-5, and both players'
    // orders are carried out.
    const engaged = createGameStateWithEngagedUnits(
      createTestUnit('black'),
      createTestUnit('white'),
      'E-5',
    );
    const state = updatePhaseState(
      engaged,
      createIssueCommandsPhaseState({ step: 'complete' }),
    );

    // E-5 is the one fight still to come (§4.4.1).
    expect(generateCompleteIssueCommandsPhaseEvent(state)).toStrictEqual({
      effectType: 'completeIssueCommandsPhase',
      eventType: 'gameEffect',
      remainingEngagements: ['E-5'],
    });
  });

  it('records no fight when no space is engaged, so Phase 4 ends at once', () => {
    // An empty board, and both players' orders carried out.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState({ step: 'complete' }),
    );

    // Nothing to fight (§4.4.4).
    expect(
      generateCompleteIssueCommandsPhaseEvent(state).remainingEngagements,
    ).toStrictEqual([]);
  });

  it('records every engaged space in board order, and no unit standing alone', () => {
    // Two engagements, on E-5 and C-3, and a lone white unit on G-7 that
    // fights no one. Each side's second unit is its instance 2.
    const firstFight = createBoardWithEngagedUnits(
      createTestUnit('black'),
      createTestUnit('white'),
      'E-5',
    );
    const secondFight = addUnitToBoard(
      addUnitToBoard(
        firstFight,
        placed(createTestUnit('black', { instanceNumber: 2 }), 'C-3', 'north'),
      ),
      placed(createTestUnit('white', { instanceNumber: 2 }), 'C-3', 'south'),
    );
    const withLoneUnit = addUnitToBoard(
      secondFight,
      placed(createTestUnit('white', { instanceNumber: 3 }), 'G-7', 'south'),
    );
    const board = replaceBoard(createEmptyGameState('standard'), withLoneUnit);
    const state = updatePhaseState(
      board,
      createIssueCommandsPhaseState({ step: 'complete' }),
    );

    // Both fights are owed; the lone unit is not one. The northern row comes
    // first in board order, though the order means nothing.
    expect(
      generateCompleteIssueCommandsPhaseEvent(state).remainingEngagements,
    ).toStrictEqual(['C-3', 'E-5']);
  });
});
