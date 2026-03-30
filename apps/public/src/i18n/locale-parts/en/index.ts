import type { TranslationNamespaces } from "../../translations";

import { enPartA } from "./a";
import { enPartB } from "./b";
import { enPartC } from "./c";
import { enPartD } from "./d";

export const en: TranslationNamespaces = {
  ...enPartA,
  ...enPartB,
  ...enPartC,
  ...enPartD,
};
