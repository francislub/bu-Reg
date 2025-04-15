import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userRoles } from "@/lib/utils"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const courseUpload = await prisma.courseUpload.findUnique({
      where: {
        id: params.id,
      },
      include: {
        registration: true,
      },
    })

    if (!courseUpload) {
      return NextResponse.json({ message: "Course upload not found" }, { status: 404 })
    }

    // Check if user is removing their own course or has permission
    if (session.user.id !== courseUpload.userId && session.user.role === userRoles.STUDENT) {
      return NextResponse.json({ message: "You can only remove your own courses" }, { status: 403 })
    }

    // Check if course is already approved
    if (courseUpload.status === "APPROVED" && session.user.role === userRoles.STUDENT) {
      return NextResponse.json({ message: "Cannot remove approved courses" }, { status: 400 })
    }

    // Delete course upload
    await prisma.courseUpload.delete({
      where: {
        id: params.id,
      },
    })

    // Check if this was the last course for the registration
    const remainingCourses = await prisma.courseUpload.count({
      where: {
        registrationId: courseUpload.registrationId,
      },
    })

    // If no courses left, delete the registration
    if (remainingCourses === 0) {
      await prisma.registration.delete({
        where: {
          id: courseUpload.registrationId,
        },
      })
    }

    return NextResponse.json({ message: "Course removed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error removing course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only staff and registrars can update course status
    if (session.user.role === userRoles.STUDENT) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { status, comments } = body

    if (!status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    const courseUpload = await prisma.courseUpload.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    if (!courseUpload) {
      return NextResponse.json({ message: "Course upload not found" }, { status: 404 })
    }

    // If staff, check if they belong to the course's department
    if (session.user.role === userRoles.STAFF) {
      const staffDepartment = await prisma.departmentStaff.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!staffDepartment || staffDepartment.departmentId !== courseUpload.course.departmentId) {
        return NextResponse.json({ message: "You can only approve courses from your department" }, { status: 403 })
      }
    }

    // Update course upload status
    const updatedCourseUpload = await prisma.courseUpload.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    })

    // Create approval record
    await prisma.courseApproval.create({
      data: {
        courseUploadId: params.id,
        approverId: session.user.id,
        status,
        comments,
      },
    })

    // Check if all courses for this registration are approved
    if (status === "APPROVED") {
      const registration = await prisma.registration.findUnique({
        where: {
          id: courseUpload.registrationId,
        },
        include: {
          courseUploads: true,
        },
      })

      if (registration) {
        const allApproved = registration.courseUploads.every((upload) => upload.status === "APPROVED")

        if (allApproved) {
          // Update registration status
          await prisma.registration.update({
            where: {
              id: registration.id,
            },
            data: {
              status: "APPROVED",
            },
          })

          // Create registration card if it doesn't exist
          const existingCard = await prisma.registrationCard.findFirst({
            where: {
              userId: registration.userId,
              semesterId: registration.semesterId,
            },
          })

          if (!existingCard) {
            await prisma.registrationCard.create({
              data: {
                userId: registration.userId,
                semesterId: registration.semesterId,
                cardNumber: `REG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
              },
            })
          }
        }
      }
    }

    return NextResponse.json(updatedCourseUpload)
  } catch (error) {
    console.error("Error updating course upload:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const courseUpload = await prisma.courseUpload.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!courseUpload) {
      return NextResponse.json({ message: "Course upload not found" }, { status: 404 })
    }

    // Students can only view their own course uploads
    if (session.user.role === userRoles.STUDENT && session.user.id !== courseUpload.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(courseUpload)
  } catch (error) {
    console.error("Error fetching course upload:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
