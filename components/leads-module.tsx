"use client"

import * as React from "react"
import { useCRM, Lead } from "@/context/crm-context"
import { APPLIANCE_OPTIONS } from "./booking-module"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PlusSignCircleIcon, 
  SearchIcon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  Menu01Icon,
  MoreHorizontalCircle01Icon,
  Cancel01Icon,
  Delete02Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function LeadsModule() {
  const { leads, technicians, addLead, updateLead, deleteLead, convertLeadToBooking, currentRole, customers } = useCRM()
  
  // State managers
  const [search, setSearch] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [dateFilterType, setDateFilterType] = React.useState<"ALL" | "today" | "yesterday" | "this-week" | "this-month" | "previous-month" | "custom">("this-month")
  const [startDateFilter, setStartDateFilter] = React.useState("")
  const [endDateFilter, setEndDateFilter] = React.useState("")
  
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
  const [editCustomAppliance, setEditCustomAppliance] = React.useState("")
  const [editRequirement, setEditRequirement] = React.useState("")
  const [editAssignedTo, setEditAssignedTo] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<any>("New")
  const [editCustomerNotes, setEditCustomerNotes] = React.useState("")
  const [editStaffNotes, setEditStaffNotes] = React.useState("")

  // Customer Linking States
  const [linkCustomer, setLinkCustomer] = React.useState(false)
  const [customerId, setCustomerId] = React.useState("")
  const [editLinkCustomer, setEditLinkCustomer] = React.useState(false)
  const [editCustomerId, setEditCustomerId] = React.useState("")
  const [customerSearch, setCustomerSearch] = React.useState("")
  const [editCustomerSearch, setEditCustomerSearch] = React.useState("")

  // Open Edit Drawer
  const handleOpenEdit = (l: Lead) => {
    setSelectedLead(l)
    setEditName(l.name)
    setEditMobile(l.mobile)
    setEditAddress(l.address)
    setEditSource(l.source)
    if (APPLIANCE_OPTIONS.filter(o => o !== "Other").includes(l.appliance)) {
      setEditAppliance(l.appliance)
      setEditCustomAppliance("")
    } else {
      setEditAppliance("Other")
      setEditCustomAppliance(l.appliance)
    }
    setEditRequirement(l.requirement)
    setEditAssignedTo(l.assignedTo)
    setEditStatus(l.status)
    setEditCustomerNotes(l.customerNotes || "")
    setEditStaffNotes(l.staffNotes || "")
    setEditCustomerId(l.customerId || "")
    setEditLinkCustomer(!!l.customerId)
    setIsEditOpen(true)
  }

  // Submit Edit Lead
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return
    if (!editLinkCustomer && !/^\d{10}$/.test(editMobile)) {
      setEditMobileError("Mobile number must be exactly 10 digits.")
      toast.error("Invalid Mobile Number", { description: "Mobile number must be exactly 10 digits." })
      return
    }
    setEditMobileError("")

    const finalAppliance = editAppliance === "Other" ? (editCustomAppliance.trim() || "Other") : editAppliance

    updateLead(selectedLead.id, {
      name: editName,
      mobile: editMobile,
      address: editAddress,
      source: editSource,
      appliance: finalAppliance,
      requirement: editRequirement,
      assignedTo: editAssignedTo,
      status: editStatus,
      customerNotes: editCustomerNotes,
      staffNotes: editStaffNotes,
      customerId: editLinkCustomer ? editCustomerId : undefined
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
  const [customAppliance, setCustomAppliance] = React.useState("")
  const [requirement, setRequirement] = React.useState("")
  const [assignedTo, setAssignedTo] = React.useState("")
  const [customerNotes, setCustomerNotes] = React.useState("")
  const [staffNotes, setStaffNotes] = React.useState("")

  const [mobileError, setMobileError] = React.useState("")
  const [editMobileError, setEditMobileError] = React.useState("")

  // Reset errors
  React.useEffect(() => {
    if (!isAddOpen) setMobileError("")
  }, [isAddOpen])

  React.useEffect(() => {
    if (!isEditOpen) setEditMobileError("")
  }, [isEditOpen])

  // Filtered list
  const filteredLeads = leads.filter(l => {
    const searchString = `${l.id} ${l.name} ${l.mobile} ${l.requirement}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter

    // Date filtering logic
    let matchesDate = true
    const targetDate = l.createdAt || ""
    if (dateFilterType === "today") {
      const todayStr = new Date().toISOString().split("T")[0]
      matchesDate = targetDate === todayStr
    } else if (dateFilterType === "yesterday") {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]
      matchesDate = targetDate === yesterdayStr
    } else if (dateFilterType === "this-week") {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
      const startStr = startOfWeek.toISOString().split("T")[0]
      matchesDate = targetDate >= startStr
    } else if (dateFilterType === "this-month") {
      const todayStr = new Date().toISOString().split("T")[0]
      const currentMonthPrefix = todayStr.substring(0, 7) // YYYY-MM
      matchesDate = targetDate.startsWith(currentMonthPrefix)
    } else if (dateFilterType === "previous-month") {
      const now = new Date()
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const year = prevMonth.getFullYear()
      const month = String(prevMonth.getMonth() + 1).padStart(2, '0')
      const prevMonthPrefix = `${year}-${month}`
      matchesDate = targetDate.startsWith(prevMonthPrefix)
    } else if (dateFilterType === "custom") {
      matchesDate = targetDate >= startDateFilter && targetDate <= endDateFilter
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Bulk Delete
  const handleBulkDelete = () => {
    if (window.confirm(`⚠️ WARNING: This action is irreversible. Are you sure you want to delete the ${selectedIds.length} selected leads?`)) {
      selectedIds.forEach(id => deleteLead(id))
      setSelectedIds([])
      toast.success(`Deleted ${selectedIds.length} leads.`)
    }
  }

  // Submit Lead
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkCustomer && !/^\d{10}$/.test(mobile)) {
      setMobileError("Mobile number must be exactly 10 digits.")
      toast.error("Invalid Mobile Number", { description: "Mobile number must be exactly 10 digits." })
      return
    }
    setMobileError("")
    
    const finalAppliance = appliance === "Other" ? (customAppliance.trim() || "Other") : appliance

    addLead({
      name,
      mobile,
      address,
      source,
      appliance: finalAppliance,
      requirement,
      assignedTo: assignedTo || "Manager",
      status: "New",
      customerNotes,
      staffNotes,
      customerId: linkCustomer ? customerId : undefined
    })

    // Reset Form
    setName("")
    setMobile("")
    setAddress("")
    setSource("Ad")
    setAppliance("AC")
    setCustomAppliance("")
    setRequirement("")
    setAssignedTo("")
    setCustomerNotes("")
    setStaffNotes("")
    setLinkCustomer(false)
    setCustomerId("")
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
                className="h-8 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
            
            {/* Date Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Select value={dateFilterType} onValueChange={(val: any) => {
                setDateFilterType(val)
                if (val !== "custom") {
                  setStartDateFilter("")
                  setEndDateFilter("")
                }
              }}>
                <SelectTrigger className="w-28 md:w-32 h-8 text-xs bg-background">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="previous-month">Previous Month</SelectItem>
                  <SelectItem value="custom">Custom Range...</SelectItem>
                </SelectContent>
              </Select>

              {dateFilterType === "custom" && (
                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                  <Input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="h-8 text-xs w-32 bg-background"
                  />
                  <span className="text-muted-foreground text-xs font-medium">to</span>
                  <Input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="h-8 text-xs w-32 bg-background"
                  />
                </div>
              )}
            </div>

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
                  <th className="px-4 py-3 w-10 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded-sm border-primary text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-primary"
                      checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={(evt) => {
                        if (evt.target.checked) {
                          setSelectedIds(filteredLeads.map(x => x.id))
                        } else {
                          setSelectedIds([])
                        }
                      }}
                    />
                  </th>
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
                    <td colSpan={9} className="text-center py-12 text-muted-foreground font-medium">
                      No customer leads captured yet.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 w-10 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded-sm border-primary text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-primary"
                          checked={selectedIds.includes(l.id)}
                          onChange={(evt) => {
                            if (evt.target.checked) {
                              setSelectedIds(prev => [...prev, l.id])
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== l.id))
                            }
                          }}
                        />
                      </td>
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
                          {l.customerNotes && (
                            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold truncate" title={l.customerNotes}>Cust: {l.customerNotes}</span>
                          )}
                          {l.staffNotes && (
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold truncate" title={l.staffNotes}>Staff: {l.staffNotes}</span>
                          )}
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
                            {(currentRole === "Admin" || currentRole === "Manager") && (
                              <DropdownMenuItem onClick={() => handleOpenEdit(l)} className="cursor-pointer">
                                Edit
                              </DropdownMenuItem>
                            )}
                            {l.status !== "Converted" && l.status !== "Lost" && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setActiveLead(l)
                                  setIsConvertOpen(true)
                                }}
                                className="cursor-pointer"
                              >
                                Convert to Job
                              </DropdownMenuItem>
                            )}
                            {currentRole === "Admin" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this lead?")) {
                                      deleteLead(l.id)
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
                
                {/* Link Customer Toggle */}
                <div className="flex items-center gap-2 mb-2 p-1 bg-muted/30 rounded-lg">
                  <input
                    type="checkbox"
                    id="link-customer-checkbox"
                    checked={linkCustomer}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setLinkCustomer(checked)
                      if (!checked) {
                        setCustomerId("")
                        setName("")
                        setMobile("")
                        setAddress("")
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="link-customer-checkbox" className="text-xs font-bold text-foreground cursor-pointer">
                    Link to Registered Customer (Optional)
                  </Label>
                </div>

                {linkCustomer && (
                  <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-primary/20 bg-primary/5 mb-2 animate-in fade-in duration-200">
                    <Label className="text-xs font-bold text-primary">Search & Select Customer</Label>
                    {customerId ? (
                      /* Selected Customer Card */
                      (() => {
                        const sel = customers.find(c => c.id === customerId)
                        return sel ? (
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-primary/30 bg-primary/10">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-7 rounded-md bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">
                                {sel.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col gap-0 min-w-0">
                                <span className="text-xs font-bold text-foreground truncate">{sel.name}</span>
                                <span className="text-[10px] text-muted-foreground">{sel.mobile} • {sel.id}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setCustomerId(""); setCustomerSearch(""); setName(""); setMobile(""); setAddress("") }}
                              className="shrink-0 size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Deselect customer"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
                            </button>
                          </div>
                        ) : null
                      })()
                    ) : (
                      <>
                        <Input 
                          placeholder="Search by name or phone..." 
                          value={customerSearch} 
                          onChange={(e) => setCustomerSearch(e.target.value)} 
                          className="bg-background h-8 text-xs"
                          autoFocus
                        />
                        <div className="border border-border/60 rounded-lg max-h-48 overflow-y-auto bg-muted/10 divide-y divide-border/40">
                          {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.mobile.includes(customerSearch)).length === 0 ? (
                            <div className="p-3 text-xs text-muted-foreground text-center">No customers match "{customerSearch}"</div>
                          ) : (
                            customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.mobile.includes(customerSearch)).map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => { setCustomerId(c.id); setName(c.name); setMobile(c.mobile); setAddress(c.address); setCustomerSearch("") }}
                                className="w-full text-left p-2.5 text-xs flex items-center justify-between transition-colors hover:bg-muted/50 text-foreground"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <div className="font-semibold flex items-center gap-1.5 text-foreground">
                                    <span>{c.name}</span>
                                    <span className="text-[10px] text-muted-foreground">({c.id})</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                    <span>{c.mobile}</span>
                                    <span className="text-border">•</span>
                                    <span className="truncate max-w-[200px]">{c.address}</span>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-name" className="text-xs font-bold text-muted-foreground">Lead Customer Name</Label>
                  <Input 
                    id="lead-name"
                    placeholder="E.g., Anil Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={linkCustomer}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-phone" className="text-xs font-bold text-muted-foreground">Mobile Phone Number</Label>
                  <Input 
                    id="lead-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="E.g., 9555112233"
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setMobile(val)
                      if (mobileError && /^\d{10}$/.test(val)) setMobileError("")
                    }}
                    className={mobileError ? "border-destructive focus-visible:ring-destructive" : ""}
                    required
                    disabled={linkCustomer}
                  />
                  {mobileError && (
                    <span className="text-[10px] text-destructive font-semibold">{mobileError}</span>
                  )}
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
                    disabled={linkCustomer}
                  />
                </div>

                {/* Customer Notes */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-customer-notes" className="text-xs font-bold text-muted-foreground">Customer Notes</Label>
                  <Textarea 
                    id="lead-customer-notes"
                    placeholder="E.g., Prefers calls after 4 PM, requested double check on pricing"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Appliance */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lead-appliance" className="text-xs font-bold text-muted-foreground">Appliance Type</Label>
                    <Select value={appliance} onValueChange={setAppliance}>
                      <SelectTrigger id="lead-appliance" className="bg-background text-xs h-9 border-border/60">
                        <SelectValue placeholder="Select Appliance Type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLIANCE_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {appliance === "Other" && (
                      <Input
                        placeholder="Custom Appliance Name"
                        value={customAppliance}
                        onChange={(e) => setCustomAppliance(e.target.value)}
                        className="bg-background text-xs h-9 border-border/60 mt-1.5"
                        required
                      />
                    )}
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

                {/* Staff Notes */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lead-staff-notes" className="text-xs font-bold text-muted-foreground">Internal Staff Notes</Label>
                  <Textarea 
                    id="lead-staff-notes"
                    placeholder="E.g., High probability deal, follow up on Tuesday"
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
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
                
                {/* Link Customer Toggle */}
                <div className="flex items-center gap-2 mb-2 p-1 bg-muted/30 rounded-lg">
                  <input
                    type="checkbox"
                    id="edit-link-customer-checkbox"
                    checked={editLinkCustomer}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setEditLinkCustomer(checked)
                      if (!checked) {
                        setEditCustomerId("")
                        setEditName("")
                        setEditMobile("")
                        setEditAddress("")
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="edit-link-customer-checkbox" className="text-xs font-bold text-foreground cursor-pointer">
                    Link to Registered Customer (Optional)
                  </Label>
                </div>

                {editLinkCustomer && (
                  <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-primary/20 bg-primary/5 mb-2 animate-in fade-in duration-200">
                    <Label className="text-xs font-bold text-primary">Search & Select Customer</Label>
                    {editCustomerId ? (
                      (() => {
                        const sel = customers.find(c => c.id === editCustomerId)
                        return sel ? (
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-primary/30 bg-primary/10">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-7 rounded-md bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">
                                {sel.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col gap-0 min-w-0">
                                <span className="text-xs font-bold text-foreground truncate">{sel.name}</span>
                                <span className="text-[10px] text-muted-foreground">{sel.mobile} • {sel.id}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setEditCustomerId(""); setEditCustomerSearch(""); setEditName(""); setEditMobile(""); setEditAddress("") }}
                              className="shrink-0 size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Deselect customer"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
                            </button>
                          </div>
                        ) : null
                      })()
                    ) : (
                      <>
                        <Input 
                          placeholder="Search by name or phone..." 
                          value={editCustomerSearch} 
                          onChange={(e) => setEditCustomerSearch(e.target.value)} 
                          className="bg-background h-8 text-xs"
                          autoFocus
                        />
                        <div className="border border-border/60 rounded-lg max-h-48 overflow-y-auto bg-muted/10 divide-y divide-border/40">
                          {customers.filter(c => c.name.toLowerCase().includes(editCustomerSearch.toLowerCase()) || c.mobile.includes(editCustomerSearch)).length === 0 ? (
                            <div className="p-3 text-xs text-muted-foreground text-center">No customers match "{editCustomerSearch}"</div>
                          ) : (
                            customers.filter(c => c.name.toLowerCase().includes(editCustomerSearch.toLowerCase()) || c.mobile.includes(editCustomerSearch)).map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => { setEditCustomerId(c.id); setEditName(c.name); setEditMobile(c.mobile); setEditAddress(c.address); setEditCustomerSearch("") }}
                                className="w-full text-left p-2.5 text-xs flex items-center justify-between transition-colors hover:bg-muted/50 text-foreground"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <div className="font-semibold flex items-center gap-1.5 text-foreground">
                                    <span>{c.name}</span>
                                    <span className="text-[10px] text-muted-foreground">({c.id})</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                    <span>{c.mobile}</span>
                                    <span className="text-border">•</span>
                                    <span className="truncate max-w-[200px]">{c.address}</span>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-name" className="text-xs font-bold text-muted-foreground">Lead Customer Name</Label>
                  <Input 
                    id="edit-lead-name"
                    placeholder="E.g., Anil Kumar"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    disabled={editLinkCustomer}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-phone" className="text-xs font-bold text-muted-foreground">Mobile Phone Number</Label>
                  <Input 
                    id="edit-lead-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="E.g., 9899001122"
                    value={editMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setEditMobile(val)
                      if (editMobileError && /^\d{10}$/.test(val)) setEditMobileError("")
                    }}
                    className={editMobileError ? "border-destructive focus-visible:ring-destructive" : ""}
                    required
                    disabled={editLinkCustomer}
                  />
                  {editMobileError && (
                    <span className="text-[10px] text-destructive font-semibold">{editMobileError}</span>
                  )}
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
                    disabled={editLinkCustomer}
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

                {/* Customer Notes */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-customer-notes" className="text-xs font-bold text-muted-foreground">Customer Notes</Label>
                  <Textarea 
                    id="edit-lead-customer-notes"
                    placeholder="E.g., Prefers calls after 4 PM, requested double check on pricing"
                    value={editCustomerNotes}
                    onChange={(e) => setEditCustomerNotes(e.target.value)}
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Appliance */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-lead-appliance" className="text-xs font-bold text-muted-foreground">Appliance Type</Label>
                    <Select value={editAppliance} onValueChange={setEditAppliance}>
                      <SelectTrigger id="edit-lead-appliance" className="bg-background text-xs h-9 border-border/60">
                        <SelectValue placeholder="Select Appliance Type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLIANCE_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editAppliance === "Other" && (
                      <Input
                        placeholder="Custom Appliance Name"
                        value={editCustomAppliance}
                        onChange={(e) => setEditCustomAppliance(e.target.value)}
                        className="bg-background text-xs h-9 border-border/60 mt-1.5"
                        required
                      />
                    )}
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

                {/* Staff Notes */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lead-staff-notes" className="text-xs font-bold text-muted-foreground">Internal Staff Notes</Label>
                  <Textarea 
                    id="edit-lead-staff-notes"
                    placeholder="E.g., High probability deal, follow up on Tuesday"
                    value={editStaffNotes}
                    onChange={(e) => setEditStaffNotes(e.target.value)}
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
