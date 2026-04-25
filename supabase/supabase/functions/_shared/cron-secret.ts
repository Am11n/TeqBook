/**
 * Optional shared guard for cron-style Edge Functions invoked with the service role.
 * When TEQBOOK_CRON_SECRET is set, require `Authorization: Bearer <secret>`.
 * When unset, allow invocation (backward compatible) but log once per cold start risk.
 */
export function verifyCronSecret(req: Request): Response | null {
  const secret = Deno.env.get("TEQBOOK_CRON_SECRET")?.trim();
  if (!secret) {
    console.warn(
      "[cron] TEQBOOK_CRON_SECRET is not set — cron endpoints accept unauthenticated invocation. Set TEQBOOK_CRON_SECRET and send Authorization: Bearer … from your scheduler.",
    );
    return null;
  }

  const auth = req.headers.get("Authorization")?.trim();
  if (auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}
