import type { TranslationNamespaces } from "../../translations";

import { amPartA } from "./a";
import { amPartB } from "./b";
import { amPartC } from "./c";
import { amPartD } from "./d";

export const am: TranslationNamespaces = {
  ...amPartA,
  ...amPartB,
  ...amPartC,
  ...amPartD,
};
