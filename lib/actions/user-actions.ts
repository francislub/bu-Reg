"use server"

import { hash, compare } from "bcryptjs"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function registerUser(data: {
  name: string
  email: string
  password: string
  role: string
  profileData?: {
    firstName?: string
    middleName?: string
    lastName?: string
    dateOfBirth?: Date
    gender?: string
    nationality?: string
    maritalStatus?: string
    religion?: string
    church?: string
    responsibility?: string
    referralSource?: string
    physicallyDisabled?: boolean
  }
}) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, message: "User with this email already exists" }
    }

    // Validate role - only allow specific roles
    const validRole =
      data.role === "ADMIN" || data.role === "REGISTRAR" || data.role === "STAFF" || data.role === "STUDENT"
    const assignedRole = validRole ? data.role : "STUDENT" // Default to STUDENT if invalid role

    // Extract first and last name from full name if not provided
    const firstName = data.profileData?.firstName || data.name.split(" ")[0] || "New"
    const lastName = data.profileData?.lastName || data.name.split(" ").slice(1).join(" ") || "User"

    // Create profile first with safe defaults
    const profile = await db.profile.create({
      data: {
        firstName,
        middleName: data.profileData?.middleName,
        lastName,
        dateOfBirth: data.profileData?.dateOfBirth,
        gender: data.profileData?.gender,
        nationality: data.profileData?.nationality,
        maritalStatus: data.profileData?.maritalStatus,
        religion: data.profileData?.religion,
        church: data.profileData?.church,
        responsibility: data.profileData?.responsibility,
        referralSource: data.profileData?.referralSource,
        physicallyDisabled: data.profileData?.physicallyDisabled || false,
      },
    })

    // Hash password
    const hashedPassword = await hash(data.password, 10)

    // Create user with profile reference
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: assignedRole, // Use the validated role
        profileId: profile.id,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "Failed to register user" }
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    firstName: string
    middleName?: string
    lastName: string
    dateOfBirth?: Date
    gender?: string
    nationality?: string
    maritalStatus?: string
    religion?: string
    church?: string
    responsibility?: string
    referralSource?: string
    physicallyDisabled: boolean
  },
) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      return { success: false, message: "User not found" }
    }

    if (!user.profileId) {
      // Create new profile if it doesn't exist
      const profile = await db.profile.create({
        data: {
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          nationality: data.nationality,
          maritalStatus: data.maritalStatus,
          religion: data.religion,
          church: data.church,
          responsibility: data.responsibility,
          referralSource: data.referralSource,
          physicallyDisabled: data.physicallyDisabled,
        },
      })

      await db.user.update({
        where: { id: userId },
        data: { profileId: profile.id },
      })
    } else {
      // Update existing profile
      await db.profile.update({
        where: { id: user.profileId },
        data: {
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          nationality: data.nationality,
          maritalStatus: data.maritalStatus,
          religion: data.religion,
          church: data.church,
          responsibility: data.responsibility,
          referralSource: data.referralSource,
          physicallyDisabled: data.physicallyDisabled,
        },
      })
    }

    revalidatePath("/dashboard/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Verify current password
    const passwordValid = await compare(currentPassword, user.password)
    if (!passwordValid) {
      return { success: false, message: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Error changing password:", error)
    return { success: false, message: "Failed to change password" }
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  try {
    // Validate userId to prevent malformed ObjectID errors
    if (!userId || userId === "$[id]" || userId.includes("%")) {
      console.error("Invalid user ID provided:", userId)
      return { success: false, message: "Invalid user ID provided" }
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      return { success: false, message: "User not found" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { success: false, message: "Failed to fetch user profile" }
  }
}

export async function getAllUsers(role?: string) {
  try {
    const users = await db.user.findMany({
      where: role ? { role } : undefined,
      include: { profile: true },
    })

    return { success: true, users }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, message: "Failed to fetch users" }
  }
}

export async function createStaffAccount(data: {
  name: string
  email: string
  password: string
  departmentId: string
  isHead: boolean
  profileData?: {
    firstName?: string
    middleName?: string
    lastName?: string
    dateOfBirth?: Date
    gender?: string
    nationality?: string
    maritalStatus?: string
    religion?: string
    church?: string
    responsibility?: string
    referralSource?: string
    physicallyDisabled?: boolean
  }
}) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, message: "User with this email already exists" }
    }

    // Create profile first with safe defaults
    const profile = await db.profile.create({
      data: {
        firstName: data.profileData?.firstName || "New",
        middleName: data.profileData?.middleName,
        lastName: data.profileData?.lastName || "Staff",
        dateOfBirth: data.profileData?.dateOfBirth,
        gender: data.profileData?.gender,
        nationality: data.profileData?.nationality,
        maritalStatus: data.profileData?.maritalStatus,
        religion: data.profileData?.religion,
        church: data.profileData?.church,
        responsibility: data.profileData?.responsibility,
        referralSource: data.profileData?.referralSource,
        physicallyDisabled: data.profileData?.physicallyDisabled || false,
      },
    })

    // Hash password
    const hashedPassword = await hash(data.password, 10)

    // Create user with profile reference
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "STAFF",
        profileId: profile.id,
      },
    })

    // Create department staff entry
    await db.departmentStaff.create({
      data: {
        userId: user.id,
        departmentId: data.departmentId,
        isHead: data.isHead,
      },
    })

    revalidatePath("/dashboard/staff")
    return { success: true, user }
  } catch (error) {
    console.error("Error creating staff account:", error)
    return { success: false, message: "Failed to create staff account" }
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId },
    })

    revalidatePath("/dashboard/staff")
    revalidatePath("/dashboard/students")
    return { success: true, message: "User deleted successfully" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, message: "Failed to delete user" }
  }
}
