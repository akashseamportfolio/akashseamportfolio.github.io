# Morph Pitch scope review (proposed, not yet applied to ClickUp)

**Prepared:** 2026-11-02  
**Tracking list:** Morph (ClickUp list `1000450000001486`)  
**Status:** Candidate scope for a first playable Pitch slice. The ClickUp stage reassignment is **pending** because the connected ClickUp service reached its daily request limit. Do not interpret this document as completed changes.

## Pitch acceptance criterion

A player can take control of Skye, encounter a simple traversal obstacle in one deliberately small greybox area, transform into a crow, take off and fly, use the crow's different access or interaction capability, then return to dog form and complete the objective. The sequence should be playable in roughly 60–90 seconds, with intelligible controls, reliable collision, and no forced developer intervention. It must communicate why the two animal bodies change available options.

The example route is **The Back Gate**: dog approaches an obstruction, crow flies to an otherwise inaccessible latch, the opening changes the dog-accessible route, and the objective concludes as the dog. Validate that transforming behind the obstacle does not trivialize the intended dog-specific outcome. Rework the interaction if that loophole undermines the demonstration. This is a design target, not a claim that these systems already work.

**Non-goals for Pitch:** full scent tracking, combat, AI reputation, detailed city simulation, wildlife NPC ecosystems, skill trees, stamina economies, time limits, extra animal species, complex quest engines, advanced perching, extensive dog polish and world streaming.

## Already completed, preserve in Pitch (15 cards)

These statuses were confirmed in ClickUp on Nov 2, 2026. The umbrella cards overlap with narrower subtasks, so task-count percentages are administrative indicators rather than effort-weighted measures.

- [x] [Lock dog body orientation during airborne movement](https://app.clickup.com/t/wdwxne0gd9)
- [x] [Calibrate dog locomotion to native animation speeds](https://app.clickup.com/t/wdwxne0gd8)
- [x] [Audit Skye's 25 directional locomotion animations](https://app.clickup.com/t/wdwxne0gd5)
- [x] [Audit dog rotation-rate curve by gait](https://app.clickup.com/t/wdwxne0c87)
- [x] [Tune dog jump takeoff anticipation](https://app.clickup.com/t/wdwxne0c86)
- [x] [Finish dog physical jump and airborne animation phase alignment](https://app.clickup.com/t/wdwxne0c84)
- [x] [Verify dog ground gait and directional turns regression](https://app.clickup.com/t/wdwxne0c85)
- [x] [Jump and fall states](https://app.clickup.com/t/wdwxne092q)
- [x] [Walk button(K)](https://app.clickup.com/t/wdwxne07v3)
- [x] [Sprint button(C+K)](https://app.clickup.com/t/wdwxne07v2)
- [x] [5 Gait Blendspace](https://app.clickup.com/t/wdwxne07v1)
- [x] [Dynamic Rotation Rate](https://app.clickup.com/t/wdwxne07v0)
- [x] [Dynamic Camera](https://app.clickup.com/t/wdwxne07uz)
- [x] [Dog controller](https://app.clickup.com/t/wdwxne07uy)
- [x] [Turn animations for dog](https://app.clickup.com/t/wdwxndwb4b)

## Proposed outstanding Pitch work (25 cards)

These are *candidates*, selected from existing task names, **not yet confirmed stage assignments**. Do not change their completion status. Some may already be classified under a later suggested stage. An item enters the actual Pitch milestone only when tagged `pitch` in ClickUp.

### Existing assets and controlled bird prototype

- [ ] [Audit retained BP_Crow and old transform prototype](https://app.clickup.com/t/wdwxne0c8j)
- [ ] [Choose and inventory new crow skeletal mesh and animation pack](https://app.clickup.com/t/wdwxne0c8h)
- [ ] [Crow Controller (umbrella)](https://app.clickup.com/t/wdwxne07ux)
- [ ] [Preserve crow ground movement controls](https://app.clickup.com/t/wdwxne0c8k)
- [ ] [Refine crow flap impulse and reduced-gravity flight](https://app.clickup.com/t/wdwxne0c8m)
- [ ] [Define crow glide versus flap state machine](https://app.clickup.com/t/wdwxne0c8n)
- [ ] [Implement crow landing detection and touchdown](https://app.clickup.com/t/wdwxne0c8p)

### Transform between dog and crow

- [ ] [Morph to Crow (umbrella)](https://app.clickup.com/t/wdwxne07uw)
- [ ] [Define form identifiers and capability tags](https://app.clickup.com/t/wdwxne0c90)
- [ ] [Implement centralized transform request on PlayerController](https://app.clickup.com/t/wdwxne0c92)
- [ ] [Transfer camera heading and boom state between forms](https://app.clickup.com/t/wdwxne0c93)
- [ ] [Carry over appropriate horizontal and vertical velocity](https://app.clickup.com/t/wdwxne0c94)
- [ ] [Define transformation while airborne and at unsafe heights](https://app.clickup.com/t/wdwxne0c96)
- [ ] [Validate destination capsule clearance before transform](https://app.clickup.com/t/wdwxne0c97)
- [ ] [Add transform visual and sound effect](https://app.clickup.com/t/wdwxne0c98)

### Compact two-form obstacle

- [ ] [Define one-block city vertical slice footprint](https://app.clickup.com/t/wdwxne0cec)
- [ ] [Audit existing CubeGrid collision settings](https://app.clickup.com/t/wdwxne0ced)
- [ ] [Design The Back Gate small interdependent puzzle](https://app.clickup.com/t/wdwxne0cgz)
- [ ] [Create form-agnostic BPI_Interactable](https://app.clickup.com/t/wdwxne0cae)
- [ ] [Add input routing for contextual interact](https://app.clickup.com/t/wdwxne0cag)
- [ ] [Implement crow-specific small latch](https://app.clickup.com/t/wdwxne0cat)
- [ ] [Implement reusable locked door and gate](https://app.clickup.com/t/wdwxne0caq)

### Demonstrate and validate the loop

- [ ] [Create packaging pipeline and executable playtest build](https://app.clickup.com/t/wdwxne0cge)
- [ ] [Run small external player playtests](https://app.clickup.com/t/wdwxne0cga)
- [ ] [Create objective toast and tracker UI](https://app.clickup.com/t/wdwxne0cc6)

## Reclassification procedure, once ClickUp access returns

1. Fetch and inspect the current set of tasks classified as Pitch by `Suggested stage:` descriptions or explicit tags. Do not assume all the candidates above were originally Pitch.
2. Preserve the 15 verified completed cards and deliberately tag the 25 selected outstanding cards as `pitch`. Existing umbrella task statuses should not be marked complete prematurely.
3. For *every other* provisionally pitched task, decide whether it belongs in **Alpha** (expanded gameplay/production), **Beta** (content hardening, testing, accessibility), or **Full Release** (launch / certification / postlaunch considerations). Apply exactly one explicit stage tag. The sync script already prioritizes an explicit tag over the description's historical suggestion.
4. Confirm `pitch` and `alpha` etc. tags exist and no task has multiple recognized stage tags. Retain existing task descriptions, historical proposed stages, comments, and statuses.
5. Only after verification, update this document to show the authoritative scoped list and remove the provisional warning on the public dashboard.

The draft selection is **40 cards total**, not a target that must be reached regardless of requirements. If the one-obstacle test genuinely needs an additional task, add it; if a card proves redundant, defer it. Avoid denominator manipulation for cosmetic progress.

## Dashboard boundary

The current dashboard remains ClickUp-driven. No private task names, descriptions or credentials are included in `progress.json`; it contains only summary counts. The site currently shows **15 / 338 overall**, with provisional stage totals **Pitch 15/104, Alpha 0/116, Beta 0/76, Full Release 0/18**, and **24 unassigned** as of the latest verified snapshot. This document does not change those totals.
