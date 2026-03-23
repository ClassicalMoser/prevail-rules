import type { StandardBoard, UnitWithPlacement } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
import { tempUnits } from '@sampleValues';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveUnitsBrokenEvent } from './generateResolveUnitsBrokenEvent';

describe('generateResolveUnitsBrokenEvent', () => {
  it('returns empty unitTypes when player has no units on board', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
    const event = generateResolveUnitsBrokenEvent(full);
    expect(event.effectType).toBe('resolveUnitsBroken');
    expect(event.player).toBe('white');
    expect(event.unitTypes).toEqual([]);
  });

  it('uses second player on secondPlayerResolveRally step', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );
    const event = generateResolveUnitsBrokenEvent(full);
    expect(event.player).toBe('black');
  });

  it('throws when cleanup step is not a resolveRally step', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );
    expect(() => generateResolveUnitsBrokenEvent(full)).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });

  it('throws when not in cleanup phase', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveUnitsBrokenEvent(full)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });

  it('lists an unsupported unit type once when multiple units share that type', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const unitType = tempUnits[0];
    const u1 = createTestUnit('white', { unitType, instanceNumber: 1 });
    const u2 = createTestUnit('white', { unitType, instanceNumber: 2 });
    const wp1: UnitWithPlacement<StandardBoard> = {
      unit: u1,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const wp2: UnitWithPlacement<StandardBoard> = {
      unit: u2,
      placement: { coordinate: 'E-6', facing: 'north' },
    };
    let s = { ...base, boardState: addUnitToBoard(base.boardState, wp1) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, wp2) };
    const full = updatePhaseState(
      s,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );

    const event = generateResolveUnitsBrokenEvent(full);
    expect(event.unitTypes).toHaveLength(1);
    expect(event.unitTypes[0]!.id).toBe(unitType.id);
  });

  it('lists each unsupported unit type once when several types are on board', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const u1 = createTestUnit('white', { unitType: tempUnits[0] });
    const u2 = createTestUnit('white', { unitType: tempUnits[1] });
    const wp1: UnitWithPlacement<StandardBoard> = {
      unit: u1,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const wp2: UnitWithPlacement<StandardBoard> = {
      unit: u2,
      placement: { coordinate: 'E-6', facing: 'north' },
    };
    let s = { ...base, boardState: addUnitToBoard(base.boardState, wp1) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, wp2) };
    const full = updatePhaseState(
      s,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );

    const event = generateResolveUnitsBrokenEvent(full);
    const ids = event.unitTypes.map((t) => t.id).sort();
    expect(ids).toEqual(['1', '2']);
  });
});
