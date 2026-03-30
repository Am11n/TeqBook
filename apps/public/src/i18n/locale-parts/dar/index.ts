import type { TranslationNamespaces } from "../../translations";

import { darPartA } from "./a";
import { darPartB } from "./b";
import { darPartC } from "./c";
import { darPartD } from "./d";

export const dar: TranslationNamespaces = {
  ...darPartA,
  ...darPartB,
  ...darPartC,
  ...darPartD,
};
