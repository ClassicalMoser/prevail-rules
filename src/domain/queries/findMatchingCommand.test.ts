import type { Command } from '@entities';
import { createTestCard } from '@testing';
import { describe, expect, it } from 'vitest';
import { findMatchingCommand } from './findMatchingCommand';

describe('findMatchingCommand', () => {
  it('should return the matching command from the set', () => {
    const matchingCommand = createTestCard({
      commandModifiers: [{ type: 'attack', value: 1 }],
      commandRestrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword'],
        unitRestrictions: ['11111111-1111-1111-1111-111111111111'],
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

  it('should return undefined when the primitive fields do not match', () => {
    const command = createTestCard().command;
    const commands = new Set([command]);
    const targetCommand = {
      ...command,
      number: command.number + 1,
    };

    expect(findMatchingCommand(commands, targetCommand)).toBeUndefined();
  });

  it('should return undefined when the command size does not match', () => {
    const command = createTestCard().command;
    const commands = new Set([command]);
    const targetCommand = {
      ...command,
      size: 'lines' as const,
    };

    expect(findMatchingCommand(commands, targetCommand)).toBeUndefined();
  });

  it('should return undefined when the restrictions differ', () => {
    const command = createTestCard({
      commandRestrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword'],
        unitRestrictions: ['11111111-1111-1111-1111-111111111111'],
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

  it('should return undefined when the modifiers differ', () => {
    const command: Command = createTestCard({
      commandModifiers: [{ type: 'attack', value: 1 }],
    }).command;
    const commands = new Set([command]);
    // Create a target command with different modifiers
    const targetCommand: Command = {
      ...command,
      modifiers: [{ type: 'speed', value: 1 }],
    };

    expect(findMatchingCommand(commands, targetCommand)).toBeUndefined();
  });
});
