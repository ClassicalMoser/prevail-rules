import type { AuthoritativeGameState } from '@game';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createPlayableGame,
  createTestCard,
} from '@testing';

import { updatePhaseState } from '@transforms';
import { validatePlayerChoice } from './validatePlayerChoice';

import { createChooseCardEvent, createMoveCommanderEvent } from '@factories';

// Each side's hand; each card is held by one player only.
const blackCard = createTestCard();
const blackSpareCard = createTestCard();
const whiteCard = createTestCard();
const whiteSpareCard = createTestCard();

/**
 * Phase 1 of a game under way, Black holding the initiative: both players
 * are asked for a card at once (§4.1.1), and each holds two, so neither hand
 * empties on playing one (§11.1).
 */
function choosingCards(): AuthoritativeGameState {
  const game = createPlayableGame(
    [
      { coord: 'H-5', facing: 'north', player: 'black' },
      { coord: 'B-5', facing: 'south', player: 'white' },
    ],
    {
      hands: {
        black: [blackCard, blackSpareCard],
        white: [whiteCard, whiteSpareCard],
      },
      initiative: 'black',
    },
  );
  const choosing = updatePhaseState(game, createPlayCardsPhaseState());
  return choosing;
}

/**
 * ValidatePlayerChoice: Validates a player choice against the current game state.
 *
 * It asks in order whether the choice is expected, whether it is well formed,
 * and whether the rules allow it, and answers the first refusal. It never
 * throws: a fault beneath it becomes a refusal naming its cause.
 */
describe('validatePlayerChoice function', () => {
  it('refuses a choice the game is not waiting for, before reading what it holds', () => {
    // Phase 1 asks for cards; moving a commander belongs to Phase 2, so the
    // choice is refused as unexpected without its contents being judged.
    const event = createMoveCommanderEvent({ player: 'black', to: 'G-5' });

    expect(validatePlayerChoice(event, choosingCards())).toStrictEqual({
      errorReason: 'Expected chooseCard, got moveCommander',
      result: false,
    });
  });

  it('refuses an expected choice that does not parse, naming what is malformed', () => {
    // Black is asked for a card, and sends one whose initiative is 9; a card
    // shows an initiative of 1 to 4 (§4.1.3), so no card could look like it.
    const event = createChooseCardEvent({
      card: { ...blackCard, initiative: 9 },
      player: 'black',
    });

    // The refusal carries the schema's own account of the fault: the path
    // to the bad field and the bound it broke.
    expect(validatePlayerChoice(event, choosingCards())).toStrictEqual({
      errorReason: `Invalid player choice event: [
  {
    "origin": "number",
    "code": "too_big",
    "maximum": 4,
    "inclusive": true,
    "path": [
      "card",
      "initiative"
    ],
    "message": "Too big: expected number to be <=4"
  }
]`,
      result: false,
    });
  });

  it('refuses an expected, well-formed choice the rules do not allow', () => {
    // Black is asked for a card and names one White holds: a well-formed
    // card, but not one Black may lay down (§4.1.1).
    const event = createChooseCardEvent({ card: whiteCard, player: 'black' });

    expect(validatePlayerChoice(event, choosingCards())).toStrictEqual({
      errorReason: `Command card ${whiteCard.id} is not a legal choice for black`,
      result: false,
    });
  });

  it('accepts an expected, well-formed choice the rules allow', () => {
    // Black lays a card from its own hand.
    const event = createChooseCardEvent({ card: blackCard, player: 'black' });

    expect(validatePlayerChoice(event, choosingCards())).toStrictEqual({
      result: true,
    });
  });

  it('turns a fault found while checking legality into a refusal that names the cause', () => {
    // White holds the initiative, so white moves its commander first, and the
    // game is waiting on exactly that choice. But white's commander was never
    // placed, so there is no commander to move: a fault in the state, not a
    // move to weigh.
    const game = createPlayableGame(
      [
        { coord: 'A-1', facing: 'south', player: 'white' },
        { coord: 'I-9', facing: 'north', player: 'black' },
      ],
      { initiative: 'white' },
    );
    const state = updatePhaseState(game, createMoveCommandersPhaseState());
    const event = createMoveCommanderEvent({
      player: 'white',
      to: 'E-7',
    });

    const validation = validatePlayerChoice(event, state);

    expect(validation).toStrictEqual({
      errorReason:
        'Error validating player choice: The white commander is not on the board',
      result: false,
    });
  });
});
