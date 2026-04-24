import {
  buildTwilioSignaturePayload,
  computeTwilioSignature,
  isValidTwilioSignature,
  mapTwilioStatus,
  statusRank,
} from "./index.ts";

Deno.test("maps Twilio statuses correctly", () => {
  if (mapTwilioStatus("sent") !== "sent") throw new Error("sent mapping failed");
  if (mapTwilioStatus("delivered") !== "delivered") throw new Error("delivered mapping failed");
  if (mapTwilioStatus("undelivered") !== "undelivered") throw new Error("undelivered mapping failed");
  if (mapTwilioStatus("failed") !== "failed") throw new Error("failed mapping failed");
  if (mapTwilioStatus("queued") !== null) throw new Error("unknown status should be ignored");
});

Deno.test("replay guard rank keeps status monotonic", () => {
  if (!(statusRank("sent") < statusRank("delivered"))) throw new Error("rank ordering invalid");
  if (!(statusRank("delivered") < statusRank("failed"))) throw new Error("rank ordering invalid");
});

Deno.test("rejects spoofed Twilio signature", async () => {
  const params = new URLSearchParams();
  params.set("MessageSid", "SM123");
  params.set("MessageStatus", "delivered");

  const valid = await isValidTwilioSignature({
    requestUrl: "https://example.com/sms-status-webhook",
    canonicalUrl: "https://example.com/sms-status-webhook",
    params,
    providedSignature: "bad-signature",
    authToken: "auth-token",
  });

  if (valid) throw new Error("spoofed signature should be rejected");
});

Deno.test("accepts valid Twilio signature", async () => {
  const params = new URLSearchParams();
  params.set("MessageSid", "SM123");
  params.set("MessageStatus", "delivered");
  const url = "https://example.com/sms-status-webhook";
  const payload = buildTwilioSignaturePayload(url, params);
  const signature = await computeTwilioSignature(payload, "auth-token");

  const valid = await isValidTwilioSignature({
    requestUrl: url,
    canonicalUrl: url,
    params,
    providedSignature: signature,
    authToken: "auth-token",
  });

  if (!valid) throw new Error("valid signature should be accepted");
});
