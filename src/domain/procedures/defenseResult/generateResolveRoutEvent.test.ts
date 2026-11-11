import { PLAY_CARDS_PHASE } from '@game';

import {
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestCard,
  createTestUnit,
  placed,
} from '@testing';
import {
  addUnitToBoard,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';

import { generateResolveRoutEvent } from './generateResolveRoutEvent';

import { createEmptyGameState } from '@factories';
/**
 * `resolveRout` materializes rout discards: penalty and affected units come from whichever
 * rout substep is active—ranged attack-apply, melee (initiative player’s apply first),
 * rear engagement during movement, or cleanup rally after failed support.
 */
describe('generateResolveRoutEvent function', () => {
  it('charges the morale of a shot’s routed defender', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRout(defendingUnit);
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    const event = generateResolveRoutEvent(full);
    expect(event.effectType).toBe('resolveRout');
    expect(event.penalty).toBe(defendingUnit.unitType.morale);
    expect(event.player).toBe(defendingUnit.playerSide);
  });

  it('with both melee sides awaiting their penalty, answers the initiative player’s', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
    const blackWp = placed(blackUnit, 'E-5', 'south');
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const blackApply = createAttackApplyStateWithRout(blackUnit);
    const whiteApply = createAttackApplyStateWithRout(whiteUnit);

    const melee = createMeleeResolutionState(s, {
      firstPlayerAttackApplyState: blackApply,
      secondPlayerAttackApplyState: whiteApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const event = generateResolveRoutEvent(full);
    expect(event.player).toBe(blackUnit.playerSide);
    expect(event.penalty).toBe(blackUnit.unitType.morale);
  });

  it('throws in a phase that routs nobody', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRoutEvent(full)).toThrow(
      'No rout is awaiting its penalty',
    );
  });

  it('resolves the rout of a unit engaged from the rear', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    state.cardState.black.inPlay = createTestCard();
    const whiteUnit = createTestUnit('white');
    // The penalty is what this effect works out, so the rout reaches it unpaid.
    const routState = createRoutState('white', whiteUnit);
    const movement = createMovementResolutionState(state, {
      engagementState: createRearEngagementState({ routState }),
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    const event = generateResolveRoutEvent(full);
    expect(event.player).toBe(whiteUnit.playerSide);
  });

  it('resolves the rout of the units a rally could not cover', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: {
          completed: false,
          playerRallied: true,
          rallyResolved: true,
          routState: {
            cardsChosen: false,
            completed: false,
            numberToDiscard: 'pending',
            player: 'white',
            substepType: 'rout',
            unitsToRout: [unit],
          },
          unitsLostSupport: [],
        },
        step: 'firstPlayerResolveRally',
      }),
    );

    const event = generateResolveRoutEvent(full);
    expect(event.player).toBe(unit.playerSide);
  });

  it('throws when the command being resolved holds no rout', () => {
    // Where a rout can sit is the query's answer, so a command that holds none
    // leaves this procedure with no penalty to work out.
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    state.cardState.black.inPlay = createTestCard();
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: {
          commandResolutionType: 'melee',
        } as never,
      }),
    );

    expect(() => generateResolveRoutEvent(full)).toThrow(
      'No rout is awaiting its penalty',
    );
  });
});
