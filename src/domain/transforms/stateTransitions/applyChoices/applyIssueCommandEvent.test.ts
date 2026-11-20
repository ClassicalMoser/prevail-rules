import { tempCommandCards } from '@sampleValues';
import type { IssueCommandEvent } from '@events';
import type { GameState } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

import { getIssueCommandsPhaseState, isSameUnitInstance } from '@queries';
import {
  createBoardWithFacingRow,
  createTestCommand,
  createTestUnit,
  replaceBoard,
  updateCardState,
} from '@testing';

import {
  addUnitsToCommandedUnits,
  updatePhaseState,
} from '@transforms/pureTransforms';
import { throwIfNone } from '@utils';

import { applyIssueCommandEvent } from './applyIssueCommandEvent';

import { createEmptyGameState, createIssueCommandEvent } from '@factories';
import { updateCurrentInitiative } from '@transforms/pureTransforms/state/updateCurrentInitiative';
/**
 * Issue-commands: spending a command type removes it from the side’s remaining set and adds
 * the chosen unit instances to the round’s `commandedUnits` (for later resolution ordering).
 */
describe('applyIssueCommandEvent function', () => {
  /** FirstPlayerIssueCommands with one command left per side from two inPlay cards. */
  function createGameStateWithCommands(
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      currentInitiative,
    );
    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: tempCommandCards[0],
      },
      white: {
        ...state.cardState.white,
        inPlay: tempCommandCards[1],
      },
    });

    const blackCommand = tempCommandCards[0].command;
    const whiteCommand = tempCommandCards[1].command;

    const stateWithPhase = updatePhaseState(stateWithCards, {
      currentCommandResolutionState: 'pending',
      phase: ISSUE_COMMANDS_PHASE,
      remainingCommandsFirstPlayer: [blackCommand],
      remainingCommandsSecondPlayer: [whiteCommand],
      remainingUnitsFirstPlayer: [],
      remainingUnitsSecondPlayer: [],
      step: 'firstPlayerIssueCommands',
    });

    return stateWithPhase;
  }

  describe('command spend and commandedUnits', () => {
    it('given black issues their remaining command with one unit, command drops from first-player set and unit commanded', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      const { command } = tempCommandCards[0];

      const event: IssueCommandEvent = {
        choiceType: 'issueCommand',
        eventType: 'playerChoice',
        player: 'black',
        order: {
          command,
          selection: { selectionType: 'units', units: [unit] },
        },
      };

      const newState = applyIssueCommandEvent(event, state);

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingCommandsFirstPlayer).not.toContain(command);
      // Check unit presence using value equality, not reference equality
      const unitInCommandedUnits = [
        ...newState.currentRoundState.commandedUnits,
      ].some((u) => isSameUnitInstance(u, unit));
      expect(unitInCommandedUnits).toBe(true);
    });

    it("issuing the first player's last order leaves the step for issuing to be completed next", () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      const { command } = tempCommandCards[0];

      const newState = applyIssueCommandEvent(
        {
          choiceType: 'issueCommand',
          eventType: 'playerChoice',
          player: 'black',
          order: {
            command,
            selection: { selectionType: 'units', units: [unit] },
          },
        },
        state,
      );
      const phaseState = getIssueCommandsPhaseState(newState);

      // The order is spent and the unit ordered. Moving on to carrying the
      // orders out is completeIssuingCommands', which the expected engine
      // asks for once no order is left.
      expect(phaseState).toMatchObject({
        remainingCommandsFirstPlayer: [],
        step: 'firstPlayerIssueCommands',
      });
      expect(newState.currentRoundState.commandedUnits).toStrictEqual([unit]);
    });

    it("issuing the second player's last order leaves the step for issuing to be completed next", () => {
      const base = createGameStateWithCommands();
      const state = updatePhaseState(base, {
        ...getIssueCommandsPhaseState(base),
        remainingCommandsFirstPlayer: [],
        step: 'secondPlayerIssueCommands',
      });
      const unit = createTestUnit('white', { attack: 3 });
      const { command } = tempCommandCards[1];

      const newState = applyIssueCommandEvent(
        {
          choiceType: 'issueCommand',
          eventType: 'playerChoice',
          player: 'white',
          order: {
            command,
            selection: { selectionType: 'units', units: [unit] },
          },
        },
        state,
      );
      const phaseState = getIssueCommandsPhaseState(newState);

      // The order is spent and the unit ordered; issuing is completed next.
      expect(phaseState).toMatchObject({
        remainingCommandsSecondPlayer: [],
        step: 'secondPlayerIssueCommands',
      });
      expect(newState.currentRoundState.commandedUnits).toStrictEqual([unit]);
    });

    it('keeps firstPlayerIssueCommands when more commands remain', () => {
      const base = createGameStateWithCommands();
      const first = tempCommandCards[0].command;
      const second = { ...first, number: 2 };
      const state = updatePhaseState(base, {
        ...getIssueCommandsPhaseState(base),
        remainingCommandsFirstPlayer: [first, second],
      });
      const unit = createTestUnit('black', { attack: 3 });

      const newState = applyIssueCommandEvent(
        {
          choiceType: 'issueCommand',
          eventType: 'playerChoice',
          player: 'black',
          order: {
            command: first,
            selection: { selectionType: 'units', units: [unit] },
          },
        },
        state,
      );
      const phaseState = getIssueCommandsPhaseState(newState);

      expect(phaseState).toMatchObject({
        remainingCommandsFirstPlayer: [second],
        remainingUnitsFirstPlayer: [],
        step: 'firstPlayerIssueCommands',
      });
    });

    it('given white issues second-player command, remainingCommandsSecondPlayer loses that command', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('white', { attack: 3 });
      const { command } = tempCommandCards[1];

      const event: IssueCommandEvent = {
        choiceType: 'issueCommand',
        eventType: 'playerChoice',
        player: 'white',
        order: {
          command,
          selection: { selectionType: 'units', units: [unit] },
        },
      };

      const newState = applyIssueCommandEvent(event, state);

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingCommandsSecondPlayer).not.toContain(command);
      // Check unit presence using value equality, not reference equality
      const unitInCommandedUnits = [
        ...newState.currentRoundState.commandedUnits,
      ].some((u) => isSameUnitInstance(u, unit));
      expect(unitInCommandedUnits).toBe(true);
    });

    it('given black issues one command for two units, both appear in commandedUnits size 2', () => {
      const state = createGameStateWithCommands();
      const unit1 = createTestUnit('black', { attack: 3 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const { command } = tempCommandCards[0];

      const event: IssueCommandEvent = {
        choiceType: 'issueCommand',
        eventType: 'playerChoice',
        player: 'black',
        order: {
          command,
          selection: { selectionType: 'units', units: [unit1, unit2] },
        },
      };

      const newState = applyIssueCommandEvent(event, state);

      // Check unit presence using value equality, not reference equality
      const unit1InCommandedUnits = [
        ...newState.currentRoundState.commandedUnits,
      ].some((u) => isSameUnitInstance(u, unit1));
      const unit2InCommandedUnits = [
        ...newState.currentRoundState.commandedUnits,
      ].some((u) => isSameUnitInstance(u, unit2));
      expect(unit1InCommandedUnits).toBe(true);
      expect(unit2InCommandedUnits).toBe(true);
      expect(newState.currentRoundState.commandedUnits).toHaveLength(2);
    });
  });

  describe('structural update', () => {
    it('given phase commandedUnits and remaining set sizes before apply, input state unchanged after apply', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      const { command } = tempCommandCards[0];
      const phaseState = getIssueCommandsPhaseState(state);
      const originalRemainingCommandsSize =
        phaseState.remainingCommandsFirstPlayer.length;
      const originalCommandedUnitsSize =
        state.currentRoundState.commandedUnits.length;

      const event: IssueCommandEvent = {
        choiceType: 'issueCommand',
        eventType: 'playerChoice',
        player: 'black',
        order: {
          command,
          selection: { selectionType: 'units', units: [unit] },
        },
      };

      applyIssueCommandEvent(event, state);

      // Original state should be unchanged
      const phaseStateAfter = getIssueCommandsPhaseState(state);
      expect(phaseStateAfter.remainingCommandsFirstPlayer).toHaveLength(
        originalRemainingCommandsSize,
      );
      expect(state.currentRoundState.commandedUnits).toHaveLength(
        originalCommandedUnitsSize,
      );
    });
  });

  it('gives a line order to every unit the order lists', () => {
    // Black's rank of four, E-1 to E-4, facing north, and a line order.
    const lineCommand = createTestCommand({
      number: 1,
      restrictions: {
        inspirationRangeRestriction: -1,
        restrictionType: 'none',
      },
      size: 'lines',
    });
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-2', 'E-3', 'E-4'],
    });
    const base = replaceBoard(createGameStateWithCommands(), board);
    const state = updatePhaseState(base, {
      ...getIssueCommandsPhaseState(base),
      remainingCommandsFirstPlayer: [lineCommand],
    });

    // Black orders the line E-3 to E-1, listing its units from E-3.
    const event: IssueCommandEvent = {
      choiceType: 'issueCommand',
      eventType: 'playerChoice',
      player: 'black',
      order: {
        command: lineCommand,
        selection: {
          selectionType: 'line',
          units: [unitAt('E-3').unit, unitAt('E-2').unit, unitAt('E-1').unit],
        },
      },
    };
    const issued = applyIssueCommandEvent(event, state);

    // The three units listed are commanded, as listed; E-4 is not.
    expect(issued.currentRoundState.commandedUnits).toStrictEqual([
      unitAt('E-3').unit,
      unitAt('E-2').unit,
      unitAt('E-1').unit,
    ]);
  });

  describe('stopping, with no order', () => {
    it('forfeits the orders left', () => {
      // Black has one order left and has already ordered one unit.
      const unit = createTestUnit('black', { attack: 3 });
      const state = addUnitsToCommandedUnits(createGameStateWithCommands(), [
        unit,
      ]);

      // Black stops instead of giving the last order (§4.3.3).
      const stopped = applyIssueCommandEvent(
        createIssueCommandEvent({ order: null, player: 'black' }),
        state,
      );

      // The order left is forfeited. With none left, the expected engine asks
      // for completeIssuingCommands, which carries out the order given.
      expect(getIssueCommandsPhaseState(stopped)).toMatchObject({
        remainingCommandsFirstPlayer: [],
        step: 'firstPlayerIssueCommands',
      });
    });

    it('lets the second player stop on their own issuing step', () => {
      // Black has given all their orders; White is issuing, with one left.
      const base = createGameStateWithCommands();
      const state = updatePhaseState(base, {
        ...getIssueCommandsPhaseState(base),
        remainingCommandsFirstPlayer: [],
        step: 'secondPlayerIssueCommands',
      });

      // White stops without giving any order.
      const stopped = applyIssueCommandEvent(
        createIssueCommandEvent({ order: null, player: 'white' }),
        state,
      );

      // White's order is forfeited; issuing is completed next.
      expect(getIssueCommandsPhaseState(stopped)).toMatchObject({
        remainingCommandsSecondPlayer: [],
        step: 'secondPlayerIssueCommands',
      });
    });
  });
});
