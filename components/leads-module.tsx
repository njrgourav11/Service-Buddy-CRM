"use client"

import * as React from "react"
import { useCRM, Lead } from "@/context/crm-context"
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
  Loading03Icon,
  Menu01Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function LeadsModule() {
  const { leads, technicians, addLead, updateLead, deleteLead, convertLeadToBooking, currentRole } = useCRM()
  
  // State managers
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  
  // Add modal state
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)

  // Edit Form State
  const [editName, setEditName] = React.useState("")
  const [editMobile, setEditMobile] = React.useState("")
  const [editAddress, setEditAddress] = React.useState("")
  const [editSource, setEditSource] = React.useState<any>("Ad")
  const [editAppliance, setEditAppliance] = React.useState("AC")
  const [editRequirement, setEditRequirement] = React.useState("")
  const [editAssignedTo, setEditAssignedTo] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<any>("New")

  // Open Edit Drawer
  const handleOpenEdit = (l: Lead) => {
    setSelectedLead(l)
    setEditName(l.name)
    setEditMobile(l.mobile)
    setEditAddress(l.address)
    setEditSource(l.source)
    setEditAppliance(l.appliance)
    setEditRequirement(l.requirement)
    setEditAssignedTo(l.assignedTo)
    setEditStatus(l.status)
    setIsEditOpen(true)
  }

  // Submit Edit Lead
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return

    updateLead(selectedLead.id, {
      name: editName,
      mobile: editMobile,
      address: editAddress,
      source: editSource,
      appliance: editAppliance,
      requirement: editRequirement,
      assignedTo: editAssignedTo,
      status: editStatus
    })

    setIsEditOpen(false)
  }
  
  // Conversion state
  const [isConvertOpen, setIsConvertOpen] = React.useState(false)
  const [activeLead, setActiveLead] = React.useState<Lead | null>(null)
  const [convertTechId, setConvertTechId] = React.useState("")
  const [convertCharge, setConvertCharge] = React.useState(500)

  // Form State
  const [name, setName] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [source, setSource] = React.useState<any>("Ad")
  const [appliance, setAppliance] = React.useState("AC")
  const [requirement, setRequirement] = React.useState("")
  const [assignedTo, setAssignedTo] = React.useState("")

  // Filtered list
  const filteredLeads = leads.filter(l => {
    const searchString = `${l.id} ${l.name} ${l.mobile} ${l.requirement}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Submit Lead
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addLead({
      name,
      mobile,
      address,
      source,
      appliance,
      requirement,
      assignedTo: assignedTo || "Manager",
      status: "New"
    })

    // Reset Form
    setName("")
    setMobile("")
    setAddress("")
    setSource("Ad")
    setAppliance("AC")
    setRequirement("")
    setAssignedTo("")
    setIsAddOpen(false)
  }

  // Handle Convert Lead Confirm
  const handleConvertConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLead) return
    if (!convertTechId) {
      toast.error("Please select a dispatch technician.")
      return
    }

    convertLeadToBooking(activeLead.id, convertTechId, convertCharge)
    setIsConvertOpen(false)
    setActiveLead(null)
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Lead Management Board</h2>
          <p className="text-sm text-muted-foreground">Track pre-sales customer inquiries, identify high-converting ad networks, and dispatch jobs instantly.</p>
        </div>
        {(currentRole === "Admin" || currentRole === "Manager") && (
          <Button onClick={() => setIsAddOpen(true)} className="w-fit">
            <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
            Capture New Lead
          </Button>
        )}
      </div>

      {/* Control Panel: Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search leads by name, phone or requirements..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Inquiries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Inquiries</SelectItem>
                <SelectItem value="New">New Inquiries</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Converted">Converted to Jobs</SelectItem>
                <SelectItem value="Lost">Lost Deals</SelectItem>
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
                  <th className="px-4 py-3">Lead ID</th>
                  <th className="px-4 py-3">Lead Name</th>
                  <th className="px-4 py-3">Mobile Phone</th>
                  <th className="px-4 py-3">Source Channel</th>
                  <th className="px-4 py-3">Request Details</th>
                  <th className="px-4 py-3">Assigned Agent</th>
                  <th className="px-4 py-3">Lead Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground font-medium">
                      No customer leads captured yet.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{l.id}</td>
                      <td className="px-4 py-4 font-semibold text-xs text-foreground">{l.name}</td>
                      <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{l.mobile}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="text-[10px] font-semibold">{l.source}</Badge>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-foreground font-medium truncate">{l.requirement}</span>
                          <span className="text-[9px] text-muted-foreground">Appliance: {l.appliance} • Address: {l.address}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-foreground">{l.assignedTo}</td>
                      <td className="px-4 py-4">
                        <Badge 
                          variant="outline"
                          className={`text-[9px] font-bold py-0.5 px-1.5 ${
                            l.status === "Converted" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                              : l.status === "Lost" 
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                              : l.status === "In Progress"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse"
                          }`}
                        >
                          {l.status === "Converted" ? (
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2.5} className="size-3" />
                          ) : (
                            <HugeiconsIcon icon={Loading03Icon} strokeWidth={2.5} className="size-3" />
                          )}
                          {l.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {l.status !== "Converted" && l.status !== "Lost" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setActiveLead(l)
                                setIsConvertOpen(true)
                              }}
                              className="h-7 text-xs font-semibold px-2"
                            >
                              <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
                              Convert to Job
                            </Button>
                          )}
                          {(currentRole === "Admin" || currentRole === "Manager") && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenEdit(l)}
                              className="h-7 text-xs font-semibold px-2 bg-background hover:bg-muted"
                            >
                              Edit
                            </Button>
                          )}
                          {currentRole === "Admin" && (
                            <Button 
                              variant="ghost" 
                              onClick={() => deleteLead(l.id)}
                              className="h-7 size-7 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lead Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Capture New Customer Lead</DrawerTitle>
              <DrawerDescription className="text-xs">
                Capture organic inquiries or advertisement referrals. Auto logs profiles for follow-up workflows.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-name" className="text-xs font-bold text-muted-foreground">Lead Customer Name</Label>
                  <Input 
                    id="lead-name"
                    placeholder="E.g., Anil Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-phone" className="text-xs font-bold text-muted-foreground">Mobile Phone Number</Label>
                  <Input 
                    id="lead-phone"
                    placeholder="E.g., 9555112233"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-address" className="text-xs font-bold text-muted-foreground">Customer Location / Address</Label>
                  <Input 
                    id="lead-address"
                    placeholder="Flat/Villa, Sector, Gurugram"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Lead Source */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lead-source" className="text-xs font-bold text-muted-foreground">Acquisition Channel</Label>
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger id="lead-source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ad">Ad</SelectItem>
                        <SelectItem value="Contact">Contact</SelectItem>
                        <SelectItem value="Repeat Consumer">Repeat Consumer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Appliance */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lead-appliance" className="text-xs font-bold text-muted-foreground">Appliance Type</Label>
                    <Input 
                      id="lead-appliance"
                      placeholder="E.g., AC, TV, Refrigerator"
                      value={appliance}
                      onChange={(e) => setAppliance(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Requirement Description */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-req" className="text-xs font-bold text-muted-foreground">Client Requirements</Label>
                  <Input 
                    id="lead-req"
                    placeholder="E.g., Complete installation or regular AMC service"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    required
                  />
                </div>

                {/* Assigned To staff */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-agent" className="text-xs font-bold text-muted-foreground">Assigned Sales Agent</Label>
                  <Input 
                    id="lead-agent"
                    placeholder="E.g., Megha Manager"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Register Inquiry</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Entry</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* ==========================================
          CONVERSION DIALOG
         ========================================== */}
      <Drawer open={isConvertOpen} onOpenChange={setIsConvertOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleConvertConfirm} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Convert Lead to Work Order</DrawerTitle>
              <DrawerDescription className="text-xs">
                This will automatically onboard a new Customer File, trigger a live Service Booking, and dispatch the technician.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-sm max-w-lg mx-auto w-full">
              
              {activeLead && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col gap-1.5 text-xs">
                  <span className="font-bold text-foreground">Lead Profile Details</span>
                  <span>Name: {activeLead.name}</span>
                  <span>Mobile: {activeLead.mobile}</span>
                  <span>Appliance Request: {activeLead.appliance}</span>
                  <span>Issue Description: {activeLead.requirement}</span>
                </div>
              )}

              {/* Select technician */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="convert-tech" className="text-xs font-bold text-muted-foreground">Dispatch Assigned Technician</Label>
                <Select value={convertTechId} onValueChange={setConvertTechId}>
                  <SelectTrigger id="convert-tech">
                    <SelectValue placeholder="Select Technician..." />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.skills.join(", ")})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service charge */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="convert-charge" className="text-xs font-bold text-muted-foreground">Service Charge (W)</Label>
                <Input 
                  type="number"
                  id="convert-charge"
                  min="0"
                  value={convertCharge}
                  onChange={(e) => setConvertCharge(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3 max-w-lg mx-auto w-full">
              <Button type="submit" className="flex-1">Confirm Conversion</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Cancel Conversion</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Lead Edit Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Customer Lead Details</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify details of lead inquiry or advertisement referrals.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-name" className="text-xs font-bold text-muted-foreground">Lead Customer Name</Label>
                  <Input 
                    id="edit-lead-name"
                    placeholder="E.g., Anil Kumar"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-phone" className="text-xs font-bold text-muted-foreground">Mobile Phone Number</Label>
                  <Input 
                    id="edit-lead-phone"
                    placeholder="E.g., 9555112233"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    required
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-address" className="text-xs font-bold text-muted-foreground">Customer Location / Address</Label>
                  <Input 
                    id="edit-lead-address"
                    placeholder="Flat/Villa, Sector, Gurugram"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Lead Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-status" className="text-xs font-bold text-muted-foreground">Lead Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="edit-lead-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New Inquiries</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Converted">Converted to Jobs</SelectItem>
                      <SelectItem value="Lost">Lost Deals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Lead Source */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-lead-source" className="text-xs font-bold text-muted-foreground">Acquisition Channel</Label>
                    <Select value={editSource} onValueChange={setEditSource}>
                      <SelectTrigger id="edit-lead-source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ad">Ad</SelectItem>
                        <SelectItem value="Contact">Contact</SelectItem>
                        <SelectItem value="Repeat Consumer">Repeat Consumer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Appliance */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-lead-appliance" className="text-xs font-bold text-muted-foreground">Appliance Type</Label>
                    <Input 
                      id="edit-lead-appliance"
                      placeholder="E.g., AC, TV, Refrigerator"
                      value={editAppliance}
                      onChange={(e) => setEditAppliance(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Requirement Description */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-req" className="text-xs font-bold text-muted-foreground">Client Requirements</Label>
                  <Input 
                    id="edit-lead-req"
                    placeholder="E.g., Complete installation or regular AMC service"
                    value={editRequirement}
                    onChange={(e) => setEditRequirement(e.target.value)}
                    required
                  />
                </div>

                {/* Assigned To staff */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-agent" className="text-xs font-bold text-muted-foreground">Assigned Sales Agent</Label>
                  <Input 
                    id="edit-lead-agent"
                    placeholder="E.g., Megha Manager"
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3 max-w-lg mx-auto w-full">
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
