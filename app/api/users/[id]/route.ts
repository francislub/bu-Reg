import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcrypt"

// GET /api/users/[id] - Get a user by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        profile: true,
        registrations: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, email, password, role, registrationNo, profile } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      registrationNo,
    }

    // Only hash and update password if provided
    if (password) {
      updateData.password = await hash(password, 10)
    }

    // Update user
    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
    })

    // Update profile if provided
    if (profile) {
      if (existingUser.profile) {
        await prisma.profile.update({
          where: {
            userId: params.id,
          },
          data: {
            department: profile.department,
            program: profile.program,
            campus: profile.campus,
            yearOfStudy: profile.yearOfStudy,
            phoneNumber: profile.phoneNumber,
            address: profile.address,
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
            gender: profile.gender,
            profileImageUrl: profile.profileImageUrl,
          },
        })
      } else {
        await prisma.profile.create({
          data: {
            userId: params.id,
            department: profile.department,
            program: profile.program,
            campus: profile.campus,
            yearOfStudy: profile.yearOfStudy,
            phoneNumber: profile.phoneNumber,
            address: profile.address,
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
            gender: profile.gender,
            profileImageUrl: profile.profileImageUrl,
          },
        })
      }
    }

    // Get updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        profile: true,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser!

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user (cascade will handle profile deletion)
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

