/** A spec whose setup or assertion reaches its own subject. */
export interface SelfProof {
  /** The spec's path, relative to the source directory. */
  spec: string;
  /** The modules it calls that lead back to the subject. */
  through: string[];
}
