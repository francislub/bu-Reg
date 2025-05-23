import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters for pagination and filtering
    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const departmentId = searchParams.get("departmentId")
    const credits = searchParams.get("credits") ? Number.parseInt(searchParams.get("credits") || "0") : null
    const search = searchParams.get("search")

    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Build the where clause for filtering
    const where: any = {}

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (credits !== null) {
      where.credits = credits
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count for pagination
    const totalCount = await db.course.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    // Fetch courses with pagination and filtering
    const courses = await db.course.findMany({
      where,
      include: {
        department: true,
      },
      orderBy: {
        code: "asc",
      },
      skip,
      take: limit,
    })

    // Fetch all departments for the dropdown
    const departments = await db.department.findMany({
      orderBy: {
        name: "asc",
      },
    })

    // If count parameter is provided, just return the count
    if (searchParams.get("count") === "true") {
      return NextResponse.json({
        success: true,
        count: totalCount,
      })
    }

    return NextResponse.json({
      success: true,
      courses,
      departments,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Only staff, registrars, and admins can create/update courses
    if (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const data = await req.json()
    const { id, code, title, credits, description, departmentId, programIds, semesterIds } = data

    // Validate required fields
    if (!code || !title || !credits || !departmentId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if department exists
    const department = await db.department.findUnique({
      where: { id: departmentId },
    })

    if (!department) {
      return NextResponse.json({ success: false, error: "Department not found" }, { status: 404 })
    }

    // If id is provided, update existing course
    if (id) {
      // Check if course exists
      const existingCourse = await db.course.findUnique({
        where: { id },
      })

      if (!existingCourse) {
        return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
      }

      // Check if code is already used by another course
      if (code !== existingCourse.code) {
        const courseWithSameCode = await db.course.findUnique({
          where: { code },
        })

        if (courseWithSameCode) {
          return NextResponse.json({ success: false, error: "Course code already exists" }, { status: 400 })
        }
      }

      // Update course
      const updatedCourse = await db.course.update({
        where: { id },
        data: {
          code,
          title,
          credits,
          description,
          departmentId,
        },
      })

      // Update program associations if provided
      if (programIds && programIds.length > 0) {
        // Delete existing associations
        await db.programCourse.deleteMany({
          where: { courseId: id },
        })

        // Create new associations
        for (const programId of programIds) {
          await db.programCourse.create({
            data: {
              programId,
              courseId: id,
            },
          })
        }
      }

      // Update semester associations if provided
      if (semesterIds && semesterIds.length > 0) {
        // Delete existing associations
        await db.semesterCourse.deleteMany({
          where: { courseId: id },
        })

        // Create new associations
        for (const semesterId of semesterIds) {
          await db.semesterCourse.create({
            data: {
              semesterId,
              courseId: id,
            },
          })
        }
      }

      return NextResponse.json({
        success: true,
        course: updatedCourse,
      })
    } else {
      // Check if code is already used
      const existingCourse = await db.course.findUnique({
        where: { code },
      })

      if (existingCourse) {
        return NextResponse.json({ success: false, error: "Course code already exists" }, { status: 400 })
      }

      // Create new course
      const newCourse = await db.course.create({
        data: {
          code,
          title,
          credits,
          description,
          departmentId,
        },
      })

      // Create program associations if provided
      if (programIds && programIds.length > 0) {
        for (const programId of programIds) {
          await db.programCourse.create({
            data: {
              programId,
              courseId: newCourse.id,
            },
          })
        }
      }

      // Create semester associations if provided
      if (semesterIds && semesterIds.length > 0) {
        for (const semesterId of semesterIds) {
          await db.semesterCourse.create({
            data: {
              semesterId,
              courseId: newCourse.id,
            },
          })
        }
      }

      return NextResponse.json({
        success: true,
        course: newCourse,
      })
    }
  } catch (error) {
    console.error("Error creating/updating course:", error)
    return NextResponse.json({ success: false, error: "Failed to create/update course" }, { status: 500 })
  }
}
