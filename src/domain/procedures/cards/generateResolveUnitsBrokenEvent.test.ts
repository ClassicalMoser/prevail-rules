import type { StandardBoard, UnitWithPlacement } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';

import { tempUnits } from '@sampleValues';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveUnitsBrokenEvent } from './generateResolveUnitsBrokenEvent';

/**
 * After rally, hands change which unit types are “supported” by remaining cards. This procedure
 * emits `resolveUnitsBroken` listing unit types the acting player still has on board but no longer
 * supports (deduped per type). Step must be first/secondPlayerResolveRally inside cleanup.
 */
describe('generateResolveUnitsBrokenEvent', () => {
  it('given white initiative and empty board at firstPlayerResolveRally, player white and no types', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
    const event = generateResolveUnitsBrokenEvent(full, 0);
    expect(event.effectType).toBe('resolveUnitsBroken');
    expect(event.player).toBe('white');
    expect(event.unitTypes).toEqual([]);
  });

  it('given same initiative, secondPlayerResolveRally targets the non-initiative player (black)', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );
    const event = generateResolveUnitsBrokenEvent(full, 0);
    expect(event.player).toBe('black');
  });

  it('given cleanup discardPlayedCards step, throws resolveRally step guard', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );
    expect(() => generateResolveUnitsBrokenEvent(full, 0)).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });

  it('given playCards phase, throws cleanup phase guard', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveUnitsBrokenEvent(full, 0)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });

  it('given two white units same unsupported type on E-5 and E-6, lists that type once', () => {
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

    const event = generateResolveUnitsBrokenEvent(full, 0);
    expect(event.unitTypes).toHaveLength(1);
    expect(event.unitTypes[0]!.id).toBe(unitType.id);
  });

  it('given two different unsupported white types on board, lists both type ids', () => {
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

    const event = generateResolveUnitsBrokenEvent(full, 0);
    const ids = event.unitTypes.map((t) => t.id).sort();
    expect(ids).toEqual(['1', '2']);
  });
});
