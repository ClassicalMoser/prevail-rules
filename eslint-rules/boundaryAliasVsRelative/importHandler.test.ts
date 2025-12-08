/**
 * Unit tests for importHandler.ts
 * Tests the main import handler that orchestrates all checking logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Rule } from 'eslint';
import path from 'node:path';
import { handleImport } from './importHandler.js';
import type { Boundary } from './types.js';

describe('importHandler', () => {
  const cwd = '/project';
  const rootDir = 'src';

  let entitiesBoundary: Boundary;
  let queriesBoundary: Boundary;
  let eventsBoundary: Boundary;
  let boundaries: Boundary[];
  let mockContext: Rule.RuleContext;
  let mockNode: Rule.Node;
  let reportedViolations: Array<{
    node: Rule.Node;
    messageId: string;
    data?: Record<string, string>;
    fix?: Rule.ReportFixer;
    severity?: number;
  }>;

  beforeEach(() => {
    entitiesBoundary = {
      dir: 'domain/entities',
      alias: '@entities',
      absDir: path.resolve(cwd, rootDir, 'domain/entities'),
      allowImportsFrom: ['@events'],
    };

    queriesBoundary = {
      dir: 'domain/queries',
      alias: '@queries',
      absDir: path.resolve(cwd, rootDir, 'domain/queries'),
      allowImportsFrom: ['@entities'],
    };

    eventsBoundary = {
      dir: 'domain/events',
      alias: '@events',
      absDir: path.resolve(cwd, rootDir, 'domain/events'),
    };

    boundaries = [entitiesBoundary, queriesBoundary, eventsBoundary];

    reportedViolations = [];

    mockNode = {
      type: 'ImportDeclaration',
      source: {
        type: 'Literal',
        value: '@entities',
        raw: "'@entities'",
      },
    } as Rule.Node;

    mockContext = {
      report: vi.fn((descriptor) => {
        reportedViolations.push(descriptor as any);
      }),
    } as unknown as Rule.RuleContext;
  });

  describe('external package detection', () => {
    it('should skip checking for npm packages', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      const result = handleImport(
        mockNode,
        'lodash',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
      );

      expect(result).toBe(false);
      expect(mockContext.report).not.toHaveBeenCalled();
    });

    it('should check absolute paths within rootDir', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      // Test with rootDir prefix (no leading slash)
      handleImport(
        mockNode,
        'src/domain/entities',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true, // Skip boundary rules
      );

      // Should check absolute paths within rootDir
      expect(mockContext.report).toHaveBeenCalled();
    });

    it('should check absolute paths with leading slash', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      // Test with /rootDir prefix (with leading slash)
      handleImport(
        mockNode,
        '/src/domain/entities',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true, // Skip boundary rules
      );

      // Should check absolute paths with leading slash
      expect(mockContext.report).toHaveBeenCalled();
    });

    it('should skip checking for vitest', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      const result = handleImport(
        mockNode,
        'vitest',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
      );

      expect(result).toBe(false);
      expect(mockContext.report).not.toHaveBeenCalled();
    });

    it('should check relative imports', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      // Use a path that will definitely be wrong (cross-boundary as relative)
      const result = handleImport(
        mockNode,
        '../entities', // Wrong - should be @entities for cross-boundary
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
      );

      // Should report violation for incorrect path format
      expect(mockContext.report).toHaveBeenCalled();
    });

    it('should check boundary alias imports', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      // Use a path that will be wrong (alias subpath)
      const result = handleImport(
        mockNode,
        '@entities/army', // Wrong - should be @entities for cross-boundary
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
      );

      // Should report violation for alias subpath
      expect(mockContext.report).toHaveBeenCalled();
    });
  });

  describe('cross-boundary alias subpaths', () => {
    it('should flag cross-boundary alias subpaths', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '@entities/army',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
      );

      expect(mockContext.report).toHaveBeenCalled();
      const violation = reportedViolations[0];
      expect(violation.messageId).toBe('incorrectImportPath');
      expect(violation.data?.expectedPath).toBe('@entities');
      expect(violation.data?.actualPath).toBe('@entities/army');
      expect(violation.fix).toBeDefined();
    });

    it('should not flag subpaths within same boundary', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      reportedViolations = [];

      // Same boundary subpath - should not be caught by subpath check
      // (it will be caught by path format check later)
      handleImport(
        mockNode,
        '@queries/otherSubdir',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true, // Skip boundary rules to focus on subpath check
      );

      // Should not report subpath violation (same boundary)
      // But may report path format violation
      const subpathViolation = reportedViolations.find(
        (v) => v.data?.actualPath === '@queries/otherSubdir' && v.data?.expectedPath === '@queries',
      );
      expect(subpathViolation).toBeUndefined();
    });

    it('should not flag subpaths when fileBoundary is null', () => {
      const fileDir = path.resolve(cwd, 'other');
      const fileBoundary = null; // File outside boundaries

      reportedViolations = [];

      handleImport(
        mockNode,
        '@entities/army',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
      );

      // Should not report subpath violation when fileBoundary is null
      // (will be handled by path format check)
      const subpathViolation = reportedViolations.find(
        (v) => v.data?.actualPath === '@entities/army' && v.data?.expectedPath === '@entities',
      );
      expect(subpathViolation).toBeUndefined();
    });

    it('should use error severity when severity is error', () => {
      const fileBoundaryWithError: Boundary = {
        ...queriesBoundary,
        severity: 'error',
      };

      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');

      handleImport(
        mockNode,
        '@entities/army',
        fileDir,
        fileBoundaryWithError,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBe(2); // error = 2
    });

    it('should not check subpaths when using absolute style', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '@entities/army',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'absolute', // Absolute style - subpath check skipped
      );

      // Should still report, but for different reason (path format, not subpath)
      expect(mockContext.report).toHaveBeenCalled();
    });
  });

  describe('boundary rules enforcement', () => {
    it('should not check boundary rules when fileBoundary is null', () => {
      const fileDir = path.resolve(cwd, 'other');
      const fileBoundary = null;

      reportedViolations = [];

      handleImport(
        mockNode,
        '@entities',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        false,
      );

      // Should not report boundary violation when fileBoundary is null
      const boundaryViolation = reportedViolations.find(
        (v) => v.messageId === 'boundaryViolation',
      );
      expect(boundaryViolation).toBeUndefined();
    });

    it('should not check boundary rules when targetBoundary is null', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      reportedViolations = [];

      // Import from outside all boundaries
      handleImport(
        mockNode,
        '../unknown',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        true, // Allow unknown boundaries
        false,
        false,
      );

      // Should not report boundary violation when targetBoundary is null
      const boundaryViolation = reportedViolations.find(
        (v) => v.messageId === 'boundaryViolation',
      );
      expect(boundaryViolation).toBeUndefined();
    });

    it('should not check boundary rules when fileBoundary === targetBoundary', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      reportedViolations = [];

      // Import within same boundary
      handleImport(
        mockNode,
        './sibling',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        false,
      );

      // Should not report boundary violation for same-boundary imports
      const boundaryViolation = reportedViolations.find(
        (v) => v.messageId === 'boundaryViolation',
      );
      expect(boundaryViolation).toBeUndefined();
    });

    it('should not report when boundary rule passes (no violation)', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary; // Allows @entities

      reportedViolations = [];

      handleImport(
        mockNode,
        '@entities', // Allowed by boundary rules
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        false,
      );

      // Should not report boundary violation when rule passes
      const boundaryViolation = reportedViolations.find(
        (v) => v.messageId === 'boundaryViolation',
      );
      expect(boundaryViolation).toBeUndefined();
    });

    it('should use error severity when severity is error', () => {
      const fileBoundaryWithError: Boundary = {
        ...queriesBoundary,
        severity: 'error',
      };

      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');

      handleImport(
        mockNode,
        '@events', // Disallowed
        fileDir,
        fileBoundaryWithError,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        false,
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBe(2); // error = 2
    });

    it('should enforce allowImportsFrom rules', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary; // Allows @entities

      // Use correct path format but test that boundary rules are checked
      // Path is correct, so no path format violation, but we verify boundary rules run
      handleImport(
        mockNode,
        '@entities', // Correct path format, allowed by boundary rules
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        false, // Don't skip boundary rules
      );

      // Path is correct and boundary rule allows it, so no violation
      // This test verifies the handler doesn't incorrectly report
      expect(mockContext.report).not.toHaveBeenCalled();
    });

    it('should report violations for disallowed boundaries', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary; // Only allows @entities

      handleImport(
        mockNode,
        '@events', // Not in allowImportsFrom
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        false, // Don't skip boundary rules
      );

      expect(mockContext.report).toHaveBeenCalled();
      const violation = reportedViolations[0];
      expect(violation.messageId).toBe('boundaryViolation');
      expect(violation.data?.from).toBe('@queries');
      expect(violation.data?.to).toBe('@events');
    });

    it('should skip boundary rules when skipBoundaryRules is true', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '@events', // Would normally be disallowed
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true, // Skip boundary rules
      );

      // Should only check path format, not boundary rules
      // May still report if path format is wrong, but not for boundary violation
      const boundaryViolation = reportedViolations.find(
        (v) => v.messageId === 'boundaryViolation',
      );
      expect(boundaryViolation).toBeUndefined();
    });

    it('should allow type-only imports from allowTypeImportsFrom', () => {
      const fileBoundaryWithTypeAllow: Boundary = {
        ...queriesBoundary,
        allowImportsFrom: ['@entities'],
        allowTypeImportsFrom: ['@events'],
      };

      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');

      handleImport(
        mockNode,
        '@events',
        fileDir,
        fileBoundaryWithTypeAllow,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        true, // isTypeOnly
        false,
      );

      // Should not report boundary violation for type imports
      const boundaryViolation = reportedViolations.find(
        (v) => v.messageId === 'boundaryViolation',
      );
      expect(boundaryViolation).toBeUndefined();
    });
  });

  describe('path format enforcement', () => {
    it('should report incorrect path format', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '../entities', // Wrong - should be @entities for cross-boundary
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true, // Skip boundary rules to focus on path format
      );

      expect(mockContext.report).toHaveBeenCalled();
      const violation = reportedViolations[0];
      expect(violation.messageId).toBe('incorrectImportPath');
      expect(violation.fix).toBeDefined();
    });

    it('should not report when path is correct', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      reportedViolations = [];

      handleImport(
        mockNode,
        '@entities', // Correct for cross-boundary
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true, // Skip boundary rules
      );

      // Should not report if path is correct
      const pathViolation = reportedViolations.find(
        (v) => v.messageId === 'incorrectImportPath',
      );
      expect(pathViolation).toBeUndefined();
    });

    it('should provide fixer for incorrect paths', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '../entities',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true,
      );

      const violation = reportedViolations[0];
      expect(violation.fix).toBeDefined();
      expect(typeof violation.fix).toBe('function');
    });
  });

  describe('ancestor barrel imports', () => {
    it('should report ancestor barrel imports', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '@queries', // Ancestor barrel
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
      );

      expect(mockContext.report).toHaveBeenCalled();
      const violation = reportedViolations[0];
      expect(violation.messageId).toBe('ancestorBarrelImport');
      expect(violation.data?.alias).toBe('@queries');
      expect(violation.fix).toBeUndefined(); // Not fixable
    });

    it('should not report when fileBoundary is null', () => {
      const fileDir = path.resolve(cwd, 'other');
      const fileBoundary = null;

      reportedViolations = [];

      handleImport(
        mockNode,
        '@queries',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
      );

      // Should not report ancestor barrel when fileBoundary is null
      const violation = reportedViolations.find(
        (v) => v.messageId === 'ancestorBarrelImport',
      );
      expect(violation).toBeUndefined();
    });

    it('should not report when rawSpec !== fileBoundary.alias', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');
      const fileBoundary = queriesBoundary;

      reportedViolations = [];

      // correctPath is null but rawSpec is not the boundary alias
      // This case should return false (line 155)
      handleImport(
        mockNode,
        './index', // Might return null from calculateCorrectImportPath
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
      );

      // Should not report ancestor barrel when rawSpec !== fileBoundary.alias
      const violation = reportedViolations.find(
        (v) => v.messageId === 'ancestorBarrelImport',
      );
      expect(violation).toBeUndefined();
    });

    it('should use error severity when severity is error', () => {
      const fileBoundaryWithError: Boundary = {
        ...queriesBoundary,
        severity: 'error',
      };

      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');

      handleImport(
        mockNode,
        '@queries',
        fileDir,
        fileBoundaryWithError,
        boundaries,
        rootDir,
        cwd,
        mockContext,
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBe(2); // error = 2
    });
  });

  describe('unknown boundaries', () => {
    it('should report unknown boundary imports when not allowed', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '../unknown',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false, // allowUnknownBoundaries = false
        false,
        false,
      );

      expect(mockContext.report).toHaveBeenCalled();
      const violation = reportedViolations[0];
      expect(violation.messageId).toBe('unknownBoundaryImport');
      expect(violation.data?.path).toBe('../unknown');
      expect(violation.fix).toBeUndefined(); // Not fixable
    });

    it('should use error severity when defaultSeverity is error', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '../unknown',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        'error', // defaultSeverity = error
        false,
        false,
        false,
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBe(2); // error = 2
    });

    it('should use warn severity when defaultSeverity is warn', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '../unknown',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        'warn', // defaultSeverity = warn
        false,
        false,
        false,
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBe(1); // warn = 1
    });

    it('should not set severity when defaultSeverity is undefined', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        '../unknown',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined, // defaultSeverity = undefined
        false,
        false,
        false,
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBeUndefined();
    });

    it('should allow unknown boundary imports when allowed', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      reportedViolations = [];

      handleImport(
        mockNode,
        '../unknown',
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        true, // allowUnknownBoundaries = true
        false,
        false,
      );

      const violation = reportedViolations.find(
        (v) => v.messageId === 'unknownBoundaryImport',
      );
      expect(violation).toBeUndefined();
    });
  });

  describe('severity handling', () => {
    it('should use boundary-specific severity when provided', () => {
      const fileBoundaryWithSeverity: Boundary = {
        ...queriesBoundary,
        severity: 'warn',
      };

      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');

      handleImport(
        mockNode,
        '@events', // Disallowed
        fileDir,
        fileBoundaryWithSeverity,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        false,
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBe(1); // warn = 1
    });

    it('should use error severity for path format violations', () => {
      const fileBoundaryWithError: Boundary = {
        ...queriesBoundary,
        severity: 'error',
      };

      const fileDir = path.resolve(cwd, rootDir, 'domain/queries', 'subdir');

      handleImport(
        mockNode,
        '../../topLevel', // Wrong path format
        fileDir,
        fileBoundaryWithError,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true, // Skip boundary rules
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBe(2); // error = 2
    });

    it('should use defaultSeverity when boundary severity not set', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');

      handleImport(
        mockNode,
        '@events', // Disallowed
        fileDir,
        queriesBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        'warn', // defaultSeverity
        false,
        false,
        false,
      );

      const violation = reportedViolations[0];
      expect(violation.severity).toBe(1); // warn = 1
    });

    it('should not set severity when neither is provided', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');

      handleImport(
        mockNode,
        '@events',
        fileDir,
        queriesBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined, // No defaultSeverity
        false,
        false,
        false,
      );

      const violation = reportedViolations[0];
      // Severity should not be set (uses rule-level severity)
      expect(violation.severity).toBeUndefined();
    });
  });

  describe('absolute path style', () => {
    it('should use absolute paths for cross-boundary imports when configured', () => {
      const fileDir = path.resolve(cwd, rootDir, 'domain/queries');
      const fileBoundary = queriesBoundary;

      handleImport(
        mockNode,
        'src/domain/entities/army', // Wrong - should be src/domain/entities
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'absolute', // Use absolute style
        undefined,
        false,
        false,
        true, // Skip boundary rules
      );

      expect(mockContext.report).toHaveBeenCalled();
      const violation = reportedViolations[0];
      expect(violation.data?.expectedPath).toBe('src/domain/entities');
    });
  });

  describe('same boundary imports', () => {
    it('should enforce relative paths for same-boundary imports', () => {
      const fileDir = path.resolve(
        cwd,
        rootDir,
        'domain/queries',
        'subdir',
        'deep',
      );
      const fileBoundary = queriesBoundary;

      // Use a relative path that's wrong - should use alias for top-level paths
      // From subdir/deep to a top-level path should use @queries/path, not ../../path
      handleImport(
        mockNode,
        '../../topLevel', // Wrong - should be @queries/topLevel for top-level paths
        fileDir,
        fileBoundary,
        boundaries,
        rootDir,
        cwd,
        mockContext,
        'alias',
        undefined,
        false,
        false,
        true, // Skip boundary rules
      );

      // Should report violation for using relative when alias is required
      expect(mockContext.report).toHaveBeenCalled();
      const violation = reportedViolations[0];
      expect(violation.messageId).toBe('incorrectImportPath');
      expect(violation.data?.expectedPath).toContain('@queries');
      expect(violation.fix).toBeDefined();
    });
  });
});

