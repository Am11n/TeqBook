import type { TranslationNamespaces } from "../../translations";

import { faPartA } from "./a";
import { faPartB } from "./b";
import { faPartC } from "./c";
import { faPartD } from "./d";

export const fa: TranslationNamespaces = {
  ...faPartA,
  ...faPartB,
  ...faPartC,
  ...faPartD,
};
