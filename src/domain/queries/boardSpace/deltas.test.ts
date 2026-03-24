import { describe, expect, it } from 'vitest';
import { getColumnDelta, getRowDelta } from './deltas';

/**
 * getRowDelta: signed row step for moving one space along a facing on the board grid (north decreases row index).
 */
describe('getRowDelta', () => {
  it('given north, returns -1', () => {
    expect(getRowDelta('north')).toBe(-1);
  });

  it('given northEast, returns -1', () => {
    expect(getRowDelta('northEast')).toBe(-1);
  });

  it('given northWest, returns -1', () => {
    expect(getRowDelta('northWest')).toBe(-1);
  });

  it('given south, returns 1', () => {
    expect(getRowDelta('south')).toBe(1);
  });

  it('given southEast, returns 1', () => {
    expect(getRowDelta('southEast')).toBe(1);
  });

  it('given southWest, returns 1', () => {
    expect(getRowDelta('southWest')).toBe(1);
  });

  it('given east, returns 0', () => {
    expect(getRowDelta('east')).toBe(0);
  });

  it('given west, returns 0', () => {
    expect(getRowDelta('west')).toBe(0);
  });
});

/**
 * getColumnDelta: signed column step for moving one space along a facing on the board grid.
 */
describe('getColumnDelta', () => {
  it('given east, returns 1', () => {
    expect(getColumnDelta('east')).toBe(1);
  });

  it('given northEast, returns 1', () => {
    expect(getColumnDelta('northEast')).toBe(1);
  });

  it('given southEast, returns 1', () => {
    expect(getColumnDelta('southEast')).toBe(1);
  });

  it('given west, returns -1', () => {
    expect(getColumnDelta('west')).toBe(-1);
  });

  it('given northWest, returns -1', () => {
    expect(getColumnDelta('northWest')).toBe(-1);
  });

  it('given southWest, returns -1', () => {
    expect(getColumnDelta('southWest')).toBe(-1);
  });

  it('given north, returns 0', () => {
    expect(getColumnDelta('north')).toBe(0);
  });

  it('given south, returns 0', () => {
    expect(getColumnDelta('south')).toBe(0);
  });
});
