// Either hand empty: the other player wins. Both empty at once goes to the
// holder of initiative (§11.3); there is no draw.
export { findWinnerFromEmptyHands } from './findWinnerFromEmptyHands';

// A forced rout discard the hand cannot pay.
export { findWinnerFromUnpayableRoutDiscard } from './findWinnerFromUnpayableRoutDiscard';

// An army destroyed to the last unit, however many cards its player holds.
export { findWinnerFromNoUnits } from './findWinnerFromNoUnits';

// Whether the cards are still being chosen face down, before the reveal.
export { isChoosingCardsInSecret } from './isChoosingCardsInSecret';

// Empty hand first, then the unpayable rout discard, then the destroyed army.
export { findGameOverWinner } from './findGameOverWinner';
