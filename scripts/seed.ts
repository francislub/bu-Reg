import { hash } from "bcrypt"
import prisma from "../lib/prisma"

async function main() {
  console.log("Starting database seeding...")

  // Create admin user
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@bugema.ac.ug" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@bugema.ac.ug",
      password: adminPassword,
      role: "ADMIN",
    },
  })
  console.log("Admin user created:", admin.email)

  // Create faculty users
  const facultyPassword = await hash("faculty123", 10)
  const faculty1 = await prisma.user.upsert({
    where: { email: "john.doe@bugema.ac.ug" },
    update: {},
    create: {
      name: "John Doe",
      email: "john.doe@bugema.ac.ug",
      password: facultyPassword,
      role: "FACULTY",
      profile: {
        create: {
          department: "Computer Science",
        },
      },
    },
  })
  console.log("Faculty user created:", faculty1.email)

  const faculty2 = await prisma.user.upsert({
    where: { email: "jane.smith@bugema.ac.ug" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane.smith@bugema.ac.ug",
      password: facultyPassword,
      role: "FACULTY",
      profile: {
        create: {
          department: "Mathematics",
        },
      },
    },
  })
  console.log("Faculty user created:", faculty2.email)

  // Create student users
  const studentPassword = await hash("student123", 10)
  const student1 = await prisma.user.upsert({
    where: { email: "student1@bugema.ac.ug" },
    update: {},
    create: {
      name: "Student One",
      email: "student1@bugema.ac.ug",
      password: studentPassword,
      role: "STUDENT",
      registrationNo: "21/BCC/BUR/0026",
      profile: {
        create: {
          department: "Computer Science",
          program: "Bachelor of Business Computing",
          campus: "Main Campus",
          yearOfStudy: 3,
          phoneNumber: "+256700123456",
          gender: "Male",
        },
      },
    },
  })
  console.log("Student user created:", student1.email)

  const student2 = await prisma.user.upsert({
    where: { email: "student2@bugema.ac.ug" },
    update: {},
    create: {
      name: "Student Two",
      email: "student2@bugema.ac.ug",
      password: studentPassword,
      role: "STUDENT",
      registrationNo: "21/BCC/BUR/0027",
      profile: {
        create: {
          department: "Computer Science",
          program: "Bachelor of Business Computing",
          campus: "Main Campus",
          yearOfStudy: 3,
          phoneNumber: "+256700123457",
          gender: "Female",
        },
      },
    },
  })
  console.log("Student user created:", student2.email)

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { code: "CSC101" },
    update: {},
    create: {
      code: "CSC101",
      title: "Introduction to Computer Science",
      credits: 3,
      description: "An introduction to the fundamental concepts of computer science",
      department: "Computer Science",
      semester: "SEM1",
      academicYear: "2024-2025",
      maxCapacity: 50,
      currentEnrolled: 0,
      facultyId: faculty1.id,
    },
  })
  console.log("Course created:", course1.code)

  const course2 = await prisma.course.upsert({
    where: { code: "CSC201" },
    update: {},
    create: {
      code: "CSC201",
      title: "Data Structures and Algorithms",
      credits: 4,
      description: "A study of common data structures and algorithms",
      department: "Computer Science",
      semester: "SEM1",
      academicYear: "2024-2025",
      maxCapacity: 40,
      currentEnrolled: 0,
      prerequisites: ["CSC101"],
      facultyId: faculty1.id,
    },
  })
  console.log("Course created:", course2.code)

  const course3 = await prisma.course.upsert({
    where: { code: "MAT101" },
    update: {},
    create: {
      code: "MAT101",
      title: "Calculus I",
      credits: 3,
      description: "An introduction to differential and integral calculus",
      department: "Mathematics",
      semester: "SEM1",
      academicYear: "2024-2025",
      maxCapacity: 60,
      currentEnrolled: 0,
      facultyId: faculty2.id,
    },
  })
  console.log("Course created:", course3.code)

  // Create registrations
  const registration1 = await prisma.registration.upsert({
    where: {
      studentId_courseId_semester_academicYear: {
        studentId: student1.id,
        courseId: course1.id,
        semester: "SEM1",
        academicYear: "2024-2025",
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      courseId: course1.id,
      status: "APPROVED",
      semester: "SEM1",
      academicYear: "2024-2025",
    },
  })
  console.log("Registration created for student:", student1.name, "course:", course1.code)

  const registration2 = await prisma.registration.upsert({
    where: {
      studentId_courseId_semester_academicYear: {
        studentId: student1.id,
        courseId: course3.id,
        semester: "SEM1",
        academicYear: "2024-2025",
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      courseId: course3.id,
      status: "PENDING",
      semester: "SEM1",
      academicYear: "2024-2025",
    },
  })
  console.log("Registration created for student:", student1.name, "course:", course3.code)

  // Create notifications
  const notification1 = await prisma.notification.create({
    data: {
      title: "Registration Approved",
      message: `Your registration for ${course1.code}: ${course1.title} has been approved.`,
      type: "REGISTRATION",
      userId: student1.id,
    },
  })
  console.log("Notification created for student:", student1.name)

  const notification2 = await prisma.notification.create({
    data: {
      title: "Registration Deadline",
      message: "The deadline for course registration is March 15, 2025.",
      type: "DEADLINE",
      userId: null, // System-wide notification
    },
  })
  console.log("System-wide notification created")

  console.log("Database seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

