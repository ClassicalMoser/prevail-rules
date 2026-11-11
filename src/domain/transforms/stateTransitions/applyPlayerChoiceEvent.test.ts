import { tempCommandCards } from '@sampleValues';
import type { PlayerChoiceEvent } from '@events';

import { applyChooseCardEvent } from './applyChoices';
import { applyPlayerChoiceEvent } from './applyPlayerChoiceEvent';

import { createChooseCardEvent, createEmptyGameState } from '@factories';

vi.mock(import('./applyChoices'), () => ({
  applyAssignUnitSupportEvent: vi.fn(),
  applyChooseCardEvent: vi.fn(),
  applyChooseMeleeEvent: vi.fn(),
  applyChooseRallyEvent: vi.fn(),
  applyChooseRetreatOptionEvent: vi.fn(),
  applyChooseRoutDiscardEvent: vi.fn(),
  applyChooseWhetherToRetreatEvent: vi.fn(),
  applyCommitToMeleeEvent: vi.fn(),
  applyCommitToMovementEvent: vi.fn(),
  applyCommitToRangedAttackEvent: vi.fn(),
  applyDoneIssuingCommandsEvent: vi.fn(),
  applyIssueCommandEvent: vi.fn(),
  applyMoveCommanderEvent: vi.fn(),
  applyMoveUnitEvent: vi.fn(),
  applyPerformRangedAttackEvent: vi.fn(),
  applySetupUnitsEvent: vi.fn(),
}));

/**
 * Smoke tests only: real routing coverage lives on each `applyChoices/*` module.
 */
describe('applyPlayerChoiceEvent function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to the handler for the matching choiceType and returns its result', () => {
    const state = createEmptyGameState('standard');
    const event = createChooseCardEvent({
      card: tempCommandCards[0],
      player: 'black',
    });

    vi.mocked(applyChooseCardEvent).mockReturnValue(state);

    const result = applyPlayerChoiceEvent(event, state);

    expect(applyChooseCardEvent).toHaveBeenCalledWith(event, state);
    expect(result).toBe(state);
  });

  it('throws when choiceType is not handled by the switch', () => {
    const state = createEmptyGameState('standard');
    const event = {
      choiceType: 'unknown',
      eventType: 'playerChoice',
      player: 'black',
      // The default branch needs a choiceType the union forbids.
    } as unknown as PlayerChoiceEvent;

    expect(() => applyPlayerChoiceEvent(event, state)).toThrow(
      'Unknown player choice event type: unknown',
    );
  });
});
