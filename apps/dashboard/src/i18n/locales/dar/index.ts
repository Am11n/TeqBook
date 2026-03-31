import type { TranslationNamespaces } from '../../types';
import { publicBooking } from './publicBooking';
import { login } from './login';
import { signup } from './signup';
import { onboarding } from './onboarding';
import { dashboard } from './dashboard';
import { home } from './home';
import { calendar } from './calendar';
import { employees } from './employees';
import { services } from './services';
import { customers } from './customers';
import { bookings } from './bookings';
import { shifts } from './shifts';
import { personalliste } from './personalliste';
import { settings } from './settings';
import { admin } from './admin';
import { products } from './products';
import { notifications } from './notifications';
import { featureGate } from './featureGate';
import { repoErrors } from '../en/repoErrors';

export const dar: TranslationNamespaces = {
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
  personalliste,
  settings,
  admin,
  products,
  notifications,
  featureGate,
  repoErrors,
};
