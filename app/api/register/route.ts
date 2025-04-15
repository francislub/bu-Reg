import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  firstName: z.string().min(2),
  middleName: z.string().optional(),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.string(),
  nationality: z.string(),
  maritalStatus: z.enum(["Married", "Unmarried", "Divorced", "Widow", "Single"]),
  religion: z.string(),
  church: z.string().optional(),
  responsibility: z.string().optional(),
  referralSource: z.string().optional(),
  physicallyDisabled: z.boolean().default(false),
  role: z.enum(["STUDENT", "STAFF", "REGISTRAR"]),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        firstName: validatedData.firstName,
        middleName: validatedData.middleName,
        lastName: validatedData.lastName,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        gender: validatedData.gender,
        nationality: validatedData.nationality,
        maritalStatus: validatedData.maritalStatus,
        religion: validatedData.religion,
        church: validatedData.church,
        responsibility: validatedData.responsibility,
        referralSource: validatedData.referralSource,
        physicallyDisabled: validatedData.physicallyDisabled,
      },
    })

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        profileId: profile.id,
      },
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
