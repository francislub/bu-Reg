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
                academicInfo: true,
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
    const paymentInfo = (await db.payment.findFirst({
      where: {
        userId: registration.userId,
        semesterId: registration.semesterId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })) || { status: "Pending", amount: 0 }

    // Register handlebars helpers
    handlebars.registerHelper("eq", (a, b) => a === b)

    const templateData = {
      studentName: fullName,
      studentId: registration.user.profile?.studentId || "N/A",
      email: registration.user.email,
      program: registration.user.profile?.program || "N/A",
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
      academicInfo: registration.user.profile?.academicInfo || null,
      paymentStatus: paymentInfo.status,
      amountPaid: paymentInfo.amount.toLocaleString(),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://bugema-university.edu",
    }

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    const page = await browser.newPage()

    // Read the HTML template
    const templatePath = path.resolve(process.cwd(), "templates", "registration-slip.html")
    const templateHtml = readFileSync(templatePath, "utf8")

    // Compile the template
    const template = handlebars.compile(templateHtml)
    const html = template(templateData)

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
