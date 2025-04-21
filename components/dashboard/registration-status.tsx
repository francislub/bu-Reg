import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import Link from "next/link"

interface RegistrationStatusProps {
  registration: {
    id: string
    status: string
    createdAt: string | Date
    updatedAt: string | Date
    semester: {
      name: string
      startDate: string | Date
      endDate: string | Date
    }
  }
  registrationCard?: {
    id: string
    cardNumber: string
    createdAt: string | Date
  } | null
}

export function RegistrationStatus({ registration, registrationCard }: RegistrationStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Status</CardTitle>
        <CardDescription>Your current registration status for {registration.semester.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge
              variant={
                registration.status === "APPROVED"
                  ? "success"
                  : registration.status === "PENDING"
                    ? "outline"
                    : "destructive"
              }
            >
              {registration.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
              <p>{new Date(registration.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p>{new Date(registration.updatedAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Semester</p>
              <p>{registration.semester.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Registration Card</p>
              <p>{registrationCard ? `Card #${registrationCard.cardNumber}` : "Not issued yet"}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View Registration Form
            </Button>
            {registrationCard && (
              <Link href="/dashboard/registration/card">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Registration Card
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
