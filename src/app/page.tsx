import { cookies } from "next/headers";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  const cookieStore = await cookies();
  const isConnected = !!cookieStore.get("access_token");
  return <Dashboard isConnected={isConnected} />;
}
