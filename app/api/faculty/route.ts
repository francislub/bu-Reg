import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userRoles } from "@/lib/utils"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("departmentId")
    const search = searchParams.get("search")

    const whereClause: any = {
      role: userRoles.STAFF,
    }

    if (departmentId) {
      whereClause.departmentStaff = {
        some: {
          departmentId,
        },
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { profile: { title: { contains: search, mode: "insensitive" } } },
        { profile: { specialization: { contains: search, mode: "insensitive" } } },
      ]
    }

    const faculty = await prisma.user.findMany({
      where: whereClause,
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
          },
          where: {
            semester: {
              isActive: true,
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    // Transform the data to match the expected format
    const formattedFaculty = faculty.map((member) => {
      const department = member.departmentStaff[0]?.department || {
        id: "unknown",
        name: "Unknown Department",
        code: "UNK",
      }

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.profile?.phone || undefined,
        title: member.profile?.title || "Lecturer",
        department: {
          id: department.id,
          name: department.name,
          code: department.code,
        },
        specialization: member.profile?.specialization || undefined,
        bio: member.profile?.bio || undefined,
        imageUrl: member.profile?.imageUrl || undefined,
        courses: member.lecturerCourses.map((lc) => ({
          id: lc.course.id,
          code: lc.course.code,
          title: lc.course.title,
        })),
      }
    })

    return NextResponse.json(formattedFaculty)
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
