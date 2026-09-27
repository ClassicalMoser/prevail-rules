/**
 * One step on the board grid. Rows are letters, with A at the north edge, so
 * north decreases the row index. Columns increase toward the east. A diagonal
 * steps on both axes; a pure east or west step does not change the row, and a
 * pure north or south step does not change the column.
 */

import { getColumnDelta, getRowDelta } from './deltas';

describe(getRowDelta, () => {
  it('steps one row north when facing north', () => {
    expect(getRowDelta('north')).toBe(-1);
  });

  it('steps one row north when facing northEast', () => {
    expect(getRowDelta('northEast')).toBe(-1);
  });

  it('steps one row north when facing northWest', () => {
    expect(getRowDelta('northWest')).toBe(-1);
  });

  it('steps one row south when facing south', () => {
    expect(getRowDelta('south')).toBe(1);
  });

  it('steps one row south when facing southEast', () => {
    expect(getRowDelta('southEast')).toBe(1);
  });

  it('steps one row south when facing southWest', () => {
    expect(getRowDelta('southWest')).toBe(1);
  });

  it('does not change the row when facing east', () => {
    expect(getRowDelta('east')).toBe(0);
  });

  it('does not change the row when facing west', () => {
    expect(getRowDelta('west')).toBe(0);
  });
});

describe(getColumnDelta, () => {
  it('steps one column east when facing east', () => {
    expect(getColumnDelta('east')).toBe(1);
  });

  it('steps one column east when facing northEast', () => {
    expect(getColumnDelta('northEast')).toBe(1);
  });

  it('steps one column east when facing southEast', () => {
    expect(getColumnDelta('southEast')).toBe(1);
  });

  it('steps one column west when facing west', () => {
    expect(getColumnDelta('west')).toBe(-1);
  });

  it('steps one column west when facing northWest', () => {
    expect(getColumnDelta('northWest')).toBe(-1);
  });

  it('steps one column west when facing southWest', () => {
    expect(getColumnDelta('southWest')).toBe(-1);
  });

  it('does not change the column when facing north', () => {
    expect(getColumnDelta('north')).toBe(0);
  });

  it('does not change the column when facing south', () => {
    expect(getColumnDelta('south')).toBe(0);
  });
});
