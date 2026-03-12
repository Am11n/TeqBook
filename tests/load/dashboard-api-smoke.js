import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.LOAD_BASE_URL || "https://staging.teqbook.app";
const healthPath = __ENV.DASHBOARD_HEALTH_PATH || "/api/health";

export const options = {
  stages: [
    { duration: "2m", target: 20 },
    { duration: "6m", target: 80 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<250"],
  },
};

export default function () {
  const response = http.get(`${baseUrl}${healthPath}`);
  check(response, {
    "status is healthy": (r) => r.status === 200 || r.status === 401 || r.status === 403,
  });
  sleep(1);
}

