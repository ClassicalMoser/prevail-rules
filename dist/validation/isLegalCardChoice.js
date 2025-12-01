export function isLegalCardChoice(cardState, chooseCardCommand) {
    const { card } = chooseCardCommand;
    let playerHand;
    switch (chooseCardCommand.player) {
        case "black":
            playerHand = cardState.blackPlayer.inHand;
            break;
        case "white":
            playerHand = cardState.whitePlayer.inHand;
            break;
    }
    return playerHand.includes(card);
}
