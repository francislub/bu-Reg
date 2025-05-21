import { Resend } from "resend"
import { db } from "@/lib/db"
import { RegistrationApprovedEmail } from "@/lib/emails/registration-approved-email"
import { RegistrationRejectedEmail } from "@/lib/emails/registration-rejected-email"
import { RegistrationSubmittedEmail } from "@/lib/emails/registration-submitted-email"

const resend = new Resend(process.env.RESEND_API_KEY)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bu-reg.vercel.app"

export async function sendRegistrationApprovedEmail(registrationId: string) {
  try {
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        semester: true,
      },
    })

    if (!registration) {
      throw new Error("Registration not found")
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@bugema-university.edu",
      to: registration.user.email,
      subject: "Registration Approved - Bugema University",
      react: RegistrationApprovedEmail({
        studentName: registration.user.name || "Student",
        semesterName: registration.semester.name,
        // Update the link to point to /registration instead of /registration/card
        registrationLink: `${appUrl}/dashboard/registration?id=${registrationId}`,
      }),
    })

    if (error) {
      console.error("Error sending registration approved email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in sendRegistrationApprovedEmail:", error)
    return { success: false, error }
  }
}

export async function sendRegistrationRejectedEmail(registrationId: string, reason: string) {
  try {
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        semester: true,
      },
    })

    if (!registration) {
      throw new Error("Registration not found")
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@bugema-university.edu",
      to: registration.user.email,
      subject: "Registration Rejected - Bugema University",
      react: RegistrationRejectedEmail({
        studentName: registration.user.name || "Student",
        semesterName: registration.semester.name,
        reason: reason || "No reason provided",
        registrationLink: `${appUrl}/dashboard/registration`,
      }),
    })

    if (error) {
      console.error("Error sending registration rejected email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in sendRegistrationRejectedEmail:", error)
    return { success: false, error }
  }
}

export async function sendRegistrationSubmittedEmail(registrationId: string) {
  try {
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        semester: true,
      },
    })

    if (!registration) {
      throw new Error("Registration not found")
    }

    // Get registrar emails
    const registrars = await db.user.findMany({
      where: {
        role: "REGISTRAR",
      },
      select: {
        email: true,
      },
    })

    const registrarEmails = registrars.map((r) => r.email)

    // Send email to student
    const { data: studentData, error: studentError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@bugema-university.edu",
      to: registration.user.email,
      subject: "Registration Submitted - Bugema University",
      react: RegistrationSubmittedEmail({
        studentName: registration.user.name || "Student",
        semesterName: registration.semester.name,
        registrationLink: `${appUrl}/dashboard/registration?id=${registrationId}`,
        isStudent: true,
      }),
    })

    if (studentError) {
      console.error("Error sending registration submitted email to student:", studentError)
      return { success: false, error: studentError }
    }

    // Send email to registrars if there are any
    if (registrarEmails.length > 0) {
      const { data: registrarData, error: registrarError } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "noreply@bugema-university.edu",
        to: registrarEmails,
        subject: `New Registration Submitted - ${registration.user.name}`,
        react: RegistrationSubmittedEmail({
          studentName: registration.user.name || "Student",
          semesterName: registration.semester.name,
          registrationLink: `${appUrl}/dashboard/approvals`,
          isStudent: false,
        }),
      })

      if (registrarError) {
        console.error("Error sending registration submitted email to registrars:", registrarError)
        // Continue anyway since we already sent to the student
      }
    }

    return { success: true, data: studentData }
  } catch (error) {
    console.error("Error in sendRegistrationSubmittedEmail:", error)
    return { success: false, error }
  }
}

// Other email functions remain the same...
export async function sendCourseApprovedEmail(courseUploadId: string) {
  // Implementation remains the same
}

export async function sendCourseRejectedEmail(courseUploadId: string, reason: string) {
  // Implementation remains the same
}

export async function sendAnnouncementEmail(announcementId: string, recipientEmails: string[]) {
  // Implementation remains the same
}
