"use client"

import * as React from "react"
import { useCRM, Technician } from "@/context/crm-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
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
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PlusSignCircleIcon, 
  HelpCircleIcon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  MoreHorizontalCircle01Icon,
  SearchIcon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function TechnicianModule() {
  const { technicians, bookings, payouts, addPayout, addTechnician, updateTechnician, deleteTechnician, currentRole } = useCRM()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 8

  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isSettleOpen, setIsSettleOpen] = React.useState(false)
  const [selectedTech, setSelectedTech] = React.useState<Technician | null>(null)
  const [settleAmount, setSettleAmount] = React.useState("")

  // Tab switcher removed

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
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Invalid Mobile Number", { description: "Mobile number must be exactly 10 digits." })
      return
    }
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
    if (!/^\d{10}$/.test(editMobile)) {
      toast.error("Invalid Mobile Number", { description: "Mobile number must be exactly 10 digits." })
      return
    }
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

  // Daily log handlers removed

  // Filtered Technicians List
  const filteredTechnicians = React.useMemo(() => {
    return technicians.filter(t => {
      const matchesSearch = `${t.name} ${t.mobile} ${(t.skills || []).join(" ")}`.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [technicians, search, statusFilter])

  // Pagination calculations
  const totalPages = Math.ceil(filteredTechnicians.length / pageSize)
  const paginatedTechnicians = React.useMemo(() => {
    return filteredTechnicians.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filteredTechnicians, currentPage])

  // Filtered payout sum removed

  const filteredDuesSum = React.useMemo(() => {
    return filteredTechnicians.reduce((sum, t) => sum + t.dueAmount, 0)
  }, [filteredTechnicians])

  const filteredAdvancesSum = React.useMemo(() => {
    return filteredTechnicians.reduce((sum, t) => sum + t.advanceTaken, 0)
  }, [filteredTechnicians])

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Technician Management</h2>
          <p className="text-sm text-muted-foreground">Manage dispatch staff profiles, skills directories, active job workloads, and running commissions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
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
        </div>
      </div>
      <>
          {/* Technician Clickable Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Total Staff */}
            <Card 
              className={`border-border/60 cursor-pointer hover:shadow-md transition-all duration-200 ${statusFilter === "ALL" ? "ring-1 ring-primary bg-primary/5 border-primary/30" : ""}`}
              onClick={() => setStatusFilter("ALL")}
            >
              <CardHeader className="py-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Staff</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <CardTitle className="text-2xl font-bold tracking-tight tabular-nums">{technicians.length}</CardTitle>
                <span className="text-[10px] text-muted-foreground mt-1 block">All onboarded technicians</span>
              </CardContent>
            </Card>

            {/* Active Staff */}
            <Card 
              className={`border-border/60 cursor-pointer hover:shadow-md transition-all duration-200 ${statusFilter === "Active" ? "ring-1 ring-emerald-500 bg-emerald-500/5 border-emerald-500/30" : ""}`}
              onClick={() => setStatusFilter("Active")}
            >
              <CardHeader className="py-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active Staff</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                  {technicians.filter(t => t.status === "Active").length}
                </CardTitle>
                <span className="text-[10px] text-muted-foreground mt-1 block">Available for dispatch</span>
              </CardContent>
            </Card>

            {/* Total Outstanding Dues */}
            <Card className="border-border/60">
              <CardHeader className="py-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Filtered Outstanding Dues</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">
                  ₹{filteredDuesSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </CardTitle>
                <span className="text-[10px] text-muted-foreground mt-1 block">Unpaid commission balance</span>
              </CardContent>
            </Card>

            {/* Total Active Advances */}
            <Card className="border-border/60">
              <CardHeader className="py-3">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Filtered Running Advances</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-rose-600 dark:text-rose-400">
                  ₹{filteredAdvancesSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </CardTitle>
                <span className="text-[10px] text-muted-foreground mt-1 block">Active advance draw ledger</span>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel: Filters */}
          <Card className="border-border/60">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search technicians by name, mobile or skills..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Technician Table UI */}
          <Card className="border-border/60 overflow-hidden shadow-xs">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/60 border-b border-border/50">
                    <TableRow>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">ID</TableHead>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Technician Name</TableHead>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Mobile</TableHead>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Joining Date</TableHead>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Skills</TableHead>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Jobs (Comp/Pend)</TableHead>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Dues</TableHead>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Advances</TableHead>
                      <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Status</TableHead>
                      <TableHead className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTechnicians.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground font-medium">
                          No technicians match the query.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTechnicians.map((t) => {
                        const techBookings = bookings.filter(b => 
                          (b.assignedTechnicianId || "").split(",").map(id => id.trim()).includes(t.id)
                        )
                        const completedJobs = techBookings.filter(b => b.status === "Completed" || b.status === "Inspected").length
                        const pendingJobs = techBookings.filter(b => b.status === "In Progress" || b.status === "Not Started").length

                        return (
                          <TableRow key={t.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{t.id}</TableCell>
                            <TableCell className="px-4 py-4 font-semibold text-xs text-foreground">
                              <div className="flex items-center gap-2.5">
                                <div className="size-8 bg-primary/10 text-primary border border-primary/20 text-[10px] font-black rounded-lg flex items-center justify-center">
                                  {t.name.split(" ").map(w => w.charAt(0)).join("")}
                                </div>
                                <span className="font-semibold text-foreground text-xs">{t.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{t.mobile}</TableCell>
                            <TableCell className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{t.joiningDate}</TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex flex-wrap gap-1 max-w-[160px]">
                                {t.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-[9px] font-semibold py-0 px-1 bg-muted/40">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center text-xs font-bold text-foreground tabular-nums">
                              {completedJobs} / {pendingJobs}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                              ₹{t.dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                              ₹{t.advanceTaken.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
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
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 cursor-pointer"
                                  >
                                    <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36">
                                  <DropdownMenuItem onClick={() => handleOpenEdit(t)} className="cursor-pointer">
                                    Edit Profile
                                  </DropdownMenuItem>
                                  {t.dueAmount > 0 && (currentRole === "Admin" || currentRole === "Manager") && (
                                    <DropdownMenuItem onClick={() => handleOpenSettle(t)} className="cursor-pointer">
                                      Settle Dues
                                    </DropdownMenuItem>
                                  )}
                                  {currentRole === "Admin" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          if (window.confirm(`Are you sure you want to delete profile for ${t.name}?`)) {
                                            deleteTechnician(t.id)
                                          }
                                        }}
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-semibold"
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3.5 border-t border-border/40 bg-muted/20">
                <span className="text-xs text-muted-foreground">
                  Showing {Math.min(filteredTechnicians.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredTechnicians.length, currentPage * pageSize)} of {filteredTechnicians.length} technicians
                </span>
                <div className="flex items-center gap-2.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="h-7 text-xs px-2 bg-background shadow-xs hover:bg-muted cursor-pointer"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 text-xs p-0 cursor-pointer ${currentPage === page ? "pointer-events-none" : "bg-background hover:bg-muted"}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="h-7 text-xs px-2 bg-background shadow-xs hover:bg-muted cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>

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
