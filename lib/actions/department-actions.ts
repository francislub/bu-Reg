"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

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
    return { success: false, message: "Failed to fetch departments" }
  }
}

export async function getDepartmentById(departmentId: string) {
  try {
    const department = await db.department.findUnique({
      where: { id: departmentId },
      include: {
        courses: true,
        programs: true,
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

export async function createDepartment(data: {
  name: string
  code: string
}) {
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

export async function updateDepartment(
  departmentId: string,
  data: {
    name: string
    code: string
  },
) {
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

export async function getDepartmentStaff(departmentId: string) {
  try {
    const departmentStaff = await db.departmentStaff.findMany({
      where: { departmentId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    return { success: true, departmentStaff }
  } catch (error) {
    console.error("Error fetching department staff:", error)
    return { success: false, message: "Failed to fetch department staff" }
  }
}

export async function addStaffToDepartment(data: {
  userId: string
  departmentId: string
  isHead: boolean
}) {
  try {
    // Check if staff is already in department
    const existingStaff = await db.departmentStaff.findFirst({
      where: {
        userId: data.userId,
      },
    })

    if (existingStaff) {
      return { success: false, message: "Staff is already assigned to a department" }
    }

    // If setting as head, remove current head if exists
    if (data.isHead) {
      await db.departmentStaff.updateMany({
        where: {
          departmentId: data.departmentId,
          isHead: true,
        },
        data: {
          isHead: false,
        },
      })
    }

    const departmentStaff = await db.departmentStaff.create({
      data: {
        userId: data.userId,
        departmentId: data.departmentId,
        isHead: data.isHead,
      },
    })

    revalidatePath("/dashboard/departments")
    return { success: true, departmentStaff }
  } catch (error) {
    console.error("Error adding staff to department:", error)
    return { success: false, message: "Failed to add staff to department" }
  }
}

export async function removeStaffFromDepartment(departmentStaffId: string) {
  try {
    await db.departmentStaff.delete({
      where: { id: departmentStaffId },
    })

    revalidatePath("/dashboard/departments")
    return { success: true, message: "Staff removed from department successfully" }
  } catch (error) {
    console.error("Error removing staff from department:", error)
    return { success: false, message: "Failed to remove staff from department" }
  }
}
