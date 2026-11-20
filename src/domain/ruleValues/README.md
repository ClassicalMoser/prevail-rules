# Rule values

Import as `@ruleValues`.

Constants the rules share. This layer imports nothing from the domain: `@entities` imports its values, so an import back would be a cycle. A list here carries its own literal type, and the layer that uses it checks it against the domain's type there.

- `ruleValues` — the shared numeric and named constants
- `traits` — unit traits
- `gameEffectTypes` — effect type names
- `commitmentModifiers` — which stats each moment a card may be committed at accepts, and so every stat a card may name
- `boardSizes`, `boardLabels`, `boardCoordinates`, `boardLayouts` — the board sizes, the labels on rows and columns, every space, and each size's depth, frontage and spaces
- `gameModes` — the game modes, and which board size each is played on
