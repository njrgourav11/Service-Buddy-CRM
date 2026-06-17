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
  Alert02Icon
} from "@hugeicons/core-free-icons"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, LineChart, Line,
  PieChart, Pie, Cell
} from "recharts"

export function ReportsModule() {
  const { bookings, expenses, technicians, spares, customers } = useCRM()

  // ==========================================
  // Interactive Filters State
  // ==========================================
  const [applianceFilter, setApplianceFilter] = React.useState("ALL")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [yearFilter, setYearFilter] = React.useState("ALL")

  // ==========================================
  // Filter Options Extraction
  // ==========================================
  const uniqueAppliances = React.useMemo(() => {
    return Array.from(new Set(bookings.map(b => b.appliance).filter(Boolean))).sort()
  }, [bookings])

  const uniqueYears = React.useMemo(() => {
    const years = bookings
      .map(b => b.date ? new Date(b.date).getFullYear() : null)
      .filter((y): y is number => y !== null)
    return Array.from(new Set(years)).sort((a, b) => b - a)
  }, [bookings])

  // ==========================================
  // Filter Logic
  // ==========================================
  const filteredBookings = React.useMemo(() => {
    return bookings.filter(b => {
      const matchesAppliance = applianceFilter === "ALL" || b.appliance === applianceFilter
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter
      
      let matchesYear = true
      if (yearFilter !== "ALL" && b.date) {
        matchesYear = new Date(b.date).getFullYear().toString() === yearFilter
      }
      
      return matchesAppliance && matchesStatus && matchesYear
    })
  }, [bookings, applianceFilter, statusFilter, yearFilter])

  // ==========================================
  // KPI Calculations
  // ==========================================
  const totalRevenue = filteredBookings
    .filter(b => b.status === "Completed")
    .reduce((sum, b) => sum + (b.totalConsumerAmount || 0), 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const totalTechLiability = filteredBookings
    .filter(b => b.status === "Completed")
    .reduce((sum, b) => sum + (b.totalTechnicianAmount || 0), 0)

  const netProfit = Math.round((totalRevenue - totalExpenses - totalTechLiability) * 100) / 100

  // ==========================================
  // Day-wise & Month-wise Analytics & KPIs
  // ==========================================
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const dayWiseData = React.useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat
    filteredBookings.forEach(b => {
      if (b.date) {
        const day = new Date(b.date).getDay()
        counts[day]++
      }
    })
    return daysOfWeek.map((day, idx) => ({
      day: day.substring(0, 3),
      Bookings: counts[idx]
    }))
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
  // Review Stats Calculations
  // ==========================================
  const totalCustomers = customers.length
  const positiveReviews = customers.filter(c => c.reviewStatus === "Positive").length
  const negativeReviews = customers.filter(c => c.reviewStatus === "Negative").length
  const callNotReceived = customers.filter(c => c.reviewStatus === "Call didn't receive").length
  const reviewNotDone = customers.filter(c => !c.reviewStatus || c.reviewStatus === "Review not done").length

  const totalReviewsDone = positiveReviews + negativeReviews + callNotReceived
  const satisfactionRate = totalReviewsDone > 0 ? Math.round((positiveReviews / totalReviewsDone) * 100) : 0

  const reviewDistributionData = [
    { name: "Positive", value: positiveReviews, color: "#10b981" },
    { name: "Negative", value: negativeReviews, color: "#f43f5e" },
    { name: "Call didn't receive", value: callNotReceived, color: "#f97316" },
    { name: "Review not done", value: reviewNotDone, color: "#3b82f6" },
  ].filter(d => d.value > 0)

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
    const techBookings = filteredBookings.filter(b => b.assignedTechnicianId === t.id && b.status === "Completed")
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

      {/* Interactive Select Filters */}
      <Card className="border-border/60 bg-muted/20/45 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interactive Report Filters</div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Appliance Filter */}
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Appliance:</Label>
              <Select value={applianceFilter} onValueChange={setApplianceFilter}>
                <SelectTrigger className="w-full md:w-40 h-8 text-xs bg-background">
                  <SelectValue placeholder="All Appliances" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Appliances</SelectItem>
                  {uniqueAppliances.map(app => (
                    <SelectItem key={app} value={app}>{app === "TL-WM (Top Load Washing Machine)" ? "TL-WM" : app}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Year Filter */}
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Year:</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-40 h-8 text-xs bg-background">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Years</SelectItem>
                  {uniqueYears.map(yr => (
                    <SelectItem key={yr} value={yr.toString()}>{yr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High level KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border/60">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gross Billing</CardDescription>
            <div className="text-emerald-500"><HugeiconsIcon icon={ChartUpIcon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-black tabular-nums">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Total customer billings completed</span>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Expenses</CardDescription>
            <div className="text-rose-500"><HugeiconsIcon icon={CreditCardIcon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-black tabular-nums">₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Total advertisement & operational spends</span>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-0 space-y-0 pb-1">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Margin</CardDescription>
            <div className="text-blue-500"><HugeiconsIcon icon={ChartUpIcon} strokeWidth={2.5} className="size-4" /></div>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-black tabular-nums">₹{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Net company gain (excluding tech payout)</span>
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
                <Bar name="Bookings Count" dataKey="Bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
                <span className="tabular-nums">{totalReviewsDone} / {totalCustomers} CUSTOMERS</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${totalCustomers > 0 ? (totalReviewsDone / totalCustomers) * 100 : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
