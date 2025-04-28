"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getAllPrograms() {
  try {
    const programs = await db.program.findMany({
      include: {
        department: true,
        programCourses: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, programs }
  } catch (error) {
    console.error("Error fetching programs:", error)
    return { success: false, message: "Failed to fetch programs" }
  }
}

export async function getProgramById(programId: string) {
  try {
    const program = await db.program.findUnique({
      where: { id: programId },
      include: {
        department: true,
        programCourses: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!program) {
      return { success: false, message: "Program not found" }
    }

    return { success: true, program }
  } catch (error) {
    console.error("Error fetching program:", error)
    return { success: false, message: "Failed to fetch program" }
  }
}

export async function createProgram(data: {
  name: string
  code: string
  type: string
  duration: number
  departmentId: string
  description?: string
}) {
  try {
    // Check if program with same code already exists
    const existingProgram = await db.program.findUnique({
      where: { code: data.code },
    })

    if (existingProgram) {
      return { success: false, message: "Program with this code already exists" }
    }

    const program = await db.program.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        duration: data.duration,
        departmentId: data.departmentId,
        description: data.description,
      },
    })

    revalidatePath("/dashboard/programs")
    return { success: true, program }
  } catch (error) {
    console.error("Error creating program:", error)
    return { success: false, message: "Failed to create program" }
  }
}

export async function updateProgram(
  programId: string,
  data: {
    name: string
    code: string
    type: string
    duration: number
    departmentId: string
    description?: string
  },
) {
  try {
    // Check if program with same code already exists (excluding this program)
    const existingProgram = await db.program.findFirst({
      where: {
        code: data.code,
        id: { not: programId },
      },
    })

    if (existingProgram) {
      return { success: false, message: "Another program with this code already exists" }
    }

    const program = await db.program.update({
      where: { id: programId },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        duration: data.duration,
        departmentId: data.departmentId,
        description: data.description,
      },
    })

    revalidatePath(`/dashboard/programs/${programId}`)
    revalidatePath("/dashboard/programs")
    return { success: true, program }
  } catch (error) {
    console.error("Error updating program:", error)
    return { success: false, message: "Failed to update program" }
  }
}

export async function deleteProgram(programId: string) {
  try {
    await db.program.delete({
      where: { id: programId },
    })

    revalidatePath("/dashboard/programs")
    return { success: true, message: "Program deleted successfully" }
  } catch (error) {
    console.error("Error deleting program:", error)
    return { success: false, message: "Failed to delete program" }
  }
}

export async function addCoursesToProgram(programId: string, courseIds: string[]) {
  try {
    // Filter out courses that are already in the program
    const existingProgramCourses = await db.programCourse.findMany({
      where: {
        programId: programId,
        courseId: { in: courseIds },
      },
    })

    const existingCourseIds = existingProgramCourses.map((pc) => pc.courseId)
    const newCourseIds = courseIds.filter((id) => !existingCourseIds.includes(id))

    if (newCourseIds.length === 0) {
      return { success: true, message: "No new courses to add" }
    }

    // Create program courses for the new courses
    await Promise.all(
      newCourseIds.map((courseId) =>
        db.programCourse.create({
          data: {
            programId: programId,
            courseId: courseId,
          },
        }),
      ),
    )

    revalidatePath(`/dashboard/programs/${programId}`)
    return { success: true, message: `${newCourseIds.length} course(s) added to program successfully` }
  } catch (error) {
    console.error("Error adding courses to program:", error)
    return { success: false, message: "Failed to add courses to program" }
  }
}

export async function removeCourseFromProgram(programId: string, courseId: string) {
  try {
    await db.programCourse.deleteMany({
      where: {
        programId: programId,
        courseId: courseId,
      },
    })

    revalidatePath(`/dashboard/programs/${programId}`)
    return { success: true, message: "Course removed from program successfully" }
  } catch (error) {
    console.error("Error removing course from program:", error)
    return { success: false, message: "Failed to remove course from program" }
  }
}
