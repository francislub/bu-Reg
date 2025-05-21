import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import puppeteer from "puppeteer"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const registrationId = params.id

    // Check if the registration exists with expanded data
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
                studentId: true,
                program: true,
                phone: true,
                address: true,
                avatar: true,
              },
            },
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 })
    }

    // Check if the user is authorized to view this registration
    if (registration.userId !== session.user.id && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Format the data for the template
    const fullName = `${registration.user.profile?.firstName || ""} ${
      registration.user.profile?.middleName || ""
    } ${registration.user.profile?.lastName || ""}`.trim()

    const totalCredits = registration.courseUploads.reduce((total, upload) => total + upload.course.credits, 0)

    // Check if registration is pending or has pending courses
    const isPending =
      registration.status === "PENDING" || registration.courseUploads.some((upload) => upload.status === "PENDING")

    // Get registration card separately
    const registrationCard = await db.registrationCard
      .findFirst({
        where: {
          userId: registration.userId,
          semesterId: registration.semesterId,
        },
      })
      .catch(() => null)

    // Get payment information if available
    let paymentInfo = { status: "Pending", amount: 0 }
    try {
      const payment = await db.payment.findFirst({
        where: {
          userId: registration.userId,
          semesterId: registration.semesterId,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (payment) {
        paymentInfo = { status: payment.status, amount: payment.amount }
      }
    } catch (error) {
      console.error("Error fetching payment info:", error)
      // Continue with default payment info
    }

    // Format courses for the template
    const formattedCourses = registration.courseUploads.map((upload) => ({
      code: upload.course.code,
      title: upload.course.title,
      department: upload.course.department.name,
      credits: upload.course.credits,
      status: upload.status,
    }))

    // Generate HTML template directly without using handlebars
    const html = generateRegistrationCardHTML({
      studentName: fullName || registration.user.name || "Unknown",
      studentId: registration.user.profile?.studentId || registration.user.id,
      email: registration.user.email || "N/A",
      program: registration.user.profile?.program || "Not specified",
      phoneNumber: registration.user.profile?.phone || "N/A",
      address: registration.user.profile?.address || "N/A",
      semester: registration.semester.name,
      academicYear: registration.semester.academicYear.name,
      registrationDate: new Date(registration.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status: registration.status,
      isPending: isPending,
      cardNumber: registrationCard?.cardNumber || "Not Issued",
      cardIssueDate: registrationCard
        ? new Date(registrationCard.issuedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
      courses: formattedCourses,
      totalCredits,
      printDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      paymentStatus: paymentInfo.status,
      amountPaid: paymentInfo.amount.toLocaleString(),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://bugema-university.edu",
    })

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    const page = await browser.newPage()

    // Set the HTML content
    await page.setContent(html, { waitUntil: "networkidle0" })

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    })

    await browser.close()

    // Return the PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Registration_Slip_${registration.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { success: false, message: `An error occurred while generating the PDF: ${error.message}` },
      { status: 500 },
    )
  }
}

// Function to generate HTML template without using handlebars
function generateRegistrationCardHTML(data) {
  const coursesHTML = data.courses
    .map(
      (course) => `
    <tr>
      <td>${course.code}</td>
      <td>${course.title}</td>
      <td>${course.department}</td>
      <td>${course.credits}</td>
      <td>${course.status}</td>
    </tr>
  `,
    )
    .join("")

  return `
    <html>
      <head>
        <title>Registration Card</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .courses { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .courses th, .courses td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .courses th { background-color: #f2f2f2; }
          .signature { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
          .signature-line { border-top: 1px dashed #000; padding-top: 5px; text-align: center; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
          .pending { color: #f59e0b; font-weight: bold; }
          .logo { max-width: 150px; margin-bottom: 10px; }
          .university-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .card-title { font-size: 20px; margin-bottom: 10px; }
          .semester-info { font-size: 16px; margin-bottom: 15px; }
          .section-title { font-size: 18px; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .payment-info { margin-bottom: 20px; }
          .payment-info p { margin: 5px 0; }
          .official-note { font-style: italic; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="university-name">BUGEMA UNIVERSITY</div>
          <div class="card-title">STUDENT REGISTRATION CARD</div>
          <div class="semester-info">${data.semester} - ${data.academicYear}</div>
          ${data.isPending ? '<p class="pending">PROVISIONAL - PENDING APPROVAL</p>' : ""}
        </div>
        
        <div class="student-info">
          <div>
            <p><strong>Student Name:</strong> ${data.studentName}</p>
            <p><strong>Student ID:</strong> ${data.studentId}</p>
            <p><strong>Program:</strong> ${data.program}</p>
            <p><strong>Email:</strong> ${data.email}</p>
          </div>
          <div>
            <p><strong>Registration Date:</strong> ${data.registrationDate}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Card Number:</strong> ${data.cardNumber}</p>
            <p><strong>Phone:</strong> ${data.phoneNumber}</p>
          </div>
        </div>
        
        <div class="section-title">Registered Courses</div>
        <table class="courses">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${coursesHTML}
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Total Credit Hours:</strong></td>
              <td><strong>${data.totalCredits}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        
        <div class="section-title">Payment Information</div>
        <div class="payment-info">
          <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
          <p><strong>Amount Paid:</strong> ${data.amountPaid} UGX</p>
        </div>
        
        <div class="signature">
          <div>
            <div class="signature-line">Student Signature</div>
          </div>
          <div>
            <div class="signature-line">Registrar Signature</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This registration card is an official document of Bugema University. Any alteration renders it invalid.</p>
          <p>Printed on: ${data.printDate}</p>
          ${
            data.isPending
              ? '<p class="pending">PROVISIONAL COPY - This card is pending final approval from the registrar\'s office.</p>'
              : ""
          }
          <p class="official-note">For verification, please contact the Registrar's Office.</p>
        </div>
      </body>
    </html>
  `
}
