import type { TranslationNamespaces } from "../../translations";

import { tlPartA } from "./a";
import { tlPartB } from "./b";
import { tlPartC } from "./c";
import { tlPartD } from "./d";

export const tl: TranslationNamespaces = {
  ...tlPartA,
  ...tlPartB,
  ...tlPartC,
  ...tlPartD,
};
