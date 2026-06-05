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
  const [selectedTech, setSelectedTech] = React.useState<Technician | null>(null)

  // Form State
  const [name, setName] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [skillsString, setSkillsString] = React.useState("AC, Electrical")
  const [status, setStatus] = React.useState<any>("Active")
  const [joiningDate, setJoiningDate] = React.useState(new Date().toISOString().split("T")[0])

  // Edit Form State
  const [editName, setEditName] = React.useState("")
  const [editMobile, setEditMobile] = React.useState("")
  const [editAddress, setEditAddress] = React.useState("")
  const [editSkillsString, setEditSkillsString] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<any>("Active")
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

  // Settle Outstanding Dues
  const handleSettleDues = (t: Technician) => {
    if (window.confirm(`Are you sure you want to settle all outstanding dues of ₹${t.dueAmount} for ${t.name}?`)) {
      addPayout({
        technicianId: t.id,
        date: new Date().toISOString().split("T")[0],
        dailyEarnings: 0,
        totalPayout: t.dueAmount,
        advance: 0,
        extra: 0,
        paymentStatus: "Paid",
        customerName: "Bulk Settlement",
        cinNumber: "—"
      })
      toast.success(`Dues of ₹${t.dueAmount} settled successfully for ${t.name}.`)
    }
  }

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
        <div className="flex items-center gap-2">
          {currentRole === "Admin" && technicians.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => {
                if (window.confirm("Are you sure you want to remove all technicians?")) {
                  technicians.forEach(t => deleteTechnician(t.id))
                }
              }} 
              className="w-fit cursor-pointer font-bold"
            >
              Clear All Technicians
            </Button>
          )}
          <Button onClick={() => setIsAddOpen(true)} className="w-fit cursor-pointer">
            <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
            Onboard Technician
          </Button>
        </div>
      </div>

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

          const totalCommission = techBookings
            .filter(b => b.status === "Completed")
            .reduce((sum, b) => sum + (b.technicianCommission || 0), 0)

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
                    <span className="text-muted-foreground font-medium">Total:</span>
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
              <CardFooter className="pt-0 border-t border-border/40 py-2 flex justify-between gap-2 items-center">
                <div className="flex gap-2 flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(t)}
                    className="h-7 text-xs font-bold px-2.5 bg-background hover:bg-muted cursor-pointer flex-1"
                  >
                    Edit Profile
                  </Button>
                  {t.dueAmount > 0 && (currentRole === "Admin" || currentRole === "Manager") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSettleDues(t)}
                      className="h-7 text-xs font-bold px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 cursor-pointer flex-1"
                    >
                      Settle Dues
                    </Button>
                  )}
                </div>
                {currentRole === "Admin" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete profile for ${t.name}?`)) {
                        deleteTechnician(t.id)
                      }
                    }}
                    className="h-7 size-7 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold cursor-pointer"
                  >
                    ×
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

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
                    id="tech-mob"
                    placeholder="E.g., 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
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
                    id="edit-tech-mob"
                    placeholder="E.g., 9876543210"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
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
                    onChange={(e) => setEditStatus(e.target.value as any)}
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

    </div>
  )
}
