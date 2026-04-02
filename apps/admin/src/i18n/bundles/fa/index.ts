import { publicBooking } from "./publicBooking";
import { login } from "./login";
import { signup } from "./signup";
import { onboarding } from "./onboarding";
import { home } from "./home";
import { dashboard } from "./dashboard";
import { calendar } from "./calendar";
import { services } from "./services";
import { employees } from "./employees";
import { customers } from "./customers";
import { bookings } from "./bookings";
import { shifts } from "./shifts";
import { settings } from "./settings";
import { admin } from "./admin";
import { products } from "./products";
import { notifications } from "./notifications";

import type { TranslationNamespaces } from "../../types/namespaces";

export const fa: TranslationNamespaces = {
  publicBooking,
  login,
  signup,
  onboarding,
  home,
  dashboard,
  calendar,
  services,
  employees,
  customers,
  bookings,
  shifts,
  settings,
  admin,
  products,
  notifications,
};
