"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Get all departments
 */
export async function getAllDepartments() {
  try {
    const departments = await db.department.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, departments }
  } catch (error) {
    console.error("Error fetching departments:", error)
    return { success: false, message: "Failed to fetch departments", error: error.message }
  }
}

/**
 * Get department by ID
 */
export async function getDepartmentById(id: string) {
  try {
    const department = await db.department.findUnique({
      where: { id },
      include: {
        courses: true,
        programs: true,
      },
    })

    if (!department) {
      return { success: false, message: "Department not found" }
    }

    return { success: true, department }
  } catch (error) {
    console.error("Error fetching department:", error)
    return { success: false, message: "Failed to fetch department", error: error.message }
  }
}

/**
 * Create a new department
 */
export async function createDepartment(data: {
  name: string
  code: string
  description?: string
}) {
  try {
    const department = await db.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    })

    revalidatePath("/dashboard/departments")
    return { success: true, department }
  } catch (error) {
    console.error("Error creating department:", error)
    return { success: false, message: "Failed to create department", error: error.message }
  }
}

/**
 * Update a department
 */
export async function updateDepartment(
  id: string,
  data: {
    name: string
    code: string
    description?: string
  },
) {
  try {
    const department = await db.department.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    })

    revalidatePath("/dashboard/departments")
    return { success: true, department }
  } catch (error) {
    console.error("Error updating department:", error)
    return { success: false, message: "Failed to update department", error: error.message }
  }
}

/**
 * Delete a department
 */
export async function deleteDepartment(id: string) {
  try {
    await db.department.delete({
      where: { id },
    })

    revalidatePath("/dashboard/departments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting department:", error)
    return { success: false, message: "Failed to delete department", error: error.message }
  }
}
