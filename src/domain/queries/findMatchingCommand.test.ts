import type { Command } from "@entities";
import { createTestCard } from "@testing";
import { describe, expect, it } from "vitest";
import { findMatchingCommand } from "./findMatchingCommand";

/**
 * findMatchingCommand: finds a command in a Set that is deeply equal to a target command (type, number, size,
 * restrictions, modifiers); returns the set member reference when found.
 */
describe("findMatchingCommand", () => {
  it("given target matches a set member, returns that member reference", () => {
    const matchingCommand = createTestCard({
      commandModifiers: [{ type: "attack", value: 1 }],
      commandRestrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["sword"],
        unitRestrictions: ["11111111-1111-1111-1111-111111111111"],
      },
    }).command;
    const commands = new Set([matchingCommand]);
    const targetCommand = {
      ...matchingCommand,
      restrictions: {
        ...matchingCommand.restrictions,
      },
      modifiers: [...matchingCommand.modifiers],
    };

    expect(findMatchingCommand(commands, targetCommand)).toBe(matchingCommand);
  });

  it("given command type differs, returns undefined", () => {
    const command = createTestCard().command;
    const commands = new Set([command]);
    const targetCommand = {
      ...command,
      type: "rangedAttack" as const,
    };

    expect(findMatchingCommand(commands, targetCommand)).toBeUndefined();
  });

  it("given primitive field differs, returns undefined", () => {
    const command = createTestCard().command;
    const commands = new Set([command]);
    const targetCommand = {
      ...command,
      number: command.number + 1,
    };

    expect(findMatchingCommand(commands, targetCommand)).toBeUndefined();
  });

  it("given command size differs, returns undefined", () => {
    const command = createTestCard().command;
    const commands = new Set([command]);
    const targetCommand = {
      ...command,
      size: "lines" as const,
    };

    expect(findMatchingCommand(commands, targetCommand)).toBeUndefined();
  });

  it("given restrictions differ, returns undefined", () => {
    const command = createTestCard({
      commandRestrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["sword"],
        unitRestrictions: ["11111111-1111-1111-1111-111111111111"],
      },
    }).command;
    const commands = new Set([command]);
    const targetCommand = {
      ...command,
      restrictions: {
        ...command.restrictions,
        inspirationRangeRestriction: 2,
      },
    };

    expect(findMatchingCommand(commands, targetCommand)).toBeUndefined();
  });

  it("given modifiers differ, returns undefined", () => {
    const command: Command = createTestCard({
      commandModifiers: [{ type: "attack", value: 1 }],
    }).command;
    const commands = new Set([command]);
    const targetCommand: Command = {
      ...command,
      modifiers: [{ type: "speed", value: 1 }],
    };

    expect(findMatchingCommand(commands, targetCommand)).toBeUndefined();
  });
});
