"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getAllAcademicYears() {
  try {
    const academicYears = await db.academicYear.findMany({
      orderBy: {
        startDate: "desc",
      },
    })

    return { success: true, academicYears }
  } catch (error) {
    console.error("Error fetching academic years:", error)
    return { success: false, message: "Failed to fetch academic years" }
  }
}

export async function getActiveAcademicYear() {
  try {
    const academicYear = await db.academicYear.findFirst({
      where: { isActive: true },
    })

    if (!academicYear) {
      return { success: false, message: "No active academic year found" }
    }

    return { success: true, academicYear }
  } catch (error) {
    console.error("Error fetching active academic year:", error)
    return { success: false, message: "Failed to fetch active academic year" }
  }
}

export async function getAcademicYearById(academicYearId: string) {
  try {
    const academicYear = await db.academicYear.findUnique({
      where: { id: academicYearId },
      include: {
        semesters: true,
      },
    })

    if (!academicYear) {
      return { success: false, message: "Academic year not found" }
    }

    return { success: true, academicYear }
  } catch (error) {
    console.error("Error fetching academic year:", error)
    return { success: false, message: "Failed to fetch academic year" }
  }
}

export async function createAcademicYear(data: {
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
}) {
  try {
    // If setting this academic year as active, deactivate all other academic years
    if (data.isActive) {
      await db.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    const academicYear = await db.academicYear.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      },
    })

    revalidatePath("/dashboard/academic-years")
    return { success: true, academicYear }
  } catch (error) {
    console.error("Error creating academic year:", error)
    return { success: false, message: "Failed to create academic year" }
  }
}

export async function updateAcademicYear(
  academicYearId: string,
  data: {
    name: string
    startDate: Date
    endDate: Date
    isActive: boolean
  },
) {
  try {
    // If setting this academic year as active, deactivate all other academic years
    if (data.isActive) {
      await db.academicYear.updateMany({
        where: {
          isActive: true,
          id: { not: academicYearId },
        },
        data: { isActive: false },
      })
    }

    const academicYear = await db.academicYear.update({
      where: { id: academicYearId },
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      },
    })

    revalidatePath("/dashboard/academic-years")
    return { success: true, academicYear }
  } catch (error) {
    console.error("Error updating academic year:", error)
    return { success: false, message: "Failed to update academic year" }
  }
}

export async function deleteAcademicYear(academicYearId: string) {
  try {
    await db.academicYear.delete({
      where: { id: academicYearId },
    })

    revalidatePath("/dashboard/academic-years")
    return { success: true, message: "Academic year deleted successfully" }
  } catch (error) {
    console.error("Error deleting academic year:", error)
    return { success: false, message: "Failed to delete academic year" }
  }
}
