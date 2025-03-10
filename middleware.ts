import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuthenticated = !!token

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin")
  const isFacultyPage = req.nextUrl.pathname.startsWith("/faculty")
  const isStudentPage = req.nextUrl.pathname.startsWith("/dashboard")

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    // Redirect to appropriate dashboard based on role
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    } else if (token.role === "FACULTY") {
      return NextResponse.redirect(new URL("/faculty/dashboard", req.url))
    } else {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && (isAdminPage || isFacultyPage || isStudentPage)) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Check role-based access
  if (isAuthenticated) {
    const userRole = token.role as string

    // Restrict admin pages to admin users
    if (isAdminPage && userRole !== "ADMIN") {
      if (userRole === "FACULTY") {
        return NextResponse.redirect(new URL("/faculty/dashboard", req.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Restrict faculty pages to faculty users
    if (isFacultyPage && userRole !== "FACULTY") {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Restrict student pages to student users
    if (isStudentPage && userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    } else if (isStudentPage && userRole === "FACULTY") {
      return NextResponse.redirect(new URL("/faculty/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/faculty/:path*", "/auth/:path*"],
}

