# Bot

Import as `@bot`.

A player that chooses for itself. It is two things: an algorithm, which is what this layer exists for, and a harness for watching bots play each other.

## The algorithm

`getBotChoice(view, seat, temperament, random)` returns the choice a bot makes for its seat. It is asked only for a choice that seat owes; asked out of turn, it throws.

**It sees what its seat sees.** It is given the game as projected for its own side (`projectGameStateForVisibility`), so the opponent's hand is hidden from it, as it would be from a person across the table. The board is public.

**It chooses only from what the rules offer.** Every choice starts from `getLegalPlayerChoiceOptions` and the follow-up helpers in `@legality`, and the bot only ranks what it is offered. So a bot cannot make an illegal choice. If the rules refuse a choice a bot made, the rules offered something they should not have, and that is a fault in the rules.

**It scores and picks.** Each decision lives in `decisions/`, one file to a kind of choice. Each scores the options it was offered and takes the best (`pickBest`). It does not search ahead: the outcomes depend on dice and on cards it cannot see. The scores come from `appraisal/`:

- **A place to stand.** Near the distance a unit wants from the enemy (adjacent for a fighter, at Range for a shooter), turned toward it, near its general, and in line: shoulder to shoulder with friends facing the same way (§4.3.5), and not turned on the diagonal. Friends ordered to move this phase that have not moved yet are left out, so a line can step forward one unit at a time and close up behind its first mover. A flank or back within an enemy's reach is a danger, and so is a head-on charge the enemy would win with its support.
- **An engagement.** A charge from behind is worth the whole unit and its Morale (§6.3.3). A front or flank engagement is worth the exchange of attacks, counting support on both sides (§7.3).
- **A card.** What it would order this round, against what it is worth to keep: the units it steadies at a rally, and its initiative.

**It reads each stat once per view.** A unit's stats depend on the general's reach, which walks the board, and a decision asks the same few questions thousands of times. `recallStat` and `recallAttackResult` remember answers for the view they were read from.

## Temperament

`BotTemperament` is the parametric side: aggression, caution, risk tolerance, thrift and whimsy, each from 0 to 1. A temperament changes which legal option a bot prefers, never what it may do. Two bots with the same temperament and seed make the same choices. `defaultBotTemperament` is a middle-of-the-road general.

Flavour preferences, such as a fondness for cavalry or for shooting, are not built yet. Neither is building an army.

## The harness

`playBotGame` plays one seeded game through the four engines: the expected engine, procedures for effects, each bot choosing from its own seat's view, validation of every choice against the full state, and `applyEvent`. `playBotGames` plays a run of seeds and sums them up. Each game record says how the game ended and why, who won, and how many rounds each side held the initiative. It also counts every kind of event, which is the plainest picture of how the bots played, and times every kind of decision.

It is for observing bots, not for running real games; those go through `@application`. `pnpm bot:games [count] [mini]` runs it from the command line with the sample armies.

## What it does not do yet

- It does not judge where a tied retreat leaves it (§9.1.3), and takes one at random.
- It does not look a round ahead. It knows a unit within an enemy's reach is exposed, but it does not plan a charge for next round or hold back so the enemy must close first.
- It weighs a card's command by the units in reach where the general stands now, before the general moves (§4.2).
