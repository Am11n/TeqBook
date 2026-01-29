import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient, createServerSupabaseClientForRouteHandler } from "@teqbook/shared/server";
import { NextRequest, NextResponse } from "next/server";

export async function createClient(): Promise<SupabaseClient> {
  return createServerSupabaseClient();
}

export function createClientForRouteHandler(
  request: NextRequest,
  response: NextResponse
): SupabaseClient {
  return createServerSupabaseClientForRouteHandler(request, response);
}
