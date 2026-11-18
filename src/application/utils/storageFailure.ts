import type {
  PortFailureResponse,
  RunnerFailureResponse,
} from '@application/ports';

/**
 * Names a storage port's refusal as the runner's `storage` failure. Storage
 * says only what went wrong; the runner adds whose it was, so a caller can
 * tell a store that is down from a game that is not there or not legal.
 *
 * @param refusal - What the storage port answered
 * @returns The same reason, named as a storage failure
 */
export function storageFailure(
  refusal: PortFailureResponse,
): RunnerFailureResponse {
  // The adapter's own words are kept: only it knows what failed.
  const failure: RunnerFailureResponse = {
    errorReason: refusal.errorReason,
    failure: 'storage',
    result: false,
  };
  return failure;
}
