// What the rules offer the player the game is waiting on, packaged for a UI
// or a bot: the choice, who is asked, and its legal options.
export {
  getLegalPlayerChoiceOptions,
  type LegalPlayerChoiceOptions,
  type LegalPlayerChoiceOptionsByChoice,
  type LegalPlayerChoiceOptionsFor,
} from './getLegalPlayerChoiceOptions';

// Whether a choice a player sent is the one expected, well formed and legal;
// it answers with a reason and never throws.
export { validatePlayerChoice } from './validatePlayerChoice';
