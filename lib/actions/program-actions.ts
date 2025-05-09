"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Get all programs
 */
export async function getAllPrograms() {
  try {
    const programs = await db.program.findMany({
      include: {
        department: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, programs }
  } catch (error) {
    console.error("Error fetching programs:", error)
    return { success: false, message: "Failed to fetch programs", error: error.message }
  }
}

/**
 * Get program by ID
 */
export async function getProgramById(id: string) {
  try {
    const program = await db.program.findUnique({
      where: { id },
      include: {
        department: true,
        programCourses: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
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
    return { success: false, message: "Failed to fetch program", error: error.message }
  }
}

/**
 * Get departments by program ID
 */
export async function getDepartmentsByProgramId(programId: string) {
  try {
    const program = await db.program.findUnique({
      where: { id: programId },
      include: {
        department: true,
      },
    })

    if (!program) {
      return { success: false, message: "Program not found" }
    }

    // Get all departments that have courses in this program
    const programCourses = await db.programCourse.findMany({
      where: { programId },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    // Extract unique departments
    const departmentMap = new Map()
    departmentMap.set(program.department.id, program.department)

    programCourses.forEach((pc) => {
      if (pc.course.department) {
        departmentMap.set(pc.course.department.id, pc.course.department)
      }
    })

    const departments = Array.from(departmentMap.values())

    return { success: true, departments }
  } catch (error) {
    console.error("Error fetching departments by program:", error)
    return { success: false, message: "Failed to fetch departments", error: error.message }
  }
}

/**
 * Get courses by program ID and department ID
 */
export async function getCoursesByProgramAndDepartment(programId: string, departmentId: string) {
  try {
    const programCourses = await db.programCourse.findMany({
      where: { programId },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    // Filter courses by department
    const courses = programCourses.filter((pc) => pc.course.departmentId === departmentId).map((pc) => pc.course)

    return { success: true, courses }
  } catch (error) {
    console.error("Error fetching courses by program and department:", error)
    return { success: false, message: "Failed to fetch courses", error: error.message }
  }
}

/**
 * Create a new program
 */
export async function createProgram(data: {
  name: string
  code: string
  type: string
  duration: number
  description?: string
  departmentId: string
}) {
  try {
    const program = await db.program.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        duration: data.duration,
        description: data.description,
        departmentId: data.departmentId,
      },
    })

    revalidatePath("/dashboard/programs")
    return { success: true, program }
  } catch (error) {
    console.error("Error creating program:", error)
    return { success: false, message: "Failed to create program", error: error.message }
  }
}

/**
 * Update a program
 */
export async function updateProgram(
  id: string,
  data: {
    name: string
    code: string
    type: string
    duration: number
    description?: string
    departmentId: string
  },
) {
  try {
    const program = await db.program.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        duration: data.duration,
        description: data.description,
        departmentId: data.departmentId,
      },
    })

    revalidatePath("/dashboard/programs")
    revalidatePath(`/dashboard/programs/${id}`)
    return { success: true, program }
  } catch (error) {
    console.error("Error updating program:", error)
    return { success: false, message: "Failed to update program", error: error.message }
  }
}

/**
 * Delete a program
 */
export async function deleteProgram(id: string) {
  try {
    await db.program.delete({
      where: { id },
    })

    revalidatePath("/dashboard/programs")
    return { success: true }
  } catch (error) {
    console.error("Error deleting program:", error)
    return { success: false, message: "Failed to delete program", error: error.message }
  }
}

/**
 * Add a course to a program
 */
export async function addCourseToProgram(programId: string, courseId: string) {
  try {
    // Check if the course is already in the program
    const existingProgramCourse = await db.programCourse.findFirst({
      where: {
        programId,
        courseId,
      },
    })

    if (existingProgramCourse) {
      return { success: false, message: "Course is already in the program" }
    }

    const programCourse = await db.programCourse.create({
      data: {
        programId,
        courseId,
      },
    })

    revalidatePath(`/dashboard/programs/${programId}`)
    return { success: true, programCourse }
  } catch (error) {
    console.error("Error adding course to program:", error)
    return { success: false, message: "Failed to add course to program", error: error.message }
  }
}

/**
 * Remove a course from a program
 */
export async function removeCourseFromProgram(programId: string, courseId: string) {
  try {
    await db.programCourse.deleteMany({
      where: {
        programId,
        courseId,
      },
    })

    revalidatePath(`/dashboard/programs/${programId}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing course from program:", error)
    return { success: false, message: "Failed to remove course from program", error: error.message }
  }
}
