"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
 * Get departments by program ID
 */
export async function getDepartmentsByProgramId(programId: string) {
  try {
    // First, get the program to verify it exists
    const program = await db.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return { success: false, message: "Program not found" }
    }

    // Get the department associated with this program
    const department = await db.department.findUnique({
      where: { id: program.departmentId },
    })

    if (!department) {
      return { success: false, message: "Department not found for this program" }
    }

    return { success: true, departments: [department] }
  } catch (error) {
    console.error("Error fetching departments by program:", error)
    return { success: false, message: "Failed to fetch departments", error: error.message }
  }
}

/**
 * Get courses by program and department
 */
export async function getCoursesByProgramAndDepartment(programId: string, departmentId: string) {
  try {
    // Get courses that are associated with the program and department
    const programCourses = await db.programCourse.findMany({
      where: {
        programId,
        course: {
          departmentId,
        },
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    // Extract just the courses from the program courses
    const courses = programCourses.map((pc) => pc.course)

    return { success: true, courses }
  } catch (error) {
    console.error("Error fetching courses by program and department:", error)
    return { success: false, message: "Failed to fetch courses", error: error.message }
  }
}

/**
 * Update student program and department
 */
export async function updateStudentProgramAndDepartment(userId: string, programId: string, departmentId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Get program name for reference
    const program = await db.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return { success: false, message: "Program not found" }
    }

    // Update profile with program and department
    if (user.profileId) {
      await db.profile.update({
        where: { id: user.profileId },
        data: {
          programId,
          departmentId,
          program: program.name, // Store program name for easy reference
        },
      })
    } else {
      // Create profile if it doesn't exist (unlikely but handling edge case)
      const profile = await db.profile.create({
        data: {
          firstName: user.name?.split(" ")[0] || "Student",
          lastName: user.name?.split(" ").slice(1).join(" ") || "",
          programId,
          departmentId,
          program: program.name,
        },
      })

      await db.user.update({
        where: { id: userId },
        data: { profileId: profile.id },
      })
    }

    revalidatePath("/dashboard/profile")
    revalidatePath(`/dashboard/students/${userId}`)

    return { success: true, message: "Program and department updated successfully" }
  } catch (error) {
    console.error("Error updating program and department:", error)
    return { success: false, message: "Failed to update program and department", error: error.message }
  }
}
