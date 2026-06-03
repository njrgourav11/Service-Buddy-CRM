"use client"

import * as React from "react"
import { useCRM, OutstandingDue } from "@/context/crm-context"
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
  CheckmarkCircle01Icon,
  Loading03Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function OutstandingModule() {
  const { outstandingDues, addOutstandingDue, updateOutstandingDue, deleteOutstandingDue, currentRole } = useCRM()
  const [search, setSearch] = React.useState("")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedDue, setSelectedDue] = React.useState<OutstandingDue | null>(null)

  // Form State
  const [recipient, setRecipient] = React.useState("")
  const [amount, setAmount] = React.useState(0)
  const [reason, setReason] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])

  // Edit Form State
  const [editRecipient, setEditRecipient] = React.useState("")
  const [editAmount, setEditAmount] = React.useState(0)
  const [editReason, setEditReason] = React.useState("")
  const [editDate, setEditDate] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<any>("Pending")

  // Open Edit Drawer
  const handleOpenEdit = (d: OutstandingDue) => {
    setSelectedDue(d)
    setEditRecipient(d.recipient)
    setEditAmount(d.amount)
    setEditReason(d.reason)
    setEditDate(d.date)
    setEditStatus(d.status)
    setIsEditOpen(true)
  }

  // Submit Edit Due
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDue) return

    updateOutstandingDue(selectedDue.id, {
      recipient: editRecipient,
      amount: editAmount,
      reason: editReason,
      date: editDate,
      status: editStatus
    })

    setIsEditOpen(false)
  }

  // Filtered List
  const filteredDues = outstandingDues.filter(d => {
    const searchString = `${d.id} ${d.recipient} ${d.reason}`.toLowerCase()
    return searchString.includes(search.toLowerCase())
  })

  // Submit Outstanding
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addOutstandingDue({
      recipient,
      amount,
      reason,
      date,
      status: "Pending"
    })

    // Reset Form
    setRecipient("")
    setAmount(0)
    setReason("")
    setIsAddOpen(false)
  }

  // Settle Toggle
  const handleToggleSettle = (id: string, current: string) => {
    updateOutstandingDue(id, { status: current === "Pending" ? "Settled" : "Pending" })
    toast.success("Due status reconciled successfully.")
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Outstanding & Dues Tracker</h2>
          <p className="text-sm text-muted-foreground">Track pending liabilities, vendor outstanding invoices, and historical technician monthly due balances.</p>
        </div>
        {currentRole === "Admin" && (
          <Button onClick={() => setIsAddOpen(true)} className="w-fit">
            <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
            Log Outstanding Liability
          </Button>
        )}
      </div>

      {/* Grid: Search and List */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search dues by recipient or reason..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
            />
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
                  <th className="px-4 py-3">Due ID</th>
                  <th className="px-4 py-3">Date Generated</th>
                  <th className="px-4 py-3">Recipient Party</th>
                  <th className="px-4 py-3">Outstanding Reason</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {currentRole === "Admin" && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredDues.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole === "Admin" ? 7 : 6} className="text-center py-12 text-muted-foreground font-medium">
                      No outstanding dues logged.
                    </td>
                  </tr>
                ) : (
                  filteredDues.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{d.id}</td>
                      <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{d.date}</td>
                      <td className="px-4 py-4 font-semibold text-xs text-foreground">{d.recipient}</td>
                      <td className="px-4 py-4 text-xs text-foreground max-w-xs truncate">{d.reason}</td>
                      <td className="px-4 py-4 text-right font-bold text-foreground tabular-nums">₹{d.amount}</td>
                      <td className="px-4 py-4 text-center">
                        <Badge 
                          variant="outline"
                          className={`text-[9px] font-bold py-0.5 px-1.5 ${
                            d.status === "Settled" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse"
                          }`}
                        >
                          <HugeiconsIcon icon={d.status === "Settled" ? CheckmarkCircle01Icon : Loading03Icon} strokeWidth={2.5} className="size-3" />
                          {d.status}
                        </Badge>
                      </td>
                      {currentRole === "Admin" && (
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleToggleSettle(d.id, d.status)}
                              className="h-7 text-xs font-semibold px-2"
                            >
                              {d.status === "Pending" ? "Reconcile / Settle" : "Mark Pending"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenEdit(d)}
                              className="h-7 text-xs font-semibold px-2 bg-background hover:bg-muted"
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={() => deleteOutstandingDue(d.id)}
                              className="h-7 size-7 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold"
                            >
                              ×
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Log Outstanding Liability / Due Balance</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log liabilities or balances for technicians/vendors. Aggregates live cash margin and report graphs.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Recipient */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="due-recipient" className="text-xs font-bold text-muted-foreground">Recipient Name (Vendor/Tech)</Label>
                  <Input 
                    id="due-recipient"
                    placeholder="E.g., Apex Copper Spares, Suresh Kumar"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="due-amt" className="text-xs font-bold text-muted-foreground">Outstanding Amount (₹)</Label>
                  <Input 
                    type="number"
                    id="due-amt"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="due-date" className="text-xs font-bold text-muted-foreground">Outstanding Date</Label>
                  <Input 
                    type="date"
                    id="due-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="due-reason" className="text-xs font-bold text-muted-foreground">Detailed Reason / Comments</Label>
                  <Input 
                    id="due-reason"
                    placeholder="E.g., Invoice balances, extra spares purchase"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Log Liability</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Entry</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Outstanding Edit Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Outstanding Liability / Due Balance</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify details of liabilities or balances for technicians/vendors.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Recipient */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-due-recipient" className="text-xs font-bold text-muted-foreground">Recipient Name (Vendor/Tech)</Label>
                  <Input 
                    id="edit-due-recipient"
                    placeholder="E.g., Apex Copper Spares, Suresh Kumar"
                    value={editRecipient}
                    onChange={(e) => setEditRecipient(e.target.value)}
                    required
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-due-amt" className="text-xs font-bold text-muted-foreground">Outstanding Amount (₹)</Label>
                  <Input 
                    type="number"
                    id="edit-due-amt"
                    min="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-due-status" className="text-xs font-bold text-muted-foreground">Payment Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="edit-due-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-due-date" className="text-xs font-bold text-muted-foreground">Outstanding Date</Label>
                  <Input 
                    type="date"
                    id="edit-due-date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-due-reason" className="text-xs font-bold text-muted-foreground">Detailed Reason / Comments</Label>
                  <Input 
                    id="edit-due-reason"
                    placeholder="E.g., Invoice balances, extra spares purchase"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    required
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Save Changes</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

    </div>
  )
}
