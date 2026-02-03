import { redirect } from "next/navigation";
import AdminLoginPage from "./login/page";

export default function Home() {
  // I dev (localhost:3003): vis login på / uten redirect, så URLen forblir /
  if (process.env.NODE_ENV === "development") {
    return <AdminLoginPage />;
  }
  redirect("/login");
}
