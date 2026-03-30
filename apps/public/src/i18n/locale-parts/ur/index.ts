import type { TranslationNamespaces } from "../../translations";

import { urPartA } from "./a";
import { urPartB } from "./b";
import { urPartC } from "./c";
import { urPartD } from "./d";

export const ur: TranslationNamespaces = {
  ...urPartA,
  ...urPartB,
  ...urPartC,
  ...urPartD,
};
