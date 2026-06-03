"use client"

import * as React from "react"
import { useCRM, UserRole } from "@/context/crm-context"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  DashboardSquare01Icon, 
  Menu01Icon, 
  ChartHistogramIcon, 
  Folder01Icon, 
  UserGroupIcon, 
  File01Icon, 
  Settings05Icon, 
  HelpCircleIcon, 
  SearchIcon, 
  Database01Icon, 
  Analytics01Icon, 
  CommandIcon,
  CreditCardIcon,
  Notification03Icon,
  PlusSignCircleIcon,
  LicenseIcon,
  UserCircle02Icon
} from "@hugeicons/core-free-icons"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeTab, setActiveTab, currentRole, reminders } = useCRM()

  // Count active urgent notifications
  const activeAlertsCount = reminders.length

  const navOperations = [
    {
      id: "overview",
      title: "Overview",
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
    },
    {
      id: "bookings",
      title: "Bookings & Customers",
      icon: <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />,
    },
    {
      id: "leads",
      title: "Leads Funnel",
      icon: <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />,
    },
    {
      id: "contacts",
      title: "Contacts",
      icon: <HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} />,
    },
  ]

  const navFinancials = [
    {
      id: "expenditures",
      title: "Expenditures",
      icon: <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />,
    },
    {
      id: "outstanding",
      title: "Outstanding Dues",
      icon: <HugeiconsIcon icon={File01Icon} strokeWidth={2} />,
    },
    {
      id: "payouts",
      title: "Technician Payouts",
      icon: <HugeiconsIcon icon={LicenseIcon} strokeWidth={2} />,
    },
  ]

  const navResources = [
    {
      id: "inventory",
      title: "Inventory Spares",
      icon: <HugeiconsIcon icon={Database01Icon} strokeWidth={2} />,
    },
    {
      id: "assets",
      title: "Asset Manager",
      icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
    },
    {
      id: "employees",
      title: "Employees",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
    },
    {
      id: "technicians",
      title: "Technicians",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
    },
  ]

  const navAnalytics = [
    {
      id: "reports",
      title: "Reports Center",
      icon: <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />,
    },
    {
      id: "reminders",
      title: "Reminders",
      icon: <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} />,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined
    },
    {
      id: "import",
      title: "Data Importer",
      icon: <HugeiconsIcon icon={File01Icon} strokeWidth={2} />,
    },
  ]

  const simulatedUser = {
    name: currentRole === "Admin" ? "System Administrator" : "Operation Manager",
    email: `${currentRole.toLowerCase()}@servicebuddy.in`,
    avatar: "/avatars/admin.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2.5 px-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 border border-border/50 overflow-hidden shadow-xs shrink-0">
                <img src="/icon.png" alt="ServiceBuddy Logo" className="size-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-foreground">ServiceBuddy</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Appliance CRM</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        {/* Operations Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground/80 tracking-widest uppercase px-3 py-1">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navOperations.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    className="transition-colors duration-150"
                  >
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Financials Section */}
        {currentRole === "Admin" && (
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground/80 tracking-widest uppercase px-3 py-1">Financials</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navFinancials.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab(item.id)}
                      isActive={activeTab === item.id}
                      tooltip={item.title}
                      className="transition-colors duration-150"
                    >
                      {item.icon}
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Resources Section */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground/80 tracking-widest uppercase px-3 py-1">Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navResources.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    className="transition-colors duration-150"
                  >
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Section */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground/80 tracking-widest uppercase px-3 py-1">Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navAnalytics.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    className="transition-colors duration-150"
                  >
                    {item.icon}
                    <span className="font-medium flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 py-3 bg-sidebar-accent/10">
        <NavUser user={simulatedUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
