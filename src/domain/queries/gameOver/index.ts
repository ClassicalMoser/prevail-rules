// Either hand empty: the other player wins. Both empty is a draw.
export { getWinnerFromEmptyHands } from './getWinnerFromEmptyHands';

// A forced rout discard the hand cannot pay.
export { getWinnerFromUnpayableRoutDiscard } from './getWinnerFromUnpayableRoutDiscard';

// Empty hand first, then the unpayable rout discard.
export { getGameOverWinner } from './getGameOverWinner';
