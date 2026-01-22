# Prevail: Ancient Battles

## Official Rulebook

---

## How to Use This Rulebook

**First Time Playing?** Start with [Learning to Play](#learning-to-play) for a guided walkthrough.

**Need a Quick Reminder?** Jump to [Quick Reference](#quick-reference) for phase summaries and key rules.

**Looking for Specific Rules?** Use the [Table of Contents](#table-of-contents) to find what you need.

---

## Table of Contents

1. [Learning to Play](#learning-to-play) - Your first game walkthrough
2. [What You Need to Know](#what-you-need-to-know) - Core concepts explained simply
3. [How to Win](#how-to-win) - Victory conditions
4. [Setting Up](#setting-up) - Game setup
5. [Playing the Game](#playing-the-game) - Complete rules
6. [Combat Explained](#combat-explained) - Detailed combat rules
7. [Advanced Concepts](#advanced-concepts) - Complex rules
8. [Quick Reference](#quick-reference) - At-a-glance summaries
9. [Common Questions](#common-questions) - FAQ
10. [Glossary](#glossary) - Terms defined
11. [Appendix: Geometric Resolution](#appendix-geometric-resolution) - Movement and support geometry

---

## Learning to Play

> **⏱️ Time to First Game: 15 minutes**  
> This section teaches you enough to play your first game. You'll learn the rest as you play.

### The Big Picture

**Prevail** is a tactical battle game. You command units on a grid board. Your goal: make your opponent run out of cards **in their hand**. Your hand = your army's will to fight.

### What Happens in a Round

Every round has 5 phases. Here's what each does:

1. **Play Cards** → Choose a card, see who goes first
2. **Move Commanders** → Position your commander
3. **Issue Commands** → Order units to move or attack
4. **Resolve Melee** → Resolve engagements through melee combat
5. **Cleanup** → Discard cards, check if units are still supported

### Your First Turn

Let's walk through a complete turn:

**Phase 1: Play Cards**

- Look at your hand
- Pick one card (face-down)
- Both players reveal
- **Lower initiative number goes first** (1 beats 2, 2 beats 3, etc.)

**Phase 2: Move Commanders**

- Move your commander up to 4 spaces
- Commanders provide persistent effects/boosts throughout the round
- Position them where you need the effects (but not too close to danger!)

**Phase 3: Issue Commands**

- Your card specifies the command type and which units can be commanded
- Commands typically affect multiple units (not just one)
- Range depends on the card, not strictly proximity to commander
- Movement commands: Order units to move
- Ranged Attack commands: Order units to perform ranged attacks

**Phase 4: Resolve Melee**

- **All engagements are resolved every round** (engagements created when units moved into enemy spaces)
- Engagements are resolved through melee combat (both units attack each other)
- Ranged attacks only happen if commanded—they don't resolve automatically
- See [Combat Explained](#combat-explained) for details

**Phase 5: Cleanup**

- Discard played cards (happens first)
- Choose to rally (shuffle played cards, burn one randomly, get all played and discarded cards back)
- **If you rallied**: Check which units lost support (they rout if unsupported)
- **If you didn't rally**: Skip support check

### Key Concepts You'll Need

**Units Have Stats:**

- **Speed**: How many spaces forward you can move
- **Flexibility**: How many times you can turn
- **Attack**: How hard you hit
- **Reverse/Retreat/Rout**: Defense thresholds

**Cards Do Two Things:**

- **Initiative** (1-4): Lower = go first
- **Command**: What you can order units to do

**Units Need Support:**

- Cards in your hand "preserve" unit types
- If a unit type has no preserving cards → all those units rout
- This happens during Cleanup

### Ready to Play?

Set up the game (see [Setting Up](#setting-up)), then start with Phase 1. Refer back to this rulebook as questions come up. Don't worry about getting everything perfect—you'll learn as you play!

---

## What You Need to Know

### The Board

The game uses a grid. Coordinates are **Row-Column** like `E-5` or `A-1`.

**Board Sizes:**

- **Small**: 8 rows × 12 columns (96 spaces)
- **Standard**: 12 rows × 18 columns (216 spaces) ← _Recommended for first games_
- **Large**: 24 rows × 36 columns (864 spaces)

### Units

Each unit is a formation of troops. Units have:

**Stats** (numbers on the unit):

- **Attack**: Combat strength
- **Range**: How far they can shoot (0 = melee only)
- **Speed**: Forward movement capacity
- **Flexibility**: Turning capacity
- **Reverse/Retreat/Rout**: Defense thresholds

**Facing**: Units face one of 8 directions (N, S, E, W, NE, NW, SE, SW). This matters for movement and combat.

**Rout Penalty**: When this unit routs, discard this many cards.

### Command Cards

Cards are your command capability AND your initiative. Each card shows:

- **Initiative** (1-4): Lower numbers act first
- **Command Type**: Movement or Ranged Attack
- **Modifiers**: Bonuses for units you command
- **Round Effect**: Ongoing effect while in play
- **Unit Preservation**: Which unit types this card supports

### Commanders

Each player has one commander piece. Commanders:

- Move up to 4 spaces per turn
- Don't have facing (move any direction)
- Provide persistent effects and boosts throughout the round
- Effects depend on card and commander position

### How Cards Work

Cards move through states:

```
In Hand → (Choose) → Awaiting Play → (Reveal) → In Play → (Use) → Played → (Cleanup) → Discarded
                                                                              ↓
                                                                          Burnt (gone forever)
```

**Cards leave your hand when:**

- **Committed for ranged attacks** → go to discard pile (return on rally)
- **Committed for melee** (optional) → go to discard pile (return on rally)
- **Discarded for rout penalties** → go to discard pile (return on rally)
- **Burnt for rally** → permanently removed to burnt pile
- **Played** → go to played area (returned to hand on rally, unless burnt)

**Loss Checkpoints**: You lose immediately if:

1. You cannot pay a required cost (e.g., rout penalty requires 3 cards but you only have 2 in hand)
2. Your hand is empty at the start of Phase 1 (before playing cards)
3. A required discard would leave your hand empty and you cannot complete the action

---

## How to Win

**Victory Condition: Make your opponent run out of cards in their hand.**

### Loss Conditions

A player loses **immediately** when any of the following occur:

1. **Cannot pay a required cost**: When instructed to discard/burn/pay cards and you cannot (e.g., rout penalty requires 3 cards but you only have 2 in hand)
2. **Empty hand at start of Phase 1**: If your hand is empty when Phase 1 (Play Cards) begins, you lose before the phase starts
3. **Empty hand after required discard**: If a game action requires you to discard a card from hand and your hand becomes empty as a result, you lose immediately

**Important**: Loss is checked at these specific moments, not continuously. For example:

- If your hand is empty during Phase 5 cleanup, you can still rally (if you have cards in played area) to get cards back
- You only lose if you cannot pay a required cost or if your hand is empty at the start of Phase 1

### Why Cards Matter

Your hand represents your army's will to fight. Cards are spent for:

- **Commands**: Ordering units to act
- **Commitments**: Enabling special actions (ranged attacks, etc.)
- **Rallies**: Recovering from losses
- **Rout Penalties**: When important units are destroyed

### Strategic Implications

- **Hand Management**: Keep cards that preserve your units
- **Risk vs. Reward**: Powerful actions cost cards
- **Unit Support**: Losing cards can break unit support → mass routs
- **Rout Penalties**: Important units cost more when they die

---

## Setting Up

### 1. Choose Board Size

Agree on Small, Standard, or Large. **Standard is recommended for first games.**

### 2. Place the Board

Set the board between players. Each player should be on opposite sides.

### 3. Build Armies

Each player selects units within their army's constraints:

- **Cost Limit**: Total cost of all units
- **Unit Limits**: Maximum of each unit type

### 4. Deploy Units

Place your units on your side of the board. Specific deployment rules vary by scenario.

### 5. Place Commanders

Each player places their commander on the board (usually near their starting units).

### 6. Deal Starting Hands

Each player receives their starting hand of command cards.

### 7. Determine First Initiative

Randomly determine which player has initiative for the first round (coin flip, dice, etc.).

---

## Playing the Game

The game is played in **rounds**. Each round has 5 phases that must be completed in order.

### Round Overview

```
┌─────────────────────────────────────┐
│  Round Start                         │
│    ↓                                 │
│  [1] Play Cards                      │
│    ↓                                 │
│  [2] Move Commanders                 │
│    ↓                                 │
│  [3] Issue Commands                 │
│    ↓                                 │
│  [4] Resolve Melee                   │
│    ↓                                 │
│  [5] Cleanup                         │
│    ↓                                 │
│  Round End → Next Round             │
└─────────────────────────────────────┘
```

---

## Phase 1: Play Cards

**Purpose**: Choose your command card for this round and determine turn order.

### Step-by-Step

1. **Both players simultaneously** choose one card from their hand
2. Place it face-down in your "awaiting play" area
3. **Reveal cards** simultaneously
4. Cards move to "in play"
5. **Compare initiative values**
   - Lower number wins (1 beats 2, 2 beats 3, etc.)
   - **Tie**: Current initiative holder keeps it
6. Winner receives initiative for this round

### Example

> **White** chooses a card with initiative **2**  
> **Black** chooses a card with initiative **3**  
> **Result**: White wins initiative (2 < 3)  
> White acts first in all subsequent phases this round.

### Tips

- Lower initiative = act first, but you reveal your command type
- Higher initiative = act second, but you see what your opponent is doing
- Initiative ties favor the current holder (momentum advantage)

---

## Phase 2: Move Commanders

**Purpose**: Position your commander to provide persistent effects and boosts throughout the round.

### Step-by-Step

1. **Initiative player** moves their commander (up to 4 spaces)
2. **Non-initiative player** moves their commander (up to 4 spaces)
3. Phase completes

### Commander Movement Rules

- **Maximum Distance**: 4 spaces per turn
- **Movement**: Can move orthogonally or diagonally
- **Can Move Through**: Empty spaces, friendly units
- **Cannot Move Through**: Enemy units, engaged spaces
- **No Facing**: Commanders don't have facing (move any direction)

### Why It Matters

Commanders provide persistent effects and boosts throughout the round. The exact effects depend on the card and commander position. Position your commander strategically where you need the effects, but keep them safe from enemy units.

---

## Phase 3: Issue Commands

**Purpose**: Order your units to move or attack.

### Structure

This phase has two sub-phases for each player:

1. **Issue Commands** (Initiative player first)
   - Issue all commands you want to give
   - Commands come from your active card's command type
   - Commands typically affect multiple units (the card specifies which units and conditions)

2. **Resolve Commands** (Initiative player first)
   - Resolve each command you issued
   - Movement: Move the unit
   - Ranged Attack: Perform the attack

3. **Repeat** for non-initiative player

### Movement Commands

**When**: Your active card has "Movement" command type

**Process**:

1. Your card specifies which units can be commanded and any range/conditions
2. Issue movement commands to eligible units (typically multiple units)
3. Move each unit using its Speed and Flexibility
4. If any unit moves into an enemy space → engagement begins (resolved in Phase 4)
5. Complete all movements

**Movement Rules** (see [Unit Movement](#unit-movement) for details):

- Units have **Speed** (forward moves) and **Flexibility** (turns)
- Can combine movement and turning in any order
- Can pass through friendly units if combined flexibility ≥ 4
- Cannot pass through enemies or engaged spaces

### Ranged Attack Commands

**When**: Your active card has "Ranged Attack" command type

**Process**:

1. Your card specifies which units can be commanded and any range/conditions
2. Issue ranged attack commands to eligible units (typically multiple units)
3. For each attack: Choose target, choose supporters (optional)
4. **Attacker commits a card** (discard from hand)
5. **Defender commits a card** (discard from hand)
6. Calculate attack value
7. Apply results (rout, retreat, reverse)

**Ranged Attack Details**:

- Attack value = attacker's attack + support bonuses
- Compare to target's Reverse/Retreat/Rout thresholds
- Apply all applicable results
- **Important**: Ranged attacks only happen if commanded. They don't resolve automatically—you must issue a ranged attack command.
- See [Combat Explained](#combat-explained) for complete rules

---

## Phase 4: Resolve Melee

**Purpose**: Resolve all engagements that occurred during movement.

### Step-by-Step

1. **Initiative player** chooses one engagement to resolve
2. Determine engagement type (Front, Flank, or Rear)
3. Resolve according to engagement type
4. **Alternate** choosing engagements until all are resolved
5. Phase completes

### Engagement Definition and Timing

**Engagement**: The process of a unit **entering** a space containing an enemy unit. When this occurs, both units become **Engaged** and remain co-located in that space.

**Engaged Space**: A space containing two enemy units. No other units can move through or into an engaged space until the engagement is resolved.

**Engagement vs. Melee**:

- **Engagement** = Entering an enemy space (happens in Phase 3 during movement)
- **Melee** = Combat resolution of an engagement (happens in Phase 4)

**Timing**:

- Engagements are **created** during Phase 3 (Issue Commands) when a unit moves into an enemy space
- Engagements **persist** until resolved in Phase 4 (Resolve Melee)
- Both units remain in the same space during this time
- Phase 4 resolves all engagements through melee combat

### Engagement Types

Engagement type is determined by the relative facing of the **engaging unit** (the one that moved into the space) and the **defending unit** (the one already in the space):

**Front Engagement**: Engaging unit faces opposite the defending unit

- Defending unit's player can commit a card (optional)
- Defending unit can retreat (if possible)
- If defending unit doesn't retreat → melee combat occurs

**Flank Engagement**: Engaging unit faces orthogonal (90°) to defending unit

- Defending unit is **forced to rotate** to face engaging unit
- Melee combat occurs (defending unit cannot retreat)

**Rear Engagement**: Engaging unit approaches from behind defending unit

- Defending unit is **immediately routed**
- Apply rout penalties
- No melee combat occurs (engagement resolved)

See [Combat Explained](#combat-explained) for complete engagement and melee combat rules.

---

## Phase 5: Cleanup

**Purpose**: End-of-round maintenance and card recovery.

### Card Zones

Before detailing the steps, understand the card zones:

- **Hand**: Cards you can use (play, commit, etc.)
- **In Play**: Card currently active this round (moved to "Played" at cleanup start)
- **Played Area**: Cards that were "in play" since the last rally (available for rally)
- **Discard Pile**: Cards discarded during play (commitments, rout penalties, etc.)
- **Burnt Pile**: Cards permanently removed (burned during rally)

### Step-by-Step

**Step 1: Move Cards to Played Area** (happens first, for both players simultaneously)

- Cards currently "in play" move to the "played area"
- These cards remain in the played area until you decide whether to rally
- **Important**: Cards do NOT go to discard yet—they stay in the played area

**Step 2: Initiative Player Rally Decision**

- Choose to rally or not
- **If you choose to rally**:
  1. Shuffle your played area cards
  2. Randomly select one card to burn (permanently remove to burnt pile)
  3. Return all remaining played area cards to your hand
  4. Return all discarded cards to your hand
  5. Check unit support (see below)
  6. Resolve any rout penalties from unsupported units
- **If you choose NOT to rally**:
  - Cards in your played area remain there (they do not return to hand)
  - Unit support check is skipped entirely
  - No rout penalties are checked

**Step 3: Non-Initiative Player Rally Decision**

- Same process as Step 2
- **If you choose to rally**: Burn one, return played + discarded to hand, check support
- **If you choose NOT to rally**: Cards stay in played area, support check skipped

**Step 4: Round Ends**

- New round begins with Phase 1
- Cards remaining in played area from previous rounds stay there (they can be rallied in future cleanup phases)

**Important Notes**:

- **Unit support is ONLY checked after rallying**. If you don't rally, the support check is skipped entirely.
- **Cards in played area are NOT in your hand**. You cannot use them until you rally.
- **If you don't rally, your played cards accumulate in the played area** until you choose to rally in a future cleanup phase.

### Rallying

**To Rally** (when you choose to rally during cleanup):

1. Shuffle all cards in your **played area**
2. Randomly select one card to **burn** (permanently remove to burnt pile)
3. Return all remaining **played area** cards to your hand
4. Return all **discarded** cards to your hand
5. Check unit support (see below)

**Critical: Rallying is the ONLY way to get cards back into your hand.**

- Cards in "discarded" or "played area" are NOT in your hand
- **If your hand is empty, you lose immediately**—even if you have many cards in discard or played area
- You must rally to return cards to your hand, or you'll eventually run out
- Burning a card is the cost of getting your cards back
- **If you don't rally**: Cards stay in played area and cannot be used until you rally in a future cleanup phase

### Unit Support Check

**Only happens after rallying.** If you didn't rally, skip this entirely.

After rallying, check unit support:

1. **Look at cards in your hand**
   - Each card lists unit type IDs it "preserves" (exact matches only)
   - Collect all preserved unit type IDs → your **supported type IDs**

2. **Look at units on the board**
   - Group by unit type ID (each unit has a specific type ID)

3. **Find broken units**
   - For each unit type ID on board:
     - If that type ID is NOT in your supported type IDs → **broken**
   - All instances of broken unit type IDs rout immediately

4. **Resolve rout penalties**
   - For each routed unit, discard cards equal to rout penalty
   - **Loss check**: If you don't have enough cards in hand to pay → **you lose immediately**

**Example**:

> Your hand has cards preserving: Swordsmen, Spearmen, Cavalry  
> Your board has: 2× Swordsmen, 1× Spearmen, 1× Archers  
> **Result**: Archers rout (not preserved). Discard cards equal to Archer rout penalty.

---

## Combat Explained

### How Combat Works

Combat happens in two ways:

1. **Melee**: Resolves engagements (when units occupy the same space)
2. **Ranged**: Units attack from a distance (must be commanded)

Both use the same resolution system: compare attack value to defense thresholds.

### Attack Value Calculation

**Base Attack** = Unit's attack stat

**+ Support Bonuses** (see [Support in Combat](#support-in-combat) for details):

- **Melee Support**: Calculated from adjacent friendly units (see [Melee Support](#melee-support))
- **Ranged Attack Support**: Supporting units chosen by attacker (see [Ranged Attack Support](#ranged-attack-support))
- Support values differ between melee and ranged attacks

**+ Card Modifiers**:

- **Active card's command modifiers** (if unit was commanded)
  - Applied only to units that received a command this round
  - Examples: +1 attack, +1 speed, etc.
- **Round effect modifiers** (if applicable)
  - Ongoing effects while card is in play
  - May have restrictions (unit types, inspiration range from commander, etc.)
  - Examples: All cavalry +1 speed, All spearmen +1 defense (within commander range)
- **Committed card modifiers** (for ranged attacks)
  - Cards committed during ranged attacks can provide modifiers
  - Attacker and defender each commit a card
  - Committed cards specify which modifier types they apply (range, attack, flexibility)
  - These modifiers are applied to the attack calculation

**+ Terrain Effects** (if applicable)

**Final Attack Value** = Base + Support + Modifiers + Terrain

### Defense Thresholds

Each unit has three thresholds:

- **Reverse**: Attack ≥ this → unit reverses (turns 180°)
- **Retreat**: Attack ≥ this → unit retreats
- **Rout**: Attack ≥ this → unit routs (removed from board)

**Multiple Results**: If attack value meets multiple thresholds, results are applied in priority order: **Rout → Retreat → Reverse**. Rout removes the unit immediately, so retreat and reverse are not physically applied (though they would have occurred if the unit hadn't routed).

### Melee Combat Procedure

**When**: Resolving a Front engagement where defender doesn't retreat, or a Flank engagement after forced rotation

**Melee is bidirectional**: Both units attack each other simultaneously. Each unit's attack is calculated and applied to the other unit.

**Step-by-Step Resolution**:

1. **Engagement type already determined** (from when engagement was created in Phase 3)
   - Front: Engaging unit faces opposite defender
   - Flank: Engaging unit faces orthogonal to defender (defender forced to rotate)
   - Rear: Engaging unit from behind (defender immediately routed, no melee—skip this procedure)

2. **Commitment step** (for Front and Flank engagements)
   - Defending unit's player may commit a card (optional) to provide temporary modifiers
   - Engaging unit's player may commit a card (optional) to provide temporary modifiers
   - Committed cards provide modifiers to attack/defense/flexibility
   - Both players decide simultaneously (or in initiative order if needed)

3. **Calculate attack values** (for both units)
   - Attacker's attack value: Base + Support + Modifiers
   - Defender's attack value: Base + Support + Modifiers
   - Both calculations happen simultaneously

4. **Compare to thresholds** (for both units)
   - Engaging unit's attack value vs. Defending unit's thresholds (reverse, retreat, rout)
   - Defending unit's attack value vs. Engaging unit's thresholds (reverse, retreat, rout)

5. **Apply results in priority order** (for each unit independently):
   - **Rout** (if attack ≥ rout threshold): Unit removed from board, owner discards rout penalty cards
   - **Retreat** (if attack ≥ retreat threshold): Unit moves to retreat destination
   - **Reverse** (if attack ≥ reverse threshold): Unit's facing flips 180°

**Result Priority**: Rout is applied first. If a unit routs, it is removed immediately. Retreat and reverse are not applied to routed units (they're already gone), though they would have applied if the unit hadn't routed.

**Example**:

> **Attacker**: Attack 5, +2 support = **7 total**  
> **Defender**: Attack 4, +1 support = **5 total**  
> **Defender's thresholds**: Reverse 3, Retreat 4, Rout 6  
> **Attacker's thresholds**: Reverse 2, Retreat 3, Rout 5
>
> **Results**:
>
> - Defender: Routed (7 ≥ 6), also retreats and reverses (but routed, so removed)
> - Attacker: Routed (5 ≥ 5), also retreats and reverses (but routed, so removed)
> - Both units removed, both owners discard rout penalty cards

### Ranged Attacks

**When**: Unit with Range > 0 attacks a target within range (must be commanded)

**Process**:

1. Attacking unit's player chooses target (within range)
2. Attacking unit's player chooses supporters (optional)
3. **Both players commit cards** (discard from hand to discard pile)
   - Attacking player commits a card (required)
   - Defending player commits a card (required)
   - Committed cards provide temporary modifiers (range, attack, flexibility)
4. Calculate attack value (attacking unit only)
5. Compare to target unit's thresholds
6. Apply results in priority order: **Rout → Retreat → Reverse**

**Differences from Melee**:

- Requires commitments from both players (both required, not optional)
- Can attack from distance
- Target doesn't fight back (one-way attack)
- **Engaged units cannot perform ranged attacks** (units in an engaged space cannot be commanded to ranged attack)

**Line of Sight**: No line of sight rules. Range is the only constraint. If a target is within range, it can be attacked.

**Important**: Ranged attacks only happen if commanded during Phase 3. They do not resolve automatically.

### Support in Combat

Support works differently for melee and ranged attacks.

#### Melee Support

**Supporting Units Must Be**:

- Adjacent to the attacking unit (orthogonal or diagonal)
- Not in spaces behind the attacking unit
- Not engaged themselves
- Friendly (same player)
- Diagonally adjacent units must have clear diagonal (not blocked by enemy units)

**Support Values**:

- **Strong Support (+2)**: Supporting unit faces the attacking unit (attacking unit is in supporting unit's front spaces)
- **Weak Support (+1)**: Supporting unit flanks the attacking unit (attacking unit is in supporting unit's flanking spaces)
- **No Support (0)**: Supporting unit is behind the attacking unit or not adjacent

**Melee Support Example**:

```
    [S]  [S]
      \  /
       [U] → attacks enemy
```

> Unit `U` attacks in melee.  
> Unit `S` (left) faces `U` → +2 support  
> Unit `S` (right) flanks `U` → +1 support  
> **Total support**: +3  
> **Final attack** = U's attack + 3

#### Ranged Attack Support

**Supporting Units**:

- Attacker chooses which units provide support (from `supportingUnits` set)
- Supporting units are specified when the ranged attack is declared
- Support calculation may differ from melee (see [Appendix: Geometric Resolution](#appendix-geometric-resolution))

**Note**: Ranged attack support rules may differ from melee. The exact calculation depends on how supporting units are chosen and positioned relative to the attacker.

### Engagement Types in Detail

#### Front Engagement

**Condition**: Engaging unit faces opposite the defending unit

**Resolution** (during Phase 4):

1. Engagement type was determined when the engagement was created (in Phase 3)
2. **Commitment step** (optional for both players):
   - Defending unit's player may commit a card (optional) to provide temporary modifiers
   - Engaging unit's player may commit a card (optional) to provide temporary modifiers
3. **Defending unit retreat decision**:
   - Check if defending unit can retreat (must have legal retreat space)
   - If defending unit can retreat: Defending unit's player chooses to retreat or stay and fight
   - If retreating: Defending unit's player chooses retreat destination, unit moves, engagement ends (no melee)
   - If defending unit cannot retreat or player chooses not to: Proceed to melee combat
4. **Melee combat** (if defending unit doesn't retreat):
   - Both units attack each other simultaneously
   - Follow [Melee Combat Procedure](#melee-combat-procedure)

**Retreat Rules**:

- Defending unit must have a legal retreat space (behind the unit, reachable with movement)
- Retreat is a backward movement using normal movement rules
- If no legal retreat space exists → defending unit must stay and fight
- If defending unit retreats, engagement ends immediately (no melee combat occurs)

#### Flank Engagement

**Condition**: Engaging unit faces orthogonal (90°) to defending unit

**Resolution** (during Phase 4):

1. Engagement type was determined when the engagement was created (in Phase 3)
2. **Defending unit is forced to rotate** to face the engaging unit (defending unit's facing changes to opposite of engaging unit)
3. **Commitment step** (optional for both players):
   - Defending unit's player may commit a card (optional) to provide temporary modifiers
   - Engaging unit's player may commit a card (optional) to provide temporary modifiers
4. **Melee combat occurs**:
   - Defending unit cannot retreat from flank engagements
   - Both units attack each other simultaneously
   - Follow [Melee Combat Procedure](#melee-combat-procedure)

**Why It's Dangerous**:

- Defending unit loses facing advantage (forced to rotate)
- Cannot retreat
- Often leads to rout

#### Rear Engagement

**Condition**: Engaging unit approaches from behind defending unit

**Resolution** (during Phase 4):

1. Engagement type was determined when the engagement was created (in Phase 3)
2. **Defending unit is immediately routed** (no melee combat occurs)
3. Apply rout penalties (defending unit's owner discards cards equal to rout penalty)
4. Engagement resolved (no melee combat needed)

**Why It's Devastating**:

- Instant rout (no chance to fight back)
- Full rout penalties apply
- No commitment or melee combat phase

---

## Advanced Concepts

### Unit Movement

Units move using two resources: **Speed** and **Flexibility**.

**Speed**: Used for forward movement (moving in the direction you're facing)

- Each space moved forward costs 1 speed
- Can move forward multiple spaces in one turn

**Flexibility**: Used for changing facing (rotating)

- Each 45° rotation costs 1 flexibility
- Can rotate multiple times in one turn

**Combining Movement and Turning**:

- You can move forward, then turn, then move forward again
- You can turn, then move, then turn again
- Use speed and flexibility in any order

**Passing Through Friendly Units**:

- If you want to move through a friendly unit's space:
  - Your flexibility + their flexibility must be ≥ 4
  - If so, you can pass through
  - If not, you cannot pass through
  - **You may NOT end your movement in a space occupied by a friendly unit**
  - If passing through multiple friendly units, check the combined-flexibility condition for each pass-through

**Cannot**:

- Move through enemy units
- Move through **engaged spaces** (spaces containing two enemy units fighting)
- End movement in a space occupied by a friendly unit
- End movement in an illegal space

### Unit Facing

Units face one of 8 directions:

- **Cardinal**: North, South, East, West
- **Diagonal**: Northeast, Northwest, Southeast, Southwest

**Facing Matters For**:

- **Movement**: Forward vs. backward
- **Engagements**: Front vs. flank vs. rear
- **Support**: Units must face correctly to provide support

**Changing Facing**:

- Costs flexibility (1 per 45°)
- Can turn multiple times
- Can turn before, during, or after movement

### Card Modifiers

Cards can modify unit stats:

**Command Modifiers**:

- Applied to units that were commanded this round
- Only active if the unit received a command
- Examples: +1 attack, +1 speed, etc.

**Round Effects**:

- Ongoing effects while card is in play
- **Always active** (unlike command modifiers which only apply to commanded units)
- May have restrictions that limit which units benefit:
  - **Unit type restrictions**: Only certain unit types benefit
  - **Trait restrictions**: Only units with certain traits benefit
  - **Inspiration range restrictions**: Only units within X spaces of commander benefit
- Examples:
  - All cavalry +1 speed (no restrictions)
  - All spearmen +1 defense (within 3 spaces of commander)

**Modifier Application Order**:

1. **Base stat** from unit
2. **Round effect modifiers** (if applicable, with restrictions checked)
3. **Command modifiers** (if unit was commanded)
4. **Committed card modifiers** (for ranged attacks, from committed cards)
5. **Terrain effects** (if applicable)
6. **Final stat** = base + all applicable modifiers

### Retreat Movement

When a unit retreats, it moves backward:

**Retreat Rules**:

- Must move to a legal space behind the unit
- Uses normal movement rules (speed, flexibility)
- Cannot retreat into enemy units
- If no legal retreat space → unit cannot retreat

**Retreat Destinations**:

- Spaces behind the unit (opposite facing)
- Must be reachable with remaining movement
- Player chooses from legal retreat options

---

## Unit Support System

### The Core Concept

**Units must be preserved by cards in your hand.**

Each card lists **unit type IDs** it "preserves" (exact matches only). If a unit type has no preserving cards in your hand, all units of that type rout automatically.

### Unit Type Matching

**Exact-Type Model**: Cards preserve specific unit type IDs. There is no hierarchy or inheritance.

- Each unit has a unique **unit type ID** (e.g., `"hastati-001"`, `"cavalry-002"`)
- Each card lists specific unit type IDs it preserves (e.g., `["hastati-001", "principes-001"]`)
- A unit is supported if **at least one card in your hand** lists that unit's exact type ID
- **No partial matches**: A card preserving `"hastati-001"` does NOT preserve `"hastati-002"` or any other unit type

**Example**:

- Card A preserves: `["hastati-001", "principes-001"]`
- Card B preserves: `["cavalry-001"]`
- Your board has: 2× `hastati-001`, 1× `hastati-002`, 1× `cavalry-001`
- **Result**: `hastati-001` units are supported (Card A), `cavalry-001` is supported (Card B), but `hastati-002` routs (no card preserves it)

### How It Works

**During Cleanup Phase** (after rallying):

1. **Check Your Hand**
   - Look at all cards currently in your hand
   - Each card has a "unit preservation" list
   - Collect all unit types listed → your **supported types**

2. **Check Your Board**
   - Look at all your units on the board
   - Group by unit type

3. **Find Broken Units**
   - For each unit type on board:
     - If that type is NOT in your supported types → **broken**
   - All instances of broken unit types rout immediately

4. **Resolve Rout Penalties**
   - For each routed unit, discard cards equal to its rout penalty
   - If you don't have enough cards → **you lose immediately**

### Example

**Your Hand Contains**:

- Card A: Preserves `["swordsmen-001", "spearmen-001"]`
- Card B: Preserves `["swordsmen-001", "cavalry-001"]`
- Card C: Preserves `["skirmishers-001"]`

**Your Supported Type IDs**: `swordsmen-001`, `spearmen-001`, `cavalry-001`, `skirmishers-001`

**Your Units on Board**:

- 2× `swordsmen-001` ✅ (supported by Card A or B)
- 1× `spearmen-001` ✅ (supported by Card A)
- 1× `cavalry-001` ✅ (supported by Card B)
- 1× `skirmishers-001` ✅ (supported by Card C)
- 1× `archers-001` ❌ (NOT supported → ROUTS)

**Result**: The `archers-001` unit routs. Discard cards equal to its rout penalty. If you don't have enough cards in hand, you lose immediately.

### Strategic Implications

**Hand Management**:

- Keep cards that preserve your important units
- Don't discard cards that preserve units you have on the board
- Plan ahead: What units will you have next round?

**Unit Diversity**:

- Having many different unit types requires diverse card support
- Specialized armies (few unit types) are easier to support
- Mixed armies require more card diversity

**Rally Decisions**:

- Rallying burns a card (permanently removes it)
- Burning a card might break unit support
- Weigh the benefit (getting cards back) vs. risk (losing support)

**Rout Penalties**:

- Important units (high rout penalty) cost more when they rout
- Losing a high-penalty unit can be devastating
- Protect important units or accept the card cost

---

## Quick Reference

### Round Structure

| Phase                  | Who Acts                    | What Happens                            |
| ---------------------- | --------------------------- | --------------------------------------- |
| **1. Play Cards**      | Both (simultaneous)         | Choose cards, reveal, assign initiative |
| **2. Move Commanders** | Initiative → Non-initiative | Move commanders (max 4 spaces)          |
| **3. Issue Commands**  | Initiative → Non-initiative | Issue and resolve commands              |
| **4. Resolve Melee**   | Alternating                 | Resolve all engagements                 |
| **5. Cleanup**         | Initiative → Non-initiative | Rally, discard, check support           |

### Initiative

- **Lower initiative value wins** (1 beats 2, 2 beats 3, etc.)
- **Tie**: Current holder keeps initiative
- **Initiative player acts first** in all subsequent phases

### Movement

| Resource        | Use              | Cost               |
| --------------- | ---------------- | ------------------ |
| **Speed**       | Forward movement | 1 per space        |
| **Flexibility** | Change facing    | 1 per 45° rotation |

**Passing Through Friendly Units**: Combined flexibility ≥ 4

### Combat Thresholds

| Result      | Condition        | Effect                        |
| ----------- | ---------------- | ----------------------------- |
| **Reverse** | Attack ≥ Reverse | Unit turns 180°               |
| **Retreat** | Attack ≥ Retreat | Unit retreats                 |
| **Rout**    | Attack ≥ Rout    | Unit removed, discard penalty |

### Engagement Types

| Type      | Condition                      | Effect                            |
| --------- | ------------------------------ | --------------------------------- |
| **Front** | Engaging unit faces opposite   | Defending unit can retreat        |
| **Flank** | Engaging unit faces orthogonal | Defending unit forced to rotate   |
| **Rear**  | Engaging unit from behind      | Defending unit immediately routed |

### Support Values (Melee)

| Type       | Condition                           | Bonus |
| ---------- | ----------------------------------- | ----- |
| **Strong** | Supporting unit faces attacker      | +2    |
| **Weak**   | Supporting unit flanks attacker     | +1    |
| **None**   | Supporting unit behind/not adjacent | 0     |

**Note**: Ranged attack support may work differently. See [Support in Combat](#support-in-combat) for details.

### Commander Movement

- **Maximum**: 4 spaces per turn
- **Can**: Move through empty spaces, friendly units
- **Cannot**: Move through enemies, engaged spaces
- **No Facing**: Move any direction

### Card States

```
In Hand → Awaiting Play → In Play → Played → Discarded
                                    ↓
                                  Burnt (permanent)
```

### Victory Condition

**Win when opponent's hand is empty.**

Cards leave hand when:

- Committed (ranged/melee) → go to discard (return on rally)
- Discarded for rout penalties → go to discard (return on rally)
- Burnt for rally → permanently removed
- Played → go to played area (return on rally, unless burnt)

**Loss occurs when**: Cannot pay required cost, or hand empty at start of Phase 1

---

## Common Questions

### Movement

**Q: Can I move through my own units?**  
A: Yes, if your combined flexibility + their flexibility ≥ 4.

**Q: Can I move backward?**  
A: Normal movement is forward only (in the direction you're facing). Use flexibility to turn first, then move forward. However, retreats (which happen during engagements or from attacks) do move backward—but those are combat results, not normal movement commands.

**Q: Can I move and then turn?**  
A: Yes, you can use speed and flexibility in any order.

**Q: What if I can't move through a friendly unit?**  
A: You must go around them or find another path.

### Combat

**Q: Can I attack and then move?**  
A: No, ranged attacks are resolved during Issue Commands phase. Movement happens separately. Commands are issued and resolved in sequence, but you cannot move a unit after it performs a ranged attack in the same phase.

**Q: Can engaged units perform ranged attacks?**  
A: No, units in an engaged space (two enemy units in the same space) cannot be commanded to perform ranged attacks. They must resolve the engagement first.

**Q: What if attack value meets multiple thresholds?**  
A: All applicable results happen. However, practically speaking, after a unit is routed (removed from board), there's nothing left to retreat or reverse. Rout is the most severe result and removes the unit immediately.

**Q: Can I retreat from a flank engagement?**  
A: No, flank engagements force rotation and cannot be retreated from.

**Q: What if I can't retreat?**  
A: You stay and fight. All melee combat is resolved in the Resolve Melee phase.

### Cards

**Q: What happens if I run out of cards?**  
A: You lose immediately if your **hand** is empty. Your hand represents your army's will to fight. You can still lose even if you have many cards in discard or played—only cards in your hand count.

**Q: Can I rally if I have no cards in hand?**  
A: You can rally if you have cards in your **played area** (since you burn from played area). However, if you have no cards anywhere (hand, played area, and discard all empty), you've already lost. **Note**: If your hand is empty but you have cards in played area, you can rally to get them back—but you must have at least one card in played area to burn.

**Q: Do committed cards come back?**  
A: Committed cards go to your **discard pile** (not permanently removed). They return to your hand when you rally, just like other discarded cards. Committed cards are safe from being burned during rally (only cards in the **played area** can be burned).

**Q: What if I don't have a card that preserves my units?**  
A: Unit support is checked **after** rallying, so all your cards (from both played area and discard pile) will be in your hand at that moment. If you still don't have a card preserving a unit type after rallying, all units of that type rout. This means you truly don't have any such cards anywhere in your deck. **Note**: If you don't rally, unit support is not checked, so units remain on the board even if you have no preserving cards in hand.

### Unit Support

**Q: When is unit support checked?**  
A: Only after rallying during Cleanup phase. If you don't rally, the support check is skipped entirely.

**Q: What if I have multiple units of the same type?**  
A: If that type loses support, ALL units of that type rout (not just one).

**Q: Can I prevent unit support loss?**  
A: Keep cards in your hand that preserve your unit types. Don't discard them unnecessarily.

**Q: What if I can't pay rout penalties?**  
A: You lose immediately if you don't have enough cards to pay rout penalties.

### General

**Q: Can I skip phases?**  
A: No, all phases must be completed in order. Each phase has specific steps that must be resolved, even if some steps have no actions (e.g., Phase 4 completes immediately if there are no engagements).

**Q: What if there are no engagements?**  
A: Phase 4 (Resolve Melee) always happens but completes immediately with no engagements to resolve. All engagements are resolved every round, but ranged attacks only happen if commanded.

**Q: Can commanders be attacked?**  
A: Commanders can be lost if caught in combat (specific rules may vary by scenario).

---

## Glossary

**Commander**: Special piece that moves on the board and provides persistent effects and boosts throughout the round. The exact effects depend on the card and commander position.

**Commitment**: Discarding a card from your hand to provide a temporary boost (ranged attack modifiers, engagement defense, etc.).

**Engagement**: The process of a unit entering a space containing an enemy unit. Both units become "engaged" and remain co-located until resolved. Engagements are created in Phase 3 (movement) and resolved in Phase 4 (melee combat).

**Flexibility**: Resource used for changing unit facing. Each 45° rotation costs 1 flexibility.

**Melee**: The combat resolution system used to resolve engagements. Both units attack each other simultaneously. Melee occurs in Phase 4 when resolving engagements.

**Initiative**: Turn order determined by comparing card initiative values. Lower values act first.

**Inspiration Range**: Commanders provide persistent effects and boosts throughout the round. The exact effects and range depend on the card and commander position. Commanders are positioned strategically to provide effects where needed, but kept safe from enemy units.

**Rally**: The ONLY way to get cards back into your hand. Shuffle your played cards, randomly burn one (permanently remove it), then return all remaining played cards and all discarded cards to your hand. Unit support is only checked after rallying—if you don't rally, support check is skipped. **Critical**: If your hand is empty, you lose immediately, even if you have many cards in discard.

**Rout**: Unit is removed from the board. Owner discards cards equal to the unit's rout penalty.

**Speed**: Resource used for forward movement. Each space moved forward costs 1 speed.

**Support**: Adjacent friendly units providing combat bonuses to an attacking unit.

**Unit Preservation**: System where cards in your hand must "preserve" unit types. Unpreserved unit types rout automatically.

---

## Appendix: Geometric Resolution

This appendix explains the geometric rules for movement, facing, and support calculations.

### Adjacency

**Adjacent spaces** are all spaces that share an edge or corner with a given space:

- **Orthogonally adjacent**: 4 spaces (North, South, East, West)
- **Diagonally adjacent**: 4 spaces (Northeast, Northwest, Southeast, Southwest)
- **Total adjacent**: Up to 8 spaces

**Example** (unit at `E-5`):

```
    D-4  D-5  D-6
    E-4 [E-5] E-6
    F-4  F-5  F-6
```

- Orthogonal: `D-5`, `E-4`, `E-6`, `F-5`
- Diagonal: `D-4`, `D-6`, `F-4`, `F-6`

### Unit Facing and Directions

Units face one of 8 directions. Each facing has:

**Front Spaces** (3 spaces):

- The facing direction itself
- The two adjacent facings (45° to either side)

**Flanking Spaces** (2 spaces):

- The two orthogonal facings (90° to either side)

**Back Spaces** (3 spaces):

- Opposite of front spaces (180° from facing)

**Example** (unit facing North at `E-5`):

```
    D-4  D-5  D-6  (front spaces)
    E-4 [E-5] E-6  (flanking spaces)
    F-4  F-5  F-6  (back spaces)
```

- Front: `D-4`, `D-5`, `D-6` (North, Northwest, Northeast)
- Flanking: `E-4`, `E-6` (West, East)
- Back: `F-4`, `F-5`, `F-6` (Southwest, South, Southeast)

### Diagonal Movement

**Diagonal movement** requires passing through an orthogonal space. This is a **legality constraint**, not an extra movement cost.

**Rule**: Diagonal movement counts as **1 space of movement** (costs 1 speed), but is only legal if at least one of the two shared orthogonal spaces is traversable.

**When moving diagonally**:

1. Identify the two shared orthogonal spaces between your current space and the diagonal destination
2. At least one of these orthogonal spaces must be legal to move through (using normal pass-through rules)
3. The diagonal destination space must be legal to move into
4. Diagonal movement costs **1 speed** (same as orthogonal movement)

**Example** (moving from `E-5` to `D-4` diagonally):

- Shared orthogonal spaces: `D-5` and `E-4`
- Must be able to move through at least one of these (checking pass-through rules for each)
- Diagonal move to `D-4` costs **1 speed** (not 2)
- Then can move into `D-4` if it's legal

**Why**: This prevents "teleporting" through corners and ensures realistic movement, while keeping diagonal movement cost the same as orthogonal.

### Diagonal Support Blocking

For **melee support**, diagonally adjacent supporting units can be blocked by enemy units.

**Rule**: A diagonally adjacent unit can provide support only if the diagonal is "clear."

**Diagonal is clear** if:

- The two shared orthogonal spaces between the attacking unit and the supporting unit
- Have at most one enemy unit total
- If both shared spaces have enemy units → diagonal is blocked

**Example**:

```
    [E]  [S]
      \  /
       [U] → attacks
```

- `U` (attacking unit) at `E-5`, `S` (supporting unit) at `D-4` (diagonal)
- Shared orthogonal spaces: `D-5` and `E-4`
- If both `D-5` and `E-4` have enemy units → `S` cannot support
- If only one (or neither) has enemy units → `S` can support

**Orthogonal support** is never blocked (orthogonal units always provide support if they meet other requirements).

### Melee Support Geometry

**Supporting units must be**:

1. **Adjacent** (orthogonal or diagonal)
2. **Not behind** the attacking unit (exclude back spaces)
3. **Not engaged** themselves
4. **Friendly** (same player)
5. **Diagonally clear** (if diagonal, diagonal must not be blocked)

**Support value**:

- **Strong Support (+2)**: Supporting unit faces the attacker
  - Attacker is in supporting unit's **front spaces** (facing direction or adjacent facings)
- **Weak Support (+1)**: Supporting unit flanks the attacker
  - Attacker is in supporting unit's **flanking spaces** (orthogonal to facing)
- **No Support (0)**: Supporting unit is behind or not adjacent

**Example**:

```
    [S1]     [S2]
      \      /
       [U] → attacks enemy
```

- `U` at `E-5` facing East
- `S1` at `D-4` (diagonal, northwest)
- `S2` at `D-6` (diagonal, northeast)

**For S1** (supporting unit at `D-4`):

- Check if diagonal is clear (shared spaces: `D-5`, `E-4`)
- If clear: Check if `E-5` (attacking unit U) is in S1's front or flanking spaces
- If S1 faces South: `E-5` is in front → +2 support
- If S1 faces East: `E-5` is flanking → +1 support

**For S2** (supporting unit at `D-6`):

- Same process
- Diagonal must be clear (shared spaces: `D-5`, `E-6`)

### Ranged Attack Support

Ranged attack support works differently from melee:

- Supporting units are **chosen by the attacker** when declaring the ranged attack
- Supporting units are specified in the `supportingUnits` set
- The exact calculation of support value may differ from melee
- See specific card rules or game documentation for ranged attack support calculations

**Note**: Ranged attack support may not require adjacency or may use different geometric rules than melee support.

### Movement Through Friendly Units

**Rule**: Combined flexibility ≥ 4

When moving through a friendly unit's space:

- Your flexibility + their flexibility must be ≥ 4
- This applies to both orthogonal and diagonal movement
- If combined flexibility < 4, you cannot pass through

**Example**:

- Your unit: Flexibility 2
- Friendly unit: Flexibility 2
- Combined: 4 → **Can pass through**

- Your unit: Flexibility 1
- Friendly unit: Flexibility 2
- Combined: 3 → **Cannot pass through**

**Why**: Represents units' ability to coordinate movement. Higher flexibility = more maneuverable = easier to pass through.

### Facing Changes

**Cost**: 1 flexibility per 45° rotation

**8 Directions**:

- Cardinal: N, S, E, W (0°, 90°, 180°, 270°)
- Diagonal: NE, NW, SE, SW (45°, 135°, 225°, 315°)

**Rotating**:

- N → NE: 1 flexibility (45°)
- N → E: 2 flexibility (90°)
- N → SE: 3 flexibility (135°)
- N → S: 4 flexibility (180°)

**Minimum rotation** between any two facings: 1-4 flexibility

---

## End of Rules

For questions, clarifications, or errata, please refer to the official rules engine documentation.

**Good luck, and may your hand never empty!**

---

_Prevail: Ancient Battles - Official Rulebook v1.0_
