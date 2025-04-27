"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { writeFile } from "fs/promises"
import { mkdir } from "fs/promises"
import path from "path"

// Function to create a backup of the database
export async function createBackup() {
  try {
    // Get data from all relevant tables
    const [
      users,
      profiles,
      courses,
      departments,
      semesters,
      academicYears,
      registrations,
      courseUploads,
      registrationCards,
    ] = await Promise.all([
      db.user.findMany(),
      db.profile.findMany(),
      db.course.findMany(),
      db.department.findMany(),
      db.semester.findMany(),
      db.academicYear.findMany(),
      db.registration.findMany(),
      db.courseUpload.findMany(),
      db.registrationCard.findMany(),
    ])

    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        profiles,
        courses,
        departments,
        semesters,
        academicYears,
        registrations,
        courseUploads,
        registrationCards,
      },
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups")
    await mkdir(backupDir, { recursive: true })

    // Create filename with timestamp
    const filename = `backup_${new Date().toISOString().replace(/:/g, "-")}.json`
    const filePath = path.join(backupDir, filename)

    // Write backup to file
    await writeFile(filePath, JSON.stringify(backup, null, 2))

    // Create a record of the backup in the database
    const backupRecord = await db.backup.create({
      data: {
        filename,
        path: filePath,
        size: JSON.stringify(backup).length,
      },
    })

    return { success: true, backup: backupRecord }
  } catch (error) {
    console.error("Error creating backup:", error)
    return { success: false, message: "Failed to create backup" }
  }
}

// Function to get all backups
export async function getBackups() {
  try {
    const backups = await db.backup.findMany({
      orderBy: { createdAt: "desc" },
    })

    return { success: true, backups }
  } catch (error) {
    console.error("Error fetching backups:", error)
    return { success: false, message: "Failed to fetch backups" }
  }
}

// Function to delete a backup
export async function deleteBackup(backupId: string) {
  try {
    await db.backup.delete({
      where: { id: backupId },
    })

    revalidatePath("/dashboard/backups")
    return { success: true }
  } catch (error) {
    console.error("Error deleting backup:", error)
    return { success: false, message: "Failed to delete backup" }
  }
}
