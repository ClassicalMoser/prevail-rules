/**
 * The response from a successful port operation.
 */
export interface PortSuccessResponse<T> {
  result: true;
  data: T;
}

/**
 * The response from a failed port operation.
 */
export interface PortFailureResponse {
  result: false;
  errorReason: string;
}

/**
 * The response from a port operation.
 */
export type PortResponse<T> = PortSuccessResponse<T> | PortFailureResponse;
