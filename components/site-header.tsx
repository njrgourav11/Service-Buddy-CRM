"use client"

import * as React from "react"
import { useCRM, UserRole } from "@/context/crm-context"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Notification03Icon,
  HelpCircleIcon
} from "@hugeicons/core-free-icons"

// Self-contained high-fidelity theme SVG icons
function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

export function SiteHeader() {
  const { activeTab, setActiveTab, currentRole, setCurrentRole, reminders } = useCRM()
  
  const [theme, setTheme] = React.useState<"light" | "dark">("dark")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark")
      setTheme(isDark ? "dark" : "light")
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    setTheme(nextTheme)
  }

  // Dynamic Page Headers
  const getTabTitle = () => {
    switch (activeTab) {
      case "overview": return "Dashboard Overview"
      case "bookings": return "Service Bookings Ledger"
      case "customers": return "Customer Directory"
      case "leads": return "Leads Pipeline Funnel"
      case "contacts": return "Contacts Directory"
      case "expenditures": return "Operational Expenses"
      case "outstanding": return "Outstanding & Dues Tracker"
      case "payouts": return "Technician Payouts ledger"
      case "inventory": return "Spare Spares Catalog"
      case "assets": return "Company Assets"
      case "employees": return "Employee Payroll"
      case "reminders": return "Reminders & Alerts"
      case "reports": return "Reports & Charts Center"
      default: return "ServiceBuddy"
    }
  }

  const activeAlertsCount = reminders.length

  const handleRoleChange = (role: string) => {
    setCurrentRole(role as UserRole)
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-card/60 backdrop-blur-md sticky top-0 z-40">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        
        {/* Left Side: Navigation Trigger and Title */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-base transition-all">
            {getTabTitle()}
          </h1>
        </div>
 
        {/* Right Side: Role Switcher and Alerts */}
        <div className="flex items-center gap-3">
          
          {/* User Role Switcher Selector */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-1.5 hidden md:inline">Active Role:</span>
            <Select value={currentRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="h-7 text-xs font-semibold py-0.5 px-2 bg-background border-border/50 select-none shadow-none w-28 md:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="w-40">
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
 
            {/* Role Badge Indicator */}
            <Badge 
              variant="outline"
              className={`text-[9px] font-extrabold px-1.5 h-5 flex items-center shrink-0 uppercase tracking-wide select-none ${
                currentRole === "Admin" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
              }`}
            >
              {currentRole}
            </Badge>
          </div>
 
          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          {/* Theme Switcher Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
          >
            {theme === "dark" ? (
              <SunIcon className="size-4 text-amber-500 fill-amber-500/20" />
            ) : (
              <MoonIcon className="size-4 text-indigo-500 fill-indigo-500/10" />
            )}
            <span className="sr-only">Toggle Theme</span>
          </Button>

          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          {/* Quick Reminders notification bell */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveTab("reminders")}
            className="size-8 text-muted-foreground hover:text-foreground relative hover:bg-muted"
          >
            <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4.5" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

        </div>

      </div>
    </header>
  )
}
