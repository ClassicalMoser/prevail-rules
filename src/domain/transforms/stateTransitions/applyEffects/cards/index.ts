// Both face-down cards turned over into play (§4.1.2).
export { applyRevealCardsEvent } from './applyRevealCardsEvent';
// The side that won the initiative recorded, and card play done (§4.1.3).
export { applyResolveInitiativeEvent } from './applyResolveInitiativeEvent';
// Both cards in play put on their played piles as Cleanup opens (§4.5.1).
export { applyCardsLeavePlayEvent } from './applyCardsLeavePlayEvent';
// A rally's burn, and every other card back in hand (§10.3.2).
export { applyResolveRallyEvent } from './applyResolveRallyEvent';
// The support check's outcome: every unit left without a place routs (§10.4).
export { applyUnitsLostSupportAfterRally } from './applyUnitsLostSupportAfterRally';
// The side that prevailed, recorded as the battle ends (§11).
export { applyGameOverEvent } from './applyGameOverEvent';
