import type { ResolvedNamespace } from "@/i18n/resolve-namespace";

const PREFIX = "TB|";

/** Map repository `tb("CODE")` errors to locale strings; pass through Supabase messages. */
export function mapRepoError(
  error: string | null | undefined,
  tr: ResolvedNamespace<"repoErrors">,
): string {
  if (error == null || error === "") return "";
  if (!error.startsWith(PREFIX)) return error;
  const code = error.slice(PREFIX.length);
  switch (code) {
    case "UNKNOWN":
      return tr.unknownError;
    case "EMPLOYEE_CREATE_FAILED":
      return tr.employeeCreateFailed;
    case "EMPLOYEE_UPDATE_FAILED":
      return tr.employeeUpdateFailed;
    case "EMPLOYEE_LINK_SERVICES_FAILED":
      return tr.employeeLinkServicesFailed;
    case "EMPLOYEE_UPDATE_SERVICES_FAILED":
      return tr.employeeUpdateServicesFailed;
    case "EMPLOYEE_LOAD_FAILED":
      return tr.employeeLoadFailed;
    case "EMPLOYEES_LOAD_FAILED":
      return tr.employeesLoadFailed;
    case "EMPLOYEE_NOT_FOUND":
      return tr.employeeNotFound;
    case "EMPLOYEE_DELETE_FAILED":
      return tr.employeeDeleteFailed;
    case "BOOKING_CREATE_FAILED":
      return tr.bookingCreateFailed;
    case "BOOKING_UPDATE_FAILED":
      return tr.bookingUpdateFailed;
    case "BOOKING_REQUIRED_FIELDS":
      return tr.bookingRequiredFields;
    case "BOOKING_START_IN_PAST":
      return tr.bookingStartInPast;
    case "BOOKING_SLOT_UNAVAILABLE":
      return tr.bookingSlotUnavailable;
    case "CUSTOMER_CREATE_FAILED":
      return tr.customerCreateFailed;
    case "CUSTOMER_UPDATE_FAILED":
      return tr.customerUpdateFailed;
    case "CUSTOMER_NOT_FOUND":
      return tr.customerNotFound;
    case "SERVICE_CREATE_FAILED":
      return tr.serviceCreateFailed;
    case "SERVICE_UPDATE_FAILED":
      return tr.serviceUpdateFailed;
    case "SERVICE_NAME_REQUIRED":
      return tr.serviceNameRequired;
    case "SHIFT_CREATE_FAILED":
      return tr.shiftCreateFailed;
    case "SHIFT_UPDATE_FAILED":
      return tr.shiftUpdateFailed;
    case "SHIFT_OVERRIDE_CREATE_FAILED":
      return tr.shiftOverrideCreateFailed;
    case "SHIFT_OVERRIDE_UPDATE_FAILED":
      return tr.shiftOverrideUpdateFailed;
    case "SHIFT_OVERRIDES_FETCH_FAILED":
      return tr.shiftOverridesFetchFailed;
    case "TIME_BLOCK_CREATE_FAILED":
      return tr.timeBlockCreateFailed;
    case "TIME_BLOCK_UPDATE_FAILED":
      return tr.timeBlockUpdateFailed;
    case "PERSONALLISTE_CREATE_FAILED":
      return tr.personallisteCreateFailed;
    case "PERSONALLISTE_UPDATE_FAILED":
      return tr.personallisteUpdateFailed;
    case "PACKAGE_NOT_FOUND":
      return tr.packageNotFound;
    case "GIFT_CARD_NOT_FOUND":
      return tr.giftCardNotFound;
    case "IMPORT_NO_VALID_ROWS":
      return tr.importNoValidRows;
    case "IMPORT_CREATE_BATCH_FAILED":
      return tr.importCreateBatchFailed;
    case "IMPORT_CHUNK_FAILED":
      return tr.importChunkFailed;
    case "IMPORT_UNKNOWN_TYPE":
      return tr.importUnknownType;
    case "WAITLIST_ENTRY_NOT_FOUND":
      return tr.waitlistEntryNotFound;
    case "WAITLIST_COULD_NOT_CONVERT":
      return tr.waitlistCouldNotConvert;
    case "SALON_ID_REQUIRED":
      return tr.salonIdRequired;
    case "SALON_EMPLOYEE_IDS_REQUIRED":
      return tr.salonEmployeeIdsRequired;
    case "SALON_FULL_NAME_REQUIRED":
      return tr.salonFullNameRequired;
    case "INVALID_EMAIL":
      return tr.invalidEmail;
    case "PHONE_TOO_SHORT":
      return tr.phoneTooShort;
    case "FAILED_TO_LOAD_EMPLOYEES":
      return tr.failedToLoadEmployees;
    default:
      return error;
  }
}
