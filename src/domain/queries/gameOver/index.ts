// Either hand empty: the other player wins. Both empty at once goes to the
// holder of initiative (§11.3); there is no draw.
export { getWinnerFromEmptyHands } from './getWinnerFromEmptyHands';

// A forced rout discard the hand cannot pay.
export { getWinnerFromUnpayableRoutDiscard } from './getWinnerFromUnpayableRoutDiscard';

// An army destroyed to the last unit, however many cards its player holds.
export { getWinnerFromNoUnits } from './getWinnerFromNoUnits';

// Empty hand first, then the unpayable rout discard, then the destroyed army.
export { getGameOverWinner } from './getGameOverWinner';
