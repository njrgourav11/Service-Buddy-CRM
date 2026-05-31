"use client"

import * as React from "react"
import { useCRM } from "@/context/crm-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  ChartUpIcon,
  CreditCardIcon,
  Menu01Icon
} from "@hugeicons/core-free-icons"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, LineChart, Line 
} from "recharts"

export function ReportsModule() {
  const { bookings, expenses, technicians, spares } = useCRM()

  // ==========================================
  // Calculations
  // ==========================================
  const totalRevenue = bookings
    .filter(b => b.status === "Completed")
    .reduce((sum, b) => sum + (b.totalConsumerAmount || 0), 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const totalTechLiability = bookings
    .filter(b => b.status === "Completed")
    .reduce((sum, b) => sum + (b.totalTechnicianAmount || 0), 0)

  const netProfit = Math.round((totalRevenue - totalExpenses - totalTechLiability) * 100) / 100

  // ==========================================
  // Graph 1: Revenue vs Expenses vs Net Margins (Monthly)
  // ==========================================
  const monthlyData = [
    { month: "Jan", Billing: 4200, Expenses: 1800, Profit: 2400 },
    { month: "Feb", Billing: 5100, Expenses: 2200, Profit: 2900 },
    { month: "Mar", Billing: 6800, Expenses: 3100, Profit: 3700 },
    { month: "Apr", Billing: 7200, Expenses: 2900, Profit: 4300 },
    { month: "May", Billing: Math.round(totalRevenue), Expenses: Math.round(totalExpenses), Profit: Math.round(netProfit) },
  ]

  // ==========================================
  // Graph 2: Technician Performance Rankings
  // ==========================================
  const techPerformanceData = technicians.map(t => {
    const techBookings = bookings.filter(b => b.assignedTechnicianId === t.id && b.status === "Completed")
    const jobsCount = techBookings.length
    const commission = techBookings.reduce((sum, b) => sum + (b.technicianCommission || 0), 0)
    const earnings = techBookings.reduce((sum, b) => sum + (b.totalTechnicianAmount || 0), 0)

    return {
      name: t.name,
      Jobs: jobsCount,
      Commission: Math.round(commission),
      Earnings: Math.round(earnings)
    }
  })

  // ==========================================
  // Graph 3: Spares Stock Availability Chart
  // ==========================================
  const sparesStockData = spares.map(s => ({
    name: s.name,
    Available: s.stockQty,
    Limit: s.reorderLevel
  }))

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">CRM Reports & Performance Analytics</h2>
          <p className="text-sm text-muted-foreground">Inspect multi-dimensional financial charts, calculate gross net margins, and analyze technician KPIs.</p>
        </div>
      </div>

      {/* High level KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gross Business Billing</CardDescription>
            <div className="text-emerald-500"><HugeiconsIcon icon={ChartUpIcon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black tabular-nums">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Total customer billings logged completed</span>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Overhead Expenses</CardDescription>
            <div className="text-rose-500"><HugeiconsIcon icon={CreditCardIcon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black tabular-nums">₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Total category vouchers and advertising spends</span>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gross Company Margin</CardDescription>
            <div className="text-blue-500"><HugeiconsIcon icon={ChartUpIcon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black tabular-nums">₹{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Net company gain (excluding technician splits)</span>
          </CardContent>
        </Card>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Graph 1: Financial margins area chart */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Overhead Costs & Margins Ratio</CardTitle>
            <CardDescription className="text-xs">Reconciling monthly overhead, operational expenses, and net profit margins.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBilling" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis dataKey="month" fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis fontSize={10} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" name="Customer Billings" dataKey="Billing" stroke="var(--primary)" fillOpacity={1} fill="url(#colorBilling)" strokeWidth={2} />
                <Area type="monotone" name="Net Margin Profit" dataKey="Profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graph 2: Technician performance bar chart */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Technician Earnings Performance</CardTitle>
            <CardDescription className="text-xs">Comparing gross jobs completed, total commissions, and payouts generated.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={techPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis fontSize={10} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar name="Jobs Completed" dataKey="Jobs" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar name="Earnings (₹)" dataKey="Earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graph 3: Spares inventory bar chart */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Spares Stock Status Ledger</CardTitle>
            <CardDescription className="text-xs">Comparing catalog available counts vs critical reorder thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={sparesStockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis fontSize={10} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar name="Stock Available" dataKey="Available" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="Reorder Limit" dataKey="Limit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
