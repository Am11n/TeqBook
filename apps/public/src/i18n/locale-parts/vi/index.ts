import type { TranslationNamespaces } from "../../translations";

import { viPartA } from "./a";
import { viPartB } from "./b";
import { viPartC } from "./c";
import { viPartD } from "./d";

export const vi: TranslationNamespaces = {
  ...viPartA,
  ...viPartB,
  ...viPartC,
  ...viPartD,
};
