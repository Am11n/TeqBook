import type { TranslationNamespaces } from "../../translations";

import { soPartA } from "./a";
import { soPartB } from "./b";
import { soPartC } from "./c";
import { soPartD } from "./d";

export const so: TranslationNamespaces = {
  ...soPartA,
  ...soPartB,
  ...soPartC,
  ...soPartD,
};
