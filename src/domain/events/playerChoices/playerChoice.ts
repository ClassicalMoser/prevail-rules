import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import type { ChooseCardEvent } from './chooseCard';
import type { ChooseMeleeResolutionEvent } from './chooseMeleeResolution';
import type { ChooseRallyEvent } from './chooseRally';
import type { ChooseRetreatOptionEvent } from './chooseRetreatOption';
import type { ChooseRoutDiscardEvent } from './chooseRoutDiscard';
import type { ChooseWhetherToRetreatEvent } from './chooseWhetherToRetreat';
import type { CommitToMeleeEvent } from './commitToMelee';
import type { CommitToMovementEvent } from './commitToMovement';
import type { CommitToRangedAttackEvent } from './commitToRangedAttack';
import type { IssueCommandEvent } from './issueCommand';
import type { MoveCommanderEvent } from './moveCommander';
import type { MoveUnitEvent } from './moveUnit';
import type { PerformRangedAttackEvent } from './performRangedAttack';
import type { PlayerChoiceType } from './playerChoiceTypes';
import type { SetupUnitsEvent } from './setupUnit';

import { type ZodDiscriminatedUnion, z } from 'zod';
import { chooseCardEventSchema } from './chooseCard';
import { chooseMeleeResolutionEventSchema } from './chooseMeleeResolution';
import { chooseRallyEventSchema } from './chooseRally';
import { chooseRetreatOptionEventSchema } from './chooseRetreatOption';
import { chooseRoutDiscardEventSchema } from './chooseRoutDiscard';
import { chooseWhetherToRetreatEventSchema } from './chooseWhetherToRetreat';
import { commitToMeleeEventSchema } from './commitToMelee';
import { commitToMovementEventSchema } from './commitToMovement';
import { commitToRangedAttackEventSchema } from './commitToRangedAttack';
import { issueCommandEventSchema } from './issueCommand';
import { moveCommanderEventSchema } from './moveCommander';
import { moveUnitEventSchema } from './moveUnit';
import { performRangedAttackEventSchema } from './performRangedAttack';
import { setupUnitsEventSchema } from './setupUnit';

export type { PlayerChoiceType } from './playerChoiceTypes';
export { playerChoices, playerChoiceTypeSchema } from './playerChoiceTypes';

/** An event that represents a player choice. */
export type PlayerChoiceEvent<
  TBoard extends Board,
  _TPlayerChoiceType extends PlayerChoiceType,
> =
  | ChooseCardEvent<TBoard, 'chooseCard'>
  | ChooseMeleeResolutionEvent<TBoard, 'chooseMeleeResolution'>
  | ChooseRallyEvent<TBoard, 'chooseRally'>
  | ChooseRoutDiscardEvent<TBoard, 'chooseRoutDiscard'>
  | ChooseRetreatOptionEvent<TBoard, 'chooseRetreatOption'>
  | ChooseWhetherToRetreatEvent<TBoard, 'chooseWhetherToRetreat'>
  | CommitToMeleeEvent<TBoard, 'commitToMelee'>
  | CommitToMovementEvent<TBoard, 'commitToMovement'>
  | CommitToRangedAttackEvent<TBoard, 'commitToRangedAttack'>
  | IssueCommandEvent<TBoard, 'issueCommand'>
  | MoveCommanderEvent<TBoard, 'moveCommander'>
  | MoveUnitEvent<TBoard, 'moveUnit'>
  | PerformRangedAttackEvent<TBoard, 'performRangedAttack'>
  | SetupUnitsEvent<TBoard, 'setupUnits'>;

/**
 * Discriminated by `choiceType`. Spatial choices nest `z.discriminatedUnion('boardType', …)`.
 * Per-variant spatial schemas use explicit `z.ZodObject<…>` so `--isolatedDeclarations` can emit
 * `typeof` exports without losing `$ZodTypeDiscriminable` for this outer DU.
 */
type _PlayerChoiceEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof chooseCardEventSchema,
    typeof chooseMeleeResolutionEventSchema,
    typeof chooseRallyEventSchema,
    typeof chooseRoutDiscardEventSchema,
    typeof chooseRetreatOptionEventSchema,
    typeof chooseWhetherToRetreatEventSchema,
    typeof commitToMeleeEventSchema,
    typeof commitToMovementEventSchema,
    typeof commitToRangedAttackEventSchema,
    typeof issueCommandEventSchema,
    typeof moveCommanderEventSchema,
    typeof moveUnitEventSchema,
    typeof performRangedAttackEventSchema,
    typeof setupUnitsEventSchema,
  ],
  'choiceType'
>;

const _playerChoiceEventSchemaObject: _PlayerChoiceEventDiscriminatedUnion =
  z.discriminatedUnion('choiceType', [
    chooseCardEventSchema,
    chooseMeleeResolutionEventSchema,
    chooseRallyEventSchema,
    chooseRoutDiscardEventSchema,
    chooseRetreatOptionEventSchema,
    chooseWhetherToRetreatEventSchema,
    commitToMeleeEventSchema,
    commitToMovementEventSchema,
    commitToRangedAttackEventSchema,
    issueCommandEventSchema,
    moveCommanderEventSchema,
    moveUnitEventSchema,
    performRangedAttackEventSchema,
    setupUnitsEventSchema,
  ]);

type PlayerChoiceEventSchemaType = z.infer<
  typeof _playerChoiceEventSchemaObject
>;

/** The schema for a player choice event. */
export const playerChoiceEventSchema: typeof _playerChoiceEventSchemaObject =
  _playerChoiceEventSchemaObject;

const _assertExactPlayerChoiceEvent: AssertExact<
  PlayerChoiceEvent<Board, PlayerChoiceType>,
  PlayerChoiceEventSchemaType
> = true;
