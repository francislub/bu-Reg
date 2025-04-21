import type React from "react"
import { Layout } from "@/components/site/layout"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Layout>{children}</Layout>
}
