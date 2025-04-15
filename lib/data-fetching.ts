import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { userRoles } from "@/lib/utils"

// Cached data fetching functions for server components
export const getRegistrationStats = cache(async () => {
  const totalStudents = await prisma.user.count({
    where: { role: userRoles.STUDENT },
  })

  const pendingRegistrations = await prisma.registration.count({
    where: { status: "PENDING" },
  })

  const approvedRegistrations = await prisma.registration.count({
    where: { status: "APPROVED" },
  })

  const activeCourses = await prisma.semesterCourse.count({
    where: {
      semester: {
        isActive: true,
      },
    },
  })

  return {
    totalStudents,
    pendingRegistrations,
    approvedRegistrations,
    activeCourses,
  }
})

export const getActiveSemester = cache(async () => {
  return prisma.semester.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  })
})

export const getDepartmentStats = cache(async (departmentId: string) => {
  const departmentStudents = await prisma.departmentStaff.count({
    where: { departmentId },
  })

  const departmentCourses = await prisma.course.count({
    where: { departmentId },
  })

  const pendingApprovals = await prisma.courseUpload.count({
    where: {
      course: {
        departmentId,
      },
      status: "PENDING",
    },
  })

  const approvedRegistrations = await prisma.courseUpload.count({
    where: {
      course: {
        departmentId,
      },
      status: "APPROVED",
    },
  })

  return {
    departmentStudents,
    departmentCourses,
    pendingApprovals,
    approvedRegistrations,
  }
})

export const getStudentStats = cache(async (userId: string) => {
  const activeSemester = await getActiveSemester()

  if (!activeSemester) {
    return {
      registeredCourses: 0,
      pendingCourses: 0,
      approvedCourses: 0,
      totalCredits: 0,
    }
  }

  const registeredCourses = await prisma.courseUpload.count({
    where: {
      userId,
      semesterId: activeSemester.id,
    },
  })

  const pendingCourses = await prisma.courseUpload.count({
    where: {
      userId,
      semesterId: activeSemester.id,
      status: "PENDING",
    },
  })

  const approvedCourses = await prisma.courseUpload.count({
    where: {
      userId,
      semesterId: activeSemester.id,
      status: "APPROVED",
    },
  })

  const courseUploads = await prisma.courseUpload.findMany({
    where: {
      userId,
      semesterId: activeSemester.id,
    },
    include: {
      course: true,
    },
  })

  const totalCredits = courseUploads.reduce((sum, upload) => sum + upload.course.credits, 0)

  return {
    registeredCourses,
    pendingCourses,
    approvedCourses,
    totalCredits,
  }
})

export const getRecentRegistrations = cache(async (limit = 5) => {
  return prisma.registration.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      semester: true,
    },
  })
})

export const getRecentCourseUploads = cache(async (limit = 5) => {
  return prisma.courseUpload.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      course: {
        include: {
          department: true,
        },
      },
      semester: true,
    },
  })
})

export const getDepartmentCourseUploads = cache(async (departmentId: string, limit = 5) => {
  return prisma.courseUpload.findMany({
    take: limit,
    where: {
      course: {
        departmentId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      course: true,
      semester: true,
    },
  })
})

export const getStudentCourses = cache(async (userId: string) => {
  const activeSemester = await getActiveSemester()

  if (!activeSemester) {
    return []
  }

  return prisma.courseUpload.findMany({
    where: {
      userId,
      semesterId: activeSemester.id,
    },
    include: {
      course: {
        include: {
          department: true,
        },
      },
      semester: true,
    },
    orderBy: { createdAt: "desc" },
  })
})

export const getRegistrationCard = cache(async (userId: string) => {
  const activeSemester = await getActiveSemester()

  if (!activeSemester) {
    return null
  }

  return prisma.registrationCard.findFirst({
    where: {
      userId,
      semesterId: activeSemester.id,
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      semester: true,
    },
  })
})

export const getAvailableCourses = cache(async () => {
  const activeSemester = await getActiveSemester()

  if (!activeSemester) {
    return []
  }

  return prisma.semesterCourse.findMany({
    where: {
      semesterId: activeSemester.id,
    },
    include: {
      course: {
        include: {
          department: true,
        },
      },
    },
  })
})

export const getCoursesByDepartment = cache(async () => {
  const departments = await prisma.department.findMany({
    include: {
      courses: true,
    },
  })

  const coursesByDepartment = departments.map((department) => ({
    department: department.name,
    count: department.courses.length,
  }))

  return coursesByDepartment
})

export const getRegistrationsByMonth = cache(async () => {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const registrations = await prisma.registration.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      createdAt: true,
    },
  })

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const registrationsByMonth: Record<string, number> = {}

  // Initialize all months with 0
  for (let i = 0; i < 6; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthName = months[d.getMonth()]
    registrationsByMonth[`${monthName} ${d.getFullYear()}`] = 0
  }

  // Count registrations by month
  registrations.forEach((registration) => {
    const date = new Date(registration.createdAt)
    const monthName = months[date.getMonth()]
    const key = `${monthName} ${date.getFullYear()}`

    if (registrationsByMonth[key] !== undefined) {
      registrationsByMonth[key]++
    }
  })

  // Convert to array format for charts
  return Object.entries(registrationsByMonth)
    .map(([name, value]) => ({ name, value }))
    .reverse()
})

export const getApprovalRates = cache(async () => {
  const totalUploads = await prisma.courseUpload.count()
  const approvedUploads = await prisma.courseUpload.count({
    where: { status: "APPROVED" },
  })
  const pendingUploads = await prisma.courseUpload.count({
    where: { status: "PENDING" },
  })
  const rejectedUploads = await prisma.courseUpload.count({
    where: { status: "REJECTED" },
  })

  return [
    { name: "Approved", value: approvedUploads, color: "#4ade80" },
    { name: "Pending", value: pendingUploads, color: "#facc15" },
    { name: "Rejected", value: rejectedUploads, color: "#f87171" },
  ]
})

export const getStudentRegistrationHistory = cache(async (userId: string) => {
  return prisma.registration.findMany({
    where: {
      userId,
    },
    include: {
      semester: true,
      courseUploads: {
        include: {
          course: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
})

export const getDepartments = cache(async () => {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
  })
})

export const getCourses = cache(async (departmentId?: string) => {
  const whereClause = departmentId ? { departmentId } : {}

  return prisma.course.findMany({
    where: whereClause,
    include: {
      department: true,
    },
    orderBy: { code: "asc" },
  })
})

// New data fetching functions for timetable, lecturer assignment, and attendance

export const getLecturers = cache(async (departmentId?: string) => {
  const whereClause: any = { role: userRoles.STAFF }

  if (departmentId) {
    whereClause.departmentStaff = {
      departmentId,
    }
  }

  return prisma.user.findMany({
    where: whereClause,
    include: {
      profile: true,
      departmentStaff: {
        include: {
          department: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
})

export const getLecturerCourses = cache(async (lecturerId?: string, semesterId?: string) => {
  const whereClause: any = {}

  if (lecturerId) {
    whereClause.lecturerId = lecturerId
  }

  if (semesterId) {
    whereClause.semesterId = semesterId
  } else {
    const activeSemester = await getActiveSemester()
    if (activeSemester) {
      whereClause.semesterId = activeSemester.id
    }
  }

  return prisma.lecturerCourse.findMany({
    where: whereClause,
    include: {
      lecturer: {
        include: {
          profile: true,
        },
      },
      course: {
        include: {
          department: true,
        },
      },
      semester: true,
    },
    orderBy: { createdAt: "desc" },
  })
})

export const getTimetables = cache(async (semesterId?: string) => {
  const whereClause: any = {}

  if (semesterId) {
    whereClause.semesterId = semesterId
  } else {
    const activeSemester = await getActiveSemester()
    if (activeSemester) {
      whereClause.semesterId = activeSemester.id
    }
  }

  return prisma.timetable.findMany({
    where: whereClause,
    include: {
      semester: true,
      slots: {
        include: {
          course: true,
          lecturerCourse: {
            include: {
              lecturer: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
})

export const getStudentTimetable = cache(async (userId: string) => {
  const activeSemester = await getActiveSemester()

  if (!activeSemester) {
    return null
  }

  // Get the student's registered courses
  const courseUploads = await prisma.courseUpload.findMany({
    where: {
      userId,
      semesterId: activeSemester.id,
      status: "APPROVED",
    },
    select: {
      courseId: true,
    },
  })

  const courseIds = courseUploads.map((upload) => upload.courseId)

  if (courseIds.length === 0) {
    return null
  }

  // Get the published timetable for the active semester
  const timetable = await prisma.timetable.findFirst({
    where: {
      semesterId: activeSemester.id,
      isPublished: true,
    },
    include: {
      semester: true,
    },
  })

  if (!timetable) {
    return null
  }

  // Get the timetable slots for the student's courses
  const timetableSlots = await prisma.timetableSlot.findMany({
    where: {
      timetableId: timetable.id,
      courseId: {
        in: courseIds,
      },
    },
    include: {
      course: true,
      lecturerCourse: {
        include: {
          lecturer: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })

  return {
    timetable,
    slots: timetableSlots,
  }
})

export const getAttendanceSessions = cache(async (courseId?: string, lecturerId?: string, semesterId?: string) => {
  const whereClause: any = {}

  if (courseId) {
    whereClause.courseId = courseId
  }

  if (lecturerId) {
    whereClause.lecturerId = lecturerId
  }

  if (semesterId) {
    whereClause.semesterId = semesterId
  } else {
    const activeSemester = await getActiveSemester()
    if (activeSemester) {
      whereClause.semesterId = activeSemester.id
    }
  }

  return prisma.attendanceSession.findMany({
    where: whereClause,
    include: {
      course: true,
      lecturer: {
        include: {
          profile: true,
        },
      },
      semester: true,
      records: {
        include: {
          student: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  })
})

export const getStudentAttendance = cache(async (studentId: string, courseId?: string) => {
  const activeSemester = await getActiveSemester()

  if (!activeSemester) {
    return []
  }

  const whereClause: any = {
    studentId,
    session: {
      semesterId: activeSemester.id,
    },
  }

  if (courseId) {
    whereClause.session.courseId = courseId
  }

  return prisma.attendanceRecord.findMany({
    where: whereClause,
    include: {
      session: {
        include: {
          course: true,
          lecturer: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: {
      session: {
        date: "desc",
      },
    },
  })
})

export const getStudentAttendanceStats = cache(async (studentId: string) => {
  const activeSemester = await getActiveSemester()

  if (!activeSemester) {
    return {
      totalSessions: 0,
      present: 0,
      absent: 0,
      studentLate: 0,
      presentPercentage: 0,
      absentPercentage: 0,
      latePercentage: 0,
    }
  }

  const records = await prisma.attendanceRecord.findMany({
    where: {
      studentId,
      session: {
        semesterId: activeSemester.id,
      },
    },
    select: {
      status: true,
    },
  })

  const totalSessions = records.length
  const present = records.filter((r) => r.status === "PRESENT").length
  const absent = records.filter((r) => r.status === "ABSENT").length
  const studentLate = records.filter((r) => r.status === "LATE").length

  return {
    totalSessions,
    present,
    absent,
    studentLate,
    presentPercentage: totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0,
    absentPercentage: totalSessions > 0 ? Math.round((absent / totalSessions) * 100) : 0,
    latePercentage: totalSessions > 0 ? Math.round((studentLate / totalSessions) * 100) : 0,
  }
})

export const getCourseAttendanceStats = cache(async (courseId: string, semesterId?: string) => {
  const whereClause: any = {
    courseId,
  }

  if (semesterId) {
    whereClause.semesterId = semesterId
  } else {
    const activeSemester = await getActiveSemester()
    if (activeSemester) {
      whereClause.semesterId = activeSemester.id
    }
  }

  const sessions = await prisma.attendanceSession.findMany({
    where: whereClause,
    include: {
      records: {
        select: {
          status: true,
        },
      },
    },
  })

  const totalSessions = sessions.length
  const totalRecords = sessions.reduce((sum, session) => sum + session.records.length, 0)
  const present = sessions.reduce(
    (sum, session) => sum + session.records.filter((r) => r.status === "PRESENT").length,
    0,
  )
  const absent = sessions.reduce((sum, session) => sum + session.records.filter((r) => r.status === "ABSENT").length, 0)
  const courseLate = sessions.reduce(
    (sum, session) => sum + session.records.filter((r) => r.status === "LATE").length,
    0,
  )

  return {
    totalSessions,
    totalRecords,
    present,
    absent,
    courseLate,
    presentPercentage: totalRecords > 0 ? Math.round((present / totalRecords) * 100) : 0,
    absentPercentage: totalRecords > 0 ? Math.round((absent / totalRecords) * 100) : 0,
    latePercentage: totalRecords > 0 ? Math.round((courseLate / totalRecords) * 100) : 0,
  }
})
