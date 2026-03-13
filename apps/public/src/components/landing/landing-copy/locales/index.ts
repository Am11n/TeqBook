import type { LandingCopyEntry, Locale } from "../types";
import { arSoCopy } from "./ar-so";
import { darUrCopy } from "./dar-ur";
import { hiCopy } from "./hi";
import { nbEnCopy } from "./nb-en";
import { tiAmCopy } from "./ti-am";
import { tlFaCopy } from "./tl-fa";
import { trPlCopy } from "./tr-pl";
import { viZhCopy } from "./vi-zh";

export const copy: Record<Locale, LandingCopyEntry> = {
  ...nbEnCopy,
  ...arSoCopy,
  ...tiAmCopy,
  ...trPlCopy,
  ...viZhCopy,
  ...tlFaCopy,
  ...darUrCopy,
  ...hiCopy,
};
