import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/settings - Get all settings
export async function GET() {
  try {
    // Fetch all settings from the database
    const settingsRecords = await prisma.setting.findMany()

    // Transform the flat settings array into a structured object
    const settings = settingsRecords.reduce(
      (acc, setting) => {
        const [section, key] = setting.key.split(".")

        if (!acc[section]) {
          acc[section] = {}
        }

        // Convert string values to appropriate types
        let value = setting.value
        if (value === "true") value = true
        else if (value === "false") value = false
        else if (!isNaN(Number(value)) && value !== "") value = Number(value)

        acc[section][key] = value
        return acc
      },
      {
        general: {
          institutionName: "University of Example",
          website: "https://www.example.edu",
          adminEmail: "admin@example.edu",
          supportEmail: "support@example.edu",
          timezone: "utc-5",
        },
        academic: {
          currentSemester: "fall2023",
          currentAcademicYear: "2023-2024",
          semesterStartDate: "2023-09-01",
          semesterEndDate: "2023-12-15",
        },
        registration: {
          registrationStartDate: "2023-08-15",
          registrationEndDate: "2023-09-15",
          lateRegistrationStartDate: "2023-09-16",
          lateRegistrationEndDate: "2023-09-22",
          maxCoursesPerStudent: 6,
          autoApproveRegistrations: true,
          enableWaitlists: true,
          prerequisiteChecking: true,
        },
        notifications: {
          emailNotifications: true,
          systemNotifications: true,
          registrationNotifications: true,
          deadlineReminders: true,
          reminderDays: 7,
        },
        security: {
          twoFactorAuthentication: true,
          passwordExpiry: true,
          sessionTimeout: true,
          passwordExpiryDays: 90,
          sessionTimeoutMinutes: 30,
          minPasswordLength: 12,
        },
      },
    )

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { section, data } = body

    // Validate input
    if (!section || !data) {
      return NextResponse.json({ error: "Missing section or data" }, { status: 400 })
    }

    // Update settings in the database
    const updates = Object.entries(data).map(([key, value]) => {
      const settingKey = `${section}.${key}`
      return prisma.setting.upsert({
        where: { key: settingKey },
        update: { value: String(value) },
        create: { key: settingKey, value: String(value) },
      })
    })

    await Promise.all(updates)

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

