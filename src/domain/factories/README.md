# Factories

Import as `@factories`.

Build a domain value from raw inputs: an empty board, an empty game, a unit. A factory does not change an existing entity or state. Those operators live under `@transforms`. A test-only helper that neither a factory nor a transform can do lives in `@testing`.

The board layouts live here too, under `board/layout/`: each size's rows and columns, how a row and column name a space, and `getCoordinateLayout` for a board's size. Empty boards are built from them, and the board queries and rules read them, so they sit below both.
