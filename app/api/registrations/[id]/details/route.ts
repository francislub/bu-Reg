import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const registrationId = params.id

    // Check if the registration exists
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
        registrationCard: true,
      },
    })

    if (!registration) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 })
    }

    // Check if the user is authorized to view this registration
    if (registration.userId !== session.user.id && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Format the response
    const formattedRegistration = {
      id: registration.id,
      user: registration.user,
      semester: {
        name: registration.semester.name,
        academicYear: {
          name: registration.semester.academicYear.name,
        },
      },
      status: registration.status,
      createdAt: registration.createdAt,
      courses: registration.courseUploads.map((upload) => ({
        id: upload.id,
        course: {
          code: upload.course.code,
          title: upload.course.title,
          credits: upload.course.credits,
          department: {
            name: upload.course.department.name,
          },
        },
        status: upload.status,
      })),
      registrationCard: registration.registrationCard
        ? {
            cardNumber: registration.registrationCard.cardNumber,
            issuedDate: registration.registrationCard.issuedDate,
          }
        : null,
    }

    return NextResponse.json({ success: true, registration: formattedRegistration })
  } catch (error) {
    console.error("Error fetching registration details:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching registration details" },
      { status: 500 },
    )
  }
}
