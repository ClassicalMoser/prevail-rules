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
import type { SetupUnitsEvent } from './setupUnit';

import { z } from 'zod';
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

/** Iterable list of valid player choices. Built from individual event constants. */
export const playerChoices = [
  'chooseCard',
  'chooseMeleeResolution',
  'chooseRally',
  'chooseRoutDiscard',
  'chooseRetreatOption',
  'commitToMelee',
  'commitToMovement',
  'chooseWhetherToRetreat',
  'commitToRangedAttack',
  'issueCommand',
  'moveCommander',
  'moveUnit',
  'performRangedAttack',
  'setupUnits',
] as const;

export type PlayerChoiceType = (typeof playerChoices)[number];

const _playerChoiceTypeSchemaObject = z.enum(playerChoices);

type PlayerChoiceTypeSchemaType = z.infer<typeof _playerChoiceTypeSchemaObject>;

const _assertExactPlayerChoiceType: AssertExact<
  PlayerChoiceType,
  PlayerChoiceTypeSchemaType
> = true;

/** The schema for a player choice type. */
export const playerChoiceTypeSchema: z.ZodType<PlayerChoiceType> =
  _playerChoiceTypeSchemaObject;

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

const _playerChoiceEventSchemaObject = z.discriminatedUnion('choiceType', [
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
export const playerChoiceEventSchema: z.ZodType<
  PlayerChoiceEvent<Board, PlayerChoiceType>
> = _playerChoiceEventSchemaObject;

// Verify manual type matches schema inference
const _assertExactPlayerChoiceEvent: AssertExact<
  PlayerChoiceEvent<Board, PlayerChoiceType>,
  PlayerChoiceEventSchemaType
> = true;
