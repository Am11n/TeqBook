import type { TranslationNamespaces } from "../../translations";

import { zhPartA } from "./a";
import { zhPartB } from "./b";
import { zhPartC } from "./c";
import { zhPartD } from "./d";

export const zh: TranslationNamespaces = {
  ...zhPartA,
  ...zhPartB,
  ...zhPartC,
  ...zhPartD,
};
