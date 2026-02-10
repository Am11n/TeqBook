import { redirect } from "next/navigation";
import AdminLoginPage from "./login/page";

export default function Home() {
  // I dev (localhost:3003): vis login på / uten redirect, så URLen forblir /
  if (process.env.NODE_ENV === "development") {
    return <AdminLoginPage />;
  }

  // In production with basePath (/admin), root "/" maps to teqbook.com/admin/.
  // Redirect to /admin (the dashboard route) so authenticated users land on the dashboard.
  // Without basePath (standalone), redirect to /login.
  const basePath = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH ?? "";
  if (basePath) {
    redirect("/admin");
  }
  redirect("/login");
}
