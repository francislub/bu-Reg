import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { CourseRegistrationForm } from "@/components/dashboard/course-registration-form";

export default async function RegistrationPage() {
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
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-xl font-semibold mb-6">Course Registration</h1>
              
              <CourseRegistrationForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
