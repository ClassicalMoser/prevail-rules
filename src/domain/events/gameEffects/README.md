# Game effect event types (`eventType: 'gameEffect'`)

Zod schemas and TypeScript types for each effect, discriminated in [`gameEffect.ts`](./gameEffect.ts). Consumed by [`applyEffects/`](../../transforms/stateTransitions/applyEffects/README.md) and produced by [`procedures/`](../../procedures/README.md).

**Layout** matches apply/procedure packages:

| Folder                               | Event modules                                                                                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`cards/`](./cards/)                 | Discard played cards, reveal cards, initiative, rally, game over                                                                                |
| [`sequencing/`](./sequencing/)       | The end of each phase from Play Cards to Resolve Melee, a fallen commander's turn passed over, and the round's end                              |
| [`defenseResult/`](./defenseResult/) | Retreat, reverse, rout, trigger rout from retreat, and opening each on an attack's apply                                                        |
| [`movement/`](./movement/)           | The end of a unit's move and of a Move order; starting an engagement, the flank turn, and a front-engaged defender's retreat option and retreat |
| [`resolveAttack/`](./resolveAttack/) | A melee and a shot measured; the end of an attack's results, of a melee, of a shot, and of a Shoot order                                        |

Use the root [`index.ts`](./index.ts) barrel from `@events`; avoid deep imports from outside this package.
