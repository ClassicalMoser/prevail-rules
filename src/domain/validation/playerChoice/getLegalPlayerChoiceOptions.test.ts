import { tempCommandCards } from '@sampleValues';
import type {
  ExpectedEventInfo,
  PlayerChoiceType,
  PlayerSource,
} from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createBoardWithCommander,
  createIssueCommandsPhaseState,
  createTestCard,
  createTestCommand,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';

import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getLegalPlayerChoiceOptions } from './getLegalPlayerChoiceOptions';

import { createEmptyGameState } from '@factories';

const mocks = vi.hoisted(() => ({
  findExpectedEventMock: vi.fn(),
  actualFindExpectedEvent: undefined as
    | ((state: GameState) => ExpectedEventInfo | undefined)
    | undefined,
}));

vi.mock(import('@expected'), async (importOriginal) => {
  const actual = await importOriginal();
  mocks.actualFindExpectedEvent = actual.findExpectedEvent;
  mocks.findExpectedEventMock.mockImplementation(actual.findExpectedEvent);
  return {
    ...actual,
    findExpectedEvent: mocks.findExpectedEventMock,
  };
});

/**
 * Choices whose enumerators answer on a bare state: with no round under way
 * there is simply nothing to offer, so they answer "nothing".
 */
const allChoiceTypes = [
  'chooseCard',
  'chooseShooter',
  'chooseMovingUnit',
  'chooseRoutDiscard',
  'chooseRetreatOption',
  'commitToMelee',
  'commitToMovement',
  'chooseWhetherToRetreat',
  'commitToRangedAttack',
  'commitToRangedDefense',
  'doneIssuingCommands',
  'issueCommand',
  'moveCommander',
  'performRangedAttack',
  'setupUnits',
] as const satisfies readonly PlayerChoiceType[];

/**
 * Choices whose enumerators read the round or the movement under way. A bare
 * state has neither, so they cannot answer; that is a fault to throw, not an
 * empty offer.
 */
const choicesNeedingRoundUnderWay = [
  'chooseMeleeResolution',
  'chooseRally',
  'moveUnit',
] as const satisfies readonly PlayerChoiceType[];

/**
 * GetLegalPlayerChoiceOptions: presentation router from expected choice →
 * legal option payload (events or compound root atoms).
 */
describe('getLegalPlayerChoiceOptions function', () => {
  beforeEach(() => {
    mocks.findExpectedEventMock.mockReset();
    if (mocks.actualFindExpectedEvent !== undefined) {
      mocks.findExpectedEventMock.mockImplementation(
        mocks.actualFindExpectedEvent,
      );
    }
  });

  function stubExpected(
    choiceType: PlayerChoiceType,
    playerSource: PlayerSource = 'black',
  ): void {
    const expected: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType,
      playerSource,
    };
    mocks.findExpectedEventMock.mockReturnValue(expected);
  }

  it('returns null when the next expected action is a game effect', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    // Both awaitingPlay set by createEmptyGameState → revealCards expects game effect
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null when the next expected action is gameOver', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null once a winner is set, because a finished game is owed no choice', () => {
    // The battle is over: no player is asked for anything.
    const state = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };

    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it.each(choicesNeedingRoundUnderWay)(
    'throws the enumerator’s own fault for %s when no round is under way, instead of offering no options',
    (choiceType) => {
      // The choice is expected, but the state has no round to read it from.
      // That is a fault in the state, not a player with nothing to choose.
      stubExpected(choiceType);

      expect(() =>
        getLegalPlayerChoiceOptions(createEmptyGameState('standard')),
      ).toThrow('No current phase state found');
    },
  );

  it('packages chooseCard events from the live enumerator', () => {
    const base = createEmptyGameState('standard');
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
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [createTestCard()],
      },
      white: {
        ...state.cardState.white,
        inHand: [createTestCard()],
      },
    });
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

  it('packages chooseShooter root attackers', () => {
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
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [createTestCard()],
        // In-play command must be rangedAttack for this choice to open.
        inPlay: {
          ...createTestCard(),
          command: createTestCommand({ type: 'rangedAttack' }),
        },
      },
      white: {
        ...state.cardState.white,
        inHand: [createTestCard()],
      },
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

    // The Shoot order starts by naming its shooter (§4.3.11 step 1).
    const options = getLegalPlayerChoiceOptions(state);
    expect(options).toMatchObject({
      choiceType: 'chooseShooter',
      playerSource: 'black',
    });
    if (options?.choiceType !== 'chooseShooter') {
      throw new Error('expected chooseShooter');
    }
    expect(options.rangedAttackers.attackers).toStrictEqual([attacker]);
  });

  describe('discriminant per PlayerChoiceType (soft empty when nothing is available)', () => {
    it.each(allChoiceTypes)(
      'returns choiceType %s with the expected payload shape',
      (choiceType) => {
        stubExpected(choiceType, 'black');
        const options = getLegalPlayerChoiceOptions(
          createEmptyGameState('standard'),
        );
        expect(options).not.toBeNull();
        expect(options?.choiceType).toBe(choiceType);
        expect(options?.playerSource).toBe('black');

        switch (choiceType) {
          case 'chooseCard':
          case 'chooseRetreatOption':
          case 'chooseWhetherToRetreat':
          case 'commitToMelee':
          case 'commitToMovement':
          case 'commitToRangedAttack':
          case 'commitToRangedDefense':
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
          case 'chooseMovingUnit': {
            expect(options).toMatchObject({
              moveUnits: { player: 'black', units: [] },
            });
            break;
          }
          case 'chooseShooter': {
            expect(options).toMatchObject({
              rangedAttackers: { attackers: [], player: 'black' },
            });
            break;
          }
          case 'performRangedAttack': {
            // No shot is open in this state, so there is no shooter and
            // nothing to aim at.
            expect(options).toMatchObject({ shooter: null, targets: [] });
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
