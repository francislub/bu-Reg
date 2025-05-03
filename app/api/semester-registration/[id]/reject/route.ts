import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only registrars and admins can reject registrations
    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    const { comment } = await req.json()

    if (!comment) {
      return NextResponse.json(
        { message: "Rejection reason is required" },
        { status: 400 }
      )
    }

    const registration = await db.semesterRegistration.update({
      where: {
        id: params.id,
      },
      data: {
        status: "REJECTED",
        comment,
        // Update all course registrations to rejected
        courseRegistrations: {
          updateMany: {
            where: {},
            data: {
              status: "REJECTED",
            },
          },
        },
      },
      include: {
        student: true,
        semester: true,
        courseRegistrations: {
          include: {
            course: true,
          },
        },
      },
    })

    // TODO: Send notification to student about rejection

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error rejecting semester registration:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
