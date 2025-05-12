import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { AcademicYearSemestersClient } from "@/components/dashboard/academic-year-semesters-client"
import { db } from "@/lib/db"

interface AcademicYearSemestersPageProps {
  params: {
    id: string
  }
}

export default async function AcademicYearSemestersPage({ params }: AcademicYearSemestersPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !["REGISTRAR", "ADMIN"].includes(session.user.role)) {
    notFound()
  }

  const academicYear = await db.academicYear.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!academicYear) {
    notFound()
  }

  const semesters = await db.semester.findMany({
    where: {
      academicYearId: params.id,
    },
    orderBy: {
      startDate: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Semesters for {academicYear.name}</h1>
        <p className="text-muted-foreground">Manage semesters for the academic year {academicYear.name}</p>
      </div>
      <Suspense fallback={<SemestersLoading />}>
        <AcademicYearSemestersClient academicYear={academicYear} initialSemesters={semesters} />
      </Suspense>
    </div>
  )
}

function SemestersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="rounded-md border">
        <div className="h-16 px-4 flex items-center border-b">
          <Skeleton className="h-6 w-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 px-4 flex items-center border-b">
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
