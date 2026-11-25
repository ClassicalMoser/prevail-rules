// A card's way through a round, each step twice: once for a hand this view
// can see, once for a hand it holds face down.

// A card laid face down from hand in Phase 1 (§4.1.1).
export { chooseCard } from './chooseCard';
// The same, for a hand this view cannot see: one face-down card leaves it.
export { chooseHiddenCard } from './chooseHiddenCard';
// One player's face-down card turned over and put in play (§4.1.2).
export { revealCard } from './revealCard';
// The same, for a hand this view cannot see: the event names the card.
export { revealHiddenCard } from './revealHiddenCard';
// Both players' face-down cards turned over together, under any view.
export { revealBothAwaitingCards } from './revealBothAwaitingCards';
// Cards committed or paid for a rout, from hand to the discard pile (§8.1, §9.3.2).
export { discardCardsFromHand } from './discardCardsFromHand';
// The same, for a hand this view cannot see: the card is shown as it goes.
export { discardShownCardFromHiddenHand } from './discardShownCardFromHiddenHand';
// One player's card in play onto the played pile at Cleanup (§4.5.1).
export { moveCardToPlayed } from './moveCardToPlayed';
// Both players' cards in play onto their played piles, under any view.
export { moveBothInPlayToPlayed } from './moveBothInPlayToPlayed';
// The card a rally burns, from the played pile to the burnt pile (§10.3.2).
export { burnCardFromPlayed } from './burnCardFromPlayed';
// The same, for a hand this view cannot see; the played pile is face up.
export { burnHiddenCardFromPlayed } from './burnHiddenCardFromPlayed';
// The rest of a rally: the played and discard piles back into hand.
export { returnCardsToHand } from './returnCardsToHand';
// The same, for a hand this view cannot see: the cards turn face down.
export { returnHiddenCardsToHand } from './returnHiddenCardsToHand';
// A player's cards as a viewer who cannot see the hand holds them (§1.4).
export { toHiddenCardState } from './toHiddenCardState';
// One player's cards in view, written back into both players' cards.
export { replaceOwnedPlayerCardState } from './replaceOwnedPlayerCardState';
// One player's face-down cards, written back into both players' cards.
export { replaceHiddenPlayerCardState } from './replaceHiddenPlayerCardState';
// Both players' cards, written back into the game.
export { replaceCardState } from './replaceCardState';
// One player's cards changed in whichever form this view holds them, and
// the change it is given for each form.
export { updatePlayerCards } from './updatePlayerCards';
export type { PlayerCardsChange } from './updatePlayerCards';
// One player's cards in view, written into the game; only fixtures call it.
export { updatePlayerCardState } from './updatePlayerCardState';
