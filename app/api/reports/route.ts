import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/reports - Get all reports
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build where clause based on query params
    const where: any = {}
    if (type) where.type = type

    const reports = await prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    const total = await prisma.report.count({ where })

    return NextResponse.json({
      reports,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

// POST /api/reports - Create a new report
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, data, type, createdBy } = body

    // Create report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        data,
        type,
        createdBy,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}

