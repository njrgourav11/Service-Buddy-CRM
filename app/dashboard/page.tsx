"use client"

import * as React from "react"
import { CRMProvider, useCRM } from "@/context/crm-context"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

// Screen Module Views
import { DashboardOverview } from "@/components/dashboard-overview"
import { BookingModule } from "@/components/booking-module"
import { CustomerModule } from "@/components/customer-module"
import { LeadsModule } from "@/components/leads-module"
import { ContactsModule } from "@/components/contacts-module"
import { ExpenditureModule } from "@/components/expenditure-module"
import { OutstandingModule } from "@/components/outstanding-module"
import { PayoutModule } from "@/components/payout-module"
import { InventoryModule } from "@/components/inventory-module"
import { AssetsEmployeesModule } from "@/components/assets-employees-module"
import { TechnicianModule } from "@/components/technician-module"
import { RemindersModule } from "@/components/reminders-module"
import { ReportsModule } from "@/components/reports-module"
import { ImportModule } from "@/components/import-module"
import { ComplaintsModule } from "@/components/complaints-module"

// Wrapper component to enable useCRM inside the providers
function DashboardContent() {
  const { activeTab } = useCRM()
  const [isOnline, setIsOnline] = React.useState(() => {
    if (typeof window !== "undefined") {
      return window.navigator.onLine
    }
    return true
  })

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  // Dynamic selector for sub-view rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview />
      case "bookings":
        return <BookingModule />
      case "customers":
        return <CustomerModule />
      case "complaints":
        return <ComplaintsModule />
      case "leads":
        return <LeadsModule />
      case "contacts":
        return <ContactsModule />
      case "expenditures":
        return <ExpenditureModule />
      case "outstanding":
        return <OutstandingModule />
      case "payouts":
        return <PayoutModule />
      case "inventory":
        return <InventoryModule />
      case "assets":
        return <AssetsEmployeesModule initialSubTab="assets" />
      case "employees":
        return <AssetsEmployeesModule initialSubTab="employees" />
      case "technicians":
        return <TechnicianModule />
      case "reminders":
        return <RemindersModule />
      case "reports":
        return <ReportsModule />
      case "import":
        return <ImportModule />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          {!isOnline && (
            <div className="bg-amber-500 text-white font-bold text-xs py-2.5 px-4 text-center border-b border-amber-600 animate-in fade-in duration-200">
              ⚠️ No Internet Connection. Saved changes will only be stored locally and won't sync to the cloud database.
            </div>
          )}
          <div className="flex flex-1 flex-col overflow-y-auto min-w-0 max-w-full">
            {renderTabContent()}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default function Page() {
  return (
    <CRMProvider>
      <DashboardContent />
    </CRMProvider>
  )
}
