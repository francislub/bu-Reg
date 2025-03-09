import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const semester = url.searchParams.get("semester");
    
    // Build query
    const query: any = {
      where: {
        status: "active",
      },
      include: {
        faculty: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    };
    
    if (semester) {
      query.where.semester = semester;
    }
    
    const courses = await prisma.course.findMany(query);
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { courseCode, name, description, credits, prerequisites, facultyId, semester, academicYear, schedule, maxSeats } = body;
    
    // Check if course already exists
    const existingCourse = await prisma.course.findUnique({
      where: {
        courseCode,
      },
    });
    
    if (existingCourse) {
      return NextResponse.json(
        { error: "Course with this code already exists" },
        { status: 400 }
      );
    }
    
    // Create course
    const course = await prisma.course.create({
      data: {
        courseCode,
        name,
        description,
        credits,
        prerequisites,
        facultyId,
        semester,
        academicYear,
        schedule,
        maxSeats,
        availableSeats: maxSeats,
      },
    });
