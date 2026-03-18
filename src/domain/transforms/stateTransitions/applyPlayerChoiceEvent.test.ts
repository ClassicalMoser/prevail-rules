import type { GameState, StandardBoard } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import { createEmptyGameState } from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyChooseCardEvent,
  applyChooseMeleeEvent,
  applyChooseRallyEvent,
  applyChooseRetreatOptionEvent,
  applyChooseRoutDiscardEvent,
  applyChooseWhetherToRetreatEvent,
  applyCommitToMeleeEvent,
  applyCommitToMovementEvent,
  applyCommitToRangedAttackEvent,
  applyIssueCommandEvent,
  applyMoveCommanderEvent,
  applyMoveUnitEvent,
  applyPerformRangedAttackEvent,
  applySetupUnitsEvent,
} from './applyChoices';
import { applyPlayerChoiceEvent } from './applyPlayerChoiceEvent';

vi.mock('./applyChoices', () => ({
  applyChooseCardEvent: vi.fn(),
  applyChooseMeleeEvent: vi.fn(),
  applyChooseRallyEvent: vi.fn(),
  applyChooseRetreatOptionEvent: vi.fn(),
  applyChooseRoutDiscardEvent: vi.fn(),
  applyChooseWhetherToRetreatEvent: vi.fn(),
  applyCommitToMeleeEvent: vi.fn(),
  applyCommitToMovementEvent: vi.fn(),
  applyCommitToRangedAttackEvent: vi.fn(),
  applyIssueCommandEvent: vi.fn(),
  applyMoveCommanderEvent: vi.fn(),
  applyMoveUnitEvent: vi.fn(),
  applyPerformRangedAttackEvent: vi.fn(),
  applySetupUnitsEvent: vi.fn(),
}));

/** Router passes (event, state); handlers share this signature. */
type ApplyPlayerChoiceHandler = (
  event: PlayerChoiceEvent<StandardBoard, PlayerChoiceType>,
  state: GameState<StandardBoard>,
) => GameState<StandardBoard>;

const playerChoiceCases: ReadonlyArray<
  [PlayerChoiceType, ApplyPlayerChoiceHandler]
> = [
  ['chooseCard', applyChooseCardEvent],
  ['chooseMeleeResolution', applyChooseMeleeEvent],
  ['chooseRally', applyChooseRallyEvent],
  ['chooseRetreatOption', applyChooseRetreatOptionEvent],
  ['chooseRoutDiscard', applyChooseRoutDiscardEvent],
  ['chooseWhetherToRetreat', applyChooseWhetherToRetreatEvent],
  ['commitToMelee', applyCommitToMeleeEvent],
  ['commitToMovement', applyCommitToMovementEvent],
  ['commitToRangedAttack', applyCommitToRangedAttackEvent],
  ['issueCommand', applyIssueCommandEvent],
  ['moveCommander', applyMoveCommanderEvent],
  ['moveUnit', applyMoveUnitEvent],
  ['performRangedAttack', applyPerformRangedAttackEvent],
  ['setupUnits', applySetupUnitsEvent],
] as ReadonlyArray<[PlayerChoiceType, ApplyPlayerChoiceHandler]>;

describe('applyPlayerChoiceEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(playerChoiceCases)(
    'should route %s to corresponding handler and return its result',
    (choiceType, handler) => {
      const state = createEmptyGameState();
      const event = {
        eventType: 'playerChoice',
        choiceType,
        player: 'black',
      } as PlayerChoiceEvent<StandardBoard, PlayerChoiceType>;
      vi.mocked(handler).mockReturnValue(state);

      const result = applyPlayerChoiceEvent(event, state);

      expect(handler).toHaveBeenCalledWith(event, state);
      expect(result).toBe(state);
    },
  );

  it('should throw for unknown choice type', () => {
    const state = createEmptyGameState();
    const event = {
      eventType: 'playerChoice',
      choiceType: 'unknown',
      player: 'black',
    } as unknown as PlayerChoiceEvent<StandardBoard, PlayerChoiceType>;

    expect(() => applyPlayerChoiceEvent(event, state)).toThrow(
      'Unknown player choice event type: unknown',
    );
  });
});
