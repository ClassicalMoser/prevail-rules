import type { EnginePorts } from "../ports";
import { describe, expect, it, vi } from "vitest";
import { startNewGame } from "./startNewGame";

const placeholderGameId = "00000000-0000-0000-0000-000000000000";

function createEnginePorts(overrides: {
  gameStateSubscribers?: EnginePorts["gameStateSubscribers"];
}): EnginePorts {
  return {
    gameStorage: {
      getGame: vi.fn(),
      saveNewGame: vi.fn().mockResolvedValue({ result: true as const, data: undefined }),
      updateGameState: vi.fn(),
    },
    roundSnapshotStorage: {
      getRoundSnapshot: vi.fn(),
      saveRoundSnapshot: vi.fn(),
    },
    eventStreamStorage: {
      getEventStream: vi.fn(),
      addEventToStream: vi.fn(),
      flushEventStream: vi.fn(),
      newEventStream: vi.fn(),
      truncateEventStream: vi.fn(),
    },
    gameStateSubscribers: overrides.gameStateSubscribers ?? [],
  };
}

describe("startNewGame", () => {
  it("notifies matching subscribers with initial game state after save succeeds", async () => {
    const onGameStateChange = vi.fn();
    const ports = createEnginePorts({
      gameStateSubscribers: [
        {
          gameId: placeholderGameId,
          gameType: "mini",
          onGameStateChange,
          onError: vi.fn(),
        },
      ],
    });

    const outcome = await startNewGame("mini", ports);

    expect(outcome).toEqual({ result: true, data: undefined });
    expect(onGameStateChange).toHaveBeenCalledTimes(1);
    const [change] = onGameStateChange.mock.calls[0] ?? [];
    expect(change).toMatchObject({
      gameId: placeholderGameId,
      gameType: "mini",
    });
    expect(change?.gameState).toBeDefined();
  });

  it("does not notify subscribers when gameId or gameType does not match", async () => {
    const matching = vi.fn();
    const wrongId = vi.fn();
    const wrongType = vi.fn();
    const ports = createEnginePorts({
      gameStateSubscribers: [
        {
          gameId: placeholderGameId,
          gameType: "mini",
          onGameStateChange: matching,
          onError: vi.fn(),
        },
        {
          gameId: "11111111-1111-1111-1111-111111111111",
          gameType: "mini",
          onGameStateChange: wrongId,
          onError: vi.fn(),
        },
        {
          gameId: placeholderGameId,
          gameType: "standard",
          onGameStateChange: wrongType,
          onError: vi.fn(),
        },
      ],
    });

    const outcome = await startNewGame("mini", ports);

    expect(outcome).toEqual({ result: true, data: undefined });
    expect(matching).toHaveBeenCalledTimes(1);
    expect(wrongId).not.toHaveBeenCalled();
    expect(wrongType).not.toHaveBeenCalled();
  });

  it("returns failure when saveNewGame fails", async () => {
    const ports = createEnginePorts({
      gameStateSubscribers: [],
    });
    vi.mocked(ports.gameStorage.saveNewGame).mockResolvedValueOnce({
      result: false,
      errorReason: "Game already exists",
    });

    const outcome = await startNewGame("mini", ports);

    expect(outcome).toEqual({
      result: false,
      errorReason: "Game already exists",
    });
  });

  it("calls onError and returns failure when a subscriber throws", async () => {
    const boom = new Error("subscriber failed");
    const onGameStateChange = vi.fn(() => {
      throw boom;
    });
    const onError = vi.fn();
    const ports = createEnginePorts({
      gameStateSubscribers: [
        {
          gameId: placeholderGameId,
          gameType: "mini",
          onGameStateChange,
          onError,
        },
      ],
    });

    const outcome = await startNewGame("mini", ports);

    expect(outcome).toEqual({
      result: false,
      errorReason: "subscriber failed",
    });
    expect(onError).toHaveBeenCalledWith(boom);
  });
});
