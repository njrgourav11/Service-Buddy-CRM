import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Console Dashboard | ServiceBuddy CRM",
  description: "Monitor operational key performance indicators, appliance repair dispatches, technician commission shares, and stock catalog standings.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
