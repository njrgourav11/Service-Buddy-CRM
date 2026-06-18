"use client"

import * as React from "react"
import { useCRM, Booking, Customer } from "@/context/crm-context"
import { APPLIANCE_OPTIONS } from "./booking-module"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
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
  Alert02Icon,
  Cancel01Icon,
  HelpCircleIcon,
  MoreHorizontalCircle01Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

export function ComplaintsModule() {
  const { bookings, customers, technicians, updateBooking, addCustomer, addBooking, currentRole } = useCRM()

  // State managers
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(8)

  // Raise/Log Complaint State
  const [isLogOpen, setIsLogOpen] = React.useState(false)
  const [selectedBookingId, setSelectedBookingId] = React.useState("")
  const [bookingSearch, setBookingSearch] = React.useState("")
  const [logComplaintText, setLogComplaintText] = React.useState("")
  const [logComplaintNotes, setLogComplaintNotes] = React.useState("")
  const [logComplaintDate, setLogComplaintDate] = React.useState(new Date().toISOString().split("T")[0])
  const [logComplaintStatus, setLogComplaintStatus] = React.useState<any>("Open")

  // Custom Complaint Mode State
  const [logMode, setLogMode] = React.useState<"link" | "custom">("link")
  const [customCustomerMode, setCustomCustomerMode] = React.useState<"registered" | "new">("registered")
  const [customCustomerId, setCustomCustomerId] = React.useState("")
  const [customerSearch, setCustomerSearch] = React.useState("")
  const [newCustName, setNewCustName] = React.useState("")
  const [newCustMobile, setNewCustMobile] = React.useState("")
  const [newCustAddress, setNewCustAddress] = React.useState("")
  const [newCustReferral, setNewCustReferral] = React.useState<any>("Ad")
  const [customAppliance, setCustomAppliance] = React.useState("General")
  const [customApplianceText, setCustomApplianceText] = React.useState("")
  const [customTechId, setCustomTechId] = React.useState("")
  const [customServiceCharge, setCustomServiceCharge] = React.useState(0)

  // Edit Complaint State
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedBookingForEdit, setSelectedBookingForEdit] = React.useState<Booking | null>(null)
  const [editComplaintText, setEditComplaintText] = React.useState("")
  const [editComplaintNotes, setEditComplaintNotes] = React.useState("")
  const [editComplaintDate, setEditComplaintDate] = React.useState("")
  const [editComplaintStatus, setEditComplaintStatus] = React.useState<any>("Open")
  
  // Technician assignments in complaints
  const [logTechId, setLogTechId] = React.useState("")
  const [editTechId, setEditTechId] = React.useState("")

  // Sync selected booking technician to logTechId
  React.useEffect(() => {
    if (selectedBookingId) {
      const b = bookings.find(x => x.id === selectedBookingId)
      if (b) {
        setLogTechId(b.assignedTechnicianId || "")
      }
    } else {
      setLogTechId("")
    }
  }, [selectedBookingId, bookings])

  // Reset page index when search or status filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  // Get bookings that have complaints
  const bookingsWithComplaints = React.useMemo(() => {
    return bookings.filter(b => !!b.complaint)
  }, [bookings])

  // Filtered complaints list
  const filteredComplaints = React.useMemo(() => {
    return bookingsWithComplaints.filter(b => {
      const cust = customers.find(c => c.id === b.customerId)
      const searchString = `${b.id} ${b.complaint || ""} ${cust?.name || ""} ${cust?.mobile || ""} ${b.appliance}`.toLowerCase()
      const matchesSearch = searchString.includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === "ALL" || b.complaintStatus === statusFilter
      return matchesSearch && matchesStatus
    }).sort((a, b) => (b.complaintDate || "").localeCompare(a.complaintDate || ""))
  }, [bookingsWithComplaints, customers, search, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / pageSize)
  const paginatedComplaints = React.useMemo(() => {
    return filteredComplaints.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filteredComplaints, currentPage, pageSize])

  // Bookings filter for adding complaints
  const availableBookingsForComplaint = React.useMemo(() => {
    return bookings.filter(b => {
      const cust = customers.find(c => c.id === b.customerId)
      const searchStr = `${b.id} ${b.appliance} ${cust?.name || ""} ${cust?.mobile || ""}`.toLowerCase()
      const matchesSearch = searchStr.includes(bookingSearch.toLowerCase())
      return matchesSearch
    })
  }, [bookings, customers, bookingSearch])

  // Customers filter for adding custom complaints
  const filteredCustomersForComplaint = React.useMemo(() => {
    return customers.filter(c => {
      const searchStr = `${c.id} ${c.name} ${c.mobile} ${c.address}`.toLowerCase()
      return searchStr.includes(customerSearch.toLowerCase())
    })
  }, [customers, customerSearch])

  // Submit new complaint
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (logMode === "link") {
      if (!selectedBookingId) {
        toast.error("Please select a booking to raise a complaint against.")
        return
      }
      if (!logComplaintText.trim()) {
        toast.error("Please enter complaint details.")
        return
      }

      updateBooking(selectedBookingId, {
        complaint: logComplaintText,
        complaintDate: logComplaintDate,
        complaintStatus: logComplaintStatus,
        assignedTechnicianId: logTechId !== "none" ? logTechId : "",
        notes: logComplaintNotes || undefined
      })
      toast.success("Complaint logged against booking successfully.")
    } else {
      // Custom Complaint Mode
      if (!logComplaintText.trim()) {
        toast.error("Please enter complaint details.")
        return
      }

      let customerId = ""
      if (customCustomerMode === "registered") {
        if (!customCustomerId) {
          toast.error("Please select a customer.")
          return
        }
        customerId = customCustomerId
      } else {
        // Create new customer first
        if (!newCustName.trim() || !newCustMobile.trim() || !newCustAddress.trim()) {
          toast.error("Please fill in all customer details.")
          return
        }
        if (!/^\d{10}$/.test(newCustMobile.trim())) {
          toast.error("Mobile number must be exactly 10 digits.")
          return
        }
        const duplicate = customers.find(c => c.name.toLowerCase() === newCustName.toLowerCase() && c.mobile === newCustMobile)
        if (duplicate) {
          customerId = duplicate.id
          toast.info(`Using existing customer profile for ${newCustName}.`)
        } else {
          const newCust = addCustomer({
            name: newCustName,
            mobile: newCustMobile,
            address: newCustAddress,
            referralSource: newCustReferral,
            review: "",
            reviewStatus: "Review not done",
            notes: "Onboarded via custom complaint",
            status: "Active"
          })
          if (newCust && newCust.id) {
            customerId = newCust.id
          } else {
            toast.error("Failed to create customer profile.")
            return
          }
        }
      }

      const finalAppliance = customAppliance === "Other" ? (customApplianceText.trim() || "Other") : (customAppliance || "General")

      // Add a placeholder booking with complaint details
      addBooking({
        date: logComplaintDate,
        customerId: customerId,
        appliance: finalAppliance,
        serviceType: "Service",
        issue: "Custom Complaint (No Booking)",
        assignedTechnicianId: customTechId === "none" ? "" : customTechId,
        spareName: "None",
        spareCost: 0,
        sparePrice: 0,
        serviceCharge: customServiceCharge,
        status: "Not Started",
        complaint: logComplaintText,
        complaintDate: logComplaintDate,
        complaintStatus: logComplaintStatus,
        notes: logComplaintNotes || undefined
      })
      toast.success("Custom complaint logged successfully.")
    }

    // Reset all states
    setSelectedBookingId("")
    setBookingSearch("")
    setLogComplaintText("")
    setLogComplaintNotes("")
    setLogComplaintDate(new Date().toISOString().split("T")[0])
    setLogComplaintStatus("Open")
    setLogTechId("")
    
    setCustomCustomerId("")
    setCustomerSearch("")
    setNewCustName("")
    setNewCustMobile("")
    setNewCustAddress("")
    setNewCustReferral("Ad")
    setCustomAppliance("General")
    setCustomApplianceText("")
    setCustomTechId("")
    setCustomServiceCharge(0)
    setLogMode("link")
    setCustomCustomerMode("registered")
    
    setIsLogOpen(false)
  }

  // Submit edit complaint
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookingForEdit) return

    const closedDate = (editComplaintStatus === "Resolved" || editComplaintStatus === "Dismissed")
      ? (selectedBookingForEdit.complaintClosedDate || new Date().toISOString().split("T")[0])
      : ""

    updateBooking(selectedBookingForEdit.id, {
      complaint: editComplaintText,
      complaintDate: editComplaintDate,
      complaintStatus: editComplaintStatus,
      complaintClosedDate: closedDate,
      assignedTechnicianId: editTechId === "none" ? "" : editTechId,
      notes: editComplaintNotes || selectedBookingForEdit.notes
    })

    setSelectedBookingForEdit(null)
    setIsEditOpen(false)
    toast.success("Complaint details updated successfully.")
  }

  // Inline status Select change handler
  const handleComplaintStatusChange = (bookingId: string, status: any) => {
    const closedDate = (status === "Resolved" || status === "Dismissed") 
      ? new Date().toISOString().split("T")[0] 
      : ""
    updateBooking(bookingId, { 
      complaintStatus: status,
      complaintClosedDate: closedDate
    })
    toast.success(`Complaint status updated to ${status}.`)
  }

  // Delete Complaint
  const handleDeleteComplaint = (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      updateBooking(bookingId, {
        complaint: "",
        complaintDate: "",
        complaintStatus: undefined,
        complaintClosedDate: ""
      })
      toast.success("Complaint deleted successfully.")
    }
  }

  // Convert Custom Complaint to Booking
  const handleConvertToBooking = (bookingId: string) => {
    if (window.confirm("Are you sure you want to convert this complaint into a full booking?")) {
      updateBooking(bookingId, {
        issue: "Converted from Complaint",
        status: "Open" as any
      })
      toast.success("Complaint converted to an active booking successfully.")
    }
  }

  // Open Edit drawer
  const handleOpenEdit = (b: Booking) => {
    setSelectedBookingForEdit(b)
    setEditComplaintText(b.complaint || "")
    setEditComplaintNotes(b.notes || "")
    setEditComplaintDate(b.complaintDate || new Date().toISOString().split("T")[0])
    setEditComplaintStatus(b.complaintStatus || "Open")
    setEditTechId(b.assignedTechnicianId || "")
    setIsEditOpen(true)
  }

  // Filtered complaints for stats (independent of statusFilter)
  const filteredComplaintsForStats = React.useMemo(() => {
    return bookingsWithComplaints.filter(b => {
      const cust = customers.find(c => c.id === b.customerId)
      const searchString = `${b.id} ${b.complaint || ""} ${cust?.name || ""} ${cust?.mobile || ""} ${b.appliance}`.toLowerCase()
      return searchString.includes(search.toLowerCase())
    })
  }, [bookingsWithComplaints, customers, search])

  // Metrics
  const metrics = React.useMemo(() => {
    const total = filteredComplaintsForStats.length
    const open = filteredComplaintsForStats.filter(b => b.complaintStatus === "Open").length
    const review = filteredComplaintsForStats.filter(b => b.complaintStatus === "In Review").length
    const resolved = filteredComplaintsForStats.filter(b => b.complaintStatus === "Resolved").length
    const dismissed = filteredComplaintsForStats.filter(b => b.complaintStatus === "Dismissed").length

    return { total, open, review, resolved, dismissed }
  }, [filteredComplaintsForStats])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
      case "In Review":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400"
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
      case "Dismissed":
        return "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400"
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2.5} className="size-5 text-rose-500" />
            Customer Complaints Center
          </h2>
          <p className="text-sm text-muted-foreground">Manage and resolve reported post-service customer issues, log new customer callbacks, and track resolution timelines.</p>
        </div>
        <Button onClick={() => setIsLogOpen(true)} className="w-fit cursor-pointer gap-1.5 h-10 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border-0">
          <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
          Log Customer Complaint
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card 
          onClick={() => setStatusFilter("ALL")}
          className={`border-border/60 shadow-xs bg-card/45 backdrop-blur-xs cursor-pointer hover:bg-muted/30 transition-colors select-none ${statusFilter === "ALL" ? "ring-2 ring-primary border-transparent" : ""}`}
        >
          <CardHeader className="py-3.5 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Filed</CardDescription>
          </CardHeader>
          <CardContent className="pb-3.5 pt-0">
            <div className="text-2xl font-bold tracking-tight tabular-nums">{metrics.total}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">all logged issues</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter("Open")}
          className={`border-rose-200/50 dark:border-rose-950/20 shadow-xs bg-rose-50/5 dark:bg-rose-950/5 cursor-pointer hover:bg-rose-500/10 dark:hover:bg-rose-950/10 transition-colors select-none ${statusFilter === "Open" ? "ring-2 ring-rose-500 border-transparent" : ""}`}
        >
          <CardHeader className="py-3.5 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Open Dues</CardDescription>
          </CardHeader>
          <CardContent className="pb-3.5 pt-0">
            <div className="text-2xl font-bold tracking-tight tabular-nums text-rose-600 dark:text-rose-400">{metrics.open}</div>
            <div className="text-[10px] text-rose-500/80 mt-0.5 font-bold animate-pulse">awaiting agent response</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter("In Review")}
          className={`border-orange-200/50 dark:border-orange-950/20 shadow-xs bg-orange-50/5 dark:bg-orange-950/5 cursor-pointer hover:bg-orange-500/10 dark:hover:bg-orange-950/10 transition-colors select-none ${statusFilter === "In Review" ? "ring-2 ring-orange-500 border-transparent" : ""}`}
        >
          <CardHeader className="py-3.5 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">In Review</CardDescription>
          </CardHeader>
          <CardContent className="pb-3.5 pt-0">
            <div className="text-2xl font-bold tracking-tight tabular-nums text-orange-600 dark:text-orange-400">{metrics.review}</div>
            <div className="text-[10px] text-orange-500/80 mt-0.5 font-medium">technician inspecting</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter("Resolved")}
          className={`border-emerald-200/50 dark:border-emerald-950/20 shadow-xs bg-emerald-50/5 dark:bg-emerald-950/5 cursor-pointer hover:bg-emerald-500/10 dark:hover:bg-emerald-950/10 transition-colors select-none ${statusFilter === "Resolved" ? "ring-2 ring-emerald-500 border-transparent" : ""}`}
        >
          <CardHeader className="py-3.5 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved</CardDescription>
          </CardHeader>
          <CardContent className="pb-3.5 pt-0">
            <div className="text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">{metrics.resolved}</div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5 font-medium">successfully settled</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter("Dismissed")}
          className={`border-border/60 shadow-xs bg-card/45 backdrop-blur-xs cursor-pointer hover:bg-muted/30 transition-colors select-none ${statusFilter === "Dismissed" ? "ring-2 ring-zinc-500 border-transparent" : ""}`}
        >
          <CardHeader className="py-3.5 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Dismissed</CardDescription>
          </CardHeader>
          <CardContent className="pb-3.5 pt-0">
            <div className="text-2xl font-bold tracking-tight tabular-nums">{metrics.dismissed}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">dismissed / duplicate</div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search by CIN, customer, phone, appliance, details..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Status Filter:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Complaints" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Complaints</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table view of complaints */}
      <Card className="border-border/60 overflow-hidden shadow-xs flex flex-col justify-between">
        <CardContent className="p-0">
          <div className="overflow-x-auto min-w-0 max-w-full">
            <Table>
              <TableHeader className="bg-muted/60 border-b border-border/50">
                <TableRow>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Booking CIN</TableHead>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Customer Details</TableHead>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Appliance Details</TableHead>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Assigned Tech</TableHead>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Date Filed</TableHead>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Date Closed</TableHead>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] w-80">Complaint Details</TableHead>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] w-60">Notes</TableHead>
                  <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground font-medium">
                      No complaints match filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedComplaints.map((b) => {
                    const cust = customers.find(c => c.id === b.customerId)
                    const tech = technicians.find(t => t.id === b.assignedTechnicianId)
                    return (
                      <TableRow key={b.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="px-4 py-4 font-bold text-xs tabular-nums text-foreground">{b.id}</TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-xs">{cust?.name || "Unknown"}</span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">{cust?.mobile}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex flex-col">
                            <Badge className="w-fit text-[9px] font-bold py-0 px-1 border-indigo-200/40 text-indigo-600 bg-indigo-50/10">
                              {b.appliance}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{b.serviceType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-xs font-semibold text-foreground">{tech?.name || <span className="text-muted-foreground/40">Unassigned</span>}</TableCell>
                        <TableCell className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{b.complaintDate || "—"}</TableCell>
                        <TableCell className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{b.complaintClosedDate || "—"}</TableCell>
                        <TableCell className="px-4 py-4 text-xs font-semibold leading-relaxed text-foreground max-w-xs whitespace-pre-wrap">{b.complaint}</TableCell>
                        <TableCell className="px-4 py-4 text-xs text-muted-foreground max-w-xs truncate" title={b.notes || cust?.notes || ""}>
                          {b.notes || cust?.notes || <span className="text-muted-foreground/30">—</span>}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Select
                            value={b.complaintStatus || "Open"}
                            onValueChange={(val: any) => handleComplaintStatusChange(b.id, val)}
                          >
                            <SelectTrigger className={`h-6 text-[9px] font-extrabold py-0.5 px-1.5 w-24 rounded-md border ${getStatusBadgeColor(b.complaintStatus || "Open")}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open" className="text-rose-600 dark:text-rose-400 font-bold focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30">Open</SelectItem>
                              <SelectItem value="In Review" className="text-orange-600 dark:text-orange-400 font-bold focus:text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950/30">In Review</SelectItem>
                              <SelectItem value="Resolved" className="text-emerald-600 dark:text-emerald-400 font-bold focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30">Resolved</SelectItem>
                              <SelectItem value="Dismissed" className="text-zinc-600 dark:text-zinc-400 font-bold focus:text-zinc-600 focus:bg-zinc-50 dark:focus:bg-zinc-950/30">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
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
                              <DropdownMenuItem onClick={() => handleOpenEdit(b)} className="cursor-pointer">
                                Edit
                              </DropdownMenuItem>
                              {b.issue === "Custom Complaint (No Booking)" && b.complaintStatus !== "Resolved" && b.complaintStatus !== "Dismissed" && (
                                <DropdownMenuItem onClick={() => handleConvertToBooking(b.id)} className="cursor-pointer">
                                  Convert to Booking
                                </DropdownMenuItem>
                              )}
                              {currentRole === "Admin" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteComplaint(b.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-border/40 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Showing {Math.min(filteredComplaints.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredComplaints.length, currentPage * pageSize)} of {filteredComplaints.length} records
            </span>
            <div className="flex items-center gap-2.5">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs cursor-pointer select-none"
              >
                Previous
              </Button>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs cursor-pointer select-none"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Log Complaint Drawer */}
      <Drawer open={isLogOpen} onOpenChange={setIsLogOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleLogSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Raise Service Complaint</DrawerTitle>
              <DrawerDescription className="text-xs">
                Link a customer complaint details to an active or past appliance service booking request or create a standalone custom complaint.
              </DrawerDescription>
            </DrawerHeader>

            {/* Mode Switcher */}
            <div className="px-4 py-2 border-b border-border/40 bg-muted/20 flex items-center justify-between">
              <div className="flex bg-muted p-1 rounded-lg border border-border/40 w-fit shrink-0">
                <button
                  type="button"
                  onClick={() => setLogMode("link")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    logMode === "link"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Link to Booking
                </button>
                <button
                  type="button"
                  onClick={() => setLogMode("custom")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    logMode === "custom"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Custom Complaint (No Booking)
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                           {logMode === "link" ? (
                  /* Search & Select Booking */
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="booking-search" className="text-xs font-bold text-muted-foreground">Search and Select Booking *</Label>
                    {selectedBookingId ? (
                      /* Selected Booking Card */
                      (() => {
                        const selB = bookings.find(b => b.id === selectedBookingId)
                        const selC = selB ? customers.find(c => c.id === selB.customerId) : null
                        return selB ? (
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/5 animate-in fade-in duration-200">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground">Booking {selB.id}</span>
                                <span className="text-[10px] text-muted-foreground">({selB.appliance})</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{selC?.name || "Unknown"} • {selB.date}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setSelectedBookingId(""); setBookingSearch("") }}
                              className="shrink-0 size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Deselect booking"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
                            </button>
                          </div>
                        ) : null
                      })()
                    ) : (
                      <>
                        <div className="relative">
                          <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="booking-search"
                            placeholder="Search by CIN, customer name, mobile or appliance..."
                            value={bookingSearch}
                            onChange={(e) => setBookingSearch(e.target.value)}
                            className="pl-9 bg-background h-9 text-xs border-border/60"
                            autoFocus
                          />
                        </div>
                        
                        <div className="border border-border/60 rounded-lg max-h-56 overflow-y-auto bg-muted/10 divide-y divide-border/40">
                          {availableBookingsForComplaint.length === 0 ? (
                            <div className="p-3 text-xs text-muted-foreground text-center">No bookings match "{bookingSearch}"</div>
                          ) : (
                            availableBookingsForComplaint.map(b => {
                              const cust = customers.find(c => c.id === b.customerId)
                              const tech = technicians.find(t => t.id === b.assignedTechnicianId)
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => { setSelectedBookingId(b.id); setBookingSearch("") }}
                                  className="w-full text-left p-2.5 text-xs flex items-center justify-between transition-colors hover:bg-muted/50 text-foreground"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <div className="font-semibold flex items-center gap-1.5 text-foreground">
                                      <span>Booking {b.id}</span>
                                      <span className="text-[10px] text-muted-foreground">({b.appliance})</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                      <span>Client: {cust?.name || "Unknown"}</span>
                                      <span className="text-border">•</span>
                                      <span>Mobile: {cust?.mobile}</span>
                                      <span className="text-border">•</span>
                                      <span>Tech: {tech?.name || "Unassigned"}</span>
                                      <span className="text-border">•</span>
                                      <span>Date: {b.date}</span>
                                    </div>
                                  </div>
                                </button>
                              )
                            })
                          )}
                        </div>
                      </>
                    )}

                    {selectedBookingId && (
                      <div className="flex flex-col gap-1.5 mt-2 animate-in fade-in duration-200">
                        <Label htmlFor="link-tech" className="text-xs font-bold text-muted-foreground">Re-assign Technician (Optional)</Label>
                        <Select value={logTechId} onValueChange={setLogTechId}>
                          <SelectTrigger id="link-tech" className="h-9 text-xs bg-background border-border/60">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned / None</SelectItem>
                            {technicians.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Custom Complaint customer details */
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-bold text-muted-foreground">Client Selection</Label>
                      
                      <div className="flex bg-muted/60 p-1 rounded-lg border border-border/40 w-fit text-xs font-semibold mb-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setCustomCustomerMode("registered")}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            customCustomerMode === "registered"
                              ? "bg-background text-foreground shadow-xs font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Registered Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomCustomerMode("new")}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            customCustomerMode === "new"
                              ? "bg-background text-foreground shadow-xs font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          New Client
                        </button>
                      </div>

                      {customCustomerMode === "registered" ? (
                        <div className="flex flex-col gap-2">
                          {customCustomerId ? (
                            (() => {
                              const sel = customers.find(c => c.id === customCustomerId)
                              return sel ? (
                                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-primary/30 bg-primary/5 animate-in fade-in duration-200">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="size-7 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-black flex items-center justify-center shrink-0">
                                      {sel.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col gap-0 min-w-0">
                                      <span className="text-xs font-bold text-foreground truncate">{sel.name}</span>
                                      <span className="text-[10px] text-muted-foreground">{sel.mobile} • {sel.id}</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => { setCustomCustomerId(""); setCustomerSearch("") }}
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
                              <div className="relative">
                                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search by CIN, name, mobile or location..."
                                  value={customerSearch}
                                  onChange={(e) => setCustomerSearch(e.target.value)}
                                  className="pl-9 bg-background h-9 text-xs border-border/60"
                                  autoFocus
                                />
                              </div>
                              
                              <div className="border border-border/60 rounded-lg max-h-48 overflow-y-auto bg-muted/10 divide-y divide-border/40">
                                {filteredCustomersForComplaint.length === 0 ? (
                                  <div className="p-3 text-xs text-muted-foreground text-center">No customers match "{customerSearch}"</div>
                                ) : (
                                  filteredCustomersForComplaint.map(c => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => { setCustomCustomerId(c.id); setCustomerSearch("") }}
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
                      ) : (
                        <div className="flex flex-col gap-3.5 border border-border/40 rounded-lg p-3 bg-muted/5">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="new-cust-name" className="text-[10px] font-bold text-muted-foreground uppercase">Client Name *</Label>
                              <Input
                                id="new-cust-name"
                                placeholder="E.g. Vikram Sharma"
                                value={newCustName}
                                onChange={(e) => setNewCustName(e.target.value)}
                                className="bg-background h-8 text-xs font-semibold"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="new-cust-mobile" className="text-[10px] font-bold text-muted-foreground uppercase">Mobile Phone *</Label>
                              <Input 
                                id="new-cust-mobile" 
                                type="tel" 
                                inputMode="numeric"
                                placeholder="E.g. 9811223344" 
                                value={newCustMobile} 
                                onChange={(e) => setNewCustMobile(e.target.value.replace(/\D/g, ''))} 
                                className="bg-background h-8 text-xs font-semibold"
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <Label htmlFor="new-cust-address" className="text-[10px] font-bold text-muted-foreground uppercase">Service Address *</Label>
                            <Input
                              id="new-cust-address"
                              placeholder="Tower, Flat details, sector/location"
                              value={newCustAddress}
                              onChange={(e) => setNewCustAddress(e.target.value)}
                              className="bg-background h-8 text-xs font-semibold"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <Label htmlFor="new-cust-referral" className="text-[10px] font-bold text-muted-foreground uppercase">Acquisition Source</Label>
                            <Select value={newCustReferral} onValueChange={setNewCustReferral}>
                              <SelectTrigger id="new-cust-referral" className="h-8 text-xs bg-background font-semibold">
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
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="custom-appliance" className="text-xs font-bold text-muted-foreground">Appliance Details (Default: General)</Label>
                      <Select value={customAppliance} onValueChange={setCustomAppliance}>
                        <SelectTrigger id="custom-appliance" className="bg-background h-9 text-xs border-border/60">
                          <SelectValue placeholder="Select Appliance Type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          {APPLIANCE_OPTIONS.filter(o => o !== "Other").map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {customAppliance === "Other" && (
                        <Input
                          placeholder="Custom Appliance Name"
                          value={customApplianceText}
                          onChange={(e) => setCustomApplianceText(e.target.value)}
                          className="bg-background h-9 text-xs border-border/60 mt-1.5"
                          required
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="custom-tech" className="text-xs font-bold text-muted-foreground">Assigned Technician</Label>
                        <Select value={customTechId} onValueChange={setCustomTechId}>
                          <SelectTrigger id="custom-tech" className="h-9 text-xs bg-background border-border/60">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {technicians.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="custom-svcharge" className="text-xs font-bold text-muted-foreground">Amount / Service Charge</Label>
                        <Input
                          id="custom-svcharge"
                          type="number"
                          min="0"
                          placeholder="₹0"
                          value={customServiceCharge}
                          onChange={(e) => setCustomServiceCharge(parseFloat(e.target.value) || 0)}
                          className="bg-background h-9 text-xs border-border/60 tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Complaint Details */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="log-complaint" className="text-xs font-bold text-muted-foreground">Complaint Details *</Label>
                  <Textarea 
                    id="log-complaint" 
                    placeholder="Describe the complaint reported by the customer (e.g. appliance leaking again, technician did not resolve...)"
                    value={logComplaintText} 
                    onChange={(e) => setLogComplaintText(e.target.value)}
                    className="min-h-[100px] text-xs bg-background"
                    required
                  />
                </div>

                {/* Date Filed */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="log-complaint-date" className="text-xs font-bold text-muted-foreground">Date Logged</Label>
                  <Input 
                    type="date"
                    id="log-complaint-date" 
                    value={logComplaintDate} 
                    onChange={(e) => setLogComplaintDate(e.target.value)} 
                    className="h-8 text-xs bg-background"
                  />
                </div>

                {/* Complaint Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="log-complaint-status" className="text-xs font-bold text-muted-foreground">Initial Status</Label>
                  <Select 
                    value={logComplaintStatus} 
                    onValueChange={(val: any) => setLogComplaintStatus(val)}
                  >
                    <SelectTrigger id="log-complaint-status" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="log-complaint-notes" className="text-xs font-bold text-muted-foreground">Internal Notes (Optional)</Label>
                  <Textarea 
                    id="log-complaint-notes" 
                    placeholder="Any internal notes or follow-up actions..."
                    value={logComplaintNotes} 
                    onChange={(e) => setLogComplaintNotes(e.target.value)}
                    className="min-h-[70px] text-xs bg-background"
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-0">Onboard Complaint</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Edit Complaint Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Service Complaint</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify details, date filed, and status for booking complaint.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                  {/* Associated Booking Info */}
                <div className="rounded-lg bg-muted/40 p-4 border flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">Associated Service Job</span>
                  <div className="text-sm font-bold text-foreground">{selectedBookingForEdit?.id}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <div><span className="font-semibold text-foreground">Appliance:</span> {selectedBookingForEdit?.appliance} ({selectedBookingForEdit?.serviceType})</div>
                    <div><span className="font-semibold text-foreground">Original Issue:</span> {selectedBookingForEdit?.issue}</div>
                    <div><span className="font-semibold text-foreground">Job Status:</span> {selectedBookingForEdit?.status}</div>
                  </div>
                </div>

                {/* Edit Technician */}
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                  <Label htmlFor="edit-complaint-tech" className="text-xs font-bold text-muted-foreground">Assigned Technician</Label>
                  <Select value={editTechId} onValueChange={setEditTechId}>
                    <SelectTrigger id="edit-complaint-tech" className="h-9 text-xs bg-background border-border/60">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned / None</SelectItem>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                
                {/* Complaint Details */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-complaint" className="text-xs font-bold text-muted-foreground">Complaint Details *</Label>
                  <Textarea 
                    id="edit-complaint" 
                    value={editComplaintText} 
                    onChange={(e) => setEditComplaintText(e.target.value)}
                    className="min-h-[100px] text-xs bg-background"
                    required
                  />
                </div>

                {/* Date Filed */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-complaint-date" className="text-xs font-bold text-muted-foreground">Date Logged</Label>
                  <Input 
                    type="date"
                    id="edit-complaint-date" 
                    value={editComplaintDate} 
                    onChange={(e) => setEditComplaintDate(e.target.value)} 
                    className="h-8 text-xs bg-background"
                  />
                </div>

                {/* Complaint Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-complaint-status" className="text-xs font-bold text-muted-foreground">Complaint Status</Label>
                  <Select 
                    value={editComplaintStatus} 
                    onValueChange={(val: any) => setEditComplaintStatus(val)}
                  >
                    <SelectTrigger id="edit-complaint-status" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-complaint-notes" className="text-xs font-bold text-muted-foreground">Internal Notes (Optional)</Label>
                  <Textarea 
                    id="edit-complaint-notes" 
                    placeholder="Any internal notes or follow-up actions..."
                    value={editComplaintNotes} 
                    onChange={(e) => setEditComplaintNotes(e.target.value)}
                    className="min-h-[70px] text-xs bg-background"
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-0">Save Changes</Button>
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
