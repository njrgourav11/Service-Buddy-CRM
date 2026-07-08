"use client"

import * as React from "react"
import { useCRM } from "@/context/crm-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  ChartUpIcon,
  CreditCardIcon,
  Menu01Icon,
  Analytics01Icon,
  Alert02Icon,
  FilterIcon
} from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, LineChart, Line,
  PieChart, Pie, Cell
} from "recharts"

export function ReportsModule() {
  const { bookings, expenses, technicians, spares, customers, payouts } = useCRM()

  // ==========================================
  // Interactive Filters State
  // ==========================================
  const [applianceFilters, setApplianceFilters] = React.useState<string[]>([])
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [dateFilter, setDateFilter] = React.useState<"ALL" | "THIS_WEEK" | "THIS_MONTH" | "PREVIOUS_MONTH" | "CUSTOM">("THIS_MONTH")
  const [customStartDate, setCustomStartDate] = React.useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split("T")[0]
  })
  const [customEndDate, setCustomEndDate] = React.useState<string>(() => {
    return new Date().toISOString().split("T")[0]
  })
  // ==========================================
  // Filter Options Extraction
  // ==========================================
  const uniqueAppliances = React.useMemo(() => {
    return Array.from(new Set(bookings.map(b => b.appliance).filter(Boolean))).sort()
  }, [bookings])

  // ==========================================
  // Filter Logic
  // ==========================================
  const filteredBookings = React.useMemo(() => {
    return bookings.filter(b => {
      const matchesAppliance = applianceFilters.length === 0 || applianceFilters.includes(b.appliance)
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter
      
      let matchesDate = true
      const targetDateStr = b.workCompletedDate || b.date
      if (dateFilter !== "ALL" && targetDateStr) {
        const bDate = new Date(targetDateStr)
        const now = new Date()
        
        if (dateFilter === "THIS_WEEK") {
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
          startOfWeek.setHours(0, 0, 0, 0)
          matchesDate = bDate >= startOfWeek
        } else if (dateFilter === "THIS_MONTH") {
          matchesDate = bDate.getMonth() === new Date().getMonth() && bDate.getFullYear() === new Date().getFullYear()
        } else if (dateFilter === "PREVIOUS_MONTH") {
          const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          matchesDate = bDate.getMonth() === prevMonth.getMonth() && bDate.getFullYear() === prevMonth.getFullYear()
        } else if (dateFilter === "CUSTOM") {
          const s = new Date(customStartDate)
          const e = new Date(customEndDate)
          s.setHours(0, 0, 0, 0)
          e.setHours(23, 59, 59, 999)
          matchesDate = bDate >= s && bDate <= e
        }
      }
      
      return matchesAppliance && matchesStatus && matchesDate
    })
  }, [bookings, applianceFilters, statusFilter, dateFilter, customStartDate, customEndDate])

  // ==========================================
  // KPI Calculations
  // ==========================================
  const totalRevenue = filteredBookings
    .reduce((sum, b) => sum + (b.totalConsumerAmount || 0), 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const totalTechLiability = filteredBookings
    .reduce((sum, b) => sum + (b.totalTechnicianAmount || 0), 0)

  const netProfit = Math.round((totalRevenue - totalExpenses - totalTechLiability) * 100) / 100

  // ==========================================
  // Day-wise & Month-wise Analytics & KPIs
  // ==========================================
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const dayWiseData = React.useMemo(() => {
    const data = daysOfWeek.map((day, idx) => ({
      day: day.substring(0, 3),
      "Booking Done": 0,
      "Cancelled": 0,
      "Work Done": 0,
      "Inspected": 0,
    }))
    filteredBookings.forEach(b => {
      if (b.date) {
        const day = new Date(b.date).getDay()
        data[day]["Booking Done"]++
        if (b.status === "Cancelled") {
          data[day]["Cancelled"]++
        } else if (b.status === "Completed") {
          data[day]["Work Done"]++
        } else if (b.status === "Inspected") {
          data[day]["Inspected"]++
        }
      }
    })
    return data
  }, [filteredBookings])

  const mostActiveDay = React.useMemo(() => {
    if (filteredBookings.length === 0) return "N/A"
    const counts = [0, 0, 0, 0, 0, 0, 0]
    filteredBookings.forEach(b => {
      if (b.date) {
        counts[new Date(b.date).getDay()]++
      }
    })
    let maxIdx = 0
    let maxVal = -1
    counts.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val
        maxIdx = idx
      }
    })
    return maxVal > 0 ? daysOfWeek[maxIdx] : "N/A"
  }, [filteredBookings])

  const monthWiseData = React.useMemo(() => {
    const counts = Array(12).fill(0)
    filteredBookings.forEach(b => {
      if (b.date) {
        const month = new Date(b.date).getMonth()
        counts[month]++
      }
    })
    return months.map((month, idx) => ({
      month,
      Bookings: counts[idx]
    }))
  }, [filteredBookings])

  const mostActiveMonth = React.useMemo(() => {
    if (filteredBookings.length === 0) return "N/A"
    const counts = Array(12).fill(0)
    filteredBookings.forEach(b => {
      if (b.date) {
        counts[new Date(b.date).getMonth()]++
      }
    })
    let maxIdx = 0
    let maxVal = -1
    counts.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val
        maxIdx = idx
      }
    })
    return maxVal > 0 ? months[maxIdx] : "N/A"
  }, [filteredBookings])

  // ==========================================
  // Review Stats Calculations (Filtered Dynamically)
  // ==========================================
  // Satisfaction rate only on Completed and Inspected bookings
  const relevantBookingsForSatisfaction = React.useMemo(() => {
    return filteredBookings.filter(b => b.status === "Completed" || b.status === "Inspected")
  }, [filteredBookings])

  const positiveReviews = React.useMemo(() => relevantBookingsForSatisfaction.filter(b => b.reviewStatus === "Positive").length, [relevantBookingsForSatisfaction])
  const negativeReviews = React.useMemo(() => relevantBookingsForSatisfaction.filter(b => b.reviewStatus === "Negative").length, [relevantBookingsForSatisfaction])
  const callNotReceived = React.useMemo(() => relevantBookingsForSatisfaction.filter(b => b.reviewStatus === "Call didn't receive").length, [relevantBookingsForSatisfaction])
  const cancelOrderReviews = React.useMemo(() => relevantBookingsForSatisfaction.filter(b => b.reviewStatus === "Cancel Order").length, [relevantBookingsForSatisfaction])
  const reviewNotDone = React.useMemo(() => relevantBookingsForSatisfaction.filter(b => !b.reviewStatus || b.reviewStatus === "Review not done").length, [relevantBookingsForSatisfaction])

  const totalReviewsDone = React.useMemo(() => positiveReviews + negativeReviews + callNotReceived + cancelOrderReviews, [positiveReviews, negativeReviews, callNotReceived, cancelOrderReviews])
  const satisfactionRate = React.useMemo(() => totalReviewsDone > 0 ? Math.round((positiveReviews / totalReviewsDone) * 100) : 0, [positiveReviews, totalReviewsDone])
  const totalCustomersCount = relevantBookingsForSatisfaction.length

  const reviewDistributionData = React.useMemo(() => {
    return [
      { name: "Positive", value: positiveReviews, color: "#10b981" },
      { name: "Negative", value: negativeReviews, color: "#f43f5e" },
      { name: "Call didn't receive", value: callNotReceived, color: "#f97316" },
      { name: "Cancel Order", value: cancelOrderReviews, color: "#e11d48" },
      { name: "Review not done", value: reviewNotDone, color: "#3b82f6" },
    ].filter(d => d.value > 0)
  }, [positiveReviews, negativeReviews, callNotReceived, cancelOrderReviews, reviewNotDone])

  // ==========================================
  // Graph 1: Job Status Distribution
  // ==========================================
  const statusDistributionData = React.useMemo(() => {
    const counts: Record<string, number> = {
      "Not Started": 0,
      "In Progress": 0,
      "Inspected": 0,
      "Completed": 0,
      "Cancelled": 0,
    }
    filteredBookings.forEach(b => {
      if (b.status && counts[b.status] !== undefined) {
        counts[b.status]++
      }
    })
    return [
      { name: "Not Started", value: counts["Not Started"], color: "#94a3b8" },
      { name: "In Progress", value: counts["In Progress"], color: "#3b82f6" },
      { name: "Inspected", value: counts["Inspected"], color: "#eab308" },
      { name: "Completed", value: counts["Completed"], color: "#10b981" },
      { name: "Cancelled", value: counts["Cancelled"], color: "#ef4444" },
    ].filter(item => item.value > 0)
  }, [filteredBookings])

  // ==========================================
  // Graph 2: Technician Performance Rankings
  // ==========================================
  const techPerformanceData = React.useMemo(() => {
    return technicians.map(t => {
      const techBookings = filteredBookings.filter(b => {
        if (!b.assignedTechnicianId) return false
        const ids = b.assignedTechnicianId.split(",").map(id => id.trim())
        return ids.includes(t.id) && b.status === "Completed"
      })
      const jobsCount = techBookings.length
      
      const commission = techBookings.reduce((sum, b) => {
        const ids = b.assignedTechnicianId ? b.assignedTechnicianId.split(",").map(id => id.trim()) : []
        const share = ids.length > 0 ? (b.technicianCommission || 0) / ids.length : 0
        return sum + share
      }, 0)
      
      // Match the technician payouts from the payouts ledger
      const techPayouts = payouts.filter(p => {
        if (p.technicianId !== t.id) return false
        
        let matchesDate = true
        let targetDateStr = p.date
        if (p.bookingId) {
          const linkedBooking = bookings.find(b => b.id === p.bookingId)
          if (linkedBooking) {
            targetDateStr = linkedBooking.workCompletedDate || linkedBooking.date || p.date
          }
        }
        if (dateFilter !== "ALL" && targetDateStr) {
          const pDate = new Date(targetDateStr)
          const now = new Date()
          
          if (dateFilter === "THIS_WEEK") {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
            startOfWeek.setHours(0, 0, 0, 0)
            matchesDate = pDate >= startOfWeek
          } else if (dateFilter === "THIS_MONTH") {
            matchesDate = pDate.getMonth() === new Date().getMonth() && pDate.getFullYear() === new Date().getFullYear()
          } else if (dateFilter === "PREVIOUS_MONTH") {
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            matchesDate = pDate.getMonth() === prevMonth.getMonth() && pDate.getFullYear() === prevMonth.getFullYear()
          } else if (dateFilter === "CUSTOM") {
            const s = new Date(customStartDate)
            const e = new Date(customEndDate)
            s.setHours(0, 0, 0, 0)
            e.setHours(23, 59, 59, 999)
            matchesDate = pDate >= s && pDate <= e
          }
        }
        return matchesDate
      })
      const earnings = techPayouts.reduce((sum, p) => sum + (p.dailyEarnings || 0), 0)

      return {
        name: t.name,
        Jobs: jobsCount,
        Commission: Math.round(commission),
        Earnings: Math.round(earnings)
      }
    })
  }, [technicians, filteredBookings, payouts, dateFilter, customStartDate, customEndDate])

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

      {/* Interactive Select Filters */}
      <Card className="border-border/60 bg-muted/20/45 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interactive Report Filters</div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Appliance:</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-48 h-8 justify-start text-left text-xs bg-background">
                    <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="mr-2 size-3.5 opacity-50 shrink-0" />
                    <span className="truncate">
                      {applianceFilters.length === 0 
                        ? "All Appliances" 
                        : applianceFilters.length === 1 
                          ? applianceFilters[0] 
                          : `${applianceFilters.length} Selected`}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-background border-border/60 shadow-lg">
                  <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                    Filter by Appliance
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuCheckboxItem
                    checked={applianceFilters.length === 0}
                    onCheckedChange={() => setApplianceFilters([])}
                    onSelect={(e) => e.preventDefault()}
                    className="text-xs cursor-pointer focus:bg-muted"
                  >
                    <span className="font-semibold text-foreground">All Appliances</span>
                  </DropdownMenuCheckboxItem>
                  {uniqueAppliances.map((app) => (
                    <DropdownMenuCheckboxItem
                      key={app}
                      checked={applianceFilters.includes(app)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setApplianceFilters(prev => [...prev, app])
                        } else {
                          setApplianceFilters(prev => prev.filter(a => a !== app))
                        }
                      }}
                      onSelect={(e) => e.preventDefault()}
                      className="text-xs cursor-pointer focus:bg-muted text-foreground"
                    >
                      {app === "TL-WM (Top Load Washing Machine)" ? "TL-WM" : app}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 h-8 text-xs bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Inspected">Inspected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range:</Label>
              <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
                <SelectTrigger className="w-full md:w-40 h-8 text-xs bg-background">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Time</SelectItem>
                  <SelectItem value="THIS_WEEK">This Week</SelectItem>
                  <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  <SelectItem value="PREVIOUS_MONTH">Previous Month</SelectItem>
                  <SelectItem value="CUSTOM">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Inputs (only show if CUSTOM selected) */}
            {dateFilter === "CUSTOM" && (
              <div className="flex items-center gap-2 flex-1 md:flex-none">
                <Input 
                  type="date" 
                  value={customStartDate} 
                  onChange={(e) => setCustomStartDate(e.target.value)} 
                  className="h-8 text-xs w-32 bg-background tabular-nums"
                />
                <span className="text-xs text-muted-foreground font-medium">to</span>
                <Input 
                  type="date" 
                  value={customEndDate} 
                  onChange={(e) => setCustomEndDate(e.target.value)} 
                  className="h-8 text-xs w-32 bg-background tabular-nums"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* High level KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gross Billing</CardDescription>
            <div className="text-emerald-500"><HugeiconsIcon icon={ChartUpIcon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-black tabular-nums">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Total volume of customer billings</span>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Most Active Day</CardDescription>
            <div className="text-purple-500"><HugeiconsIcon icon={Analytics01Icon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 capitalize">{mostActiveDay}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Day of week with most bookings</span>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Most Active Month</CardDescription>
            <div className="text-amber-500"><HugeiconsIcon icon={ChartUpIcon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{mostActiveMonth}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Month with highest booking volume</span>
          </CardContent>
        </Card>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Graph 1: Job Status Distribution chart */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Job Status Distribution</CardTitle>
            <CardDescription className="text-xs">Breakdown of bookings across operational statuses in selected range.</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-between">
            <div className="flex-1 flex items-center justify-between gap-4">
              <div className="w-1/2 h-full min-h-[160px] relative flex items-center justify-center">
                {statusDistributionData.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground">No bookings in selected range</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {statusDistributionData.length > 0 && (
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-foreground tabular-nums">{filteredBookings.length}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Total Jobs</span>
                  </div>
                )}
              </div>

              <div className="w-1/2 flex flex-col gap-2 p-2 bg-muted/10 rounded-lg border border-border/20">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground border-b border-border/40 pb-1 px-1">
                  <span>STATUS</span>
                  <span>COUNT</span>
                </div>
                <div className="flex flex-col gap-1.5 px-1">
                  {[
                    { name: "Not Started", color: "bg-slate-400", value: filteredBookings.filter(b => b.status === "Not Started").length },
                    { name: "In Progress", color: "bg-blue-500", value: filteredBookings.filter(b => b.status === "In Progress").length },
                    { name: "Inspected", color: "bg-yellow-500", value: filteredBookings.filter(b => b.status === "Inspected").length },
                    { name: "Completed", color: "bg-emerald-500", value: filteredBookings.filter(b => b.status === "Completed").length },
                    { name: "Cancelled", color: "bg-red-500", value: filteredBookings.filter(b => b.status === "Cancelled").length },
                  ].map(item => (
                    <div key={item.name} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                        <span className="font-semibold text-foreground">{item.name}</span>
                      </div>
                      <span className="font-bold tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

        {/* Graph 5: Month-wise Booking Volume */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Month-wise Booking Volume</CardTitle>
            <CardDescription className="text-xs">Distribution of service requests across the calendar months.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={monthWiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis dataKey="month" fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis fontSize={10} stroke="var(--muted-foreground)" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar name="Bookings Count" dataKey="Bookings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graph 6: Day-of-Week Booking Volume */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Day-of-Week Booking Volume</CardTitle>
            <CardDescription className="text-xs">Analyzing daily service demand to optimize technician scheduling.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={dayWiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis dataKey="day" fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis fontSize={10} stroke="var(--muted-foreground)" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar name="Booking Done" dataKey="Booking Done" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="Cancelled" dataKey="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar name="Work Done" dataKey="Work Done" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Inspected" dataKey="Inspected" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graph 3: Spares inventory bar chart */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Spares Stock Status Ledger</CardTitle>
            <CardDescription className="text-xs">Comparing catalog available counts vs critical reorder thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
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

        {/* Graph 4: Customer Satisfaction & Reviews donut chart */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Customer Satisfaction & Reviews</CardTitle>
            <CardDescription className="text-xs">Analysis of customer satisfaction rates and feedback responses.</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-between">
            <div className="flex-1 flex items-center justify-between gap-4">
              {/* Donut Chart */}
              <div className="w-1/2 h-full min-h-[160px] relative flex items-center justify-center">
                {reviewDistributionData.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground">No review data logged</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reviewDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {reviewDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {reviewDistributionData.length > 0 && (
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{satisfactionRate}%</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Satisfaction</span>
                  </div>
                )}
              </div>

              {/* Stats Breakdown List */}
              <div className="w-1/2 flex flex-col gap-2 p-2 bg-muted/10 rounded-lg border border-border/20">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground border-b border-border/40 pb-1 px-1">
                  <span>STATUS</span>
                  <span>COUNT</span>
                </div>
                <div className="flex flex-col gap-1.5 px-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold text-foreground">Positive</span>
                    </div>
                    <span className="font-bold tabular-nums">{positiveReviews}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="font-semibold text-foreground">Negative</span>
                    </div>
                    <span className="font-bold tabular-nums">{negativeReviews}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="font-semibold text-foreground">Unreachable</span>
                    </div>
                    <span className="font-bold tabular-nums">{callNotReceived}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-700 shrink-0" />
                      <span className="font-semibold text-rose-700 dark:text-rose-400 font-bold">Cancel Order</span>
                    </div>
                    <span className="font-bold tabular-nums">{cancelOrderReviews}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="font-semibold text-foreground">Pending</span>
                    </div>
                    <span className="font-bold tabular-nums">{reviewNotDone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-2 flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                <span>FEEDBACK COMPLIANCE</span>
                <span className="tabular-nums">{totalReviewsDone} / {totalCustomersCount} CUSTOMERS</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${totalCustomersCount > 0 ? (totalReviewsDone / totalCustomersCount) * 100 : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
