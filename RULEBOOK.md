# Prevail: Ancient Battles
## Official Rulebook

---

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Object of the Game](#object-of-the-game)
4. [Setup](#setup)
5. [Gameplay Overview](#gameplay-overview)
6. [The Round Structure](#the-round-structure)
7. [Phase 1: Play Cards](#phase-1-play-cards)
8. [Phase 2: Move Commanders](#phase-2-move-commanders)
9. [Phase 3: Issue Commands](#phase-3-issue-commands)
10. [Phase 4: Resolve Melee](#phase-4-resolve-melee)
11. [Phase 5: Cleanup](#phase-5-cleanup)
12. [Core Concepts](#core-concepts)
13. [Combat & Engagements](#combat--engagements)
14. [Unit Support System](#unit-support-system)
15. [Quick Reference](#quick-reference)

---

## Overview

**Prevail: Ancient Battles** is a two-player tactical board game where players command armies of historical units. The game uses a card-based command system where your hand represents your army's will to fight—when your cards are gone, the battle is lost.

### Key Features

- **No Dice, No Tokens, No Measurement**: All outcomes are deterministic calculations. Movement uses discrete board spaces.
- **Card-Based Command**: Every action requires committing a card. Cards provide both command capability and initiative value.
- **Unit Support System**: Units must be preserved by cards in your hand. Units that lose support rout automatically.
- **Tactical Positioning**: Facing, flanking, and engagement rules reflect historical combat dynamics.

---

## Components

### The Board

The game uses a grid-based board with three size options:

| Board Type | Dimensions | Spaces | Rows | Columns |
|------------|------------|--------|------|---------|
| **Small**  | 8×12       | 96     | A-H  | 1-12    |
| **Standard**| 12×18      | 216    | A-L  | 1-18    |
| **Large**  | 24×36      | 864    | A-X  | 1-36    |

Coordinates are written as **Row-Column** (e.g., `E-5`, `A-1`, `L-18`).

### Units

Each unit has:
- **Stats**: Attack, Range, Speed, Flexibility, Reverse, Retreat, Rout
- **Traits**: Special characteristics (formation, mounted, skirmish, etc.)
- **Rout Penalty**: Number of cards discarded when the unit routs
- **Cost & Limit**: Army building constraints

### Command Cards

Each card has:
- **Initiative Value** (1-4): Determines turn order
- **Command**: Movement or Ranged Attack
- **Modifiers**: Stat bonuses for commanded units
- **Round Effect**: Ongoing effects while in play
- **Unit Preservation**: Which unit types this card supports

### Commanders

Each player has one commander that:
- Moves up to **4 spaces** per turn
- Provides "inspiration range" for issuing commands
- Can be lost if caught in combat

---

## Object of the Game

**You win by causing your opponent to run out of cards.**

If at any moment a player's hand has no cards remaining, they have lost the battle. Your hand represents your army's will to fight—when it's gone, the battle is over.

### How Cards Leave Your Hand

Cards are removed from your hand when:
- **Discarded for commitments**: Committing cards to actions
- **Discarded for rout penalties**: When important units rout
- **Burnt for rally**: Spending cards to rally units
- **Played and not returned**: Cards in play that aren't returned to hand

---

## Setup

1. **Choose Board Size**: Agree on Small, Standard, or Large board
2. **Place Board**: Set up the board between players
3. **Build Armies**: Each player selects units within their army's cost and limit constraints
4. **Place Units**: Deploy units on your side of the board (specific deployment rules may vary by scenario)
5. **Place Commanders**: Each player places their commander on the board
6. **Deal Starting Hands**: Each player receives their starting hand of command cards
7. **Determine First Initiative**: Randomly determine which player has initiative for the first round

---

## Gameplay Overview

The game is played in **rounds**. Each round consists of **5 phases** that must be completed in order:

1. **Play Cards** - Choose and reveal command cards
2. **Move Commanders** - Position commanders for command range
3. **Issue Commands** - Order units to move or attack
4. **Resolve Melee** - Resolve all engagements
5. **Cleanup** - Discard cards, rally, check unit support

After all 5 phases are complete, a new round begins. The game continues until one player runs out of cards.

---

## The Round Structure

### Phase Sequence

```
Round Start
    ↓
[1] Play Cards
    ↓
[2] Move Commanders
    ↓
[3] Issue Commands
    ↓
[4] Resolve Melee
    ↓
[5] Cleanup
    ↓
Round End → Next Round
```

**Important**: Phases must be completed in order. You cannot skip phases or return to previous phases.

---

## Phase 1: Play Cards

### Purpose
Choose which command card to play this round. The card's initiative value determines turn order, and its command determines what actions you can take.

### Steps

1. **Choose Card** (Both Players Simultaneously)
   - Each player secretly selects one card from their hand
   - Place it face-down in the "awaiting play" area

2. **Reveal Cards** (Automatic)
   - Both players' chosen cards are revealed simultaneously
   - Cards move from "awaiting play" to "in play"

3. **Assign Initiative** (Automatic)
   - Compare initiative values (1-4)
   - **Lower initiative value wins** (1 beats 2, 2 beats 3, etc.)
   - In case of a tie, the player who currently has initiative keeps it
   - The winner receives initiative for this round

4. **Complete**
   - Phase advances to Move Commanders

### Example

- **White** plays a card with initiative **2**
- **Black** plays a card with initiative **3**
- **White wins initiative** (lower value)
- White acts first in subsequent phases

---

## Phase 2: Move Commanders

### Purpose
Position your commander to extend your command range. Commanders must be within range of units to issue commands.

### Steps

1. **Move First Commander** (Initiative Player)
   - The player with initiative moves their commander
   - Commanders can move up to **4 spaces**
   - Movement uses the same adjacency rules as units (orthogonal and diagonal)

2. **Move Second Commander** (Non-Initiative Player)
   - The other player moves their commander
   - Same movement rules apply

3. **Complete**
   - Phase advances to Issue Commands

### Commander Movement Rules

- **Maximum Distance**: 4 spaces per turn
- **Movement Type**: Can move through empty spaces and friendly units
- **Cannot**: Move through enemy units or engaged spaces
- **No Facing**: Commanders don't have facing (they can move in any direction)

---

## Phase 3: Issue Commands

### Purpose
Order your units to move or perform ranged attacks. Units must be within your commander's "inspiration range" to receive commands.

### Structure

This phase has two sub-phases for each player:

1. **Issue Commands** (Initiative Player First)
   - Issue commands to units within commander range
   - Commands come from your active card (Movement or Ranged Attack)
   - Each command targets one unit

2. **Resolve Commands** (Initiative Player First)
   - Resolve each issued command
   - Movement commands: Move unit, potentially engage enemies
   - Ranged Attack commands: Perform ranged attacks

3. **Repeat for Non-Initiative Player**
   - Same process for the other player

4. **Complete**
   - Phase advances to Resolve Melee

### Command Types

#### Movement Command

1. **Choose Unit**: Select a unit within commander range
2. **Move Unit**: Unit moves according to its Speed and Flexibility
3. **Engagement Check**: If unit moves into an enemy space, engagement begins
4. **Complete Movement**: Finish movement or resolve engagement

#### Ranged Attack Command

1. **Choose Attacker**: Select a unit with Range > 0 within commander range
2. **Choose Target**: Select an enemy unit within range
3. **Choose Supporters**: Optionally select supporting units
4. **Commitments**: Both players commit cards (see [Commitments](#commitments))
5. **Resolve Attack**: Calculate attack value and apply results

### Command Range

Units must be within your commander's "inspiration range" to receive commands. The exact range calculation may vary, but generally units must be reasonably close to the commander.

---

## Phase 4: Resolve Melee

### Purpose
Resolve all engagements that occurred during movement. Engagements are resolved one at a time.

### Steps

1. **Choose Engagement** (Initiative Player)
   - Select one engagement to resolve
   - Engagements occur when units occupy the same space

2. **Resolve Engagement**
   - Determine engagement type (Front, Flank, or Rear)
   - Resolve according to engagement type
   - See [Combat & Engagements](#combat--engagements) for details

3. **Repeat**
   - Continue resolving engagements until all are resolved
   - Players alternate choosing which engagement to resolve

4. **Complete**
   - Phase advances to Cleanup

### Engagement Types

- **Front Engagement**: Attacker faces opposite defender
- **Flank Engagement**: Attacker faces orthogonal to defender
- **Rear Engagement**: Attacker approaches from behind

See [Combat & Engagements](#combat--engagements) for complete rules.

---

## Phase 5: Cleanup

### Purpose
Discard played cards, rally units, and check unit support. This phase ensures the game state is ready for the next round.

### Steps

1. **First Player Rally** (Initiative Player)
   - Player chooses whether to rally
   - If rallying: Burn a card, return played cards to hand
   - Check which units lost support
   - Resolve rout penalties if units lost support

2. **Second Player Rally** (Non-Initiative Player)
   - Same process for the other player

3. **Discard Played Cards**
   - Cards that were played this round are discarded
   - Cards that were committed are discarded
   - Cards that were burnt are permanently removed

4. **Check Unit Support**
   - For each player, check which unit types are no longer supported
   - Units that lost support rout automatically
   - See [Unit Support System](#unit-support-system) for details

5. **Complete**
   - Round ends
   - New round begins with Phase 1: Play Cards

---

## Core Concepts

### Units

#### Unit Stats

| Stat | Description |
|------|-------------|
| **Attack** | Base attack value for combat |
| **Range** | Maximum range for ranged attacks (0 = melee only) |
| **Speed** | Number of forward moves per turn |
| **Flexibility** | Number of facing changes per turn |
| **Reverse** | Threshold: attack value ≥ reverse causes unit to reverse |
| **Retreat** | Threshold: attack value ≥ retreat causes unit to retreat |
| **Rout** | Threshold: attack value ≥ rout causes unit to rout |

#### Unit Movement

Units move using two resources:
- **Speed**: Used for forward movement (moving in the direction you're facing)
- **Flexibility**: Used for changing facing (rotating to face a different direction)

**Movement Rules**:
- Units can move forward (consuming speed) or change facing (consuming flexibility)
- These can be combined in any order
- Units can move through friendly units if combined flexibility ≥ 4
- Units cannot move through enemy units or engaged spaces
- Units must end movement in a legal space

#### Unit Facing

Units have a facing direction (North, South, East, West, Northeast, Northwest, Southeast, Southwest). Facing matters for:
- Movement (forward vs. backward)
- Engagements (front vs. flank vs. rear)
- Support (units providing support must face correctly)

### Command Cards

#### Card Components

- **Initiative** (1-4): Lower values act first
- **Command**: Movement or Ranged Attack
- **Modifiers**: Stat bonuses applied to commanded units
- **Round Effect**: Ongoing effect while card is in play
- **Unit Preservation**: List of unit types this card supports

#### Card States

Cards exist in one of several states:
- **In Hand**: Available to be played
- **Awaiting Play**: Face-down, chosen but not revealed
- **In Play**: Face-up, active this round
- **Played**: Used this round, waiting to be discarded
- **Discarded**: Removed from hand, in discard pile
- **Burnt**: Permanently removed from game

### Commanders

Commanders are special pieces that:
- Move up to 4 spaces per turn
- Don't have facing (can move in any direction)
- Provide "inspiration range" for issuing commands
- Can be lost if caught in combat (specific rules may vary)

### Commitments

Many actions require **committing** cards. When you commit a card:
1. Choose a card from your hand
2. Discard it
3. The action is now "committed" and can proceed

**Commitments are required for**:
- Ranged attacks (both attacker and defender commit)
- Movement engagements (defender may commit)
- Other special actions as specified

---

## Combat & Engagements

### Engagement Types

Engagements occur when a unit moves into a space occupied by an enemy unit. The engagement type depends on the relative facing of the units.

#### Front Engagement

**Condition**: Attacker faces **opposite** the defender

**Resolution**:
1. Determine engagement type (automatic)
2. Defender may commit a card (optional)
3. Defender checks if they can retreat
4. If defender can retreat, they choose whether to retreat
5. If defender retreats, they choose retreat destination
6. If defender doesn't retreat, engagement continues
7. Resolve combat (if applicable)

#### Flank Engagement

**Condition**: Attacker faces **orthogonal** (90°) to the defender

**Resolution**:
1. Determine engagement type (automatic)
2. **Defender is forced to rotate** to face the attacker
3. Engagement is resolved (defender cannot retreat from flank)

#### Rear Engagement

**Condition**: Attacker approaches from **behind** the defender

**Resolution**:
1. Determine engagement type (automatic)
2. **Defender is immediately routed** (no combat resolution needed)
3. Apply rout penalties

### Combat Resolution

#### Melee Combat

Melee combat occurs during front engagements when the defender doesn't retreat.

1. **Calculate Attack Value**
   - Base attack value from attacking unit
   - Add support bonuses (see [Support](#support))
   - Apply card modifiers
   - Apply terrain effects (if applicable)

2. **Calculate Defense Values**
   - Get defender's Reverse, Retreat, and Rout thresholds
   - Apply card modifiers
   - Apply terrain effects (if applicable)

3. **Apply Attack**
   - Compare attack value to thresholds:
     - Attack ≥ Rout → Unit is routed
     - Attack ≥ Retreat → Unit retreats
     - Attack ≥ Reverse → Unit reverses (turns around)
   - Multiple results can occur (e.g., routed units also retreat)

4. **Resolve Results**
   - **Routed**: Unit is removed from board, rout penalty cards discarded
   - **Retreated**: Unit moves to retreat destination
   - **Reversed**: Unit's facing is flipped 180°

#### Ranged Attacks

Ranged attacks follow a different process:

1. **Choose Attacker & Target**
   - Attacker must have Range > 0
   - Target must be within range

2. **Choose Supporters**
   - Attacker may select supporting units
   - Supporters add to attack value

3. **Commitments**
   - Attacker commits a card
   - Defender commits a card

4. **Resolve Attack**
   - Calculate attack value
   - Compare to target's thresholds
   - Apply results (rout, retreat, reverse)

5. **Resolve Results**
   - Same as melee combat
   - Rout/retreat/reverse are resolved in priority order

### Support

Units can provide **support** to adjacent friendly units in combat.

#### Support Rules

- **Supporting units must be**:
  - Adjacent to the supported unit
  - Not engaged themselves
  - Friendly (same player)

- **Support Values**:
  - **Strong Support** (+2): Supporting unit faces the supported unit
  - **Weak Support** (+1): Supporting unit flanks the supported unit
  - **No Support** (0): Supporting unit is behind or not facing correctly

- **Support Calculation**:
  - Sum all support values from adjacent friendly units
  - Add to attack value

#### Example

```
    [S]  [S]
      \  /
       [U]
```

- Unit `U` is attacking
- Unit `S` (left) faces `U` → +2 support
- Unit `S` (right) flanks `U` → +1 support
- Total support: +3
- Final attack = base attack + 3

---

## Unit Support System

### How Support Works

Units must be **preserved** by cards in your hand. Each card has a list of unit types it preserves.

### Support Check

During the Cleanup phase, after rallying:

1. **Check Supported Types**
   - Look at all cards currently in your hand
   - Collect all unit types listed in "unit preservation"
   - This is your set of **supported unit types**

2. **Check Units on Board**
   - Look at all your units currently on the board
   - Group by unit type

3. **Find Broken Units**
   - For each unit type on board:
     - If that type is NOT in your supported types → **broken**
   - All instances of broken unit types rout immediately

4. **Resolve Rout Penalties**
   - For each routed unit, discard cards equal to its rout penalty
   - If you don't have enough cards, you lose immediately

### Example

**Your Hand Contains**:
- Card A: Preserves "Swordsmen", "Spearmen"
- Card B: Preserves "Swordsmen", "Cavalry"
- Card C: Preserves "Skirmishers"

**Your Supported Types**: Swordsmen, Spearmen, Cavalry, Skirmishers

**Your Units on Board**:
- 2× Swordsmen ✅ (supported)
- 1× Spearmen ✅ (supported)
- 1× Cavalry ✅ (supported)
- 1× Skirmishers ✅ (supported)
- 1× Archers ❌ (NOT supported → ROUTS)

**Result**: The Archer unit routs. Discard cards equal to its rout penalty.

### Strategic Implications

- **Hand Management**: Keep cards that preserve your important units
- **Unit Diversity**: Having many different unit types requires more diverse card support
- **Rally Decisions**: Rallying burns a card, potentially breaking unit support
- **Rout Penalties**: Important units (high rout penalty) cost more cards when they rout

---

## Quick Reference

### Round Structure

| Phase | Description | Key Actions |
|-------|-------------|-------------|
| **1. Play Cards** | Choose command cards | Choose card, reveal, assign initiative |
| **2. Move Commanders** | Position commanders | Move up to 4 spaces |
| **3. Issue Commands** | Order units | Move units or ranged attacks |
| **4. Resolve Melee** | Resolve engagements | Resolve all engagements |
| **5. Cleanup** | End of round | Rally, discard, check support |

### Initiative

- **Lower initiative value wins** (1 beats 2, 2 beats 3, etc.)
- **Tie**: Current holder keeps initiative
- **Initiative player acts first** in all subsequent phases

### Movement

| Resource | Use | Consumption |
|----------|-----|-------------|
| **Speed** | Forward movement | 1 per space moved forward |
| **Flexibility** | Change facing | 1 per 45° rotation |

**Passing Through Friendly Units**: Combined flexibility ≥ 4

### Combat Thresholds

| Result | Condition | Effect |
|--------|-----------|--------|
| **Reverse** | Attack ≥ Reverse threshold | Unit turns 180° |
| **Retreat** | Attack ≥ Retreat threshold | Unit moves to retreat space |
| **Rout** | Attack ≥ Rout threshold | Unit removed, discard penalty cards |

### Engagement Types

| Type | Condition | Effect |
|------|-----------|--------|
| **Front** | Attacker faces opposite | Defender can retreat |
| **Flank** | Attacker faces orthogonal | Defender forced to rotate |
| **Rear** | Attacker from behind | Defender immediately routed |

### Support Values

| Support Type | Condition | Bonus |
|--------------|-----------|-------|
| **Strong** | Supporting unit faces supported unit | +2 |
| **Weak** | Supporting unit flanks supported unit | +1 |
| **None** | Supporting unit behind or not adjacent | 0 |

### Commander Movement

- **Maximum Distance**: 4 spaces
- **Movement Type**: Any direction (no facing)
- **Cannot**: Move through enemies or engaged spaces

### Card States

```
In Hand → Awaiting Play → In Play → Played → Discarded
                                    ↓
                                  Burnt (permanent)
```

### Victory Condition

**You win when your opponent's hand is empty.**

Cards leave your hand when:
- Discarded for commitments
- Discarded for rout penalties
- Burnt for rally
- Played and not returned

---

## Glossary

**Commander**: Special piece that moves on the board and provides command range

**Commitment**: Discarding a card to enable an action (ranged attack, engagement defense, etc.)

**Engagement**: When two enemy units occupy the same space

**Flexibility**: Resource used for changing unit facing

**Initiative**: Turn order determined by card initiative values

**Inspiration Range**: Area around commander where units can receive commands

**Rally**: Spending a card to return played cards to hand and check unit support

**Rout**: Unit is removed from board, owner discards penalty cards

**Speed**: Resource used for forward movement

**Support**: Adjacent friendly units providing combat bonuses

**Unit Preservation**: System where cards in hand must "preserve" unit types or they rout

---

## End of Rules

For questions, clarifications, or errata, please refer to the official rules engine documentation or contact the game designers.

**Good luck, and may your hand never empty!**
