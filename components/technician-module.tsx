"use client"

import * as React from "react"
import { useCRM, Technician } from "@/context/crm-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  UserGroupIcon,
  HelpCircleIcon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  InvoiceIcon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function TechnicianModule() {
  const { technicians, bookings, payouts, addPayout, addTechnician, updateTechnician, deleteTechnician, currentRole } = useCRM()
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isSettleOpen, setIsSettleOpen] = React.useState(false)
  const [selectedTech, setSelectedTech] = React.useState<Technician | null>(null)
  const [settleAmount, setSettleAmount] = React.useState("")

  // Tab switcher
  const [activeSubTab, setActiveSubTab] = React.useState<"list" | "logDaily">("list")

  // Log Daily form state
  const [logTechId, setLogTechId] = React.useState("")
  const [logDate, setLogDate] = React.useState(new Date().toISOString().split("T")[0])
  const [logEarnings, setLogEarnings] = React.useState("")
  const [logAdvance, setLogAdvance] = React.useState("")
  const [logStatus, setLogStatus] = React.useState<"Paid" | "Pending">("Paid")

  // Form State
  const [name, setName] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [skillsString, setSkillsString] = React.useState("AC, Electrical")
  const [status, setStatus] = React.useState<"Active" | "Inactive">("Active")
  const [joiningDate, setJoiningDate] = React.useState(new Date().toISOString().split("T")[0])

  // Edit Form State
  const [editName, setEditName] = React.useState("")
  const [editMobile, setEditMobile] = React.useState("")
  const [editAddress, setEditAddress] = React.useState("")
  const [editSkillsString, setEditSkillsString] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<"Active" | "Inactive">("Active")
  const [editJoiningDate, setEditJoiningDate] = React.useState("")
  const [editAdvanceTaken, setEditAdvanceTaken] = React.useState(0)
  const [editDueAmount, setEditDueAmount] = React.useState(0)

  // Submit Technician Add
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const skills = skillsString.split(",").map(s => s.trim()).filter(Boolean)
    addTechnician({
      name,
      mobile,
      address,
      skills,
      status,
      joiningDate
    })
    setName("")
    setMobile("")
    setAddress("")
    setSkillsString("AC, Electrical")
    setStatus("Active")
    setIsAddOpen(false)
  }

  // Open Edit Profile
  const handleOpenEdit = (t: Technician) => {
    setSelectedTech(t)
    setEditName(t.name)
    setEditMobile(t.mobile)
    setEditAddress(t.address)
    setEditSkillsString(t.skills.join(", "))
    setEditStatus(t.status)
    setEditJoiningDate(t.joiningDate)
    setEditAdvanceTaken(t.advanceTaken)
    setEditDueAmount(t.dueAmount)
    setIsEditOpen(true)
  }

  // Submit Technician Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTech) return
    const skills = editSkillsString.split(",").map(s => s.trim()).filter(Boolean)
    updateTechnician(selectedTech.id, {
      name: editName,
      mobile: editMobile,
      address: editAddress,
      skills,
      status: editStatus,
      joiningDate: editJoiningDate,
      advanceTaken: editAdvanceTaken,
      dueAmount: editDueAmount
    })
    setIsEditOpen(false)
  }

  // Open Settle Dues Drawer
  const handleOpenSettle = (t: Technician) => {
    setSelectedTech(t)
    setSettleAmount(t.dueAmount.toString())
    setIsSettleOpen(true)
  }

  // Submit Payout Settlement
  const handleSettleDuesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTech) return
    const amount = parseFloat(settleAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive settlement amount.")
      return
    }
    if (amount > selectedTech.dueAmount) {
      toast.error(`Settlement amount cannot exceed outstanding dues of ₹${selectedTech.dueAmount}.`)
      return
    }

    addPayout({
      technicianId: selectedTech.id,
      date: new Date().toISOString().split("T")[0],
      dailyEarnings: 0,
      totalPayout: amount,
      advance: 0,
      extra: 0,
      paymentStatus: "Paid",
      customerName: amount === selectedTech.dueAmount ? "Bulk Settlement" : "Partial Settlement",
      cinNumber: "—"
    })
    toast.success(`Settled ₹${amount} successfully for ${selectedTech.name}.`)
    setIsSettleOpen(false)
    setSettleAmount("")
  }

  // Submit Daily Log Amount
  const handleLogDailySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logTechId) {
      toast.error("Please select a technician.")
      return
    }

    const earnings = parseFloat(logEarnings) || 0
    const advance = parseFloat(logAdvance) || 0

    if (earnings < 0 || advance < 0) {
      toast.error("Earnings and advances cannot be negative values.")
      return
    }

    // totalPayout calculation: if Paid, totalPayout = earnings - advance; else 0
    const totalPayout = logStatus === "Paid" ? Math.max(0, earnings - advance) : 0

    addPayout({
      technicianId: logTechId,
      date: logDate,
      dailyEarnings: earnings,
      totalPayout: totalPayout,
      advance: advance,
      extra: 0,
      paymentStatus: logStatus,
      customerName: "Daily Log",
      cinNumber: "—"
    })

    toast.success("Daily technician amount logged successfully.")

    // Reset Form
    setLogTechId("")
    setLogEarnings("")
    setLogAdvance("")
    setLogStatus("Paid")
    setLogDate(new Date().toISOString().split("T")[0])
  }

  // Filtered recent daily logs to display
  const dailyLogs = React.useMemo(() => {
    return payouts.filter(p => p.customerName === "Daily Log")
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [payouts])

  // Running KPI computations
  const totalPayoutSum = payouts
    .filter(p => p.paymentStatus === "Paid")
    .reduce((sum, p) => sum + p.totalPayout, 0)
  
  const totalDuesSum = technicians.reduce((sum, t) => sum + t.dueAmount, 0)
  const totalAdvancesSum = technicians.reduce((sum, t) => sum + t.advanceTaken, 0)

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Technician Management</h2>
          <p className="text-sm text-muted-foreground">Manage dispatch staff profiles, skills directories, active job workloads, and running commissions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/40 w-fit shrink-0">
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveSubTab("list")}
              className={`text-xs font-bold px-4 py-1.5 h-8 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === "list" 
                  ? "bg-background text-foreground shadow-sm font-bold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-3.5" />
              Technician List
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveSubTab("logDaily")}
              className={`text-xs font-bold px-4 py-1.5 h-8 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === "logDaily" 
                  ? "bg-background text-foreground shadow-sm font-bold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} className="size-3.5" />
              Log Daily Amount
            </Button>
          </div>
          {activeSubTab === "list" && (
            <>
              {currentRole === "Admin" && technicians.length > 0 && (
                <Button 
                  type="button"
                  variant="destructive" 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to remove all technicians?")) {
                      technicians.forEach(t => deleteTechnician(t.id))
                    }
                  }} 
                  className="w-fit cursor-pointer font-bold h-9 text-xs"
                >
                  Clear All Technicians
                </Button>
              )}
              <Button onClick={() => setIsAddOpen(true)} className="w-fit cursor-pointer h-9 text-xs font-bold gap-1.5">
                <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} className="size-4" />
                Onboard Technician
              </Button>
            </>
          )}
        </div>
      </div>

      {activeSubTab === "list" ? (
        <>
          {/* Technician Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Total Settled Payouts */}
            <Card className="border-border/60">
              <CardHeader className="py-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Settled Payouts</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <CardTitle className="text-2xl font-bold tracking-tight tabular-nums">₹{totalPayoutSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</CardTitle>
              </CardContent>
            </Card>

            {/* Total Outstanding Dues */}
            <Card className="border-border/60">
              <CardHeader className="py-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Total Outstanding Dues</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">₹{totalDuesSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</CardTitle>
              </CardContent>
            </Card>

            {/* Total Active Advances */}
            <Card className="border-border/60">
              <CardHeader className="py-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Total Running Advances</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-rose-600 dark:text-rose-400">₹{totalAdvancesSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</CardTitle>
              </CardContent>
            </Card>
          </div>

          {/* Technician Dashboard Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {technicians.map((t) => {
              // Dynamic metric computations from live bookings
              const techBookings = bookings.filter(b => b.assignedTechnicianId === t.id)
              const totalJobs = techBookings.length
              const completedJobs = techBookings.filter(b => b.status === "Completed").length
              const pendingJobs = techBookings.filter(b => b.status === "In Progress" || b.status === "Not Started").length
              
              // Earnings computed: Sum of dynamic totalTechnicianAmount on completed orders
              const completedEarnings = techBookings
                .filter(b => b.status === "Completed")
                .reduce((sum, b) => sum + (b.totalTechnicianAmount || 0), 0)

              return (
                <Card key={t.id} className="border-border/60 hover:shadow-md transition-all duration-300 relative overflow-hidden bg-card/60 backdrop-blur-md">
                  {/* Background abstract gradient */}
                  <div className="absolute right-0 top-0 size-28 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                  
                  <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 text-primary border border-primary/20 text-sm font-black rounded-lg flex items-center justify-center">
                          {t.name.split(" ").map(w => w.charAt(0)).join("")}
                        </div>
                        <CardTitle className="text-sm font-bold text-foreground">{t.name}</CardTitle>
                      </div>

                      <Badge 
                        variant="outline"
                        onClick={() => updateTechnician(t.id, { status: t.status === "Active" ? "Inactive" : "Active" })}
                        className={`text-[9px] font-extrabold cursor-pointer py-0 px-1.5 ${
                          t.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                            : "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800/40 dark:text-zinc-400"
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="py-4 flex flex-col gap-3">
                    {/* Financial balances */}
                    <div className="flex flex-col gap-2.5 text-xs font-semibold">
                      <div className="flex justify-between items-center bg-muted/20 px-2 py-1.5 rounded border border-border/40">
                        <span className="text-muted-foreground font-medium">Total Completed:</span>
                        <span className="font-bold tabular-nums text-foreground">₹{completedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-1.5 rounded border border-amber-500/10">
                        <span className="font-medium">Due:</span>
                        <span className="font-black tabular-nums">₹{t.dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 bg-rose-500/5 px-2 py-1.5 rounded border border-rose-500/10">
                        <span className="font-medium">Total Advance:</span>
                        <span className="font-black tabular-nums">₹{t.advanceTaken.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t border-border/40 py-2.5 flex justify-between gap-2 items-center">
                    <div className="flex gap-2 flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(t)}
                        className="h-8 text-xs font-bold px-2.5 bg-background hover:bg-muted cursor-pointer flex-1"
                      >
                        Edit Profile
                      </Button>
                      {t.dueAmount > 0 && (currentRole === "Admin" || currentRole === "Manager") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSettle(t)}
                          className="h-8 text-xs font-bold px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 cursor-pointer flex-1"
                        >
                          Settle Dues
                        </Button>
                      )}
                    </div>
                    {currentRole === "Admin" && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete profile for ${t.name}?`)) {
                            deleteTechnician(t.id)
                          }
                        }}
                        className="h-8 size-8 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold cursor-pointer"
                      >
                        ×
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        /* Log Daily Amount layout block */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          
          {/* Left Column: Log Form */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base font-bold">Record Daily Technician Amount</CardTitle>
                <CardDescription className="text-xs">
                  Directly post today's commission earnings, advances, and payout clear status for dispatch staff.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleLogDailySubmit} className="flex flex-col gap-4 text-sm">
                  
                  {/* Select Date */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="log-date" className="text-xs font-bold text-muted-foreground">Select Log Date</Label>
                    <Input
                      type="date"
                      id="log-date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>

                  {/* Select Technician */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="log-tech" className="text-xs font-bold text-muted-foreground">Choose Technician</Label>
                    <select
                      id="log-tech"
                      value={logTechId}
                      onChange={(e) => setLogTechId(e.target.value)}
                      required
                      className="h-9 text-xs font-semibold rounded-lg border border-border/80 bg-background px-2.5 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    >
                      <option value="">Select Technician...</option>
                      {technicians.filter(t => t.status === "Active").map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Dues: ₹{t.dueAmount})</option>
                      ))}
                    </select>
                  </div>

                  {/* Today's Earning & Today's Advance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="log-earnings" className="text-xs font-bold text-muted-foreground">Today's Earning (₹)</Label>
                      <Input
                        type="number"
                        id="log-earnings"
                        min="0"
                        placeholder="E.g. 1500"
                        value={logEarnings}
                        onChange={(e) => setLogEarnings(e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="log-advance" className="text-xs font-bold text-muted-foreground">Today's Advance (₹)</Label>
                      <Input
                        type="number"
                        id="log-advance"
                        min="0"
                        placeholder="E.g. 300"
                        value={logAdvance}
                        onChange={(e) => setLogAdvance(e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {/* Payment Status (Paid / Pending) */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="log-status" className="text-xs font-bold text-muted-foreground">Payment Status</Label>
                    <select
                      id="log-status"
                      value={logStatus}
                      onChange={(e) => setLogStatus(e.target.value as any)}
                      required
                      className="h-9 text-xs font-semibold rounded-lg border border-border/80 bg-background px-2.5 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    >
                      <option value="Paid">Paid / Settled Today</option>
                      <option value="Pending">Pending / Added to Dues</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full mt-2 cursor-pointer font-bold">
                    Log Daily Amount
                  </Button>

                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recent Daily Logs */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card className="border-border/60 bg-card/45 backdrop-blur-xs overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base font-bold">Recent Daily Logs Ledger</CardTitle>
                <CardDescription className="text-xs">
                  Overview of manual daily technician earnings and advance deduction sheets synced with settlements.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-muted/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Technician</th>
                        <th className="px-4 py-3">Earnings</th>
                        <th className="px-4 py-3">Advance</th>
                        <th className="px-4 py-3">Payout</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs">
                      {dailyLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                            No manual daily logs recorded.
                          </td>
                        </tr>
                      ) : (
                        dailyLogs.slice(0, 8).map((log) => {
                          const tech = technicians.find(t => t.id === log.technicianId)
                          return (
                            <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-3.5 font-semibold tabular-nums text-foreground">{log.date}</td>
                              <td className="px-4 py-3.5 font-semibold text-foreground">{tech?.name || "Unknown"}</td>
                              <td className="px-4 py-3.5 font-semibold text-foreground tabular-nums">₹{log.dailyEarnings}</td>
                              <td className="px-4 py-3.5 font-medium text-rose-600 dark:text-rose-400 tabular-nums">-₹{log.advance}</td>
                              <td className="px-4 py-3.5 font-extrabold text-foreground tabular-nums">₹{log.totalPayout}</td>
                              <td className="px-4 py-3.5">
                                <Badge 
                                  variant="outline"
                                  className={`text-[8px] font-extrabold py-0.5 px-1.5 ${
                                    log.paymentStatus === "Paid" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                                  }`}
                                >
                                  {log.paymentStatus}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* Technician Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Onboard New Dispatch Technician</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log a new service staff profile. Dues, advances, and jobs tracker are created automatically.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tech-name" className="text-xs font-bold text-muted-foreground">Technician Name</Label>
                  <Input 
                    id="tech-name"
                    placeholder="E.g., Suresh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tech-mob" className="text-xs font-bold text-muted-foreground">Mobile Phone Number</Label>
                  <Input 
                    id="tech-phone" 
                    type="tel" 
                    inputMode="numeric"
                    placeholder="E.g., 9899001122" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} 
                    required 
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tech-address" className="text-xs font-bold text-muted-foreground">Residential Address Details</Label>
                  <Input 
                    id="tech-address"
                    placeholder="E.g., Street, Sector details"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Skills Directory comma-delimited */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tech-skills" className="text-xs font-bold text-muted-foreground">Skillsets (Comma delimited)</Label>
                  <Input 
                    id="tech-skills"
                    placeholder="E.g., AC, TV, Washing Machine, Geyser"
                    value={skillsString}
                    onChange={(e) => setSkillsString(e.target.value)}
                    required
                  />
                </div>

                {/* Joining Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tech-date" className="text-xs font-bold text-muted-foreground">Joining Date</Label>
                  <Input 
                    type="date"
                    id="tech-date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    required
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Onboard Technician</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Profile</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Technician Edit Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Technician Profile Details</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify technician record parameters. Dues, advances, and join details can be overridden.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-tech-name" className="text-xs font-bold text-muted-foreground">Technician Name</Label>
                  <Input 
                    id="edit-tech-name"
                    placeholder="E.g., Suresh Kumar"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-tech-mob" className="text-xs font-bold text-muted-foreground">Mobile Phone Number</Label>
                  <Input 
                    id="edit-tech-phone" 
                    type="tel" 
                    inputMode="numeric"
                    placeholder="E.g., 9899001122" 
                    value={editMobile} 
                    onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, ''))} 
                    required 
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-tech-address" className="text-xs font-bold text-muted-foreground">Residential Address Details</Label>
                  <Input 
                    id="edit-tech-address"
                    placeholder="E.g., Street, Sector details"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Status Selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-tech-status" className="text-xs font-bold text-muted-foreground">Status</Label>
                  <select
                    id="edit-tech-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "Active" | "Inactive")}
                    className="h-8 text-xs font-bold rounded-lg border border-border/80 bg-background px-2.5 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Skills Directory comma-delimited */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-tech-skills" className="text-xs font-bold text-muted-foreground">Skillsets (Comma delimited)</Label>
                  <Input 
                    id="edit-tech-skills"
                    placeholder="E.g., AC, TV, Washing Machine, Geyser"
                    value={editSkillsString}
                    onChange={(e) => setEditSkillsString(e.target.value)}
                    required
                  />
                </div>

                {/* Joining Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-tech-date" className="text-xs font-bold text-muted-foreground">Joining Date</Label>
                  <Input 
                    type="date"
                    id="edit-tech-date"
                    value={editJoiningDate}
                    onChange={(e) => setEditJoiningDate(e.target.value)}
                    required
                  />
                </div>

                {/* Advance Taken Override */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-tech-adv" className="text-xs font-bold text-rose-600">Advance Taken (Override)</Label>
                  <Input 
                    type="number"
                    id="edit-tech-adv"
                    min="0"
                    value={editAdvanceTaken}
                    onChange={(e) => setEditAdvanceTaken(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                {/* Due Amount Override */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-tech-due" className="text-xs font-bold text-amber-600">Outstanding Due Amount (Override)</Label>
                  <Input 
                    type="number"
                    id="edit-tech-due"
                    min="0"
                    value={editDueAmount}
                    onChange={(e) => setEditDueAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Update Profile Details</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Changes</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Settle Dues Drawer */}
      <Drawer open={isSettleOpen} onOpenChange={setIsSettleOpen} direction="bottom">
        <DrawerContent className="max-w-md mx-auto flex flex-col rounded-t-2xl border-t bg-card pb-6">
          <form onSubmit={handleSettleDuesSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Settle Outstanding Dues</DrawerTitle>
              <DrawerDescription className="text-xs">
                Settle partial or full outstanding dues for {selectedTech?.name}.
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-2.5 text-xs font-semibold">
                <div className="flex justify-between items-center bg-amber-500/5 px-3 py-2 rounded border border-amber-500/10 text-amber-600 dark:text-amber-400">
                  <span className="font-medium">Current Outstanding Dues:</span>
                  <span className="font-black text-sm tabular-nums">₹{selectedTech?.dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Settlement Amount */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settle-amount" className="text-xs font-bold text-muted-foreground">Settlement Amount (₹)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="settle-amount"
                    type="number"
                    min="0.01"
                    max={selectedTech?.dueAmount}
                    step="0.01"
                    placeholder="Enter amount to settle"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => selectedTech && setSettleAmount(selectedTech.dueAmount.toString())}
                    className="text-xs font-bold cursor-pointer"
                  >
                    Set Max
                  </Button>
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirm Settlement
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1 cursor-pointer">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

    </div>
  )
}
