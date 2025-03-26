import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import prisma from "@/lib/prisma"

// PUT /api/faculty/[id] - Update a faculty member
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, password, department } = await request.json()

    // Check if faculty member exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingFaculty) {
      return NextResponse.json({ error: "Faculty member not found" }, { status: 404 })
    }

    // If email is being changed, check if it already exists
    if (email !== existingFaculty.email) {
      const facultyWithEmail = await prisma.faculty.findUnique({
        where: {
          email,
        },
      })

      if (facultyWithEmail && facultyWithEmail.id !== params.id) {
        return NextResponse.json({ error: "Email already in use by another faculty member" }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      department,
    }

    // Only hash and update password if provided
    if (password) {
      updateData.password = await hash(password, 10)
    }

    // Update faculty member
    const faculty = await prisma.faculty.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        courses: true,
      },
    })

    // Remove password from response
    const { password: _, ...facultyWithoutPassword } = faculty

    return NextResponse.json(facultyWithoutPassword)
  } catch (error) {
    console.error("Error updating faculty member:", error)
    return NextResponse.json({ error: "Failed to update faculty member" }, { status: 500 })
  }
}

// DELETE /api/faculty/[id] - Delete a faculty member
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if faculty member exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: {
        id: params.id,
      },
      include: {
        courses: true,
      },
    })

    if (!existingFaculty) {
      return NextResponse.json({ error: "Faculty member not found" }, { status: 404 })
    }

    // Check if faculty member has assigned courses
    if (existingFaculty.courses.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete faculty member with assigned courses. Please reassign courses first." },
        { status: 400 },
      )
    }

    // Delete faculty member
    await prisma.faculty.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Faculty member deleted successfully" })
  } catch (error) {
    console.error("Error deleting faculty member:", error)
    return NextResponse.json({ error: "Failed to delete faculty member" }, { status: 500 })
  }
}

