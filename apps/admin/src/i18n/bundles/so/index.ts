import { publicBooking } from "./publicBooking";
import { login } from "./login";
import { signup } from "./signup";
import { onboarding } from "./onboarding";
import { dashboard } from "./dashboard";
import { home } from "./home";
import { calendar } from "./calendar";
import { employees } from "./employees";
import { services } from "./services";
import { customers } from "./customers";
import { bookings } from "./bookings";
import { shifts } from "./shifts";
import { settings } from "./settings";
import { admin } from "./admin";
import { products } from "./products";
import { notifications } from "./notifications";

import type { TranslationNamespaces } from "../../types/namespaces";

export const so: TranslationNamespaces = {
  publicBooking,
  login,
  signup,
  onboarding,
  dashboard,
  home,
  calendar,
  employees,
  services,
  customers,
  bookings,
  shifts,
  settings,
  admin,
  products,
  notifications,
};
