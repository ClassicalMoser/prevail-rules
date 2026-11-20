import type { UnitFacing } from '@entities';
import type { GameState } from '@game';
import type { StatModifier } from '@ruleValues';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  createUnitByStat,
  placed,
  replaceBoard,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateStartEngagementEvent } from './generateStartEngagementEvent';

import { createEmptyGameState, createUnitPlacement } from '@factories';
/**
 * Start of engagement: from movement resolution, classify rear vs flank vs front from
 * defender facing on the board vs engaging facing on targetPlacement.
 * Geometry here: engager at E-5 facing east, defender at E-6 (adjacent east); facings vary per case.
 */
describe('generateStartEngagementEvent function', () => {
  /** IssueCommands + movement targeting E-6; black.inPlay satisfies movement factory commitment.card. */
  function stateEnteringDefenderAt(options: {
    defenderFacing: UnitFacing;
    engagingFacing: UnitFacing;
    moverSpeed?: number;
    moverCardModifiers?: StatModifier[];
  }): {
    full: GameState;
    defender: ReturnType<typeof createTestUnit>;
  } {
    const state = createEmptyGameState('standard');
    // The mover's committed card is black's card in play.
    state.cardState.black.inPlay = createTestCard({
      modifiers: options.moverCardModifiers ?? [],
    });
    const defender = createTestUnit('white');
    const withBoard = replaceBoard(
      state,
      addUnitToBoard(
        state.boardState,
        placed(defender, 'E-6', options.defenderFacing),
      ),
    );
    const movement = createMovementResolutionState(withBoard, {
      movingUnit: placed(
        createUnitByStat('black', 'speed', options.moverSpeed ?? 2),
        'E-5',
        'east',
      ),
      targetPlacement: createUnitPlacement('E-6', options.engagingFacing),
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    });
    const full = updatePhaseState(withBoard, phase);
    return { defender, full };
  }

  it('given movement into E-6, names the defender standing there by who it is', () => {
    const { full, defender } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'north',
    });

    const event = generateStartEngagementEvent(full);
    // The defender is named; where it stands and faces is the board's to say.
    expect(event.defendingUnit).toBe(defender);
    expect(['rear', 'flank', 'front']).toContain(event.engagementType);
  });

  it('given defender north and engaging north into rear arc, engagementType is rear', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'north',
      engagingFacing: 'north',
    });
    expect(generateStartEngagementEvent(full).engagementType).toBe('rear');
  });

  it('given defender south and engaging east (orthogonal), engagementType is flank', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'east',
    });
    expect(generateStartEngagementEvent(full).engagementType).toBe('flank');
  });

  it('given defender south and engaging north (head-on), engagementType is front', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'north',
    });
    expect(generateStartEngagementEvent(full).engagementType).toBe('front');
  });

  it('given diagonal defender facing with engaging south, throws classification error', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'northEast',
      engagingFacing: 'south',
    });
    expect(() => generateStartEngagementEvent(full)).toThrow(
      'Unable to determine engagement type. Engaging facing: south, Defending facing: northEast',
    );
  });

  it('records the engaging unit’s Speed, sampled where its move began', () => {
    // A black mover of Speed 3, no card counted, enters white head-on.
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'west',
      engagingFacing: 'east',
      moverSpeed: 3,
    });

    // Its Speed as it stood on E-5, before the engagement sets it down.
    expect(generateStartEngagementEvent(full).engagingSpeed).toBe(3);
  });

  it('counts the card the mover committed in the Speed it records', () => {
    // The same mover committed a card for +1 Speed before it moved (§4.3.10).
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'west',
      engagingFacing: 'east',
      moverCardModifiers: ['speed'],
      moverSpeed: 3,
    });

    // The card counts toward the mover's own Speed, and only its own.
    expect(generateStartEngagementEvent(full).engagingSpeed).toBe(4);
  });
});
