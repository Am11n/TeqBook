import type { TranslationNamespaces } from "../../translations";

import { tiPartA } from "./a";
import { tiPartB } from "./b";
import { tiPartC } from "./c";
import { tiPartD } from "./d";

export const ti: TranslationNamespaces = {
  ...tiPartA,
  ...tiPartB,
  ...tiPartC,
  ...tiPartD,
};
