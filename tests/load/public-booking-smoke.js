import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.LOAD_BASE_URL || "https://staging.teqbook.app";
const bookingInitialPath = __ENV.BOOKING_INITIAL_PATH || "/api/public-booking/initial";

export const options = {
  stages: [
    { duration: "2m", target: 25 },
    { duration: "5m", target: 100 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<300"],
  },
};

export default function () {
  const response = http.get(`${baseUrl}${bookingInitialPath}`);
  check(response, {
    "status is < 500": (r) => r.status < 500,
  });
  sleep(1);
}

