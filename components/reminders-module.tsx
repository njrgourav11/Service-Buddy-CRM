"use client"

import * as React from "react"
import { useCRM, Reminder } from "@/context/crm-context"
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
  Notification03Icon,
  CheckmarkCircle01Icon,
  Loading03Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function RemindersModule() {
  const { 
    reminders, 
    dismissReminder, 
    spares, 
    updateSpare, 
    outstandingDues, 
    updateOutstandingDue, 
    addReminder,
    setActiveTab,
    currentRole
  } = useCRM()

  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("ALL")
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  // Form State
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [type, setType] = React.useState<any>("General")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])

  // Filtered List
  const filteredReminders = reminders.filter(r => {
    const searchString = `${r.title} ${r.description}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    const matchesType = typeFilter === "ALL" || r.type === typeFilter

    return matchesSearch && matchesType
  })

  // Submit Reminder
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addReminder({
      title,
      description,
      type,
      date,
      status: "Active"
    })

    // Reset Form
    setTitle("")
    setDescription("")
    setType("General")
    setIsAddOpen(false)
    toast.success("Custom reminder created!")
  }

  // ==========================================
  // Direct Quick Resolution Handlers
  // ==========================================
  
  // 1. Refill Stock +10
  const handleRefillStock = (id: string, spareIdString: string) => {
    // extract SPIN-XXXX
    const spareId = spareIdString.replace("AUTO-REFILL-", "")
    const match = spares.find(s => s.id === spareId)
    if (match) {
      updateSpare(spareId, { stockQty: match.stockQty + 10 })
      dismissReminder(id)
      toast.success(`Replenished stock limit of '${match.name}' by +10 items!`)
    }
  }

  // 2. Mark Outstanding Settle
  const handleSettleDue = (id: string, dueIdString: string) => {
    // extract DUE-XXXX
    const dueId = dueIdString.replace("AUTO-REC-", "")
    const match = outstandingDues.find(d => d.id === dueId)
    if (match) {
      updateOutstandingDue(dueId, { status: "Settled" })
      dismissReminder(id)
      toast.success(`Outstanding Due recovered for ${match.recipient}!`)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Reminders & Notifications Feed</h2>
          <p className="text-sm text-muted-foreground">Inspect reactive system alerts, review low inventory indicators, and trigger quick resolution shortcuts.</p>
        </div>
        {(currentRole === "Admin" || currentRole === "Manager") && (
          <Button onClick={() => setIsAddOpen(true)} className="w-fit">
            <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
            Create Alert
          </Button>
        )}
      </div>

      {/* Control Panel: Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search notifications and memo descriptors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Alert Type:</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Alerts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Alerts</SelectItem>
                <SelectItem value="Service Follow-up">Service Follow-up</SelectItem>
                <SelectItem value="Technician Payout Due">Technician Payout Due</SelectItem>
                <SelectItem value="Inventory Refill">Inventory Refill</SelectItem>
                <SelectItem value="Customer AMC Renewal">Customer AMC Renewal</SelectItem>
                <SelectItem value="Outstanding Recovery">Outstanding Recovery</SelectItem>
                <SelectItem value="General">General Memo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Notifications Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReminders.length === 0 ? (
          <Card className="border-border/60 p-12 text-center flex flex-col items-center gap-3">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 p-4 text-emerald-600 dark:text-emerald-400">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-8" />
            </div>
            <span className="text-base font-bold text-foreground">No alerts requiring attention!</span>
            <span className="text-xs text-muted-foreground">All systems, stock limits, and running balances are healthy.</span>
          </Card>
        ) : (
          filteredReminders.map((r) => {
            let badgeVariant: any = "outline"
            let colorClass = "border-zinc-200 dark:border-zinc-800 bg-card/60 backdrop-blur-md"
            
            if (r.type === "Inventory Refill") {
              badgeVariant = "destructive"
              colorClass = "border-rose-200 dark:border-rose-950/25 bg-rose-500/5 hover:border-rose-500/25"
            } else if (r.type === "Technician Payout Due" || r.type === "Outstanding Recovery") {
              colorClass = "border-amber-200 dark:border-amber-950/25 bg-amber-500/5 hover:border-amber-500/25"
            }

            return (
              <Card key={r.id} className={`border hover:shadow-xs transition-all duration-200 ${colorClass}`}>
                <CardHeader className="py-4 flex flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted border border-border/50 p-2 text-muted-foreground mt-0.5">
                      <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-sm font-bold text-foreground leading-none">{r.title}</CardTitle>
                        <Badge variant={badgeVariant} className="text-[9px] font-extrabold uppercase tracking-wide py-0 px-1.5 h-4 flex items-center">
                          {r.type}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">{r.description}</CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Render specific reactive resolutions buttons */}
                    {r.type === "Inventory Refill" && r.autoGenerated && (
                      <Button 
                        onClick={() => handleRefillStock(r.id, r.id)}
                        className="h-7 text-xs font-semibold px-2.5 bg-rose-600 hover:bg-rose-500 text-white dark:bg-rose-950/50 dark:hover:bg-rose-900/50 dark:text-rose-200 border-none shrink-0"
                      >
                        +10 Restock Parts
                      </Button>
                    )}

                    {r.type === "Technician Payout Due" && r.autoGenerated && (
                      <Button 
                        onClick={() => setActiveTab("payouts")}
                        className="h-7 text-xs font-semibold px-2.5 bg-amber-600 hover:bg-amber-500 text-white dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:text-amber-200 border-none shrink-0"
                      >
                        Settle Ledger
                      </Button>
                    )}

                    {r.type === "Outstanding Recovery" && r.autoGenerated && (
                      <Button 
                        onClick={() => handleSettleDue(r.id, r.id)}
                        className="h-7 text-xs font-semibold px-2.5 bg-blue-600 hover:bg-blue-500 text-white dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:text-blue-200 border-none shrink-0"
                      >
                        Recover / Settle Dues
                      </Button>
                    )}

                    <Button 
                      variant="ghost" 
                      onClick={() => dismissReminder(r.id)}
                      className="h-7 size-7 text-muted-foreground hover:text-foreground shrink-0 rounded-md p-0 flex items-center justify-center border"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>

      {/* Reminder Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Log Custom Reminder Notice</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log detailed custom alerts. Displays instantly on the operations warning boards.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-xl mx-auto w-full">
              <div className="flex flex-col gap-4">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rem-title" className="text-xs font-bold text-muted-foreground">Notification Header</Label>
                  <Input 
                    id="rem-title"
                    placeholder="E.g., Customer AMC follow-up"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Type Selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rem-cat" className="text-xs font-bold text-muted-foreground">Alert Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="rem-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Service Follow-up">Service Follow-up</SelectItem>
                      <SelectItem value="Customer AMC Renewal">Customer AMC Renewal</SelectItem>
                      <SelectItem value="General">General Memo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rem-date" className="text-xs font-bold text-muted-foreground">Alert Date</Label>
                  <Input 
                    type="date"
                    id="rem-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rem-desc" className="text-xs font-bold text-muted-foreground">Notification Details</Label>
                  <Input 
                    id="rem-desc"
                    placeholder="Provide details about the required action..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3 max-w-xl mx-auto w-full">
              <Button type="submit" className="flex-1">Publish Alert</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Alert</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

    </div>
  )
}
