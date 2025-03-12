import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminDashboard } from "@/components/admin/dashboard";
import type { UserRole } from "@prisma/client";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader user={session.user} />
      
      <div className="flex-1 flex">
        <AdminSidebar />
        
        <main className="flex-1 p-6 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <AdminDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}
