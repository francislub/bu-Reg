"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getAllDepartments() {
  try {
    const departments = await db.department.findMany({
      include: {
        courses: true,
        departmentStaff: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })

    return { success: true, departments }
  } catch (error) {
    console.error("Error fetching departments:", error)
    return { success: false, message: "Failed to fetch departments" }
  }
}

export async function getDepartmentById(departmentId: string) {
  try {
    const department = await db.department.findUnique({
      where: { id: departmentId },
      include: {
        courses: true,
        departmentStaff: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })

    if (!department) {
      return { success: false, message: "Department not found" }
    }

    return { success: true, department }
  } catch (error) {
    console.error("Error fetching department:", error)
    return { success: false, message: "Failed to fetch department" }
  }
}

export async function createDepartment(data: { name: string; code: string }) {
  try {
    // Check if department with same code already exists
    const existingDepartment = await db.department.findUnique({
      where: { code: data.code },
    })

    if (existingDepartment) {
      return { success: false, message: "Department with this code already exists" }
    }

    const department = await db.department.create({
      data: {
        name: data.name,
        code: data.code,
      },
    })

    revalidatePath("/dashboard/departments")
    return { success: true, department }
  } catch (error) {
    console.error("Error creating department:", error)
    return { success: false, message: "Failed to create department" }
  }
}

export async function updateDepartment(departmentId: string, data: { name: string; code: string }) {
  try {
    // Check if another department with same code already exists
    const existingDepartment = await db.department.findFirst({
      where: {
        code: data.code,
        NOT: {
          id: departmentId,
        },
      },
    })

    if (existingDepartment) {
      return { success: false, message: "Another department with this code already exists" }
    }

    const department = await db.department.update({
      where: { id: departmentId },
      data: {
        name: data.name,
        code: data.code,
      },
    })

    revalidatePath("/dashboard/departments")
    return { success: true, department }
  } catch (error) {
    console.error("Error updating department:", error)
    return { success: false, message: "Failed to update department" }
  }
}

export async function deleteDepartment(departmentId: string) {
  try {
    await db.department.delete({
      where: { id: departmentId },
    })

    revalidatePath("/dashboard/departments")
    return { success: true, message: "Department deleted successfully" }
  } catch (error) {
    console.error("Error deleting department:", error)
    return { success: false, message: "Failed to delete department" }
  }
}

export async function assignDepartmentHead(departmentId: string, userId: string) {
  try {
    // First, remove any existing department head
    await db.departmentStaff.updateMany({
      where: {
        departmentId,
        isHead: true,
      },
      data: {
        isHead: false,
      },
    })

    // Check if user is already in department
    const existingStaff = await db.departmentStaff.findFirst({
      where: {
        departmentId,
        userId,
      },
    })

    if (existingStaff) {
      // Update existing staff to be head
      await db.departmentStaff.update({
        where: { id: existingStaff.id },
        data: { isHead: true },
      })
    } else {
      // Create new department staff entry
      await db.departmentStaff.create({
        data: {
          departmentId,
          userId,
          isHead: true,
        },
      })
    }

    revalidatePath("/dashboard/departments")
    return { success: true, message: "Department head assigned successfully" }
  } catch (error) {
    console.error("Error assigning department head:", error)
    return { success: false, message: "Failed to assign department head" }
  }
}
