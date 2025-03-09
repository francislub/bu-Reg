import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { CourseChart } from "@/components/dashboard/course-chart";
import { NotificationList } from "@/components/dashboard/notification-list";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={session.user} />
      
      <div className="flex-1 flex">
        <DashboardSidebar user={session.user} />
        
        <main className="flex-1 p-6 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h1 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                Dashboard :: Welcome to Bugema University - Student Portal
              </h1>
              
              <CourseChart />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Latest Notification</h2>
              <NotificationList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
