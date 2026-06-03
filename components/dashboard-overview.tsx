"use client"

import * as React from "react"
import { useCRM } from "@/context/crm-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartUpIcon,
  CreditCardIcon,
  Notification03Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  ArrowRight01Icon,
  UserGroupIcon,
  Database01Icon,
  PercentSquareIcon,
  Money01Icon,
  Package01Icon,
  ChartBarLineIcon,
} from "@hugeicons/core-free-icons"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const pct = (n: number) =>
  `${isFinite(n) ? n.toFixed(1) : "0.0"}%`

// ─── Stat Card ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent: string   // tailwind bg + text classes for the icon bubble
  icon: React.ComponentType<{ className?: string }>
  negative?: boolean
  onClick?: () => void
  selected?: boolean
  clickable?: boolean
}

function StatCard({ label, value, sub, accent, icon: Icon, negative, onClick, selected, clickable }: StatCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={`group relative overflow-hidden border shadow-xs transition-all duration-200 select-none ${
        clickable 
          ? "cursor-pointer hover:shadow-md hover:border-primary/50" 
          : "border-border/70 bg-card"
      } ${
        selected 
          ? "ring-2 ring-primary border-primary bg-primary/5 dark:bg-primary/10 shadow-sm" 
          : "border-border/70 bg-card hover:border-border"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {label}
            </span>
            <span
              className={`text-xl font-bold tabular-nums tracking-tight leading-none ${
                negative ? "text-rose-600 dark:text-rose-400" : "text-foreground"
              }`}
            >
              {value}
            </span>
            {sub && (
              <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</span>
            )}
            {clickable && (
              <span className="text-[9px] text-primary font-bold mt-1.5 flex items-center gap-1">
                {selected ? (
                  <span className="flex items-center gap-1 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    Showing breakdown
                  </span>
                ) : (
                  <span className="text-muted-foreground/60 group-hover:text-primary transition-colors">
                    Click to view breakdown
                  </span>
                )}
              </span>
            )}
          </div>
          <div className={`shrink-0 rounded-xl p-2.5 ${accent} transition-transform duration-200 group-hover:scale-105`}>
            <Icon className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardOverview() {
  const {
    bookings,
    expenses,
    spares,
    technicians,
    payouts,
    customers,
    leads,
    reminders,
    dismissReminder,
    currentRole,
    setActiveTab,
  } = useCRM()

  // Breakdown state managers: Initial states are null so no detailed breakdown is shown by default
  const [activeBreakdown, setActiveBreakdown] = React.useState<"revenue" | "profit" | "expenses" | "operations" | null>(null)
  const [activeManagerBreakdown, setActiveManagerBreakdown] = React.useState<"bookings" | "clients" | "resources" | null>(null)

  const handleCardClick = (category: "revenue" | "profit" | "expenses" | "operations") => {
    setActiveBreakdown(prev => prev === category ? null : category)
  }

  const handleManagerCardClick = (category: "bookings" | "clients" | "resources") => {
    setActiveManagerBreakdown(prev => prev === category ? null : category)
  }

  // ════════════════════════════════════════════
  // REVENUE CALCULATIONS
  // ════════════════════════════════════════════
  const spareRevenue = bookings.reduce((s, b) => s + (b.spareCost || 0), 0)
  const technicianRevenue = bookings.reduce((s, b) => s + (b.totalTechnicianAmount || 0), 0)
  const companyRevenue = bookings.reduce((s, b) => s + (b.totalCompanyAmount || 0), 0)
  const totalRevenue = bookings.reduce((s, b) => s + (b.totalConsumerAmount || 0), 0)
  const completedJobs = bookings.filter((b) => b.status === "Completed").length
  const avgBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0

  // ════════════════════════════════════════════
  // EXPENSE CALCULATIONS
  // ════════════════════════════════════════════
  const sumCat = (cat: string) =>
    expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + (e.amount || 0), 0)

  const workingExpenses        = sumCat("Working expenses (beneficiary)")
  const expItems               = sumCat("Exp item")
  const toolsMaintenance       = sumCat("Tools and maintenance")
  const officeExpenses         = sumCat("Office expenses")
  const toolsSubscriptions     = sumCat("Tools and subscriptions")
  const refunds                = sumCat("Refunds")
  const nonBeneficiaryExpenses = sumCat("Non beneficiary items")
  const outstandingAmount      = sumCat("Outstanding")

  const totalExpenditure =
    workingExpenses + expItems + toolsMaintenance + officeExpenses +
    toolsSubscriptions + refunds + nonBeneficiaryExpenses

  // ════════════════════════════════════════════
  // PROFIT CALCULATIONS
  // ════════════════════════════════════════════
  const balance = companyRevenue - totalExpenditure - outstandingAmount
  const netAmt = companyRevenue - totalExpenditure
  const netProfit = totalRevenue - totalExpenditure
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const revenueLessJobs = totalRevenue - completedJobs

  // ════════════════════════════════════════════
  // OPERATIONS METRICS
  // ════════════════════════════════════════════
  const totalBookings  = bookings.length
  const pendingJobs    = bookings.filter((b) => b.status !== "Completed").length
  const completionRate = totalBookings > 0 ? (completedJobs / totalBookings) * 100 : 0

  // ════════════════════════════════════════════
  // TECHNICIAN METRICS
  // ════════════════════════════════════════════
  const totalTechnicianEarnings = technicianRevenue
  const pendingPayouts = payouts
    .filter((p) => p.paymentStatus === "Pending")
    .reduce((s, p) => s + (p.totalPayout || 0), 0)

  const totalTechnicians = technicians.length
  const avgTechnicianEarnings =
    totalTechnicians > 0 ? totalTechnicianEarnings / totalTechnicians : 0

  // ════════════════════════════════════════════
  // CUSTOMER METRICS
  // ════════════════════════════════════════════
  const totalCustomers = customers.length
  const repeatCustomers = customers.filter((c) => {
    const count = bookings.filter((b) => b.customerId === c.id).length
    return count > 1
  }).length
  const customerRetentionRate =
    totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0

  // ════════════════════════════════════════════
  // LEAD METRICS
  // ════════════════════════════════════════════
  const totalLeads     = leads.length
  const convertedLeads = leads.filter((l) => l.status === "Converted").length
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

  // ════════════════════════════════════════════
  // INVENTORY METRICS
  // ════════════════════════════════════════════
  const inventoryValue  = spares.reduce((s, sp) => s + (sp.stockQty || 0) * (sp.unitCost || 0), 0)
  const lowStockItems   = spares.filter((sp) => sp.stockQty <= sp.reorderLevel).length
  const outOfStockItems = spares.filter((sp) => sp.stockQty === 0).length

  // ════════════════════════════════════════════
  // CHART DATA
  // ════════════════════════════════════════════
  const chartData = [
    { name: "Jan", Revenue: 42000, Expenses: 18000, Profit: 24000 },
    { name: "Feb", Revenue: 51000, Expenses: 22000, Profit: 29000 },
    { name: "Mar", Revenue: 68000, Expenses: 31000, Profit: 37000 },
    { name: "Apr", Revenue: 72000, Expenses: 29000, Profit: 43000 },
    { name: "May", Revenue: Math.round(totalRevenue), Expenses: Math.round(totalExpenditure), Profit: Math.round(netProfit) },
  ]

  const recentBookings = [...bookings].reverse().slice(0, 5)

  // ════════════════════════════════════════════
  // RENDER: MANAGER ROLE VIEW
  // ════════════════════════════════════════════
  if (currentRole === "Manager") {
    const managerChartData = [
      { name: "Jan", Bookings: 45, Leads: 60, Completed: 38 },
      { name: "Feb", Bookings: 55, Leads: 72, Completed: 48 },
      { name: "Mar", Bookings: 78, Leads: 95, Completed: 65 },
      { name: "Apr", Bookings: 85, Leads: 110, Completed: 75 },
      { name: "May", Bookings: totalBookings, Leads: totalLeads, Completed: completedJobs },
    ]

    return (
      <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-300">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white shadow-md">
          <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Welcome back, {currentRole}!
              </h2>
              <p className="text-sm text-white/80 mt-0.5">
                ServiceBuddy CRM — operational metrics & technician status ledger.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab("bookings")}
              className="w-fit bg-white text-primary hover:bg-white/90 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 cursor-pointer font-bold"
            >
              New Work Order
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
          <div className="absolute -right-8 -bottom-8 size-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute right-20 -top-8 size-24 rounded-full bg-white/5 blur-xl pointer-events-none" />
        </div>

        {/* Primary Interactive Cards (3 columns for Manager) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary rounded-full" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Metrics Category</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Bookings Overview"
              value={`${totalBookings.toLocaleString()} Requests`}
              sub={`${pct(completionRate)} jobs completed`}
              accent="bg-primary/10 text-primary border border-primary/20"
              icon={(p) => <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={2} {...p} />}
              onClick={() => handleManagerCardClick("bookings")}
              selected={activeManagerBreakdown === "bookings"}
              clickable
            />
            <StatCard
              label="Customers & Leads"
              value={`${totalCustomers.toLocaleString()} Contacts`}
              sub={`${totalLeads} inbound leads logged`}
              accent="bg-primary/10 text-primary border border-primary/20"
              icon={(p) => <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} {...p} />}
              onClick={() => handleManagerCardClick("clients")}
              selected={activeManagerBreakdown === "clients"}
              clickable
            />
            <StatCard
              label="Staff & Inventory"
              value={`${totalTechnicians.toLocaleString()} Technicians`}
              sub={`${lowStockItems} spares low in stock`}
              accent="bg-primary/10 text-primary border border-primary/20"
              icon={(p) => <HugeiconsIcon icon={Database01Icon} strokeWidth={2} {...p} />}
              onClick={() => handleManagerCardClick("resources")}
              selected={activeManagerBreakdown === "resources"}
              clickable
            />
          </div>
        </div>

        {/* Detailed Breakdown for Manager (Renders below metric selection only if active) */}
        {activeManagerBreakdown && (
          <div className="flex flex-col gap-3.5 p-5 bg-card/45 backdrop-blur-md rounded-2xl border border-border/80 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  {activeManagerBreakdown === "bookings" && "Bookings Breakdown Detail"}
                  {activeManagerBreakdown === "clients" && "Customers & Leads Detail"}
                  {activeManagerBreakdown === "resources" && "Staff & Resources Detail"}
                </h3>
              </div>
              <span className="text-[9px] text-muted-foreground font-semibold">
                {activeManagerBreakdown === "bookings" && "3 items tracking"}
                {activeManagerBreakdown === "clients" && "5 items tracking"}
                {activeManagerBreakdown === "resources" && "4 items tracking"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeManagerBreakdown === "bookings" && (
                <>
                  <StatCard
                    label="Total Bookings"
                    value={totalBookings.toLocaleString()}
                    sub="Service bookings ledger"
                    accent="bg-primary/10 text-primary border border-primary/20"
                    icon={(p) => <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Completed Jobs"
                    value={completedJobs.toLocaleString()}
                    sub="Successful repairs"
                    accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                    icon={(p) => <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Pending Jobs"
                    value={pendingJobs.toLocaleString()}
                    sub="Awaiting completion"
                    accent="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                    icon={(p) => <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} {...p} />}
                  />
                </>
              )}

              {activeManagerBreakdown === "clients" && (
                <>
                  <StatCard
                    label="Total Customers"
                    value={totalCustomers.toLocaleString()}
                    sub="Registered contacts"
                    accent="bg-primary/10 text-primary border border-primary/20"
                    icon={(p) => <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Retention Rate"
                    value={pct(customerRetentionRate)}
                    sub="Repeat clients ratio"
                    accent="bg-primary/10 text-primary border border-primary/20"
                    icon={(p) => <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Total Leads"
                    value={totalLeads.toLocaleString()}
                    sub="Inbound query pipeline"
                    accent="bg-primary/10 text-primary border border-primary/20"
                    icon={(p) => <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Converted Leads"
                    value={convertedLeads.toLocaleString()}
                    sub="Successfully booked"
                    accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                    icon={(p) => <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Conversion Rate"
                    value={pct(conversionRate)}
                    sub="Converted / Leads ratio"
                    accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                    icon={(p) => <HugeiconsIcon icon={PercentSquareIcon} strokeWidth={2} {...p} />}
                  />
                </>
              )}

              {activeManagerBreakdown === "resources" && (
                <>
                  <StatCard
                    label="Total Technicians"
                    value={totalTechnicians.toLocaleString()}
                    sub="Active staff in field"
                    accent="bg-primary/10 text-primary border border-primary/20"
                    icon={(p) => <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Low Stock Items"
                    value={lowStockItems.toLocaleString()}
                    sub="At/below reorder mark"
                    accent="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                    icon={(p) => <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Out of Stock"
                    value={outOfStockItems.toLocaleString()}
                    sub="Zero stock inventory"
                    accent="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                    icon={(p) => <HugeiconsIcon icon={Database01Icon} strokeWidth={2} {...p} />}
                  />
                  <StatCard
                    label="Inventory Value"
                    value={fmt(inventoryValue)}
                    sub="Total units cost valuation"
                    accent="bg-primary/10 text-primary border border-primary/20"
                    icon={(p) => <HugeiconsIcon icon={Package01Icon} strokeWidth={2} {...p} />}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Operational Chart + Reminders */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Monthly Operational Trends Chart */}
          <Card className="lg:col-span-2 shadow-xs border border-border/80 bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Operational Trend Overview</CardTitle>
              <CardDescription>Monthly growth metrics: Bookings, inbound Leads, and Completed jobs.</CardDescription>
            </CardHeader>
            <CardContent className="h-72 min-w-0">
              <div className="w-full h-full min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={managerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                      labelStyle={{ fontWeight: "bold" }}
                      formatter={(v: unknown) => [`${Number(v)} units`, ""]}
                    />
                    <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                    <Area type="natural" dataKey="Bookings"  stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#gradBookings)"   />
                    <Area type="natural" dataKey="Leads"     stroke="#a855f7"         strokeWidth={2} fillOpacity={1} fill="url(#gradLeads)"       />
                    <Area type="natural" dataKey="Completed" stroke="#10b981"         strokeWidth={2} fillOpacity={1} fill="url(#gradCompleted)"   />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Action Reminders */}
          <Card className="shadow-xs border border-border/80 bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Action Reminders</CardTitle>
                <CardDescription>Urgent notices from system logs.</CardDescription>
              </div>
              {reminders.length > 0 && (
                <Badge variant="destructive" className="px-2 animate-bounce">
                  {reminders.length}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 max-h-64 overflow-y-auto">
              {reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                  <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 p-3 text-emerald-600 dark:text-emerald-400">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">All clear — no pending alerts.</span>
                </div>
              ) : (
                reminders.slice(0, 5).map((rem) => {
                  const colorClass =
                    rem.type === "Inventory Refill"
                      ? "bg-rose-50 dark:bg-rose-950/10 text-rose-700 border-rose-200 dark:text-rose-400"
                      : rem.type === "Outstanding Recovery"
                      ? "bg-blue-50 dark:bg-blue-950/10 text-blue-700 border-blue-200 dark:text-blue-400"
                      : "bg-amber-50 dark:bg-amber-950/10 text-amber-700 border-amber-200 dark:text-amber-400"
                  return (
                    <div key={rem.id} className={`flex items-start gap-2 rounded-lg border p-2.5 ${colorClass}`}>
                      <HugeiconsIcon icon={Notification03Icon} strokeWidth={2.5} className="size-3.5 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold leading-tight truncate">{rem.title}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{rem.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dismissReminder(rem.id)}
                        className="size-4 text-muted-foreground hover:text-foreground shrink-0 rounded-full text-xs"
                      >
                        ×
                      </Button>
                    </div>
                  )
                })
              )}
            </CardContent>
            <CardFooter className="border-t border-border/40 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("reminders")}
                className="w-full text-xs font-medium cursor-pointer"
              >
                Open Reminders Board
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Bookings & Active Technicians */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Bookings Table */}
          <Card className="lg:col-span-2 shadow-xs border border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
                <CardDescription>Latest logged service work orders.</CardDescription>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => setActiveTab("bookings")}
                className="text-xs font-semibold px-0 text-primary cursor-pointer"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-y border-border/50">
                    <tr>
                      <th className="px-4 py-2.5">ID</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Appliance</th>
                      <th className="px-4 py-2.5">Service</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {recentBookings.map((b) => {
                      const cust = customers.find((c) => c.id === b.customerId)
                      const customerName = cust ? cust.name : "Unknown Customer"
                      return (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-xs tabular-nums text-foreground">{b.id}</td>
                          <td className="px-4 py-3 font-semibold text-xs text-foreground">{customerName}</td>
                          <td className="px-4 py-3 font-medium text-xs text-muted-foreground">{b.appliance}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px] py-0 px-1 text-muted-foreground">
                              {b.serviceType}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold py-0.5 px-1.5 flex w-fit items-center gap-1 ${
                                b.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : b.status === "In Progress"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                              }`}
                            >
                              <HugeiconsIcon
                                icon={b.status === "Completed" ? CheckmarkCircle01Icon : Loading03Icon}
                                strokeWidth={2.5}
                                className="size-3"
                              />
                              {b.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                    {recentBookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                          No bookings recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Active Technicians without financial data */}
          <Card className="shadow-xs border border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Active Technicians</CardTitle>
              <CardDescription>Live standings and operations status.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {technicians.slice(0, 4).map((t) => {
                const jobsDone = bookings.filter(
                  (b) => b.assignedTechnicianId === t.id && b.status === "Completed"
                ).length
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {t.skills.slice(0, 2).join(", ") || "General Repairs"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                        {jobsDone} Jobs Done
                      </Badge>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold uppercase">
                        Active
                      </Badge>
                    </div>
                  </div>
                )
              })}
              {technicians.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No technicians registered.</p>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/40 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("technicians")}
                className="w-full text-xs font-medium cursor-pointer"
              >
                Manage Technicians
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // RENDER: ADMIN ROLE VIEW
  // ════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-300">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Welcome back, {currentRole}!
            </h2>
            <p className="text-sm text-white/85 mt-0.5">
              ServiceBuddy CRM — live financial data from Firebase across all modules.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveTab("bookings")}
            className="w-fit bg-white text-primary hover:bg-white/90 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 cursor-pointer font-bold"
          >
            New Work Order
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
          </Button>
        </div>
        <div className="absolute -right-8 -bottom-8 size-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute right-20 -top-8 size-24 rounded-full bg-white/5 blur-xl pointer-events-none" />
      </div>

      {/* Simplified Summary Metrics (Clickable Categories) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-primary rounded-full" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Financial/Operations Category</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={fmt(totalRevenue)}
            sub={`${totalBookings} booked services`}
            accent="bg-primary/10 text-primary border border-primary/20"
            icon={(p) => <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} {...p} />}
            onClick={() => handleCardClick("revenue")}
            selected={activeBreakdown === "revenue"}
            clickable
          />
          <StatCard
            label="Net Profit"
            value={fmt(netProfit)}
            sub={`${pct(profitMargin)} net margin`}
            accent={netProfit >= 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"}
            icon={(p) => <HugeiconsIcon icon={Money01Icon} strokeWidth={2} {...p} />}
            onClick={() => handleCardClick("profit")}
            selected={activeBreakdown === "profit"}
            clickable
            negative={netProfit < 0}
          />
          <StatCard
            label="Operating Expenses"
            value={fmt(totalExpenditure)}
            sub="Exclude outstanding dues"
            accent="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
            icon={(p) => <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} {...p} />}
            onClick={() => handleCardClick("expenses")}
            selected={activeBreakdown === "expenses"}
            clickable
          />
          <StatCard
            label="Operations & Inventory"
            value={`${totalBookings} Jobs`}
            sub={`${pct(completionRate)} completed jobs`}
            accent="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
            icon={(p) => <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={2} {...p} />}
            onClick={() => handleCardClick("operations")}
            selected={activeBreakdown === "operations"}
            clickable
          />
        </div>
      </div>

      {/* Expandable Detailed Breakdown Grid (Renders only if active) */}
      {activeBreakdown && (
        <div className="flex flex-col gap-3.5 p-5 bg-card/45 backdrop-blur-md rounded-2xl border border-border/80 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {activeBreakdown === "revenue" && "Total Revenue breakdown details"}
                {activeBreakdown === "profit" && "Net Profit breakdown details"}
                {activeBreakdown === "expenses" && "Operating Expenses details"}
                {activeBreakdown === "operations" && "Operations & Inventory status ledger"}
              </h3>
            </div>
            <span className="text-[9px] text-muted-foreground font-semibold">
              {activeBreakdown === "revenue" && "4 parameters logged"}
              {activeBreakdown === "profit" && "5 parameters logged"}
              {activeBreakdown === "expenses" && "5 parameters logged"}
              {activeBreakdown === "operations" && "12 parameters logged"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 mt-1">
            {activeBreakdown === "revenue" && (
              <>
                <StatCard
                  label="Spare (Actual Cost)"
                  value={fmt(spareRevenue)}
                  sub="SUM(actualSpare) supplier cost"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={Package01Icon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Company Amount"
                  value={fmt(companyRevenue)}
                  sub="SUM(totalCompanyAmount)"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={Money01Icon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Technician Amount"
                  value={fmt(technicianRevenue)}
                  sub="SUM(totalTechnicianAmount)"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Avg Booking Value"
                  value={fmt(avgBookingValue)}
                  sub="Total Revenue ÷ total bookings"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} {...p} />}
                />
              </>
            )}

            {activeBreakdown === "profit" && (
              <>
                <StatCard
                  label="Net Profit"
                  value={fmt(netProfit)}
                  sub="Total Revenue − Expenditure"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Balance"
                  value={fmt(balance)}
                  sub="CompanyAmt − Exp − Outstanding"
                  accent={balance >= 0 ? "bg-primary/10 text-primary border border-primary/20" : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"}
                  icon={(p) => <HugeiconsIcon icon={Money01Icon} strokeWidth={2} {...p} />}
                  negative={balance < 0}
                />
                <StatCard
                  label="Net Amount (COM−TE)"
                  value={fmt(netAmt)}
                  sub="CompanyAmt − Expenditure"
                  accent={netAmt >= 0 ? "bg-primary/10 text-primary border border-primary/20" : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"}
                  icon={(p) => <HugeiconsIcon icon={Money01Icon} strokeWidth={2} {...p} />}
                  negative={netAmt < 0}
                />
                <StatCard
                  label="Revenue (Less Jobs)"
                  value={fmt(revenueLessJobs)}
                  sub={`Total Revenue − ${completedJobs} jobs`}
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Profit Margin"
                  value={pct(profitMargin)}
                  sub="Net Profit ÷ Total Revenue"
                  accent={profitMargin >= 0 ? "bg-primary/10 text-primary border border-primary/20" : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"}
                  icon={(p) => <HugeiconsIcon icon={PercentSquareIcon} strokeWidth={2} {...p} />}
                  negative={profitMargin < 0}
                />
              </>
            )}

            {activeBreakdown === "expenses" && (
              <>
                <StatCard
                  label="Total Expenditure"
                  value={fmt(totalExpenditure)}
                  sub="All operating expenses"
                  accent="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                  icon={(p) => <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Working Expenses"
                  value={fmt(workingExpenses)}
                  sub="Beneficiary payouts"
                  accent="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                  icon={(p) => <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Office Expenses"
                  value={fmt(officeExpenses)}
                  sub="Office & admin costs"
                  accent="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                  icon={(p) => <HugeiconsIcon icon={Database01Icon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Outstanding"
                  value={fmt(outstandingAmount)}
                  sub="Liability (unpaid costs)"
                  accent="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                  icon={(p) => <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Refunds"
                  value={fmt(refunds)}
                  sub="Customer refunds issued"
                  accent="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                  icon={(p) => <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} {...p} />}
                />
              </>
            )}

            {activeBreakdown === "operations" && (
              <>
                <StatCard
                  label="Total Bookings"
                  value={totalBookings.toLocaleString()}
                  sub="Total service requests"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Completed Jobs"
                  value={completedJobs.toLocaleString()}
                  sub="Service status Completed"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Pending Jobs"
                  value={pendingJobs.toLocaleString()}
                  sub="Not yet completed"
                  accent="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                  icon={(p) => <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Completion Rate"
                  value={pct(completionRate)}
                  sub="Completed / Bookings ratio"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={PercentSquareIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Total Customers"
                  value={totalCustomers.toLocaleString()}
                  sub="Registered client contacts"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Retention Rate"
                  value={pct(customerRetentionRate)}
                  sub="Repeat customer ratio"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Total Leads"
                  value={totalLeads.toLocaleString()}
                  sub="Inbound customer queries"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Converted Leads"
                  value={convertedLeads.toLocaleString()}
                  sub="Converted lead status"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Conversion Rate"
                  value={pct(conversionRate)}
                  sub="Converted / Leads ratio"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={PercentSquareIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Total Technicians"
                  value={totalTechnicians.toLocaleString()}
                  sub="Active staff in field"
                  accent="bg-primary/10 text-primary border border-primary/20"
                  icon={(p) => <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Low Stock Items"
                  value={lowStockItems.toLocaleString()}
                  sub="Spares at/below reorder"
                  accent="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                  icon={(p) => <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} {...p} />}
                />
                <StatCard
                  label="Out of Stock"
                  value={outOfStockItems.toLocaleString()}
                  sub="Zero quantity items"
                  accent="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                  icon={(p) => <HugeiconsIcon icon={Database01Icon} strokeWidth={2} {...p} />}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Chart + Reminders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2 shadow-xs border border-border/80 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Monthly Financial Overview</CardTitle>
            <CardDescription>Revenue, expenditure and net profit trend (current year).</CardDescription>
          </CardHeader>
          <CardContent className="h-72 min-w-0">
            <div className="w-full h-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                  labelStyle={{ fontWeight: "bold" }}
                  formatter={(v: unknown) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                <Area type="natural" dataKey="Revenue"  stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#gradRev)"    />
                <Area type="natural" dataKey="Expenses" stroke="#f43f5e"         strokeWidth={2} fillOpacity={1} fill="url(#gradExp)"    />
                <Area type="natural" dataKey="Profit"   stroke="#10b981"         strokeWidth={2} fillOpacity={1} fill="url(#gradProfit)" />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Action Reminders */}
        <Card className="shadow-xs border border-border/80 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Action Reminders</CardTitle>
              <CardDescription>Urgent notices from system logs.</CardDescription>
            </div>
            {reminders.length > 0 && (
              <Badge variant="destructive" className="px-2 animate-bounce">
                {reminders.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 max-h-64 overflow-y-auto">
            {reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 p-3 text-emerald-600 dark:text-emerald-400">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">All clear — no pending alerts.</span>
              </div>
            ) : (
              reminders.slice(0, 5).map((rem) => {
                const colorClass =
                  rem.type === "Inventory Refill"
                    ? "bg-rose-50 dark:bg-rose-950/10 text-rose-700 border-rose-200 dark:text-rose-400"
                    : rem.type === "Outstanding Recovery"
                    ? "bg-blue-50 dark:bg-blue-950/10 text-blue-700 border-blue-200 dark:text-blue-400"
                    : "bg-amber-50 dark:bg-amber-950/10 text-amber-700 border-amber-200 dark:text-amber-400"
                return (
                  <div key={rem.id} className={`flex items-start gap-2 rounded-lg border p-2.5 ${colorClass}`}>
                    <HugeiconsIcon icon={Notification03Icon} strokeWidth={2.5} className="size-3.5 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold leading-tight truncate">{rem.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{rem.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dismissReminder(rem.id)}
                      className="size-4 text-muted-foreground hover:text-foreground shrink-0 rounded-full text-xs"
                    >
                      ×
                    </Button>
                  </div>
                )
              })
            )}
          </CardContent>
          <CardFooter className="border-t border-border/40 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("reminders")}
              className="w-full text-xs font-medium cursor-pointer"
            >
              Open Reminders Board
            </Button>
          </CardFooter>
        </Card>

      </div>

      {/* RECENT BOOKINGS + TECHNICIANS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Bookings Table */}
        <Card className="lg:col-span-2 shadow-xs border border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
              <CardDescription>Latest logged service work orders.</CardDescription>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => setActiveTab("bookings")}
              className="text-xs font-semibold px-0 text-primary cursor-pointer"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-y border-border/50">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Appliance</th>
                    <th className="px-4 py-2.5">Service</th>
                    <th className="px-4 py-2.5">Charge</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentBookings.map((b) => {
                    const cust = customers.find((c) => c.id === b.customerId)
                    const customerName = cust ? cust.name : "Unknown Customer"
                    return (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-xs tabular-nums text-foreground">{b.id}</td>
                        <td className="px-4 py-3 font-semibold text-xs text-foreground">{customerName}</td>
                        <td className="px-4 py-3 font-medium text-xs text-muted-foreground">{b.appliance}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] py-0 px-1 text-muted-foreground">
                            {b.serviceType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-bold text-xs tabular-nums text-foreground">
                          ₹{(b.serviceCharge || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold py-0.5 px-1.5 flex w-fit items-center gap-1 ${
                              b.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : b.status === "In Progress"
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={b.status === "Completed" ? CheckmarkCircle01Icon : Loading03Icon}
                              strokeWidth={2.5}
                              className="size-3"
                            />
                            {b.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                        No bookings recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Technicians */}
        <Card className="shadow-xs border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Active Technicians</CardTitle>
            <CardDescription>Live standings and pending dues.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {technicians.slice(0, 4).map((t) => {
              const jobsDone = bookings.filter(
                (b) => b.assignedTechnicianId === t.id && b.status === "Completed"
              ).length
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {jobsDone} jobs • {t.skills.slice(0, 2).join(", ")}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                    <span className="text-xs font-bold tabular-nums text-foreground">
                      ₹{(t.dueAmount || 0).toLocaleString("en-IN")} due
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Adv: ₹{(t.advanceTaken || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )
            })}
            {technicians.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No technicians registered.</p>
            )}
          </CardContent>
          <CardFooter className="border-t border-border/40 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("technicians")}
              className="w-full text-xs font-medium cursor-pointer"
            >
              Manage Technicians
            </Button>
          </CardFooter>
        </Card>

      </div>

    </div>
  )
}
