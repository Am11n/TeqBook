import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient, createServerSupabaseClientForRouteHandler } from "@teqbook/shared/server";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "sb-admin-auth-token";

export async function createClient(): Promise<SupabaseClient> {
  return createServerSupabaseClient(ADMIN_COOKIE_NAME);
}

export function createClientForRouteHandler(
  request: NextRequest,
  response: NextResponse
): SupabaseClient {
  return createServerSupabaseClientForRouteHandler(request, response, ADMIN_COOKIE_NAME);
}
