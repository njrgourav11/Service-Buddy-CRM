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

export function TechnicianModule() {
  const { technicians, bookings, addTechnician, updateTechnician, currentRole } = useCRM()
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  // Form State
  const [name, setName] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [skillsString, setSkillsString] = React.useState("AC, Electrical")
  const [status, setStatus] = React.useState<any>("Active")
  const [joiningDate, setJoiningDate] = React.useState(new Date().toISOString().split("T")[0])

  // Submit Technician Add
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Parse Skills comma-delimited
    const skills = skillsString.split(",").map(s => s.trim()).filter(Boolean)

    addTechnician({
      name,
      mobile,
      address,
      skills,
      status,
      joiningDate
    })

    // Reset Form
    setName("")
    setMobile("")
    setAddress("")
    setSkillsString("AC, Electrical")
    setStatus("Active")
    setIsAddOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Technician Management</h2>
          <p className="text-sm text-muted-foreground">Manage dispatch staff profiles, skills directories, active job workloads, and running commissions.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="w-fit">
          <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
          Onboard Technician
        </Button>
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
                    <div className="flex flex-col gap-0.5">
                      <CardTitle className="text-sm font-bold text-foreground">{t.name}</CardTitle>
                      <CardDescription className="text-[10px] tabular-nums font-semibold">{t.mobile}</CardDescription>
                    </div>
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

                <div className="flex flex-wrap gap-1 mt-3">
                  {t.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-[9px] font-semibold py-0 px-1 border border-border/50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="py-4 flex flex-col gap-3">
                {/* Job Stats Bar */}
                <div className="grid grid-cols-3 gap-2 text-center bg-muted/30 p-2 rounded-lg border border-border/40">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</span>
                    <span className="text-sm font-black tabular-nums">{totalJobs}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-x border-border/50">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">Done</span>
                    <span className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">{completedJobs}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider">Pending</span>
                    <span className="text-sm font-black tabular-nums text-amber-600 dark:text-amber-400">{pendingJobs}</span>
                  </div>
                </div>

                {/* Financial balances */}
                <div className="flex flex-col gap-2 text-xs font-semibold pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Historical Earnings:</span>
                    <span className="font-bold tabular-nums text-foreground">₹{completedEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Spare Commission Gain:</span>
                    <span className="font-bold tabular-nums text-foreground">₹{totalCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                    <span>Outstanding Dues (Due):</span>
                    <span className="font-black tabular-nums">₹{t.dueAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10">
                    <span>Salary Advance Balance:</span>
                    <span className="font-black tabular-nums">₹{t.advanceTaken}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 text-[10px] text-muted-foreground border-t border-border/40 py-2">
                Onboarded: {t.joiningDate}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Technician Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-2xl border-t bg-card">
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

    </div>
  )
}
