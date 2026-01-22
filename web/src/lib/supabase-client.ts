/**
 * @deprecated This file is kept for backward compatibility.
 * For server components and API routes, use `@/lib/supabase/server`
 * For client components, use `@/lib/supabase/client`
 * 
 * This export will be removed in a future version.
 */
import { createClient as createBrowserClient } from "@/lib/supabase/client";

// Export browser client for backward compatibility
// Note: This should only be used in client components
// For server-side code, use createClient from @/lib/supabase/server
export const supabase = createBrowserClient();


