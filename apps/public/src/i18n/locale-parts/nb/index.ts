import type { TranslationNamespaces } from "../../translations";

import { nbPartA } from "./a";
import { nbPartB } from "./b";
import { nbPartC } from "./c";
import { nbPartD } from "./d";

export const nb: TranslationNamespaces = {
  ...nbPartA,
  ...nbPartB,
  ...nbPartC,
  ...nbPartD,
};
