import { NextResponse } from "next/server"

// Change this endpoint to not reveal the actual secret length
export async function GET() {
  return NextResponse.json({
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
    nextAuthUrl: process.env.NEXTAUTH_URL || "Not set",
    nodeEnv: process.env.NODE_ENV || "Not set",
  })
}

