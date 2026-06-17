"use client"

import * as React from "react"
import { useCRM, Payout } from "@/context/crm-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PlusSignCircleIcon, 
  SearchIcon, 
  LicenseIcon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  CreditCardIcon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function PayoutModule() {
  const { payouts, technicians, bookings, customers, addPayout, updatePayout, deletePayout, currentRole } = useCRM()
  const [search, setSearch] = React.useState("")
  const [techFilter, setTechFilter] = React.useState("ALL")
  const [activeSubTab, setActiveSubTab] = React.useState<"payouts" | "dailyEarnings">("payouts")
  const [monthFilter, setMonthFilter] = React.useState("ALL")

  const formatYearMonth = (ym: string) => {
    const [year, month] = ym.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
  }

  // Sorting State
  const [ledgerSortCol, setLedgerSortCol] = React.useState<"date" | "earnings" | "paid" | "tech" | "id">("date")
  const [ledgerSortDir, setLedgerSortDir] = React.useState<"asc" | "desc">("desc")
  const [earningsSortCol, setEarningsSortCol] = React.useState<string>("tech")
  const [earningsSortDir, setEarningsSortDir] = React.useState<"asc" | "desc">("asc")

  const availableMonths = React.useMemo(() => {
    const monthsSet = new Set<string>()
    payouts.forEach(p => {
      if (!p.dailyEarnings) return
      const dateKey = p.date
      if (dateKey && dateKey.length >= 7) {
        monthsSet.add(dateKey.slice(0, 7)) // YYYY-MM
      }
    })
    return Array.from(monthsSet).sort().reverse()
  }, [payouts])

  const pivotData = React.useMemo(() => {
    const visibleTechs = technicians.filter(t => {
      const matchesFilter = techFilter === "ALL" || t.id === techFilter
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })

    const datesSet = new Set<string>()
    
    payouts.forEach(p => {
      if (!p.dailyEarnings || !p.technicianId) return
      
      const dateKey = p.date
      if (!dateKey) return
      
      if (monthFilter !== "ALL" && !dateKey.startsWith(monthFilter)) return
      
      const isTechVisible = visibleTechs.some(t => t.id === p.technicianId)
      if (!isTechVisible) return

      datesSet.add(dateKey)
    })

    const sortedDates = Array.from(datesSet).sort().reverse() // Newest dates first (on the left)

    const rows = visibleTechs.map(tech => {
      const earningsByDate: { [date: string]: number } = {}
      let techTotal = 0

      payouts.forEach(p => {
        if (p.technicianId !== tech.id || !p.dailyEarnings || !p.date) return
        if (monthFilter !== "ALL" && !p.date.startsWith(monthFilter)) return
        
        earningsByDate[p.date] = (earningsByDate[p.date] || 0) + p.dailyEarnings
        techTotal += p.dailyEarnings
      })

      return {
        techId: tech.id,
        techName: tech.name,
        earnings: earningsByDate,
        total: techTotal
      }
    })

    return {
      dates: sortedDates,
      rows
    }
  }, [payouts, technicians, techFilter, monthFilter, search])

  const sortedPivotRows = React.useMemo(() => {
    return [...pivotData.rows].sort((a, b) => {
      let comparison = 0
      if (earningsSortCol === "tech") {
        comparison = a.techName.localeCompare(b.techName)
      } else if (earningsSortCol === "total") {
        comparison = a.total - b.total
      } else {
        const earningsA = a.earnings[earningsSortCol] || 0
        const earningsB = b.earnings[earningsSortCol] || 0
        comparison = earningsA - earningsB
      }
      return earningsSortDir === "asc" ? comparison : -comparison
    })
  }, [pivotData.rows, earningsSortCol, earningsSortDir])

  const renderSortableHeader = (
    label: string, 
    col: any, 
    currentCol: any, 
    currentDir: "asc" | "desc", 
    setCol: (c: any) => void, 
    setDir: (d: any) => void
  ) => {
    const isActive = col === currentCol
    return (
      <th 
        onClick={() => {
          if (isActive) {
            setDir(currentDir === "asc" ? "desc" : "asc")
          } else {
            setCol(col)
            setDir("desc")
          }
        }}
        className="px-4 py-3 cursor-pointer hover:bg-muted/50 select-none group transition-colors border-r border-border/10 last:border-r-0"
      >
        <div className="flex items-center gap-1.5 justify-between">
          <span>{label}</span>
          <span className={`text-[10px] text-muted-foreground transition-opacity ${isActive ? "opacity-100 font-bold" : "opacity-0 group-hover:opacity-40"}`}>
            {isActive ? (currentDir === "asc" ? "▲" : "▼") : "▼"}
          </span>
        </div>
      </th>
    )
  }
  const [isPayOpen, setIsPayOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedPayout, setSelectedPayout] = React.useState<Payout | null>(null)

  // Form State
  const [formTechId, setFormTechId] = React.useState("")
  const [formBookingId, setFormBookingId] = React.useState("None")
  const [formCustomerName, setFormCustomerName] = React.useState("")
  const [formCinNumber, setFormCinNumber] = React.useState("")
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split("T")[0])
  const [formDailyEarnings, setFormDailyEarnings] = React.useState(0)
  const [formTotalPayout, setFormTotalPayout] = React.useState(0)
  const [formAdvance, setFormAdvance] = React.useState(0)
  const [formExtra, setFormExtra] = React.useState(0)
  const [formStatus, setFormStatus] = React.useState<any>("Paid")

  // Edit Form State
  const [editTechId, setEditTechId] = React.useState("")
  const [editBookingId, setEditBookingId] = React.useState("None")
  const [editCustomerName, setEditCustomerName] = React.useState("")
  const [editCinNumber, setEditCinNumber] = React.useState("")
  const [editDate, setEditDate] = React.useState("")
  const [editDailyEarnings, setEditDailyEarnings] = React.useState(0)
  const [editTotalPayout, setEditTotalPayout] = React.useState(0)
  const [editAdvance, setEditAdvance] = React.useState(0)
  const [editExtra, setEditExtra] = React.useState(0)
  const [editStatus, setEditStatus] = React.useState<any>("Paid")

  // Auto-fill total payout if a technician is selected
  React.useEffect(() => {
    if (formTechId) {
      const match = technicians.find(t => t.id === formTechId)
      if (match) {
        setFormDailyEarnings(0)
        setFormTotalPayout(match.dueAmount)
        setFormBookingId("None")
        setFormCustomerName("")
        setFormCinNumber("")
      }
    }
  }, [formTechId, technicians])

  const availableBookingsForLink = React.useMemo(() => {
    if (!formTechId) return []
    return bookings.filter(b => 
      b.assignedTechnicianId && 
      b.assignedTechnicianId.split(",").map(s => s.trim()).includes(formTechId)
    )
  }, [bookings, formTechId])

  const editAvailableBookingsForLink = React.useMemo(() => {
    if (!editTechId) return []
    return bookings.filter(b => 
      b.assignedTechnicianId && 
      b.assignedTechnicianId.split(",").map(s => s.trim()).includes(editTechId)
    )
  }, [bookings, editTechId])

  const handleBookingLink = (bookingId: string) => {
    setFormBookingId(bookingId)
    if (bookingId === "None") {
      setFormCustomerName("")
      setFormCinNumber("")
      setFormDailyEarnings(0)
      if (formTechId) {
        const match = technicians.find(t => t.id === formTechId)
        if (match) {
          setFormTotalPayout(match.dueAmount)
        }
      }
      return
    }

    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      const cust = customers.find(c => c.id === booking.customerId)
      setFormCustomerName(cust?.name || "")
      setFormCinNumber(cust?.id || "")
      
      const techEarnings = booking.totalTechnicianAmount || 0
      setFormDailyEarnings(techEarnings)
      
      if (booking.workCompletedDate) {
        setFormDate(booking.workCompletedDate)
      } else if (booking.date) {
        setFormDate(booking.date)
      }

      if (formTechId) {
        const match = technicians.find(t => t.id === formTechId)
        if (match) {
          setFormTotalPayout(match.dueAmount + techEarnings)
        }
      }
    }
  }

  const handleEditBookingLink = (bookingId: string) => {
    setEditBookingId(bookingId)
    if (bookingId === "None") {
      setEditCustomerName("")
      setEditCinNumber("")
      setEditDailyEarnings(0)
      return
    }

    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      const cust = customers.find(c => c.id === booking.customerId)
      setEditCustomerName(cust?.name || "")
      setEditCinNumber(cust?.id || "")
      setEditDailyEarnings(booking.totalTechnicianAmount || 0)
      
      if (booking.workCompletedDate) {
        setEditDate(booking.workCompletedDate)
      } else if (booking.date) {
        setEditDate(booking.date)
      }
    }
  }

  // Dashboard calculations
  const totalMonthlyPayout = payouts
    .filter(p => p.paymentStatus === "Paid")
    .reduce((sum, p) => sum + p.totalPayout, 0)

  const totalPendingPayout = technicians.reduce((sum, t) => sum + t.dueAmount, 0)
  const totalAdvanceBalance = technicians.reduce((sum, t) => sum + t.advanceTaken, 0)

  // Filtered ledger list
  const filteredPayouts = payouts.filter(p => {
    const tech = technicians.find(t => t.id === p.technicianId)
    const searchString = `${p.id} ${tech?.name || ""}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    const matchesTech = techFilter === "ALL" || p.technicianId === techFilter

    return matchesSearch && matchesTech
  })

  const sortedPayouts = React.useMemo(() => {
    return [...filteredPayouts].sort((a, b) => {
      let comparison = 0
      if (ledgerSortCol === "date") {
        comparison = a.date.localeCompare(b.date)
      } else if (ledgerSortCol === "earnings") {
        comparison = (a.dailyEarnings || 0) - (b.dailyEarnings || 0)
      } else if (ledgerSortCol === "paid") {
        comparison = (a.totalPayout || 0) - (b.totalPayout || 0)
      } else if (ledgerSortCol === "tech") {
        const nameA = technicians.find(t => t.id === a.technicianId)?.name || ""
        const nameB = technicians.find(t => t.id === b.technicianId)?.name || ""
        comparison = nameA.localeCompare(nameB)
      } else if (ledgerSortCol === "id") {
        const numA = parseInt(a.id.split("-")[1]) || 0
        const numB = parseInt(b.id.split("-")[1]) || 0
        comparison = numA - numB
      }
      return ledgerSortDir === "asc" ? comparison : -comparison
    })
  }, [filteredPayouts, ledgerSortCol, ledgerSortDir, technicians])

  // Submit Payout
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTechId) {
      toast.error("Please select a technician.")
      return
    }

    addPayout({
      technicianId: formTechId,
      date: formDate,
      dailyEarnings: formDailyEarnings,
      totalPayout: formTotalPayout,
      advance: formAdvance,
      extra: formExtra,
      paymentStatus: formStatus,
      customerName: formCustomerName || undefined,
      cinNumber: formCinNumber || undefined,
      bookingId: formBookingId !== "None" ? formBookingId : undefined
    })

    // Reset Form
    setFormTechId("")
    setFormBookingId("None")
    setFormCustomerName("")
    setFormCinNumber("")
    setFormDailyEarnings(0)
    setFormTotalPayout(0)
    setFormAdvance(0)
    setFormExtra(0)
    setFormStatus("Paid")
    setIsPayOpen(false)
  }

  // Action: update status
  const handleToggleStatus = (id: string, current: string) => {
    updatePayout(id, { paymentStatus: current === "Paid" ? "Pending" : "Paid" })
    toast.success("Payout status modified.")
  }

  // Action: Open Edit Drawer
  const handleOpenEdit = (p: Payout) => {
    setSelectedPayout(p)
    setEditTechId(p.technicianId)
    setEditBookingId(p.bookingId || "None")
    setEditCustomerName(p.customerName || "")
    setEditCinNumber(p.cinNumber || "")
    setEditDate(p.date)
    setEditDailyEarnings(p.dailyEarnings)
    setEditTotalPayout(p.totalPayout)
    setEditAdvance(p.advance)
    setEditExtra(p.extra)
    setEditStatus(p.paymentStatus)
    setIsEditOpen(true)
  }

  // Submit Edit Form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayout) return

    updatePayout(selectedPayout.id, {
      technicianId: editTechId,
      date: editDate,
      dailyEarnings: editDailyEarnings,
      totalPayout: editTotalPayout,
      advance: editAdvance,
      extra: editExtra,
      paymentStatus: editStatus,
      customerName: editCustomerName || undefined,
      cinNumber: editCinNumber || undefined,
      bookingId: editBookingId !== "None" ? editBookingId : undefined
    })

    setIsEditOpen(false)
  }

  const handleDeletePayout = (id: string) => {
    if (window.confirm("Are you sure you want to delete this payout log? This will also revert technician dues and advance balance calculations.")) {
      deletePayout(id)
    }
  }

  const selectedTechForForm = technicians.find(t => t.id === formTechId)
  const currentTechDue = selectedTechForForm ? selectedTechForForm.dueAmount : 0

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Technician Payout Ledger</h2>
          <p className="text-sm text-muted-foreground">Manage salary payouts, process advances, and reconcile dispatch technician accounts.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/40 w-fit shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveSubTab("payouts")}
              className={`text-xs font-bold px-4 py-1.5 h-8 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === "payouts" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className="size-3.5" />
              Settlement Ledger
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveSubTab("dailyEarnings")}
              className={`text-xs font-bold px-4 py-1.5 h-8 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === "dailyEarnings" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={LicenseIcon} strokeWidth={2} className="size-3.5" />
              Daily Earnings View
            </Button>
          </div>
          {(currentRole === "Admin" || currentRole === "Manager") && activeSubTab === "payouts" && (
            <Button onClick={() => setIsPayOpen(true)} className="w-fit">
              <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
              Record Payout / Settlement
            </Button>
          )}
        </div>
      </div>

      {/* Payout Dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Payout */}
        <Card className="border-border/60">
          <CardHeader className="py-3">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Monthly Settled Payouts</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <CardTitle className="text-2xl font-bold tracking-tight tabular-nums">₹{totalMonthlyPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</CardTitle>
          </CardContent>
        </Card>

        {/* Pending Dues */}
        <Card className="border-border/60">
          <CardHeader className="py-3">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Pending Dues</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">₹{totalPendingPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</CardTitle>
          </CardContent>
        </Card>

        {/* Advance Balance */}
        <Card className="border-border/60">
          <CardHeader className="py-3">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Running Advance Balance</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-rose-600 dark:text-rose-400">₹{totalAdvanceBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</CardTitle>
          </CardContent>
        </Card>

        {/* Staff Size */}
        <Card className="border-border/60">
          <CardHeader className="py-3">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Active Tech Staff Size</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <CardTitle className="text-2xl font-bold tracking-tight">{technicians.length} Technicians</CardTitle>
          </CardContent>
        </Card>
      </div>

      {activeSubTab === "payouts" ? (
        <>
          {/* Control Panel: Filters */}
          <Card className="border-border/60">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search payouts by ID or technician..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Technician:</Label>
                <Select value={techFilter} onValueChange={setTechFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Technicians" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Technicians</SelectItem>
                    {technicians.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-border/60 overflow-hidden shadow-xs">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <tr>
                      {renderSortableHeader("Transaction ID", "id", ledgerSortCol, ledgerSortDir, setLedgerSortCol, setLedgerSortDir)}
                      {renderSortableHeader("Technician", "tech", ledgerSortCol, ledgerSortDir, setLedgerSortCol, setLedgerSortDir)}
                      <th className="px-4 py-3">Customer Name</th>
                      <th className="px-4 py-3">CIN Number</th>
                      {renderSortableHeader("Settlement Date", "date", ledgerSortCol, ledgerSortDir, setLedgerSortCol, setLedgerSortDir)}
                      {renderSortableHeader("Daily Earnings", "earnings", ledgerSortCol, ledgerSortDir, setLedgerSortCol, setLedgerSortDir)}
                      <th className="px-4 py-3">Advance Deduction</th>
                      <th className="px-4 py-3">Adjusted Extra</th>
                      {renderSortableHeader("Total Paid", "paid", ledgerSortCol, ledgerSortDir, setLedgerSortCol, setLedgerSortDir)}
                      <th className="px-4 py-3">Remaining Due</th>
                      <th className="px-4 py-3">Payment Status</th>
                      {(currentRole === "Admin" || currentRole === "Manager") && <th className="px-4 py-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {sortedPayouts.length === 0 ? (
                      <tr>
                        <td colSpan={(currentRole === "Admin" || currentRole === "Manager") ? 12 : 11} className="text-center py-12 text-muted-foreground font-medium">
                          No payout logs found.
                        </td>
                      </tr>
                    ) : (
                      sortedPayouts.map((p) => {
                        const tech = technicians.find(t => t.id === p.technicianId)

                        return (
                          <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{p.id}</td>
                            <td className="px-4 py-4 font-semibold text-xs text-foreground">{tech?.name || "Unknown Technician"}</td>
                            <td className="px-4 py-4 text-xs text-muted-foreground">{p.customerName || "—"}</td>
                            <td className="px-4 py-4 text-xs font-semibold text-muted-foreground tabular-nums">{p.cinNumber || "—"}</td>
                            <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{p.date}</td>
                            <td className="px-4 py-4 text-xs font-bold text-foreground tabular-nums">₹{p.dailyEarnings}</td>
                            <td className="px-4 py-4 text-xs font-medium text-rose-600 dark:text-rose-400 tabular-nums">-₹{p.advance}</td>
                            <td className="px-4 py-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">+₹{p.extra}</td>
                            <td className="px-4 py-4 text-xs font-extrabold text-foreground tabular-nums">₹{p.totalPayout}</td>
                            <td className="px-4 py-4 text-xs font-bold text-foreground tabular-nums">₹{p.due}</td>
                            <td className="px-4 py-4">
                              <Badge 
                                variant="outline"
                                onClick={() => (currentRole === "Admin" || currentRole === "Manager") && handleToggleStatus(p.id, p.paymentStatus)}
                                className={`text-[9px] font-bold py-0.5 px-1.5 cursor-pointer hover:opacity-85 ${
                                  p.paymentStatus === "Paid" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                                }`}
                              >
                                <HugeiconsIcon icon={p.paymentStatus === "Paid" ? CheckmarkCircle01Icon : Loading03Icon} strokeWidth={2.5} className="size-3" />
                                {p.paymentStatus}
                              </Badge>
                            </td>
                            {(currentRole === "Admin" || currentRole === "Manager") && (
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleOpenEdit(p)}
                                    className="h-6 text-[10px] font-semibold px-2 bg-background hover:bg-muted"
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeletePayout(p.id)}
                                    className="h-6 text-[10px] font-semibold px-2 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Daily Earnings Filter Controls */}
          <Card className="border-border/60">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by technician..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Technician:</Label>
                  <Select value={techFilter} onValueChange={setTechFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="All Technicians" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Technicians</SelectItem>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Month:</Label>
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Months</SelectItem>
                      {availableMonths.map(ym => (
                        <SelectItem key={ym} value={ym}>{formatYearMonth(ym)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Earnings Table */}
          <Card className="border-border/60 overflow-hidden shadow-xs">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <tr>
                      {renderSortableHeader("Technician Name", "tech", earningsSortCol, earningsSortDir, setEarningsSortCol, setEarningsSortDir)}
                      {pivotData.dates.map(date => (
                        <React.Fragment key={date}>
                          {renderSortableHeader(date, date, earningsSortCol, earningsSortDir, setEarningsSortCol, setEarningsSortDir)}
                        </React.Fragment>
                      ))}
                      {renderSortableHeader("Total Earnings", "total", earningsSortCol, earningsSortDir, setEarningsSortCol, setEarningsSortDir)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {sortedPivotRows.length === 0 ? (
                      <tr>
                        <td colSpan={pivotData.dates.length + 2} className="text-center py-12 text-muted-foreground font-medium">
                          No daily earnings records found for selected criteria.
                        </td>
                      </tr>
                    ) : (
                      sortedPivotRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-4 font-semibold text-xs text-foreground">{row.techName}</td>
                          {pivotData.dates.map(date => {
                            const val = row.earnings[date] || 0
                            return (
                              <td key={date} className="px-4 py-4 text-xs font-medium text-foreground tabular-nums">
                                {val > 0 ? (
                                  `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                ) : (
                                  <span className="text-muted-foreground/30">—</span>
                                )}
                              </td>
                            )
                          })}
                          <td className="px-4 py-4 text-xs font-extrabold text-foreground tabular-nums bg-muted/10">
                            ₹{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Record Payout Dialog */}
      <Drawer open={isPayOpen} onOpenChange={setIsPayOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Process Technician Payout Settlement</DrawerTitle>
              <DrawerDescription className="text-xs">
                Process cash disbursements, reconcile outstanding commissions, and adjust active advance lines.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Tech selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pay-tech" className="text-xs font-bold text-muted-foreground">Select Technician</Label>
                  <Select value={formTechId} onValueChange={setFormTechId}>
                    <SelectTrigger id="pay-tech">
                      <SelectValue placeholder="Select Technician..." />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name} (Dues: ₹{t.dueAmount})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Link Booking dropdown */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pay-booking" className="text-xs font-bold text-muted-foreground">Link Booking (Optional)</Label>
                  <Select 
                    value={formBookingId} 
                    onValueChange={handleBookingLink}
                    disabled={!formTechId}
                  >
                    <SelectTrigger id="pay-booking">
                      <SelectValue placeholder={formTechId ? "Select Booking..." : "Please select technician first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None (No booking link)</SelectItem>
                      {availableBookingsForLink.map(b => {
                        const cust = customers.find(c => c.id === b.customerId)
                        return (
                          <SelectItem key={b.id} value={b.id}>
                            {b.id} - {cust?.name || "Unknown"} ({b.appliance}) - ₹{b.totalTechnicianAmount || 0}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Daily Earnings (calculated from tech dues) */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pay-earn" className="text-xs font-bold text-muted-foreground">New Earnings (Optional)</Label>
                    <Input 
                      type="number"
                      id="pay-earn"
                      min="0"
                      value={formDailyEarnings}
                      onChange={(e) => setFormDailyEarnings(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Cash Paid */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pay-cash" className="text-xs font-bold text-muted-foreground">Settlement Amount Paid</Label>
                    <Input 
                      type="number"
                      id="pay-cash"
                      min="0"
                      value={formTotalPayout}
                      onChange={(e) => setFormTotalPayout(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Settlement Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pay-date" className="text-xs font-bold text-muted-foreground">Settlement Date</Label>
                  <Input 
                    type="date"
                    id="pay-date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pay-cust-name" className="text-xs font-bold text-muted-foreground">Customer Name (Optional)</Label>
                    <Input 
                      id="pay-cust-name"
                      placeholder="e.g. John Doe"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pay-cust-cin" className="text-xs font-bold text-muted-foreground">Customer CIN (Optional)</Label>
                    <Input 
                      id="pay-cust-cin"
                      placeholder="e.g. CUST-1001"
                      value={formCinNumber}
                      onChange={(e) => setFormCinNumber(e.target.value)}
                    />
                  </div>
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Advance Deductions */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pay-adv" className="text-xs font-bold text-muted-foreground">Advance Reclaimed</Label>
                    <Input 
                      type="number"
                      id="pay-adv"
                      min="0"
                      value={formAdvance}
                      onChange={(e) => setFormAdvance(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Extra Compensation */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pay-extra" className="text-xs font-bold text-muted-foreground">Extra Bonus/Expense</Label>
                    <Input 
                      type="number"
                      id="pay-extra"
                      min="0"
                      value={formExtra}
                      onChange={(e) => setFormExtra(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Status Selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pay-status" className="text-xs font-bold text-muted-foreground">Payment Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger id="pay-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid / Cleared</SelectItem>
                      <SelectItem value="Pending">Pending / Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Financial Reconcile Preview */}
                <div className="mt-2 rounded-lg bg-emerald-500/5 p-3.5 border border-emerald-500/10 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="font-bold text-emerald-600 uppercase text-[10px] tracking-wider">Audit Adjustment Preview</span>
                  <div className="flex justify-between">
                    <span>Outstanding Due (Before):</span>
                    <span className="font-semibold text-foreground">₹{currentTechDue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reconciliation Formula:</span>
                    <span className="font-medium text-muted-foreground">Dues + New Earnings + Extra - Paid - Reclaimed</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Remaining Due (After):</span>
                    <span className="text-emerald-600 font-extrabold">₹{Math.max(0, currentTechDue + formDailyEarnings + formExtra - formTotalPayout - formAdvance)}</span>
                  </div>
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Clear Settlement</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Cancel Transaction</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Edit Payout Dialog */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Technician Payout / Settlement</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify transaction parameter logs. Dues and advances will automatically reconcile.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Tech Selection (Disabled) */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-pay-tech" className="text-xs font-bold text-muted-foreground">Select Technician</Label>
                  <Select value={editTechId} onValueChange={setEditTechId} disabled>
                    <SelectTrigger id="edit-pay-tech">
                      <SelectValue placeholder="Select Technician..." />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Link Booking dropdown */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-pay-booking" className="text-xs font-bold text-muted-foreground">Link Booking (Optional)</Label>
                  <Select 
                    value={editBookingId} 
                    onValueChange={handleEditBookingLink}
                  >
                    <SelectTrigger id="edit-pay-booking">
                      <SelectValue placeholder="Select Booking..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None (No booking link)</SelectItem>
                      {editAvailableBookingsForLink.map(b => {
                        const cust = customers.find(c => c.id === b.customerId)
                        return (
                          <SelectItem key={b.id} value={b.id}>
                            {b.id} - {cust?.name || "Unknown"} ({b.appliance}) - ₹{b.totalTechnicianAmount || 0}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Daily Earnings */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-pay-earn" className="text-xs font-bold text-muted-foreground">New Earnings (Commission)</Label>
                    <Input 
                      type="number"
                      id="edit-pay-earn"
                      min="0"
                      value={editDailyEarnings}
                      onChange={(e) => setEditDailyEarnings(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Cash Paid */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-pay-cash" className="text-xs font-bold text-muted-foreground">Settlement Amount Paid</Label>
                    <Input 
                      type="number"
                      id="edit-pay-cash"
                      min="0"
                      value={editTotalPayout}
                      onChange={(e) => setEditTotalPayout(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Settlement Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-pay-date" className="text-xs font-bold text-muted-foreground">Settlement Date</Label>
                  <Input 
                    type="date"
                    id="edit-pay-date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-pay-cust-name" className="text-xs font-bold text-muted-foreground">Customer Name (Optional)</Label>
                    <Input 
                      id="edit-pay-cust-name"
                      placeholder="e.g. John Doe"
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-pay-cust-cin" className="text-xs font-bold text-muted-foreground">Customer CIN (Optional)</Label>
                    <Input 
                      id="edit-pay-cust-cin"
                      placeholder="e.g. CUST-1001"
                      value={editCinNumber}
                      onChange={(e) => setEditCinNumber(e.target.value)}
                    />
                  </div>
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Advance Deductions */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-pay-adv" className="text-xs font-bold text-muted-foreground">Advance Reclaimed</Label>
                    <Input 
                      type="number"
                      id="edit-pay-adv"
                      min="0"
                      value={editAdvance}
                      onChange={(e) => setEditAdvance(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Extra Compensation */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-pay-extra" className="text-xs font-bold text-muted-foreground">Extra Bonus/Expense</Label>
                    <Input 
                      type="number"
                      id="edit-pay-extra"
                      min="0"
                      value={editExtra}
                      onChange={(e) => setEditExtra(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Status Selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-pay-status" className="text-xs font-bold text-muted-foreground">Payment Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="edit-pay-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid / Cleared</SelectItem>
                      <SelectItem value="Pending">Pending / Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reconcile Preview */}
                <div className="mt-2 rounded-lg bg-emerald-500/5 p-3.5 border border-emerald-500/10 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="font-bold text-emerald-600 uppercase text-[10px] tracking-wider">Adjustment Audit Preview</span>
                  <div className="flex justify-between">
                    <span>Audit Status:</span>
                    <span className="font-semibold text-foreground">Revising Transaction {selectedPayout?.id}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground">
                    <span>New Net Settlement:</span>
                    <span className="text-emerald-600 font-extrabold">₹{editTotalPayout}</span>
                  </div>
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Save Changes</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Changes</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

    </div>
  )
}
