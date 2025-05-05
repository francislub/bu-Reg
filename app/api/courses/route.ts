import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const programId = url.searchParams.get("programId")

    // If user is a student, get their profile to determine their program
    let studentProgramId = programId
    if (session.user.role === "STUDENT" && !programId) {
      const userProfile = await db.profile.findFirst({
        where: {
          user: {
            id: session.user.id,
          },
        },
      })

      if (userProfile?.programId) {
        studentProgramId = userProfile.programId
      }
    }

    let courses = []
    let departments = []

    // If we have a program ID (either from query or from student profile), filter courses by program
    if (studentProgramId) {
      // Get program details to find department
      const program = await db.program.findUnique({
        where: { id: studentProgramId },
        include: { department: true },
      })

      if (program) {
        // Get courses for this program through programCourses relation
        courses = await db.course.findMany({
          where: {
            programCourses: {
              some: {
                programId: studentProgramId,
              },
            },
          },
          include: {
            department: true,
            semesterCourses: {
              include: {
                semester: true,
              },
            },
          },
          orderBy: {
            code: "asc",
          },
        })

        // Get department for dropdown
        departments = [program.department]
      }
    } else {
      // For admin/registrar/staff, show all courses
      courses = await db.course.findMany({
        include: {
          department: true,
          semesterCourses: {
            include: {
              semester: true,
            },
          },
        },
        orderBy: {
          code: "asc",
        },
      })

      // Also fetch departments for the dropdown
      departments = await db.department.findMany({
        orderBy: {
          name: "asc",
        },
      })
    }

    return NextResponse.json({
      success: true,
      courses,
      departments,
    })
  } catch (error) {
    console.error("Error in courses API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Update the POST method to handle program and semester associations
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.role !== "STAFF")
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.code || !data.title || !data.credits || !data.departmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Check if course with same code already exists
    const existingCourse = await db.course.findFirst({
      where: {
        code: data.code,
        NOT: data.id ? { id: data.id } : undefined,
      },
    })

    if (existingCourse) {
      return NextResponse.json(
        {
          success: false,
          error: "Course with this code already exists",
        },
        { status: 400 },
      )
    }

    // Create or update course
    let course
    if (data.id) {
      // Update the course
      course = await db.course.update({
        where: { id: data.id },
        data: {
          code: data.code,
          title: data.title,
          credits: Number.parseInt(data.credits),
          departmentId: data.departmentId,
          description: data.description,
        },
      })

      // Handle program associations
      if (data.programIds && Array.isArray(data.programIds)) {
        // Delete existing program associations
        await db.programCourse.deleteMany({
          where: { courseId: data.id },
        })

        // Create new program associations
        if (data.programIds.length > 0) {
          await Promise.all(
            data.programIds.map(async (programId: string) => {
              await db.programCourse.create({
                data: {
                  programId,
                  courseId: data.id,
                },
              })
            }),
          )
        }
      }

      // Handle semester associations
      if (data.semesterIds && Array.isArray(data.semesterIds)) {
        // Delete existing semester associations
        await db.semesterCourse.deleteMany({
          where: { courseId: data.id },
        })

        // Create new semester associations
        if (data.semesterIds.length > 0) {
          await Promise.all(
            data.semesterIds.map(async (semesterId: string) => {
              await db.semesterCourse.create({
                data: {
                  semesterId,
                  courseId: data.id,
                },
              })
            }),
          )
        }
      }
    } else {
      // Create new course
      course = await db.course.create({
        data: {
          code: data.code,
          title: data.title,
          credits: Number.parseInt(data.credits),
          departmentId: data.departmentId,
          description: data.description,
        },
      })

      // Create program associations
      if (data.programIds && Array.isArray(data.programIds) && data.programIds.length > 0) {
        await Promise.all(
          data.programIds.map(async (programId: string) => {
            await db.programCourse.create({
              data: {
                programId,
                courseId: course.id,
              },
            })
          }),
        )
      }

      // Create semester associations
      if (data.semesterIds && Array.isArray(data.semesterIds) && data.semesterIds.length > 0) {
        await Promise.all(
          data.semesterIds.map(async (semesterId: string) => {
            await db.semesterCourse.create({
              data: {
                semesterId,
                courseId: course.id,
              },
            })
          }),
        )
      }
    }

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error("Error creating/updating course:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create/update course",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
