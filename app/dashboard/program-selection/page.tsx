import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProgramSelectionForm } from "@/components/dashboard/program-selection-form"

export default function ProgramSelectionPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Program Selection"
        text="Select your program and department to continue with course registration."
      />
      <div className="grid gap-8">
        <ProgramSelectionForm />
      </div>
    </DashboardShell>
  )
}
