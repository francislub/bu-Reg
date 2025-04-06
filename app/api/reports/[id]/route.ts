import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/reports/[id] - Get a report by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const report = await prisma.report.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}

// PUT /api/reports/[id] - Update a report
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, description, data, type } = body

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Update report
    const report = await prisma.report.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        data,
        type,
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error updating report:", error)
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 })
  }
}

// DELETE /api/reports/[id] - Delete a report
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Delete report
    await prisma.report.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Report deleted successfully" })
  } catch (error) {
    console.error("Error deleting report:", error)
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 })
  }
}

