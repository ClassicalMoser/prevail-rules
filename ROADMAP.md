# Roadmap

This document charts the next features after the audit. The audit comes first and is out of scope here. These features are the next priority once it is done.

It records closed game-design decisions for terrain, line of sight, hidden units and setup. Each section says what the rule is and why. Open points are marked as open. How the code is organized is in [`DESIGN.md`](./DESIGN.md); this file is about the game.

## Guiding principles

- **No ad hoc rules or exceptions.** Fixes extend existing rules. Data, like a terrain table, may grow. Exceptions may not.
- **Tabletop is first class.** If a rule is hard to keep in your head at the table, it does not fit.
- **Rough ground should feel as annoying as it is.** The cost lives in the effect, not in the arithmetic.
- **Where to fight matters as much as how to fight and with which troops.** Every setup decision should be an interesting one.

---

## 1. Terrain

Terrain does four things: threshold (how much it disorders), speed limit (how much it slows), elevation and line of sight.

### 1.1 Threshold, speed limit and deficit

Each terrain has two numbers.

- **Threshold:** how much the ground disorders a unit. A unit whose flexibility is below the threshold has a **deficit** equal to the difference.
- **Speed limit:** how much the ground slows everyone, whatever their order.

| Terrain                                                 | Threshold | Speed limit |
| ------------------------------------------------------- | --------- | ----------- |
| Road                                                    | 0         | none        |
| Open                                                    | 1         | none        |
| Ploughed or irrigated fields, farmland with its ditches | 2         | 3           |
| Ford                                                    | 2         | 2           |
| Scrub                                                   | 3         | 3           |
| Stony                                                   | 3         | 3           |
| Mud                                                     | 3         | 2           |
| Light forest                                            | 4         | 2           |
| Crags                                                   | 4         | 2           |
| Bank                                                    | 4         | 2           |
| Marsh                                                   | 4         | 1           |
| Dense forest                                            | 5         | 1           |

- Limits are set per terrain by table, not by formula, so terrains that share a threshold can play differently. Names that share both numbers differ only in look.
- Threshold 2 is ground a long, rigid front cannot absorb, such as ditches and furrows. Plain crops and stubble hinder everyone alike and stay open ground.
- Stony and crags are two grades of rock. Stony is small, loose stone. Crags are large, broken rock.
- Marsh is water shallow enough to wade but too deep for easy passage (the Arno marshes, 217). Mud is its milder form.
- Stony and scrub share both numbers and differ only in look.
- No terrain sits at threshold 6.

**Deficit.** A unit takes its deficit as a penalty to every other stat while it is there: attack, the defense thresholds, speed and range.

### 1.2 Movement

- **Worst values count.** The highest threshold and the lowest speed limit in the move count, each on its own, even if they come from different spaces: the origin, any space passed through, or the destination.
- **Order: limit, deficit, modifiers.** Base speed is capped at the lowest speed limit. Then the deficit from the highest threshold applies, floored at 0. Then modifiers apply. So a speed bonus from a card or commit can move a unit the deficit had stopped, and can carry a unit past the limit. The result holds for the whole move, and only for the move. Afterward a unit's deficit comes only from the space it stands in.
- A step the reduced speed does not cover cannot be taken.
- **Diagonal moves.** A diagonal move counts as passing through one of the two orthogonal spaces it goes between, the mover's choice, and pays that space's terrain. A unit already cannot slip diagonally between two enemies; terrain works the same way. So no river can be crossed diagonally for free.
- **No exceptions by unit type.** Cavalry, elephants and chariots follow the same rule. Their lower flexibility does the work.
- **Lifts.** Cards and commits can lift a stat by 1. A speed-1, flexibility-1 unit such as a pike phalanx cannot enter threshold-2 ground without a lift. That is a penalty, not a bar: +1 is common, and a unit caught on bad ground between turns can suffer badly.
- **Nothing is impassable except the board edge.** Every terrain can be crossed by someone. Board space is deliberate. A flank that cannot be turned goes against the board edge.
- **Roads.** A road is threshold 0. It matters because cards can drop flexibility to 0. A rigid unit can trade flexibility for speed and march on a road without a deficit; off the road, even on open ground, it pays. A grand road is a linear feature of its own. Roads give the rigid player something to bid for, since scenarios should not always favor open order.

Worked examples, with no modifiers (speed, flexibility):

| Unit                 | Fields | Scrub | Light forest, bank | Dense forest |
| -------------------- | ------ | ----- | ------------------ | ------------ |
| Light horse (5, 3)   | 3      | 3     | 1                  | can't        |
| Close cavalry (4, 2) | 3      | 2     | can't              | can't        |
| Chariots (4, 1)      | 2      | 1     | can't              | can't        |
| Cataphracts (3, 1)   | 2      | 1     | can't              | can't        |
| Elephants (3, 1)     | 2      | 1     | can't              | can't        |
| Phalanx (1, 1)       | can't  | can't | can't              | can't        |

### 1.3 Elevation

- **Corners.** Each corner of a space is +1 (high), 0 (level) or −1 (low). Water settles to low places, so wet corners are −1.
- **Why corners.** Melee happens inside one space, never across a border. Elevation must vary within a space, or sustained melee would ignore it.
- **Two rules govern corner elevation.** No space has alternating corner elevations, because they decide nothing. A 2–2 split happens only on straight passages. The rest is application.
- **Melee.** Sum the corners behind each unit. The side with more gets +1, whatever the difference. Steep slopes were rare and hard to show on the table. A unit facing a corner compares fewer corners than one facing a side; the difference is marginal, so the rule takes no exception.
- **Shooting.** Sum all four corners of the shooter's space and of the target's space. A higher shooter gets +1 attack. A lower shooter takes −1 attack. +1 range was considered and is too strong.

### 1.4 Rivers

- **Water is low ground.** Wetness belongs to a space's own corner, not to the shared grid point, so neighbors can differ. Hills do not work this way.
- **Banks and fords.** Every space the river touches, on both sides, is bank (4) or ford (2). A river's depth shows in its mix: a shallow river is mostly ford, a deep one mostly bank.
- **No separate crossing cost.** Crossing costs what entering those spaces costs.
- **Diagonal rivers.** A 45° river alternates spaces with one low corner on one side and three on the other. A space the river touches only at a point on the outside of a bend stays dry.
- **Holding the bank.** The bank holder gets the elevation +1. Defending on the bank wins elevation but shares the bank's deficit. Defending one space back trades elevation for time.

### 1.5 Retreats

- Retreats use normal movement, so the terrain rules apply. A unit that cannot cover the ground behind it has no legal retreat and routs.
- A river at the back is a trap.
- A unit that retreats uphill gains elevation if re-engaged. One pushed off a crest loses it.
- A ridge in mid-field swings the +1 to whoever holds it (Cynoscephalae, 197).
- Board edges rarely come into play. Terrain will.

### 1.6 Tiles and the table

- **Discrete tiles.** Terrain comes on discrete pieces, at most 5 spaces in any direction to fit the box. Larger features come in several parts. Tiles never overlap and are never stacked.
- **Layers are printed.** Every layer (cover, elevation, water) is printed on the piece. Fewer layers are better.
- **Shapes.** Pieces are two-sided, with terrain on both faces, and asymmetrical, so each piece offers options. Almost none are perfectly rectangular, except perhaps 2×2s. Open pieces are the exception: they keep large denial and are closer to round or rectangular.
- **Elevation on the board.** Shade shows elevation: lighter for high, darker for low, with a gradient where a space slopes. Most spaces are one shade. In any space that is not level, a faint triangle marks a high corner and a faint circle a low one. Unit bases are octagonal, so corners are never covered.
- **No badges or numbers on the board.** The art identifies the terrain. Each scenario card lists its features with their thresholds and limits.
- **Clutter.** Open pieces may carry some cosmetic detail. Most battlefields should not look cluttered.

---

## 2. Line of sight

1. **Trace corner to corner.** Use any corner of the shooter's space and any corner of the target's space. One clear line gives sight.
2. **What blocks.** Light forest, dense forest, and a space higher than both ends, comparing the sums of each space's four corners.
3. **Any contact blocks.** A line that touches a blocking space anywhere, at an edge or a corner, is blocked. Contact at the line's own endpoints does not count. The target's own space always counts. So a unit can see out of a forest but not into one.
4. **Adjacent spaces** always have line of sight.
5. **Units never block sight.** Ranged attacks pass over all units, friend or enemy. Distance is the cost, through the range trades. No weapon is an exception.
6. **Engaged units cannot be targeted.** They can be shot over.

---

## 3. Hidden units

- **Components.** Each color has a matched set of up to about 10 numbered stands and numbered cards. Fewer might not be worthwhile.
- **Where.** At deployment, a space that is hidden and legal for deployment may take a stand instead of a unit. Black judges hidden spaces against White's deployment zone. White, deploying last, judges them against Black's actual deployment, stands included.
- **Decoys.** A stand's unit is committed face down to the card with the stand's number. A stand may also be a decoy with no unit. Not knowing which is the point.
- **Hidden units cannot move.**
- **Movement around stands.** Every stand counts as an enemy space for movement, so nothing passes through one.
- **Reveal.** A stand resolves when an opposing unit gains line of sight to it or becomes adjacent. Its owner may also reveal it after commander movement. The owner chooses its facing on reveal. From then on it behaves as a normal unit.
- **Moves are atomic.** A unit that wants to look before committing should stop short. Any stand a moving unit can now see resolves at the end of the move.
- **Moving into a stand.** A unit that moves directly into a stand's space reveals it. A real unit there must face the mover and resolve a front engagement. A decoy is removed and the move ends there.
- **Terrain does the limiting.** Stands only go in hidden spaces inside the owner's zone, so forests and reverse slopes. Most scenarios will offer few such spaces.

---

## 4. Setup (draft, closed in outline)

Most games play from a scenario. Position is bought by bidding command cards. Setup analysis paralysis is a known failure in games like this and must be avoided.

### 4.1 Scenario cards

- Each shows Black and White deployment zones, **primary terrain** used if the scenario is played, and **secondary terrain** used if it is not.
- There is no fixed number of features. A feature may be blank open ground.
- Weather-dependent features, such as mud, are primary only. The chosen scenario sets the day's conditions. Secondary terrain is standing landform.
- They are bought from the shared points pool. A list carries a fixed number, likely three, which brings an army to about 15 cards.
- Scenarios should be roughly on par. One scenario carrying a list is no fun. A consistently dominant one can be errata'd.
- They cannot be bid.
- A large or linear secondary feature is a reason to bid for White, and should be expensive.

### 4.2 The sequence

1. **Bid.**
   - The higher-points army bids first. Bidding first reveals intent, which compensates the smaller army. With equal points, a random player bids first.
   - The first bidder may open or cede the color choice to the opponent.
   - A bid is the total number of command cards a player has discarded, face down. Each raise must beat the opponent's total.
   - A bid may not leave a player with fewer than two cards in hand, since an empty hand loses.
   - Before raising, a player with two cards in hand may burn a random discarded card and return the rest to hand, then keep discarding. So burns take bids past 10, and again past 19.
   - Either player may pass at any time, conceding.
   - Discards return at the first rally. A burn is not a rally and triggers no support check, but the unit types its card protected are exposed at the next rally.
2. **Color.** The bid winner chooses. White has the initiative, as in chess.
3. **Veto.** White vetoes one of Black's scenario cards. The veto is why a list carries several scenarios. Black's second-best is a legitimate scenario, and a dominant one still has to be paid for against the chance it goes unvetoed.
4. **Scenario.** Black chooses the scenario from its remaining cards: deployment zones and primary terrain.
5. **White's terrain.** Knowing Black's scenario, White chooses which of its own scenario cards supplies the secondary terrain.
6. **Placement.**
   - Players alternate placing features, starting with White. A feature is one or more pieces placed together.
   - Each player places only features from their own card, in any order, and need not place them all.
   - Passing ends that player's placement for good. Open ground is the default, but the passing player no longer controls where it lies. An open piece buys that control. The player still holding features keeps the ability to react.
   - Features may touch the board edge but not each other, at an edge or a corner.
   - **Multi-part features** show clearly where their parts join. No other configuration is legal, and the shape is never rearranged.
   - A part may be placed instead of the whole feature only if its join point lies on the board edge, so the rest of the feature runs off the board.
   - A feature that cannot be placed at all is lost.
   - When one player runs out or passes, the other places the rest one after another, as far as they fit.
   - Large features claim the most space but risk not fitting if left late, so placement order is a real choice.
7. **Deployment.**
   - Black deploys first. White deploys last, seeing the whole board except what stands conceal.
   - Units may deploy into terrain, but not at a deficit unless every other space in the zone is taken.

### 4.3 Wording

Rule text describes what each color does. It never says a color is favored.

---

## 5. Deferred

- **Edge features.** Stakes and pavises, whose point is buying archers a shooting window. Fortifications, which are a property of the space, not of an edge.

---

## 6. Next features

The audit must be complete before this work starts.

### 6.1 Engine

Ordered by dependency. File paths are from `src/domain`.

- [ ] **Terrain types** (`entities/board/terrainTypes.ts`). Replace `plain, rocks, scrub, lightForest, denseForest` with the table in 1.1. Split rocks into stony and crags. Add mud. Add road, fields, ford, bank and marsh. Each type carries a threshold and a speed limit.
- [ ] **Elevation** (`entities/board/elevation.ts`). Change each corner from 0–5 to −1, 0, +1. Enforce no alternating corners.
- [ ] **Water** (`entities/board/waterCover.ts`). The eight-direction cover may be removable: water is elevation −1 plus bank or ford cover, and only the art needs to know which corners are wet. Confirm before removing.
- [ ] **Terrain effects on stats** (`queries/unit/getCurrentUnitStat.ts`, terrain step marked "not yet implemented"). Apply the deficit to every stat but flexibility, range included.
- [ ] **Movement cost** (`legality/unitMovement/passage/canMoveThrough.ts`, `checkDiagonalMove.ts`, `exploreUnitMoves.ts`). `canMoveThrough` returns only true or false; it needs to report cost. Cap base speed at the lowest speed limit in the move, then apply the deficit from the highest threshold in the move (floored at 0), then modifiers, for orthogonal and diagonal moves alike.
- [ ] **Retreats** (`legality/unitMovement/getLegalRetreats.ts`). Retreats already use `exploreUnitMoves`, so terrain should flow through. Add tests for river-at-the-back routs.
- [ ] **Elevation in combat.** Melee: compare the corners behind each unit. Shooting: compare whole-space sums, +1 or −1.
- [ ] **Line of sight** (`legality/choiceOptions/performRangedAttack/canUnitRangedAttackTarget.ts`). Targeting checks only side, attacker engagement, range and arc today. Add corner-to-corner tracing as in section 2, and refuse an engaged target.
- [ ] **Hidden units.** Stands and decoys in the visibility-split state the engine already has (`GameStateVisibility`). Reveals on sight or adjacency at the end of a move, by choice after commander movement, and on a unit moving in.
- [ ] **Setup phases.** Bid, color, veto, scenario, White's terrain choice, placement with the no-touch and multi-part rules, deployment. None of these exist in the engine yet.

### 6.2 Content

- [ ] Unit cards: about 144, still undrafted.
- [ ] Terrain catalogue: feature shapes, sizes and faces for each box.
- [ ] Scenario cards for each box.

### 6.3 Testing

- [ ] **Paper test of setup.** A gridded mat and cut-out shapes. No engine needed. Measure setup time.
- [ ] **Bot baselines.** Build the bot rules-side, then generate play data for the rebalancer.
- [ ] **Human play.**
- [ ] **Things to watch:**
  - Bare-board games, so terrain does not hide a weak open game.
  - How often bids reach the top of the discard tier.
  - Forest-edge skirmishers who can shoot out but not be shot.
  - The speed-limit table, starting with chariots in fields and skirmishers in dense forest.
  - Missile coverage across army types.
  - Semi-skirmishers that may prove too sticky.
  - Rounds from first push to first rout, and how often the defender closes the gap.
