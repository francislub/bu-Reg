import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface UnauthorizedAccessProps {
  message?: string
  redirectUrl?: string
  redirectLabel?: string
}

export function UnauthorizedAccess({
  message = "You do not have permission to access this page",
  redirectUrl = "/auth/login",
  redirectLabel = "Return to Login",
}: UnauthorizedAccessProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center">Unauthorized Access</CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            Please log in with the appropriate credentials or contact your administrator for assistance.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={redirectUrl}>{redirectLabel}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

