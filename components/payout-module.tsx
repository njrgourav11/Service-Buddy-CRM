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
  const { payouts, technicians, addPayout, updatePayout, deletePayout, currentRole } = useCRM()
  const [search, setSearch] = React.useState("")
  const [techFilter, setTechFilter] = React.useState("ALL")
  const [isPayOpen, setIsPayOpen] = React.useState(false)

  // Form State
  const [formTechId, setFormTechId] = React.useState("")
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split("T")[0])
  const [formDailyEarnings, setFormDailyEarnings] = React.useState(0)
  const [formTotalPayout, setFormTotalPayout] = React.useState(0)
  const [formAdvance, setFormAdvance] = React.useState(0)
  const [formExtra, setFormExtra] = React.useState(0)
  const [formStatus, setFormStatus] = React.useState<any>("Paid")

  // Auto-fill daily earnings if a technician is selected
  React.useEffect(() => {
    if (formTechId) {
      const match = technicians.find(t => t.id === formTechId)
      if (match) {
        setFormDailyEarnings(match.dueAmount)
        setFormTotalPayout(match.dueAmount)
      }
    }
  }, [formTechId, technicians])

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
      paymentStatus: formStatus
    })

    // Reset Form
    setFormTechId("")
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

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Technician Payout Ledger</h2>
          <p className="text-sm text-muted-foreground">Manage salary payouts, process advances, and reconcile dispatch technician accounts.</p>
        </div>
        {(currentRole === "Super Admin" || currentRole === "Accountant") && (
          <Button onClick={() => setIsPayOpen(true)} className="w-fit">
            <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
            Record Payout / Settlement
          </Button>
        )}
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
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Settlement Date</th>
                  <th className="px-4 py-3">Daily Earnings</th>
                  <th className="px-4 py-3">Advance Deduction</th>
                  <th className="px-4 py-3">Adjusted Extra</th>
                  <th className="px-4 py-3">Total Paid</th>
                  <th className="px-4 py-3">Remaining Due</th>
                  <th className="px-4 py-3">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground font-medium">
                      No payout logs found.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((p) => {
                    const tech = technicians.find(t => t.id === p.technicianId)

                    return (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{p.id}</td>
                        <td className="px-4 py-4 font-semibold text-xs text-foreground">{tech?.name || "Unknown Technician"}</td>
                        <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{p.date}</td>
                        <td className="px-4 py-4 text-xs font-bold text-foreground tabular-nums">₹{p.dailyEarnings}</td>
                        <td className="px-4 py-4 text-xs font-medium text-rose-600 dark:text-rose-400 tabular-nums">-₹{p.advance}</td>
                        <td className="px-4 py-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">+₹{p.extra}</td>
                        <td className="px-4 py-4 text-xs font-extrabold text-foreground tabular-nums">₹{p.totalPayout}</td>
                        <td className="px-4 py-4 text-xs font-bold text-foreground tabular-nums">₹{p.due}</td>
                        <td className="px-4 py-4">
                          <Badge 
                            variant="outline"
                            onClick={() => (currentRole === "Super Admin" || currentRole === "Accountant") && handleToggleStatus(p.id, p.paymentStatus)}
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
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Record Payout Dialog */}
      <Drawer open={isPayOpen} onOpenChange={setIsPayOpen} direction="bottom">
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-2xl border-t bg-card">
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Daily Earnings (calculated from tech dues) */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pay-earn" className="text-xs font-bold text-muted-foreground">Earnings Unpaid</Label>
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
                    <span className="font-semibold text-foreground">₹{formDailyEarnings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reconciliation Formula:</span>
                    <span className="font-medium text-muted-foreground">Dues + Extra - Paid - Adv</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Remaining Due (After):</span>
                    <span className="text-emerald-600 font-extrabold">₹{Math.max(0, formDailyEarnings + formExtra - formTotalPayout - formAdvance)}</span>
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

    </div>
  )
}
