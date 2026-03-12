import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  cleanupTestSalon,
  cleanupTestUser,
  createServiceRoleClient,
  createTestEmployee,
  createTestSalon,
  createTestService,
  createTestUser,
  isSupabaseConfigured,
  type TestSalon,
  type TestUser,
} from "./setup";

const describeIf = isSupabaseConfigured() ? describe : describe.skip;

describeIf("Booking Concurrency Integration", () => {
  let salon: TestSalon;
  let user: TestUser;
  let employeeId: string;
  let serviceId: string;

  beforeAll(async () => {
    salon = await createTestSalon(`Concurrency Test Salon ${Date.now()}`);
    user = await createTestUser(`concurrency-${Date.now()}@test.com`, { salonId: salon.id });
    employeeId = await createTestEmployee(salon.id);
    serviceId = await createTestService(salon.id);
  });

  afterAll(async () => {
    await cleanupTestUser(user.id);
    await cleanupTestSalon(salon.id);
  });

  it("enforces one winner per conflicting slot over 50 repetitions", async () => {
    const serviceClient = createServiceRoleClient();
    const repetitions = 50;

    for (let i = 0; i < repetitions; i++) {
      const baseTime = new Date();
      baseTime.setDate(baseTime.getDate() + 7);
      baseTime.setHours(9, 0, 0, 0);
      baseTime.setMinutes(baseTime.getMinutes() + i * 45);
      const isoStart = baseTime.toISOString();

      const payload = {
        p_salon_id: salon.id,
        p_employee_id: employeeId,
        p_service_id: serviceId,
        p_start_time: isoStart,
        p_customer_full_name: `Race Customer ${i}`,
        p_customer_email: `race-${Date.now()}-${i}@example.com`,
        p_customer_phone: "+4799988877",
        p_customer_notes: null,
        p_is_walk_in: false,
      };

      const [a, b] = await Promise.all([
        serviceClient.rpc("create_booking_atomic", payload),
        serviceClient.rpc("create_booking_atomic", payload),
      ]);

      const successCount = [a, b].filter((r) => !r.error && r.data).length;
      const conflictCount = [a, b].filter((r) =>
        ["already booked", "exclusion constraint"].some((needle) =>
          (r.error?.message || "").toLowerCase().includes(needle),
        ),
      ).length;

      expect(successCount).toBe(1);
      expect(conflictCount).toBe(1);
    }
  });
});

