import type { TranslationNamespaces } from "../../translations";

import { hiPartA } from "./a";
import { hiPartB } from "./b";
import { hiPartC } from "./c";
import { hiPartD } from "./d";

export const hi: TranslationNamespaces = {
  ...hiPartA,
  ...hiPartB,
  ...hiPartC,
  ...hiPartD,
};
