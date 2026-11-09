# Legality

Import as `@legality`.

Enumerates what is legal: army composition, choice options, commander movement, unit movement, and whether a combat outcome may proceed. A `getLegal*` list is the source a validator checks membership against. `getLegalUnitMoves`, `getLegalMoveDeltas`, `getLegalRetreats`, `isValidLine`, and `canReverseUnit` live here, not under `@queries` or `@validation`.

This layer does not decide which event comes next (`@expected`) and does not accept or reject an event (`@validation`).
