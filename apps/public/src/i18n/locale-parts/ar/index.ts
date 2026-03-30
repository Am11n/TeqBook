import type { TranslationNamespaces } from "../../translations";

import { arPartA } from "./a";
import { arPartB } from "./b";
import { arPartC } from "./c";
import { arPartD } from "./d";

export const ar: TranslationNamespaces = {
  ...arPartA,
  ...arPartB,
  ...arPartC,
  ...arPartD,
};
