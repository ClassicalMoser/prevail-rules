import type { ExpectedEvent, PlayerChoiceType, PlayerSource } from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createBoardWithCommander,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getLegalPlayerChoiceOptions } from './getLegalPlayerChoiceOptions';

const mocks = vi.hoisted(() => ({
  getExpectedEventMock: vi.fn(),
  actualGetExpectedEvent: undefined as
    | ((state: GameState) => ExpectedEvent)
    | undefined,
}));

vi.mock(import('@expected'), async (importOriginal) => {
  const actual = await importOriginal();
  mocks.actualGetExpectedEvent = actual.getExpectedEvent;
  mocks.getExpectedEventMock.mockImplementation(actual.getExpectedEvent);
  return {
    ...actual,
    getExpectedEvent: mocks.getExpectedEventMock,
  };
});

const allChoiceTypes = [
  'chooseCard',
  'chooseMeleeResolution',
  'chooseRally',
  'chooseRoutDiscard',
  'chooseRetreatOption',
  'commitToMelee',
  'commitToMovement',
  'chooseWhetherToRetreat',
  'commitToRangedAttack',
  'doneIssuingCommands',
  'issueCommand',
  'moveCommander',
  'moveUnit',
  'performRangedAttack',
  'setupUnits',
] as const satisfies readonly PlayerChoiceType[];

/**
 * GetLegalPlayerChoiceOptions: presentation router from expected choice →
 * legal option payload (events or compound root atoms).
 */
describe(getLegalPlayerChoiceOptions, () => {
  beforeEach(() => {
    mocks.getExpectedEventMock.mockReset();
    if (mocks.actualGetExpectedEvent !== undefined) {
      mocks.getExpectedEventMock.mockImplementation(
        mocks.actualGetExpectedEvent,
      );
    }
  });

  function stubExpected(
    choiceType: PlayerChoiceType,
    playerSource: PlayerSource = 'black',
  ): void {
    const expected: ExpectedEvent = {
      actionType: 'playerChoice',
      choiceType,
      expectedEventNumber: 0,
      playerSource,
    };
    mocks.getExpectedEventMock.mockReturnValue(expected);
  }

  it('returns null when the next expected action is a game effect', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    // Both awaitingPlay set by createEmptyGameState → revealCards expects game effect
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null when getExpectedEvent throws', () => {
    mocks.getExpectedEventMock.mockImplementation(() => {
      throw new Error('Invalid phase');
    });
    expect(getLegalPlayerChoiceOptions(createEmptyGameState())).toBeNull();
  });

  it('packages chooseCard events from the live enumerator', () => {
    const base = createEmptyGameState();
    const withPhase = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const state = updateCardState(withPhase, {
      ...withPhase.cardState,
      black: {
        ...withPhase.cardState.black,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
      },
      white: {
        ...withPhase.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[3]],
      },
    });

    const options = getLegalPlayerChoiceOptions(state);
    expect(options).toMatchObject({
      choiceType: 'chooseCard',
      playerSource: 'bothPlayers',
    });
    if (options?.choiceType !== 'chooseCard') {
      throw new Error('expected chooseCard');
    }
    expect(options.events).toHaveLength(2);
    expect(options.events.map((e) => e.player).toSorted()).toStrictEqual([
      'black',
      'white',
    ]);
  });

  it('packages moveCommander destinations from the commander space', () => {
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = {
      ...state,
      boardState: createBoardWithCommander('black', 'E-5'),
    };
    state = updatePhaseState(state, {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });

    const options = getLegalPlayerChoiceOptions(state);
    expect(options).toMatchObject({
      choiceType: 'moveCommander',
      playerSource: 'black',
      startingCoordinate: 'E-5',
    });
    if (options?.choiceType !== 'moveCommander') {
      throw new Error('expected moveCommander');
    }
    expect(options.destinations.length).toBeGreaterThan(0);
    expect(options.destinations).toContain('E-5');
  });

  it('packages performRangedAttack root attackers', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    const target = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[15] },
    });
    state = updateBoardState(
      state,
      addUnitToBoard(addUnitToBoard(state.boardState, attacker), target),
    );
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [attacker.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const options = getLegalPlayerChoiceOptions(state);
    expect(options).toMatchObject({
      choiceType: 'performRangedAttack',
      playerSource: 'black',
    });
    if (options?.choiceType !== 'performRangedAttack') {
      throw new Error('expected performRangedAttack');
    }
    expect(options.rangedAttackers.attackers).toStrictEqual([attacker]);
  });

  describe('discriminant per PlayerChoiceType (soft empty when atoms missing)', () => {
    it.each(allChoiceTypes)(
      'returns choiceType %s with the expected payload shape',
      (choiceType) => {
        stubExpected(choiceType, 'black');
        const options = getLegalPlayerChoiceOptions(createEmptyGameState());
        expect(options).not.toBeNull();
        expect(options?.choiceType).toBe(choiceType);
        expect(options?.playerSource).toBe('black');
        expect(options?.expectedEventNumber).toBe(0);

        switch (choiceType) {
          case 'chooseCard':
          case 'chooseMeleeResolution':
          case 'chooseRally':
          case 'chooseRetreatOption':
          case 'chooseWhetherToRetreat':
          case 'commitToMelee':
          case 'commitToMovement':
          case 'commitToRangedAttack':
          case 'doneIssuingCommands': {
            expect(options).toHaveProperty('events');
            if (options && 'events' in options) {
              expect(Array.isArray(options.events)).toBe(true);
            }
            break;
          }
          case 'chooseRoutDiscard': {
            expect(options).toMatchObject({
              routDiscard: {
                cardIds: [],
                numberToDiscard: 0,
                player: 'black',
              },
            });
            break;
          }
          case 'issueCommand': {
            expect(options).toMatchObject({
              canDoneIssuing: true,
              issueCommands: { commands: [], player: 'black' },
            });
            break;
          }
          case 'moveCommander': {
            expect(options).toMatchObject({
              destinations: [],
              startingCoordinate: null,
            });
            break;
          }
          case 'moveUnit': {
            expect(options).toMatchObject({
              moveUnits: { player: 'black', units: [] },
            });
            break;
          }
          case 'performRangedAttack': {
            expect(options).toMatchObject({
              rangedAttackers: { attackers: [], player: 'black' },
            });
            break;
          }
          case 'setupUnits': {
            expect(options).toMatchObject({
              setupUnits: {
                coordinates: [],
                player: 'black',
                units: [],
              },
            });
            break;
          }
          default: {
            const _exhaustive: never = choiceType;
            throw new Error(`unhandled ${_exhaustive}`);
          }
        }
      },
    );
  });
});
