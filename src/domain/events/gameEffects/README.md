# Game effect event types (`effectType: 'gameEffect'`)

Zod schemas and TypeScript types for each effect, discriminated in [`gameEffect.ts`](./gameEffect.ts). Consumed by [`applyEffects/`](../../transforms/stateTransitions/applyEffects/README.md) and produced by [`procedures/`](../../procedures/README.md).

**Layout** matches apply/procedure packages:

| Folder                               | Event modules                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| [`cards/`](./cards/)                 | discard / reveal played cards, initiative, rally, units broken                                                                  |
| [`completePhase/`](./completePhase/) | Phase-completion payloads (cleanup, issue commands, move commanders, play cards, resolve melee phase)                           |
| [`defenseResult/`](./defenseResult/) | Retreat, reverse, rout, trigger rout from retreat, plus [`attackResolutionContext`](./defenseResult/attackResolutionContext.ts) |
| [`movement/`](./movement/)           | Complete unit movement, start / flank / engage-retreat engagement                                                               |
| [`resolveAttack/`](./resolveAttack/) | Resolve melee / ranged, complete attack-apply, melee resolution, complete ranged command                                        |

Use the root [`index.ts`](./index.ts) barrel from `@events`; avoid deep imports from outside this package.
