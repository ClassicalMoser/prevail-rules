import type { StandardBoard } from "@entities";
import type { CommitToMovementEvent } from "@events";
import { getMovementResolutionState } from "@queries";
import { tempCommandCards } from "@sampleValues";
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
} from "@testing";
import { updateCardState, updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";
import { applyCommitToMovementEvent } from "./applyCommitToMovementEvent";

/**
 * Movement command commitment: pending `commitment` on the movement CRS becomes completed with
 * the played card, and that card is removed from the moving player’s hand.
 */
describe("applyCommitToMovementEvent", () => {
  it("given black pending movement and one card in hand, commitment completed and hand empty", () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, (c) => ({
      ...c,
      black: { ...c.black, inHand: [tempCommandCards[0]] },
    }));
    const movementState = createMovementResolutionState(stateWithBlackCardInHand, {
      commitment: { commitmentType: "pending" },
    });
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createIssueCommandsPhaseState(stateWithBlackCardInHand, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "commitToMovement",
      player: "black",
      committedCard: tempCommandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const newMovement = getMovementResolutionState(newState);

    expect(newMovement.commitment).toEqual({
      commitmentType: "completed",
      card: tempCommandCards[0],
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });

  it("given white pending movement and one card in hand, same shape for white side", () => {
    const state = createEmptyGameState();
    const stateWithWhiteCardInHand = updateCardState(state, (c) => ({
      ...c,
      white: { ...c.white, inHand: [tempCommandCards[0]] },
    }));
    const movementState = createMovementResolutionState(stateWithWhiteCardInHand, {
      commitment: { commitmentType: "pending" },
    });
    const stateInPhase = updatePhaseState(
      stateWithWhiteCardInHand,
      createIssueCommandsPhaseState(stateWithWhiteCardInHand, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "commitToMovement",
      player: "white",
      committedCard: tempCommandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const newMovement = getMovementResolutionState(newState);

    expect(newMovement.commitment).toEqual({
      commitmentType: "completed",
      card: tempCommandCards[0],
    });
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });

  it("given hand and commitment snapshot before apply, input state hand and movement slice unchanged", () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, (c) => ({
      ...c,
      black: { ...c.black, inHand: [tempCommandCards[0]] },
    }));
    const movementState = createMovementResolutionState(stateWithBlackCardInHand, {
      commitment: { commitmentType: "pending" },
    });
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createIssueCommandsPhaseState(stateWithBlackCardInHand, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "commitToMovement",
      player: "black",
      committedCard: tempCommandCards[0],
      modifierTypes: [],
    };

    const handBefore = [...stateInPhase.cardState.black.inHand];
    const commitmentBefore = getMovementResolutionState(stateInPhase).commitment;

    applyCommitToMovementEvent(event, stateInPhase);

    expect(stateInPhase.cardState.black.inHand).toEqual(handBefore);
    expect(getMovementResolutionState(stateInPhase).commitment).toEqual(commitmentBefore);
  });
});
