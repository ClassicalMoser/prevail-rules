import type { Command } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import { createEmptyGameState, createIssueCommandsEvent } from '@factories';
import { PLAY_CARDS_PHASE } from '@game';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createGameState,
  createIssueCommandsPhaseState,
  createTestCard,
  createTestCommand,
  replaceBoard,
} from '@testing';
import {
  addCommanderToBoard,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { isValidIssueCommandsEvent } from './isValidIssueCommandsEvent';

// Where each unit stands, as createGameState takes them. The @testing barrel
// does not export `UnitPlacementSpec` itself.
type UnitPlacementSpec = Parameters<typeof createGameState>[0][number];

/**
 * Black, holding the initiative, on its own issuing step in Phase 3: its
 * card in play gives `command`, its units stand as `units` says, and its
 * commander stands on `commanderAt`.
 *
 * TODO(composition): getLegalIssueCommands.test.ts builds the same game
 * (`inIssueCommands`); a shared `@testing` fixture for a player on their
 * issuing step would serve both.
 */
function blackIssuing(
  units: UnitPlacementSpec[],
  command: Command,
  commanderAt: Coordinate,
): GameState {
  // Black's units on the board, Black holding the initiative, so Black is
  // the first player and issues first (§4.1.5).
  const placed = createGameState(units, { currentInitiative: 'black' });

  // Black's commander, from which inspiration range is measured (§4.3.4).
  const withCommander = replaceBoard(
    placed,
    addCommanderToBoard(placed.boardState, 'black', commanderAt),
  );

  // Black's revealed card lies in play, giving the command under test.
  const withCard = updatePlayerCardState(withCommander, 'black', {
    ...withCommander.cardState.black,
    inPlay: { ...createTestCard(), command },
  });

  // Phase 3, on Black's issuing step.
  const issuing = updatePhaseState(
    withCard,
    createIssueCommandsPhaseState({
      step: 'firstPlayerIssueCommands',
    }),
  );
  return issuing;
}

/**
 * An allocation of the card in play's command, checked a unit or a line at a
 * time against what the rules offer (§4.3.1–4.3.6).
 */
describe('isValidIssueCommandsEvent function', () => {
  describe('a units order', () => {
    /** A units order of up to `number` units, reaching any distance. */
    const unitsOrder = (number: number): Command =>
      createTestCommand({ number, size: 'units' });

    // Black's units on E-5 and E-6, with the commander on E-5.
    const twoUnits: UnitPlacementSpec[] = [
      ['E-5', 'black', 'north'],
      ['E-6', 'black', 'north'],
    ];

    /** Black's unit standing on a space of `state`. */
    const unitOn = (state: GameState, coordinate: Coordinate) =>
      getSingleUnitWithPlacementAtCoordinate(state.boardState, coordinate).unit;

    it('accepts the printed number of eligible units', () => {
      const state = blackIssuing(twoUnits, unitsOrder(2), 'E-5');
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'units',
          units: [unitOn(state, 'E-5'), unitOn(state, 'E-6')],
        },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
        result: true,
      });
    });

    it('accepts fewer units than the printed number', () => {
      const state = blackIssuing(twoUnits, unitsOrder(2), 'E-5');
      const event = createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [unitOn(state, 'E-5')] },
        player: 'black',
      });

      // The number is a ceiling, not a quota (§4.3.2).
      expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
        result: true,
      });
    });

    it('accepts ordering no unit at all, which declines the order', () => {
      const state = blackIssuing(twoUnits, unitsOrder(2), 'E-5');
      const event = createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [] },
        player: 'black',
      });

      // A player may decline to order at all (§4.3.2).
      expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
        result: true,
      });
    });

    it('refuses more units than the printed number', () => {
      const state = blackIssuing(twoUnits, unitsOrder(1), 'E-5');
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'units',
          units: [unitOn(state, 'E-5'), unitOn(state, 'E-6')],
        },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
        errorReason: 'Expected at most 1 units, got 2',
        result: false,
      });
    });

    it('refuses one unit named twice', () => {
      const state = blackIssuing(twoUnits, unitsOrder(2), 'E-5');
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'units',
          units: [unitOn(state, 'E-5'), unitOn(state, 'E-5')],
        },
        player: 'black',
      });

      // A unit is ordered once a round (§4.3.6).
      expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
        errorReason: 'Duplicate units in issue command selection',
        result: false,
      });
    });

    it('refuses a unit outside inspiration range', () => {
      // The order reaches only the commander's own space; the commander
      // stands on E-5, so the unit on E-6 is out of reach (§4.3.4).
      const inCommandersSpace = createTestCommand({
        number: 1,
        restrictions: {
          inspirationRangeRestriction: 0,
          restrictionType: 'none',
        },
        size: 'units',
      });
      const state = blackIssuing(twoUnits, inCommandersSpace, 'E-5');
      const event = createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [unitOn(state, 'E-6')] },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
        errorReason:
          'Unit is not eligible for this command under its restrictions',
        result: false,
      });
    });
  });

  describe('a lines order', () => {
    // Black's rank of eight, E-1 to E-8, facing north.
    const rank: Coordinate[] = [
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
    ];
    const rankOfEight: UnitPlacementSpec[] = rank.map((coordinate) => [
      coordinate,
      'black',
      'north',
    ]);

    // One line, reaching no further than the commander's own space. The
    // commander stands with the fourth unit, on E-4, so that unit alone is
    // within range.
    const oneLineInCommandersSpace = createTestCommand({
      number: 1,
      restrictions: { inspirationRangeRestriction: 0, restrictionType: 'none' },
      size: 'lines',
    });
    const oneLine = blackIssuing(rankOfEight, oneLineInCommandersSpace, 'E-4');

    // Two lines, reaching any distance, so any stretch of the rank is a line.
    const twoLinesAnywhere = createTestCommand({ number: 2, size: 'lines' });
    const twoLines = blackIssuing(rankOfEight, twoLinesAnywhere, 'E-4');

    /** The units standing on the given spaces, in that order. */
    const unitsAt = (spaces: Coordinate[]) =>
      spaces.map(
        (space) =>
          getSingleUnitWithPlacementAtCoordinate(oneLine.boardState, space)
            .unit,
      );

    it('accepts a line whose only unit within inspiration range stands in its middle', () => {
      // Black orders the whole rank, listing every unit in rank order. Range
      // is traced from any unit in the line, not only from an end (§4.3.5).
      const event = createIssueCommandsEvent({
        allocation: { allocationType: 'lines', lines: [unitsAt(rank)] },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        result: true,
      });
    });

    it('accepts a line listed from either end', () => {
      // Black lists the stretch E-4 to E-2 from its far end; a line is the
      // same line read either way (§4.3.5).
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'lines',
          lines: [unitsAt(['E-4', 'E-3', 'E-2'])],
        },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        result: true,
      });
    });

    it('refuses a line that leaves out a unit between its ends', () => {
      // Black names E-2 and E-4 as the line but leaves out E-3, between them.
      // Every unit of the line is ordered, so the list must hold them all.
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'lines',
          lines: [unitsAt(['E-2', 'E-4'])],
        },
        player: 'black',
      });

      // The ends name a legal line, but the list is not that line's units.
      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        errorReason:
          'The units listed are not every unit of the line between its ends, in rank order',
        result: false,
      });
    });

    it('refuses a list that runs on past a line with a unit not in it', () => {
      // E-4 and E-5 are a line; Black lists them and then E-7, skipping E-6.
      // The list starts as that line but is longer than it.
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'lines',
          lines: [unitsAt(['E-4', 'E-5', 'E-7'])],
        },
        player: 'black',
      });

      // Its ends, E-4 and E-7, name a legal line whose units it does not
      // list.
      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        errorReason:
          'The units listed are not every unit of the line between its ends, in rank order',
        result: false,
      });
    });

    it('refuses a line that lists no units', () => {
      // A line holds one to eight units (§4.3.5); an empty list is no line.
      const event = createIssueCommandsEvent({
        allocation: { allocationType: 'lines', lines: [[]] },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        errorReason: 'A line lists at least one unit',
        result: false,
      });
    });

    it('accepts ordering no line at all, forfeiting the order', () => {
      // Black gives none of its lines; the rest is forfeited (§4.3.3).
      const event = createIssueCommandsEvent({
        allocation: { allocationType: 'lines', lines: [] },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        result: true,
      });
    });

    it('refuses more lines than the card allows', () => {
      // The card allows one line; Black names two.
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'lines',
          lines: [unitsAt(['E-4']), unitsAt(['E-5'])],
        },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        errorReason: 'Expected at most 1 lines, got 2',
        result: false,
      });
    });

    it('accepts two lines that share no unit', () => {
      // Black splits its rank in two: E-1 to E-3, and E-5 to E-8 listed from
      // its far end. E-4 is left out of both.
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'lines',
          lines: [
            unitsAt(['E-1', 'E-2', 'E-3']),
            unitsAt(['E-8', 'E-7', 'E-6', 'E-5']),
          ],
        },
        player: 'black',
      });

      // Each line was offered given the one before it (§4.3.3, §4.3.6).
      expect(isValidIssueCommandsEvent(event, twoLines)).toStrictEqual({
        result: true,
      });
    });

    it('refuses a second line that takes in a unit the first already orders', () => {
      // Black orders E-2 to E-4, then E-4 to E-6: E-4 would be ordered twice
      // (§4.3.6).
      const event = createIssueCommandsEvent({
        allocation: {
          allocationType: 'lines',
          lines: [
            unitsAt(['E-2', 'E-3', 'E-4']),
            unitsAt(['E-4', 'E-5', 'E-6']),
          ],
        },
        player: 'black',
      });

      expect(isValidIssueCommandsEvent(event, twoLines)).toStrictEqual({
        errorReason: 'A line takes in a unit already ordered by another line',
        result: false,
      });
    });

    it('refuses an allocation of the wrong kind for the card’s command', () => {
      // The card gives a lines command; Black names units instead.
      const event = createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: unitsAt(['E-4']) },
        player: 'black',
      });

      // A lines command is spent on lines (§4.3.1).
      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        errorReason: 'The card in play gives a lines command, not units',
        result: false,
      });
    });

    it('refuses orders from the player who is not issuing', () => {
      // Black is issuing, so White has no orders to give yet.
      const event = createIssueCommandsEvent({
        allocation: { allocationType: 'lines', lines: [] },
        player: 'white',
      });

      // The refusal names who is issuing.
      expect(isValidIssueCommandsEvent(event, oneLine)).toStrictEqual({
        errorReason: 'Expected issue commands from black, got white',
        result: false,
      });
    });
  });

  it('throws, naming the phase, when asked outside the issue commands phase', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createIssueCommandsEvent({
      allocation: { allocationType: 'units', units: [] },
      player: 'black',
    });

    // An order given while the cards are being chosen is refused by the
    // expected check before membership is asked; reaching here is a fault.
    expect(() => isValidIssueCommandsEvent(event, state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });
});
