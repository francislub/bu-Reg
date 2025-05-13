import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import puppeteer from "puppeteer"
import handlebars from "handlebars"
import { readFileSync } from "fs"
import path from "path"

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
                phoneNumber: true,
                address: true,
                photoUrl: true,
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
        registrationCard: true,
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

    // Register handlebars helpers
    handlebars.registerHelper("eq", (a, b) => a === b)

    const templateData = {
      studentName: fullName || registration.user.name || "Unknown",
      studentId: registration.user.profile?.studentId || registration.user.id,
      email: registration.user.email || "N/A",
      program: registration.user.profile?.program || "Not specified",
      phoneNumber: registration.user.profile?.phoneNumber || "N/A",
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
      cardNumber: registration.registrationCard?.cardNumber || "Not Issued",
      cardIssueDate: registration.registrationCard
        ? new Date(registration.registrationCard.issuedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
      courses: registration.courseUploads.map((upload) => ({
        code: upload.course.code,
        title: upload.course.title,
        department: upload.course.department.name,
        credits: upload.course.credits,
        status: upload.status,
      })),
      totalCredits,
      printDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      paymentStatus: paymentInfo.status,
      amountPaid: paymentInfo.amount.toLocaleString(),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://bugema-university.edu",
    }

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    const page = await browser.newPage()

    // Create a simple HTML template if the file doesn't exist
    let html = ""
    try {
      // Read the HTML template
      const templatePath = path.resolve(process.cwd(), "templates", "registration-slip.html")
      const templateHtml = readFileSync(templatePath, "utf8")

      // Compile the template
      const template = handlebars.compile(templateHtml)
      html = template(templateData)
    } catch (error) {
      console.error("Error reading template file:", error)
      // Create a basic template if file doesn't exist
      html = `
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
            </style>
          </head>
          <body>
            <div class="header">
              <h1>BUGEMA UNIVERSITY</h1>
              <h2>STUDENT REGISTRATION CARD</h2>
              <p>${templateData.semester} - ${templateData.academicYear}</p>
              ${templateData.isPending ? '<p class="pending">PROVISIONAL - PENDING APPROVAL</p>' : ""}
            </div>
            
            <div class="student-info">
              <div>
                <p><strong>Student Name:</strong> ${templateData.studentName}</p>
                <p><strong>Student ID:</strong> ${templateData.studentId}</p>
                <p><strong>Program:</strong> ${templateData.program}</p>
                <p><strong>Email:</strong> ${templateData.email}</p>
              </div>
              <div>
                <p><strong>Registration Date:</strong> ${templateData.registrationDate}</p>
                <p><strong>Status:</strong> ${templateData.status}</p>
                <p><strong>Card Number:</strong> ${templateData.cardNumber}</p>
                <p><strong>Phone:</strong> ${templateData.phoneNumber}</p>
              </div>
            </div>
            
            <h3>Registered Courses</h3>
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
                ${templateData.courses
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
                  .join("")}
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Total Credit Hours:</strong></td>
                  <td><strong>${templateData.totalCredits}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            
            <h3>Payment Information</h3>
            <p><strong>Payment Status:</strong> ${templateData.paymentStatus}</p>
            <p><strong>Amount Paid:</strong> ${templateData.amountPaid} UGX</p>
            
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
              <p>Printed on: ${templateData.printDate}</p>
              ${templateData.isPending ? '<p class="pending">PROVISIONAL COPY - This card is pending final approval from the registrar\'s office.</p>' : ""}
            </div>
          </body>
        </html>
      `
    }

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
