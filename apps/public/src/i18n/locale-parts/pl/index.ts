import type { TranslationNamespaces } from "../../translations";

import { plPartA } from "./a";
import { plPartB } from "./b";
import { plPartC } from "./c";
import { plPartD } from "./d";

export const pl: TranslationNamespaces = {
  ...plPartA,
  ...plPartB,
  ...plPartC,
  ...plPartD,
};
