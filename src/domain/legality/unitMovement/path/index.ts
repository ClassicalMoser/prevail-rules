// The verdict on a submitted path: where it ends and at what cost, or why not.
export type { PathTrace } from './pathTrace';

// Whether a path may stop where it has arrived, and what must follow there.
export { closeMovePath } from './closeMovePath';

// Whether a submitted path is a legal move, judged step by step and turn by turn.
export { traceMovePath } from './traceMovePath';
