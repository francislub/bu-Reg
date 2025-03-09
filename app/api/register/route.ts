import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateStudentId } from "@/lib/utils";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role = "student", program = "BCC" } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // If student role, create student profile
    if (role === "student") {
      // Get count of students for ID generation
      const studentCount = await prisma.student.count();
      
      // Generate student ID
      const currentYear = new Date().getFullYear();
      const studentId = generateStudentId(
        currentYear,
        program,
        "BU",
        "R",
        studentCount + 1
      );
      
      // Split name into first and last name
      const nameParts = name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      
      // Create student profile
      await prisma.student.create({
        data: {
          userId: user.id,
          studentId,
          firstName,
          lastName,
          program,
          admissionYear: currentYear,
          expectedGradYear: currentYear + 4,
        },
      });
    }

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
