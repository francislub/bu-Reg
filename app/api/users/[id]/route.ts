import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const userUpdateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  firstName: z.string().min(2),
  middleName: z.string().optional(),
  lastName: z.string().min(2),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  religion: z.string().optional(),
  church: z.string().optional(),
  responsibility: z.string().optional(),
  referralSource: z.string().optional(),
  physicallyDisabled: z.boolean().default(false),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Users can only view their own profile unless they are staff or registrar
    if (session.user.id !== params.id && session.user.role === "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Users can only update their own profile
    if (session.user.id !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = userUpdateSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (validatedData.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: validatedData.email,
        },
      })

      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json({ message: "Email is already taken" }, { status: 409 })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        name: validatedData.name,
        email: validatedData.email,
      },
    })

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: {
        id: user.profileId!,
      },
      data: {
        firstName: validatedData.firstName,
        middleName: validatedData.middleName,
        lastName: validatedData.lastName,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        gender: validatedData.gender,
        nationality: validatedData.nationality,
        maritalStatus: validatedData.maritalStatus,
        religion: validatedData.religion,
        church: validatedData.church,
        responsibility: validatedData.responsibility,
        referralSource: validatedData.referralSource,
        physicallyDisabled: validatedData.physicallyDisabled,
      },
    })

    // Return updated user with profile
    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json({
      ...userWithoutPassword,
      profile: updatedProfile,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
