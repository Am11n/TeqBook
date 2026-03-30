import type { TranslationNamespaces } from "../../translations";

import { trPartA } from "./a";
import { trPartB } from "./b";
import { trPartC } from "./c";
import { trPartD } from "./d";

export const tr: TranslationNamespaces = {
  ...trPartA,
  ...trPartB,
  ...trPartC,
  ...trPartD,
};
