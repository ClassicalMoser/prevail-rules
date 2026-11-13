import { tempCommandCards } from '@sampleValues';
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
  updateCurrentInitiative,
} from '@transforms';

import { getLegalPlayerChoiceOptions } from './getLegalPlayerChoiceOptions';

import { createEmptyGameState } from '@factories';

/** Black holding the initiative, with a card in each hand so the battle goes on. */
function underWay(): GameState {
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );
  const withHands = updateCardState(base, {
    ...base.cardState,
    black: { ...base.cardState.black, inHand: [createTestCard()] },
    white: { ...base.cardState.white, inHand: [createTestCard()] },
  });
  return withHands;
}

/**
 * GetLegalPlayerChoiceOptions: presentation router from expected choice →
 * legal option payload (events or compound root atoms). Each case builds a
 * state that really expects the choice, and reads the options it is given.
 */
describe('getLegalPlayerChoiceOptions function', () => {
  it('returns null when the next expected action is a game effect', () => {
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      {
        phase: PLAY_CARDS_PHASE,
        step: 'revealCards',
      },
    );
    // Both awaitingPlay set by createEmptyGameState → revealCards expects game effect
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null when the next expected action is gameOver', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null once a winner is set, because a finished game is owed no choice', () => {
    // The battle is over: no player is asked for anything.
    const state = {
      ...updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      winner: 'black' as const,
    };

    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('packages chooseCard events from the live enumerator', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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

  it('packages the orders left to issue, and says the player may stop instead', () => {
    // Black is issuing and has one order left to give.
    const command = tempCommandCards[0].command;

    // A Black unit beside its general, within the order's reach of 1 space.
    const unit = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'black',
    });
    // A White unit far off, so White still has an army on the field (§11).
    const enemy = createUnitWithPlacement({
      coordinate: 'A-1',
      facing: 'south',
      playerSide: 'white',
    });
    const withUnit = updateBoardState(
      underWay(),
      addUnitToBoard(
        addUnitToBoard(createBoardWithCommander('black', 'E-5'), unit),
        enemy,
      ),
    );

    const state = updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState(withUnit, {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );

    // Black may give that order, or stop and forfeit it (§4.3.3).
    expect(getLegalPlayerChoiceOptions(state)).toMatchObject({
      canDoneIssuing: true,
      choiceType: 'issueCommand',
      issueCommands: { commands: [command], player: 'black' },
    });
  });

  it('packages moveCommander destinations from the commander space', () => {
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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

  it('offers no destinations when the commander is not on the board, rather than nothing at all', () => {
    // Commanders move, but Black's has fallen and is not on the board (§4.2.8).
    const state = updatePhaseState(underWay(), {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });

    // The choice is still owed; it simply has nowhere to go.
    expect(getLegalPlayerChoiceOptions(state)).toMatchObject({
      choiceType: 'moveCommander',
      destinations: [],
      playerSource: 'black',
      startingCoordinate: null,
    });
  });
});
