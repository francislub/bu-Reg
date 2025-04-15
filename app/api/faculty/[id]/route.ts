import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userRoles } from "@/lib/utils"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const faculty = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: userRoles.STAFF,
      },
      include: {
        profile: true,
        departmentStaff: {
          include: {
            department: true,
          },
        },
        lecturerCourses: {
          include: {
            course: true,
            semester: true,
          },
        },
      },
    })

    if (!faculty) {
      return NextResponse.json({ message: "Faculty member not found" }, { status: 404 })
    }

    // Transform the data to match the expected format
    const department = faculty.departmentStaff[0]?.department || {
      id: "unknown",
      name: "Unknown Department",
      code: "UNK",
    }

    const formattedFaculty = {
      id: faculty.id,
      name: faculty.name,
      email: faculty.email,
      phone: faculty.profile?.phone || undefined,
      title: faculty.profile?.title || "Lecturer",
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
      },
      specialization: faculty.profile?.specialization || undefined,
      bio: faculty.profile?.bio || undefined,
      imageUrl: faculty.profile?.imageUrl || undefined,
      courses: faculty.lecturerCourses.map((lc) => ({
        id: lc.course.id,
        code: lc.course.code,
        title: lc.course.title,
        semester: {
          id: lc.semester.id,
          name: lc.semester.name,
          isActive: lc.semester.isActive,
        },
      })),
    }

    return NextResponse.json(formattedFaculty)
  } catch (error) {
    console.error("Error fetching faculty member:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
