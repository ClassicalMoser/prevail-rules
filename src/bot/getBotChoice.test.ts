import { createInitialGameState } from '@factories';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { projectGameStateForVisibility } from '@transforms';
import { validatePlayerChoice } from '@validation';
import { createSeededRandom } from './runner/createSeededRandom';
import { defaultBotTemperament } from './temperament';
import { getBotChoice } from './getBotChoice';

/**
 * A bot answers only for its own seat, from that seat's view, and only with
 * a choice the rules accept.
 */
describe('getBotChoice function', () => {
  // A new mini game: White holds the initiative and deploys first (§3.5).
  const state = createInitialGameState({
    blackArmy: blackMiniStarterArmy,
    gameMode: 'mini',
    whiteArmy: whiteMiniStarterArmy,
  });

  it('deploys the whole army for the seat that owes it, and the rules accept it', () => {
    const view = projectGameStateForVisibility(state, 'whiteSeen');
    const choice = getBotChoice(
      view,
      'white',
      defaultBotTemperament,
      createSeededRandom(1),
    );
    expect(choice.choiceType).toBe('setupUnits');
    // Checked against the full state, as a real game would check it.
    expect(validatePlayerChoice(choice, state)).toStrictEqual({ result: true });
  });

  it('throws when asked for a choice the other seat owes', () => {
    // Black deploys second; asking it now is the caller's mistake.
    const view = projectGameStateForVisibility(state, 'blackSeen');
    expect(() =>
      getBotChoice(view, 'black', defaultBotTemperament, createSeededRandom(1)),
    ).toThrow('black was asked for setupUnits, which white owes');
  });
});
