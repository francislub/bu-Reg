import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/dashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }
  
  return (
      
        <main className="flex-1 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <AdminDashboard />
          </div>
        </main>
  );
}
