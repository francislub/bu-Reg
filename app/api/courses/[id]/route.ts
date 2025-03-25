import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/courses/[id] - Get a course by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        registrations: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                registrationNo: true,
                profile: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

// PUT /api/courses/[id] - Update a course
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const {
      code,
      title,
      credits,
      description,
      department,
      semester,
      academicYear,
      maxCapacity,
      prerequisites,
      facultyId,
    } = body

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // If code is being changed, check if new code already exists
    if (code !== existingCourse.code) {
      const courseWithCode = await prisma.course.findUnique({
        where: {
          code,
        },
      })

      if (courseWithCode && courseWithCode.id !== params.id) {
        return NextResponse.json({ error: "Course with this code already exists" }, { status: 400 })
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: {
        id: params.id,
      },
      data: {
        code,
        title,
        credits,
        description,
        department,
        semester,
        academicYear,
        maxCapacity,
        prerequisites: prerequisites || [],
        facultyId,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if course has registrations
    const registrationsCount = await prisma.registration.count({
      where: {
        courseId: params.id,
      },
    })

    if (registrationsCount > 0) {
      return NextResponse.json({ error: "Cannot delete course with existing registrations" }, { status: 400 })
    }

    // Delete course
    await prisma.course.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}

