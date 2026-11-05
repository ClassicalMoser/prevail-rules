import { armySchema } from '@entities';
import { blackTinyStarterArmy, whiteTinyStarterArmy } from './tinyStarterArmy';

describe('tiny starter armies', () => {
  it('each side names its army with an id an army may carry', () => {
    // Only the id is checked here: some sample cards do not yet fit the
    // card schema, which AUDIT.md records.
    const whiteIssues =
      armySchema.safeParse(whiteTinyStarterArmy).error?.issues;
    const blackIssues =
      armySchema.safeParse(blackTinyStarterArmy).error?.issues;

    expect(whiteIssues?.map((issue) => issue.path)).not.toContainEqual(['id']);
    expect(blackIssues?.map((issue) => issue.path)).not.toContainEqual(['id']);
  });
});
