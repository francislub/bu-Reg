import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import type { User } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as User & { id: string; role: string }
    const registration = await prisma.registration.findUnique({
      where: { id: params.id },
      include: { course: true, student: { select: { id: true, name: true, email: true, registrationNo: true } } },
    })

    if (!registration) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 })
    }

    if (registration.studentId !== user.id && user.role !== "ADMIN" && user.role !== "FACULTY") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error fetching registration:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as User & { id: string; role: string }
    const { status } = await req.json()

    const registration = await prisma.registration.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: true,
      },
    })

    if (!registration) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 })
    }

    if (status && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    if (registration.studentId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const updatedRegistration = await prisma.registration.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    })

    await prisma.notification.create({
      data: {
        title: "Registration Status Update",
        message: `Your registration for ${registration.course.code}: ${registration.course.title} has been ${status.toLowerCase()}.`,
        type: "REGISTRATION",
        userId: registration.studentId,
      },
    })

    return NextResponse.json(updatedRegistration)
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as User & { id: string; role: string }
    const registration = await prisma.registration.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: true,
      },
    })

    if (!registration) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 })
    }

    if (
      (registration.studentId !== user.id || registration.status !== "PENDING") &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    await prisma.registration.delete({
      where: {
        id: params.id,
      },
    })

    await prisma.course.update({
      where: {
        id: registration.courseId,
      },
      data: {
        currentEnrolled: {
          decrement: 1,
        },
      },
    })

    await prisma.notification.create({
      data: {
        title: "Registration Cancelled",
        message: `Your registration for ${registration.course.code}: ${registration.course.title} has been cancelled.`,
        type: "REGISTRATION",
        userId: registration.studentId,
      },
    })

    return NextResponse.json({ message: "Registration cancelled successfully" })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

