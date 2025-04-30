import { Suspense } from "react"
import CoursesClient from "@/components/dashboard/courses-client"
import CoursesLoading from "./loading"

export const metadata = {
  title: "Courses | Bugema University",
  description: "View and manage courses",
}

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<CoursesLoading />}>
        <CoursesClient />
      </Suspense>
    </div>
  )
}
