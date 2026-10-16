import type { UnitWithPlacement } from '@entities';
import type {
  CommandResolutionState,
  GameState,
  MeleeResolutionState,
} from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import {
  findRetreatState,
  getRetreatStateFromAttackApply,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
  getRetreatStateReadyForResolveFromMelee,
} from './retreat';

function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  return updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    }),
  );
}

function resolveMelee(
  melee: MeleeResolutionState,
  initiative: 'white' | 'black' = 'white',
): GameState {
  const empty = updateCurrentInitiative(
    createEmptyGameState('standard'),
    initiative,
  );
  return updatePhaseState(
    empty,
    createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    }),
  );
}

function placed(
  player: 'white' | 'black',
  facing: UnitWithPlacement['placement']['facing'],
): UnitWithPlacement {
  return {
    placement: { coordinate: 'E-5', facing },
    unit: createTestUnit(player, { attack: 2 }),
  };
}

/**
 * Retreat readers unwrap a retreat from an attack apply, a ranged resolution,
 * a melee side, or whichever of those is current. The ready reader returns
 * the initiative-order retreat whose final placement is set.
 */
describe('getRetreatStateFromAttackApply function', () => {
  it('returns the retreat on the attack apply', () => {
    const unit = placed('black', 'north');
    const retreat = createRetreatState(unit);
    const apply = createAttackApplyStateWithRetreat(unit, {
      retreatState: retreat,
    });

    expect(getRetreatStateFromAttackApply(apply)).toBe(retreat);
  });

  it('throws when the attack apply has no retreat', () => {
    const apply = createAttackApplyState(
      createTestUnit('black', { attack: 2 }),
      { retreatState: 'pending' },
    );

    expect(() => getRetreatStateFromAttackApply(apply)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});

describe('getRetreatStateFromRangedAttack function', () => {
  it('returns the retreat on the ranged attack apply', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(defender, {
        retreatState: retreat,
      }),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    expect(getRetreatStateFromRangedAttack(state)).toBe(retreat);
  });

  it('throws when the ranged attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const state = issueCommands(resolution);

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('throws when the ranged attack apply has no retreat', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyState(defender, {
        retreatState: 'pending',
      }),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});

describe('getRetreatStateFromMelee function', () => {
  it('returns the white retreat', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white);
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee);

    expect(getRetreatStateFromMelee(state, 'white')).toBe(retreat);
  });

  it('returns the black retreat', () => {
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black);
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithRetreat(black, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee);

    expect(getRetreatStateFromMelee(state, 'black')).toBe(retreat);
  });

  it('throws when the white attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: 'pending',
    });
    const state = resolveMelee(melee);

    expect(() => getRetreatStateFromMelee(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});

describe('findRetreatState function', () => {
  it('throws when the round has no phase', () => {
    const state = createEmptyGameState('standard');

    expect(() => findRetreatState(state, 'white')).toThrow(
      'No current phase state found',
    );
  });

  it('returns the white retreat on a ranged attack', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(defender, {
        retreatState: retreat,
      }),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    expect(findRetreatState(state, 'white')).toBe(retreat);
  });

  it('returns the white retreat on a melee', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white);
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee);

    expect(findRetreatState(state, 'white')).toBe(retreat);
  });

  it('throws when the command resolution is movement without a retreat', () => {
    const empty = createEmptyGameState('standard');
    const state = issueCommands(createMovementResolutionState(empty));

    expect(() => findRetreatState(state, 'white')).toThrow(
      'No retreat state found for player white',
    );
  });

  it('returns the retreat nested on a front engagement', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender);
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFrontEngagementState({
        defendingUnitRetreats: true,
        retreatState: retreat,
      }),
    });
    const state = issueCommands(resolution);

    expect(findRetreatState(state, 'white')).toBe(retreat);
  });

  it('throws when the retreat belongs to the other player', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(defender, {
        retreatState: retreat,
      }),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    expect(() => findRetreatState(state, 'black')).toThrow(
      'No retreat state found for player black',
    );
  });
});

describe('getRetreatStateReadyForResolveFromMelee function', () => {
  const finalPlacement = {
    coordinate: 'E-6',
    facing: 'south',
  } satisfies UnitWithPlacement['placement'];

  it('returns the first player retreat whose final placement is set', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white, {
      finalPosition: finalPlacement,
    });
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee, 'white');

    expect(getRetreatStateReadyForResolveFromMelee(state)).toBe(retreat);
  });

  it('returns the second player retreat when the first final placement is still pending', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black, {
      finalPosition: finalPlacement,
    });
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithRetreat(black, {
        retreatState: retreat,
      }),
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white),
    });
    const state = resolveMelee(melee, 'white');

    expect(getRetreatStateReadyForResolveFromMelee(state)).toBe(retreat);
  });

  it('throws when neither retreat has a final placement', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithRetreat(black),
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white),
    });
    const state = resolveMelee(melee, 'white');

    expect(() => getRetreatStateReadyForResolveFromMelee(state)).toThrow(
      'No retreat state with finalPosition found in melee resolution',
    );
  });

  it('returns the black retreat when black has initiative and that final placement is set', () => {
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black, {
      finalPosition: finalPlacement,
    });
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithRetreat(black, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee, 'black');

    expect(getRetreatStateReadyForResolveFromMelee(state)).toBe(retreat);
  });
});
