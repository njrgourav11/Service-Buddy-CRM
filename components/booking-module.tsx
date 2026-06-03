"use client"

import * as React from "react"
import { useCRM, Booking, Customer, Technician, Spare, compareIdsNumerically } from "@/context/crm-context"
import { CustomerModule } from "@/components/customer-module"
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
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PlusSignCircleIcon, 
  SearchIcon, 
  CheckmarkCircle01Icon, 
  Loading03Icon, 
  FilterIcon,
  InvoiceIcon,
  Database01Icon,
  UserCircle02Icon,
  Analytics01Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function BookingModule() {
  const { 
    bookings, 
    customers, 
    technicians, 
    spares, 
    addBooking, 
    addCustomer,
    updateCustomer,
    updateBooking, 
    deleteBooking,
    currentRole 
  } = useCRM()

  // Sub-module switcher
  const [activeSubTab, setActiveSubTab] = React.useState<"bookings" | "customers">("bookings")

  // State managers
  const [search, setSearch] = React.useState("")
  const [applianceFilter, setApplianceFilter] = React.useState("ALL")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [viewMode, setViewMode] = React.useState<"sheet" | "table" | "cards">("table")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(8)

  // Details & Row Editing State
  const [editAppliance, setEditAppliance] = React.useState<any>("AC")
  const [editServiceType, setEditServiceType] = React.useState<any>("Repair")
  const [editIssue, setEditIssue] = React.useState("")
  const [editTechId, setEditTechId] = React.useState("")
  const [editSpareName, setEditSpareName] = React.useState("None")
  const [editSpareCost, setEditSpareCost] = React.useState(0)
  const [editSparePrice, setEditSparePrice] = React.useState(0)
  const [editServiceCharge, setEditServiceCharge] = React.useState(0)
  const [editStatus, setEditStatus] = React.useState<any>("Not Started")
  const [editCustName, setEditCustName] = React.useState("")
  const [editCustMobile, setEditCustMobile] = React.useState("")
  const [editCustAddress, setEditCustAddress] = React.useState("")
  const [editCustReferral, setEditCustReferral] = React.useState<any>("Ad")
  const [editCustNotes, setEditCustNotes] = React.useState("")
  const [editCustReview, setEditCustReview] = React.useState("")
  
  // Creation modal state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null)

  // Creation Form State
  const [formCustomerId, setFormCustomerId] = React.useState("")
  const [customerSearch, setCustomerSearch] = React.useState("")
  const [customerMode, setCustomerMode] = React.useState<"existing" | "new">("existing")
  const [newCustName, setNewCustName] = React.useState("")
  const [newCustMobile, setNewCustMobile] = React.useState("")
  const [newCustAddress, setNewCustAddress] = React.useState("")
  const [newCustReferral, setNewCustReferral] = React.useState<any>("Ad")
  const [newCustNotes, setNewCustNotes] = React.useState("")

  const [formAppliance, setFormAppliance] = React.useState<any>("AC")
  const [formServiceType, setFormServiceType] = React.useState<any>("Repair")
  const [formIssue, setFormIssue] = React.useState("")
  const [formTechId, setFormTechId] = React.useState("")
  const [formSpareId, setFormSpareId] = React.useState("NONE")
  const [formSpareCost, setFormSpareCost] = React.useState(0)
  const [formSparePrice, setFormSparePrice] = React.useState(0)
  const [formServiceCharge, setFormServiceCharge] = React.useState(0)
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split("T")[0])

  // ==========================================
  // Form Auto-fill Logic
  // ==========================================
  React.useEffect(() => {
    if (formSpareId === "NONE") {
      setFormSpareCost(0)
      setFormSparePrice(0)
    } else {
      const match = spares.find(s => s.id === formSpareId)
      if (match) {
        setFormSpareCost(match.unitCost)
        setFormSparePrice(match.sellingCost)
      }
    }
  }, [formSpareId, spares])

  // Edit Form Spares Auto-fill logic
  React.useEffect(() => {
    if (editSpareName === "None" || editSpareName === "") {
      setEditSpareCost(0)
      setEditSparePrice(0)
    } else {
      const match = spares.find(s => s.name.toLowerCase() === editSpareName.toLowerCase())
      if (match) {
        setEditSpareCost(match.unitCost)
        setEditSparePrice(match.sellingCost)
      }
    }
  }, [editSpareName, spares])

  // Select a booking to review in side panel
  const handleSelectBookingForDetails = (b: Booking) => {
    setSelectedBooking(b)
    const cust = customers.find(c => c.id === b.customerId)
    
    setEditAppliance(b.appliance)
    setEditServiceType(b.serviceType)
    setEditIssue(b.issue)
    setEditTechId(b.assignedTechnicianId)
    setEditSpareName(b.spareName)
    setEditSpareCost(b.spareCost)
    setEditSparePrice(b.sparePrice)
    setEditServiceCharge(b.serviceCharge)
    setEditStatus(b.status)
    
    setEditCustName(cust?.name || "")
    setEditCustMobile(cust?.mobile || "")
    setEditCustAddress(cust?.address || "")
    setEditCustReferral(cust?.referralSource || "Ad")
    setEditCustNotes(cust?.notes || "")
    setEditCustReview(cust?.review || "")
    
    setIsDetailsOpen(true)
  }

  // Update CRM & Booking details
  const handleSaveDetailsEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    
    // Save booking updates
    updateBooking(selectedBooking.id, {
      appliance: editAppliance,
      serviceType: editServiceType,
      issue: editIssue,
      assignedTechnicianId: editTechId,
      spareName: editSpareName,
      spareCost: editSpareCost,
      sparePrice: editSparePrice,
      serviceCharge: editServiceCharge,
      status: editStatus
    })
    
    // Save customer updates
    updateCustomer(selectedBooking.customerId, {
      name: editCustName,
      mobile: editCustMobile,
      address: editCustAddress,
      referralSource: editCustReferral,
      notes: editCustNotes,
      review: editCustReview
    })
    
    setIsDetailsOpen(false)
    toast.success("Profile records and service charges updated successfully.")
  }

  // Master Ledger spreadsheet CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      "CIN NO", "Date", "Customer Name", "Phone Number", "Address", "Appliance Type", 
      "Service Issue", "Technician", "Spare Name", "Actual Spare (R)", "Consumer Spare (S)", 
      "Total Commission (T = S-R)", "Technician Commission (U = T*70%)", "Company Commission (V = T*30%)", 
      "Service Charge (W)", "Technician Commission (Service) (X = W*70%)", "Company Commission (Service) (Y = W*30%)", 
      "Total Technician (U+X)", "Total Company (V+Y)", "Total Consumer Amt (S+W)", 
      "Review", "Referral Source", "Notes", "Status"
    ]
    
    const rows = filteredBookings.map(b => {
      const cust = customers.find(c => c.id === b.customerId)
      const tech = technicians.find(t => t.id === b.assignedTechnicianId)
      
      return [
        b.id,
        b.date,
        `"${(cust?.name || "Unknown").replace(/"/g, '""')}"`,
        `"${(cust?.mobile || "").replace(/"/g, '""')}"`,
        `"${(cust?.address || "").replace(/"/g, '""')}"`,
        b.appliance,
        `"${b.issue.replace(/"/g, '""')}"`,
        `"${(tech?.name || "Unassigned").replace(/"/g, '""')}"`,
        `"${b.spareName.replace(/"/g, '""')}"`,
        b.spareCost,
        b.sparePrice,
        b.totalCommission || 0,
        b.technicianCommission || 0,
        b.companyCommission || 0,
        b.serviceCharge,
        b.technicianServiceCommission || 0,
        b.companyServiceCommission || 0,
        b.totalTechnicianAmount || 0,
        b.totalCompanyAmount || 0,
        b.totalConsumerAmount || 0,
        `"${(cust?.review || "").replace(/"/g, '""')}"`,
        cust?.referralSource || "",
        `"${(cust?.notes || "").replace(/"/g, '""')}"`,
        b.status
      ]
    })
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `ServiceBuddy_CRM_Ledger_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Unified spreadsheet ledger exported to CSV!")
  }

  // Filter Bookings
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      const cust = customers.find(c => c.id === b.customerId)
      const tech = technicians.find(t => t.id === b.assignedTechnicianId)
      
      const searchString = `${b.id} ${b.issue} ${cust?.name || ""} ${tech?.name || ""}`.toLowerCase()
      const matchesSearch = searchString.includes(search.toLowerCase())
      
      const matchesAppliance = applianceFilter === "ALL" || b.appliance === applianceFilter
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter

      return matchesSearch && matchesAppliance && matchesStatus
    }).sort((a, b) => compareIdsNumerically(a.id, b.id))
  }, [bookings, customers, technicians, search, applianceFilter, statusFilter])

  // Extract unique appliances for filter
  const uniqueAppliances = React.useMemo(() => {
    const set = new Set<string>()
    bookings.forEach(b => {
      if (b.appliance) {
        set.add(b.appliance)
      }
    })
    return Array.from(set).sort()
  }, [bookings])

  // Pagination Math
  const totalPages = Math.ceil(filteredBookings.length / pageSize)
  const paginatedBookings = React.useMemo(() => {
    return filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filteredBookings, currentPage, pageSize])

  // Filter registered customers for selection in create booking form
  const filteredCustomers = React.useMemo(() => {
    return customers.filter(c => {
      const searchStr = `${c.name} ${c.mobile} ${c.address} ${c.id}`.toLowerCase()
      return searchStr.includes(customerSearch.toLowerCase())
    })
  }, [customers, customerSearch])

  // Reset page index when search or filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, applianceFilter, statusFilter])

  // Handle Create Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let finalCustomerId = ""

    if (customerMode === "new") {
      if (!newCustName || !newCustMobile || !newCustAddress) {
        toast.error("Please fill in all required customer fields (Name, Mobile, Address).")
        return
      }
      
      const newCust = addCustomer({
        name: newCustName,
        mobile: newCustMobile,
        address: newCustAddress,
        referralSource: newCustReferral,
        notes: newCustNotes || "Registered inline during booking order creation",
        review: "",
        status: "Active"
      })
      finalCustomerId = newCust.id
    } else {
      if (!formCustomerId) {
        toast.error("Please select an existing customer.")
        return
      }
      finalCustomerId = formCustomerId
    }

    if (!formTechId) {
      toast.error("Please select an assigned technician.")
      return
    }

    const selectedSpare = spares.find(s => s.id === formSpareId)

    addBooking({
      date: formDate,
      customerId: finalCustomerId,
      appliance: formAppliance,
      serviceType: formServiceType,
      issue: formIssue,
      assignedTechnicianId: formTechId,
      spareName: selectedSpare ? selectedSpare.name : "None",
      spareCost: formSpareCost,
      sparePrice: formSparePrice,
      serviceCharge: formServiceCharge,
      status: "Not Started"
    })

    // Reset Form
    setFormCustomerId("")
    setCustomerSearch("")
    setNewCustName("")
    setNewCustMobile("")
    setNewCustAddress("")
    setNewCustReferral("Ad")
    setNewCustNotes("")
    setCustomerMode("existing")
    
    setFormIssue("")
    setFormTechId("")
    setFormSpareId("NONE")
    setFormSpareCost(0)
    setFormSparePrice(0)
    setFormServiceCharge(0)
    setIsCreateOpen(false)
  }

  // Quick state togglers
  const handleStatusChange = (id: string, newStatus: any) => {
    updateBooking(id, { status: newStatus })
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Premium Glassmorphic Sub-tab Switcher Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Service Bookings & Customer Registry</h2>
          <p className="text-sm text-muted-foreground">Unified terminal to log service work orders, manage client profiles, and calculate commission splits.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/40 w-fit shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveSubTab("bookings")}
            className={`text-xs font-bold px-4 py-1.5 h-8 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "bookings" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} className="size-3.5" />
            Service Bookings
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveSubTab("customers")}
            className={`text-xs font-bold px-4 py-1.5 h-8 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "customers" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} className="size-3.5" />
            Customer Directory
          </Button>
        </div>
      </div>

      {activeSubTab === "customers" ? (
        /* RENDER CUSTOMER MODULE SUB-TAB NESTED */
        <CustomerModule hideHeader={true} />
      ) : (
        /* RENDER BOOKINGS & ORDERS MODULE NESTED */
        <>
          {/* Action Header bar inside sub-tab */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Service Orders Ledger</h3>
              <p className="text-xs text-muted-foreground">Track ongoing appliance repairs, technician dispatches, and financial splits.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 w-fit text-xs font-semibold mr-2 shrink-0">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Table List
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Card Grid
                </button>
                <button
                  onClick={() => setViewMode("sheet")}
                  className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "sheet"
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Spreadsheet
                </button>
              </div>

              {/* CSV Exporter */}
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="h-9">
                <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} className="size-4" />
                Export Ledger CSV
              </Button>

              <Button onClick={() => setIsCreateOpen(true)} size="sm" className="h-9">
                <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
                Log Booking Request
              </Button>
            </div>
          </div>

          {/* Bookings Analytics Stat Cards Panel */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 shadow-xs bg-card/45 backdrop-blur-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Bookings</CardDescription>
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2.5} className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground">{bookings.length}</span>
                  <span className="text-xs text-muted-foreground font-medium">jobs logged</span>
                </div>
                <div className="text-[10px] text-primary font-bold mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse"></span>
                  {bookings.filter(b => b.status === "Completed").length} completed successfully
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xs bg-card/45 backdrop-blur-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Workload</CardDescription>
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2.5} className="size-4 animate-spin" />
                </div>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
                    {bookings.filter(b => b.status === "In Progress" || b.status === "Not Started").length}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">pending jobs</span>
                </div>
                <div className="text-[10px] text-primary font-bold mt-1.5 flex items-center gap-1">
                  {bookings.filter(b => b.status === "In Progress").length} currently in progress on site
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xs bg-card/45 backdrop-blur-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gross Billing</CardDescription>
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2.5} className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
                    ₹{bookings.reduce((sum, b) => sum + (b.totalConsumerAmount || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">total volume</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1.5">
                  Avg value: ₹{bookings.length ? Math.round(bookings.reduce((sum, b) => sum + (b.totalConsumerAmount || 0), 0) / bookings.length) : 0} per service order
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xs bg-card/45 backdrop-blur-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Company Profit</CardDescription>
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <HugeiconsIcon icon={Database01Icon} strokeWidth={2.5} className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight tabular-nums text-primary">
                    ₹{bookings.reduce((sum, b) => sum + (b.totalCompanyAmount || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">30% share profit</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1.5">
                  Tech payouts share: ₹{bookings.reduce((sum, b) => sum + (b.totalTechnicianAmount || 0), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel: Filters & Search */}
          <Card className="border-border/60">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by CIN, customer, technician or issues..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Appliance Filter */}
                <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Appliance:</Label>
                  <Select value={applianceFilter} onValueChange={setApplianceFilter}>
                    <SelectTrigger className="w-full md:w-44">
                      <SelectValue placeholder="All Appliances" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Appliances</SelectItem>
                      {uniqueAppliances.map(app => (
                        <SelectItem key={app} value={app}>{app === "TL-WM (Top Load Washing Machine)" ? "TL-WM" : app}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Status:</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-36">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Master Combined spreadsheet vs compact table list rendering */}
          {viewMode === "sheet" ? (
            /* ========================================================
               A. Master Spreadsheet View (Horizontal-scrolling grid)
               ======================================================== */
            <Card className="border-border/60 overflow-hidden shadow-xs w-full max-w-full">
              <CardContent className="p-0 w-full">
                <div className="overflow-x-auto overflow-y-auto max-h-[64vh] w-full">
                  <table className="w-full text-[11px] border-collapse min-w-[2800px]">
                    <thead className="bg-muted/95 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground sticky top-0 z-20 border-b border-border/50 select-none">
                      <tr>
                        {/* Frozen left headers */}
                        <th className="px-3 py-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border/40 w-24 text-left">CIN (Booking)</th>
                        <th className="px-3 py-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 sticky left-24 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border/40 w-40 text-left">Customer Name</th>
                        
                        {/* Customer details headers */}
                        <th className="px-3 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 w-28 text-left">Phone Number</th>
                        <th className="px-3 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 w-64 text-left">Service Address</th>
                        <th className="px-3 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 w-32 text-left">Lead Source</th>
                        <th className="px-3 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 w-56 text-left">Customer Review</th>
                        <th className="px-3 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 w-56 text-left">Customer Notes</th>
 
                        {/* Booking & Job headers */}
                        <th className="px-3 py-3 bg-purple-50/40 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 w-28 text-left">Booking Date</th>
                        <th className="px-3 py-3 bg-purple-50/40 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 w-44 text-left">Appliance Type</th>
                        <th className="px-3 py-3 bg-purple-50/40 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 w-56 text-left">Service Issue</th>
                        <th className="px-3 py-3 bg-purple-50/40 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 w-40 text-left">Appointed Tech</th>
                        <th className="px-3 py-3 bg-purple-50/40 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 w-40 text-left">Spare Used</th>
 
                        {/* Spares cost headers */}
                        <th className="px-3 py-3 bg-rose-50/30 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 w-32 text-right">Actual Spare (R)</th>
                        <th className="px-3 py-3 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 w-32 text-right">Consumer Spare (S)</th>
                        <th className="px-3 py-3 bg-blue-50/30 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 w-36 text-right">Spare Comm (T = S-R)</th>
                        <th className="px-3 py-3 bg-teal-50/30 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 w-36 text-right">Tech Comm (U = T*70%)</th>
                        <th className="px-3 py-3 bg-cyan-50/30 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 w-36 text-right">Comp Comm (V = T*30%)</th>
 
                        {/* Workmanship split headers */}
                        <th className="px-3 py-3 bg-amber-50/30 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 w-32 text-right">Service Charge (W)</th>
                        <th className="px-3 py-3 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 w-40 text-right">Tech Serv (X = W*70%)</th>
                        <th className="px-3 py-3 bg-cyan-50/20 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 w-40 text-right">Comp Serv (Y = W*30%)</th>
 
                        {/* Payout reconciliation splits */}
                        <th className="px-3 py-3 bg-slate-100 dark:bg-slate-900 font-extrabold text-foreground w-36 text-right border-l border-border/40">Total Tech (U+X)</th>
                        <th className="px-3 py-3 bg-slate-100 dark:bg-slate-900 font-extrabold text-foreground w-36 text-right">Total Company (V+Y)</th>
                        <th className="px-3 py-3 bg-primary/10 dark:bg-primary/30 font-black text-primary w-36 text-right">Total Consumer (S+W)</th>
 
                        <th className="px-3 py-3 w-28 text-left">Status</th>
                        <th className="px-3 py-3 text-right w-24 sticky right-0 bg-background dark:bg-slate-900 z-10 border-l border-border/40 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={24} className="text-center py-12 text-muted-foreground font-medium bg-card">
                            No matching service bookings logged.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => {
                          const cust = customers.find(c => c.id === b.customerId)
                          const tech = technicians.find(t => t.id === b.assignedTechnicianId)
 
                          return (
                            <tr key={b.id} className="hover:bg-muted/30 transition-colors bg-card/25 text-xs">
                              {/* Frozen columns CIN */}
                              <td className="px-3 py-2.5 font-bold text-foreground sticky left-0 bg-background dark:bg-slate-900 border-r border-border/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] z-10">
                                {b.id}
                              </td>
                              
                              {/* Frozen customer name */}
                              <td className="px-3 py-2.5 font-bold text-foreground sticky left-24 bg-background dark:bg-slate-900 border-r border-border/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] z-10 truncate max-w-[150px]">
                                {cust?.name || "Unknown"}
                              </td>
 
                              {/* Customer Profile */}
                              <td className="px-3 py-2.5 text-muted-foreground font-medium tabular-nums">{cust?.mobile}</td>
                              <td className="px-3 py-2.5 text-foreground font-medium truncate max-w-[240px]">{cust?.address}</td>
                              <td className="px-3 py-2.5">
                                <Badge variant="outline" className="text-[9px] font-bold py-0.5 px-1.5 bg-indigo-50/10 border-indigo-200/40 text-indigo-600 dark:text-indigo-400">
                                  {cust?.referralSource || "Other"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2.5 italic text-muted-foreground truncate max-w-[200px]" title={cust?.review}>
                                {cust?.review ? `"${cust.review}"` : <span className="text-[9px] text-muted-foreground/45 not-italic">None</span>}
                              </td>
                              <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[200px]" title={cust?.notes}>
                                {cust?.notes || <span className="text-[9px] text-muted-foreground/45">None</span>}
                              </td>

                              {/* Booking columns */}
                              <td className="px-3 py-2.5 text-muted-foreground font-semibold tabular-nums">{b.date}</td>
                              <td className="px-3 py-2.5">
                                <Badge 
                                  className={`text-[9px] font-bold py-0.5 px-2 ${
                                    b.appliance === "AC" 
                                      ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400" 
                                      : b.appliance === "TV" 
                                      ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400"
                                      : b.appliance === "TL-WM (Top Load Washing Machine)"
                                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                                      : b.appliance === "Geyser"
                                      ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400"
                                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                                  }`}
                                >
                                  {b.appliance === "TL-WM (Top Load Washing Machine)" ? "TL-WM" : b.appliance}
                                </Badge>
                              </td>
                              <td className="px-3 py-2.5 font-medium text-foreground truncate max-w-[200px]" title={b.issue}>{b.issue}</td>
                              <td className="px-3 py-2.5 font-semibold text-foreground">{tech?.name || "Unassigned"}</td>
                              <td className="px-3 py-2.5 text-muted-foreground font-medium truncate max-w-[150px]">{b.spareName}</td>

                              {/* Spares Cost (S and R) */}
                              <td className="px-3 py-2.5 text-right text-rose-600 dark:text-rose-400 font-bold tabular-nums">₹{b.spareCost}</td>
                              <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300 font-bold tabular-nums">₹{b.sparePrice}</td>
                              
                              {/* Commission calculation (T = S - R) */}
                              <td className="px-3 py-2.5 text-right text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/5 dark:bg-blue-950/15 tabular-nums">₹{b.totalCommission}</td>
                              
                              {/* 70/30 Spares Splits */}
                              <td className="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">₹{b.technicianCommission}</td>
                              <td className="px-3 py-2.5 text-right text-cyan-600 dark:text-cyan-400 font-bold tabular-nums">₹{b.companyCommission}</td>
 
                              {/* Service Splits (W) */}
                              <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300 font-bold tabular-nums">₹{b.serviceCharge}</td>
                              
                              {/* 70/30 Service Splits */}
                              <td className="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">₹{b.technicianServiceCommission}</td>
                              <td className="px-3 py-2.5 text-right text-cyan-600 dark:text-cyan-400 font-bold tabular-nums">₹{b.companyServiceCommission}</td>
 
                              {/* Grand Splits Totals */}
                              <td className="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50/15 dark:bg-emerald-950/10 tabular-nums border-l border-border/40">₹{b.totalTechnicianAmount}</td>
                              <td className="px-3 py-2.5 text-right text-cyan-600 dark:text-cyan-400 font-black bg-cyan-50/15 dark:bg-cyan-950/10 tabular-nums">₹{b.totalCompanyAmount}</td>
                              <td className="px-3 py-2.5 text-right text-primary font-black bg-primary/10 dark:bg-primary/20 tabular-nums text-xs">₹{b.totalConsumerAmount}</td>
 
                              {/* Interactive Status Dropdown */}
                              <td className="px-3 py-2.5">
                                <Select 
                                  value={b.status} 
                                  disabled={false}
                                  onValueChange={(val) => handleStatusChange(b.id, val)}
                                >
                                  <SelectTrigger className={`h-6 text-[9px] font-extrabold py-0.5 px-1.5 w-24 rounded-md border ${
                                    b.status === "Completed" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                      : b.status === "In Progress" 
                                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                                      : b.status === "Cancelled"
                                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                                  }`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Not Started">Not Started</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
 
                              {/* Edit Row button in sticky end column */}
                              <td className="px-3 py-2.5 text-right sticky right-0 bg-background dark:bg-slate-900 z-10 border-l border-border/40 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-end gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleSelectBookingForDetails(b)}
                                    className="h-6 text-[9px] font-bold px-1.5 bg-background shadow-xs hover:bg-muted"
                                  >
                                    Edit Row
                                  </Button>
                                  {currentRole === "Admin" && (
                                    <Button 
                                      variant="ghost" 
                                      onClick={() => deleteBooking(b.id)}
                                      className="h-6 size-6 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold"
                                    >
                                      ×
                                    </Button>
                                  )}
                                </div>
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
          ) : viewMode === "table" ? (
            <Card className="border-border/60 overflow-hidden shadow-xs flex flex-col justify-between">
              <CardContent className="p-0">
                <div className="overflow-x-auto min-w-0 max-w-full">
                  <Table>
                    <TableHeader className="bg-muted/60 border-b border-border/50">
                      <TableRow>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">CIN</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Date</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Customer</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Appliance & Type</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Service Issue</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Tech</TableHead>
                        <TableHead className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px]">Total Consumer</TableHead>
                        <TableHead className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px]">Tech Payout</TableHead>
                        <TableHead className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px]">Company Comm</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                        <TableHead className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-12 text-muted-foreground font-medium">
                            No service bookings match query.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedBookings.map((b) => {
                          const cust = customers.find(c => c.id === b.customerId)
                          const tech = technicians.find(t => t.id === b.assignedTechnicianId)
                          return (
                            <TableRow key={b.id} className="hover:bg-muted/20 transition-colors text-xs">
                              <TableCell className="px-4 py-4 font-bold text-foreground tabular-nums">{b.id}</TableCell>
                              <TableCell className="px-4 py-4 font-semibold text-muted-foreground tabular-nums">{b.date}</TableCell>
                              <TableCell className="px-4 py-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground">{cust?.name || "Unknown"}</span>
                                  <span className="text-[10px] text-muted-foreground tabular-nums">{cust?.mobile}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <div className="flex flex-col gap-1">
                                  <Badge className="w-fit text-[9px] font-bold py-0.5 px-1.5 bg-indigo-50/10 border-indigo-200/40 text-indigo-600 dark:text-indigo-400">
                                    {b.appliance === "TL-WM (Top Load Washing Machine)" ? "TL-WM" : b.appliance}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground font-semibold">{b.serviceType}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-4 max-w-[200px] font-medium text-foreground truncate" title={b.issue}>
                                {b.issue}
                              </TableCell>
                              <TableCell className="px-4 py-4 font-semibold text-foreground">
                                {tech?.name || "Unassigned"}
                              </TableCell>
                              <TableCell className="px-4 py-4 text-right font-bold text-primary tabular-nums">
                                ₹{b.totalConsumerAmount}
                              </TableCell>
                              <TableCell className="px-4 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                ₹{b.totalTechnicianAmount}
                              </TableCell>
                              <TableCell className="px-4 py-4 text-right font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                                ₹{b.totalCompanyAmount}
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <Select 
                                  value={b.status} 
                                  disabled={false}
                                  onValueChange={(val) => handleStatusChange(b.id, val)}
                                >
                                  <SelectTrigger className={`h-6 text-[9px] font-extrabold py-0.5 px-1.5 w-24 rounded-md border ${
                                    b.status === "Completed" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                      : b.status === "In Progress" 
                                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                                      : b.status === "Cancelled"
                                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                                  }`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Not Started">Not Started</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleSelectBookingForDetails(b)}
                                    className="h-6 text-[9px] font-bold px-2 bg-background hover:bg-muted"
                                  >
                                    Edit Row
                                  </Button>
                                  {currentRole === "Admin" && (
                                    <Button 
                                      variant="ghost" 
                                      onClick={() => deleteBooking(b.id)}
                                      className="h-6 w-6 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold"
                                    >
                                      ×
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              {/* Table Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3.5 border-t border-border/40 bg-muted/20">
                  <span className="text-xs text-muted-foreground">
                    Showing {Math.min(filteredBookings.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredBookings.length, currentPage * pageSize)} of {filteredBookings.length} bookings
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
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedBookings.length === 0 ? (
                  <Card className="col-span-full border-border/60 py-12 text-center text-muted-foreground font-medium">
                    No service bookings match query.
                  </Card>
                ) : (
                  paginatedBookings.map((b) => {
                    const cust = customers.find(c => c.id === b.customerId)
                    const tech = technicians.find(t => t.id === b.assignedTechnicianId)
                    return (
                      <Card key={b.id} className="border-border/60 hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between shadow-xs bg-card/40 backdrop-blur-xs">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1.5 items-center">
                              <Badge variant="outline" className="text-[10px] font-bold tabular-nums">
                                {b.id}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-medium tabular-nums">{b.date}</span>
                            </div>
                            <Select 
                              value={b.status} 
                              disabled={false}
                              onValueChange={(val) => handleStatusChange(b.id, val)}
                            >
                              <SelectTrigger className={`h-5 text-[9px] font-extrabold py-0.5 px-1.5 w-24 rounded-md border ${
                                b.status === "Completed" 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                  : b.status === "In Progress" 
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                                  : b.status === "Cancelled"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <CardTitle className="text-sm font-bold text-foreground mt-2.5 truncate">
                            {cust?.name || "Unknown"}
                          </CardTitle>
                          <CardDescription className="text-[10px] font-semibold text-muted-foreground flex gap-1 items-center mt-0.5">
                            <Badge className="text-[9px] font-bold py-0 bg-indigo-50/10 border-indigo-200/40 text-indigo-600 dark:text-indigo-400">
                              {b.appliance === "TL-WM (Top Load Washing Machine)" ? "TL-WM" : b.appliance}
                            </Badge>
                            <span>• {b.serviceType}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3 text-xs flex flex-col gap-2">
                          <div className="flex flex-col gap-1 text-muted-foreground leading-relaxed">
                            <div>
                              <span className="font-bold text-foreground">Tech Assigned:</span>{" "}
                              <span>{tech?.name || "Unassigned"}</span>
                            </div>
                            <div className="line-clamp-2">
                              <span className="font-bold text-foreground">Complaint:</span> {b.issue}
                            </div>
                            {b.spareName !== "None" && (
                              <div>
                                <span className="font-bold text-foreground">Spare Used:</span>{" "}
                                <span className="italic">{b.spareName}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Financial Ratios container */}
                          <div className="rounded-lg bg-muted/40 p-2.5 border border-border/20 flex flex-col gap-1 mt-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-foreground font-semibold">Total Consumer Bill:</span>
                              <span className="font-bold text-primary tabular-nums">₹{b.totalConsumerAmount}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-foreground font-semibold">Technician Payout:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">₹{b.totalTechnicianAmount}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-foreground font-semibold">Company Net Profit:</span>
                              <span className="font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">₹{b.totalCompanyAmount}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 border-t border-border/40 py-2 flex justify-between gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSelectBookingForDetails(b)}
                            className="h-7 text-[10px] font-bold px-2 flex-1 hover:bg-muted"
                          >
                            Edit Details
                          </Button>
                          {currentRole === "Admin" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteBooking(b.id)}
                              className="h-7 text-[10px] font-bold text-destructive hover:bg-destructive/10"
                            >
                              Delete
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    )
                  })
                )}
              </div>
              {/* Card View Pagination Controls */}
              {totalPages > 1 && (
                <Card className="border-border/60 bg-muted/20 py-3.5 px-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Showing {Math.min(filteredBookings.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredBookings.length, currentPage * pageSize)} of {filteredBookings.length} records
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
                </Card>
              )}
            </div>
          )}
        </>
      )}


      {/* ========================================================
          5. DETAILS SLIDE-OUT PANEL (Editable CRM & Payouts control)
         ======================================================== */}
      <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen} direction="right">
        <DrawerContent className="h-full w-full max-w-xl ml-auto bg-card rounded-l-2xl border-l p-0 flex flex-col">
          {selectedBooking && (
            <form onSubmit={handleSaveDetailsEdit} className="h-full flex flex-col overflow-hidden">
              <DrawerHeader className="border-b border-border/40 p-4 gap-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-semibold text-xs tabular-nums">{selectedBooking.id}</Badge>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className={`h-6 text-[10px] font-bold py-0.5 px-2 w-28 rounded-md border ${
                      editStatus === "Completed" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                        : editStatus === "In Progress" 
                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                        : editStatus === "Cancelled"
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DrawerTitle className="text-base font-bold mt-2">Edit CRM & Payouts Control Center</DrawerTitle>
                <DrawerDescription className="text-xs">
                  Modify customer parameters and workload pricing ratios. Formulas reconcile automatically.
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs">
                
                {/* 1. Customer & CRM details section */}
                <div className="rounded-lg bg-indigo-50/10 dark:bg-indigo-950/5 p-3.5 border border-indigo-200/30 flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Customer & CRM Fields</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-cust-name" className="text-[10px] font-bold text-muted-foreground uppercase">Client Name</Label>
                      <Input 
                        id="edit-cust-name" 
                        value={editCustName} 
                        onChange={(e) => setEditCustName(e.target.value)} 
                        className="h-8 text-xs" 
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-cust-mob" className="text-[10px] font-bold text-muted-foreground uppercase">Contact Number</Label>
                      <Input 
                        id="edit-cust-mob" 
                        value={editCustMobile} 
                        onChange={(e) => setEditCustMobile(e.target.value)} 
                        className="h-8 text-xs" 
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-cust-addr" className="text-[10px] font-bold text-muted-foreground uppercase">Service Address</Label>
                    <Input 
                      id="edit-cust-addr" 
                      value={editCustAddress} 
                      onChange={(e) => setEditCustAddress(e.target.value)} 
                      className="h-8 text-xs" 
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-cust-ref" className="text-[10px] font-bold text-muted-foreground uppercase">Lead Source</Label>
                      <Select value={editCustReferral} onValueChange={setEditCustReferral}>
                        <SelectTrigger id="edit-cust-ref" className="h-8 text-xs">
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

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-cust-review" className="text-[10px] font-bold text-muted-foreground uppercase">Customer Review</Label>
                      <Input 
                        id="edit-cust-review" 
                        value={editCustReview} 
                        onChange={(e) => setEditCustReview(e.target.value)} 
                        placeholder="Happy client feedback..."
                        className="h-8 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-cust-notes" className="text-[10px] font-bold text-muted-foreground uppercase">Internal Staff Notes</Label>
                    <Input 
                      id="edit-cust-notes" 
                      value={editCustNotes} 
                      onChange={(e) => setEditCustNotes(e.target.value)} 
                      className="h-8 text-xs" 
                    />
                  </div>
                </div>

                {/* 2. Booking job overview */}
                <div className="rounded-lg bg-purple-50/10 dark:bg-purple-950/5 p-3.5 border border-purple-200/30 flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Booking & Appliance Fields</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Input
                        id="edit-appliance"
                        placeholder="E.g., AC, TV, Refrigerator"
                        value={editAppliance}
                        onChange={(e) => setEditAppliance(e.target.value)}
                        className="h-8 text-xs bg-background"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-serv-type" className="text-[10px] font-bold text-muted-foreground uppercase">Service Type</Label>
                      <Select value={editServiceType} onValueChange={setEditServiceType}>
                        <SelectTrigger id="edit-serv-type" className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Repair">Repair</SelectItem>
                          <SelectItem value="Installation">Installation</SelectItem>
                          <SelectItem value="Service">Service</SelectItem>
                          <SelectItem value="Gas Filling">Gas Filling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-issue" className="text-[10px] font-bold text-muted-foreground uppercase">Service Issue Complaint</Label>
                    <Input 
                      id="edit-issue" 
                      value={editIssue} 
                      onChange={(e) => setEditIssue(e.target.value)} 
                      className="h-8 text-xs" 
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-tech" className="text-[10px] font-bold text-muted-foreground uppercase">Appointed Tech</Label>
                      <Select value={editTechId} onValueChange={setEditTechId}>
                        <SelectTrigger id="edit-tech" className="h-8 text-xs">
                          <SelectValue placeholder="Technician..." />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-spare-link" className="text-[10px] font-bold text-muted-foreground uppercase">Spare Linked</Label>
                      <Select value={editSpareName} onValueChange={setEditSpareName}>
                        <SelectTrigger id="edit-spare-link" className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">No Spare Parts (None)</SelectItem>
                          {spares.map(s => (
                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 3. Pricing input & splits engine preview */}
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Financial Ratio Reconciler</h4>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-cost" className="text-[9px] font-bold text-rose-600 uppercase">Actual Spare (R)</Label>
                      <Input 
                        type="number" 
                        id="edit-cost" 
                        min="0" 
                        value={editSpareCost} 
                        onChange={(e) => setEditSpareCost(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-semibold tabular-nums text-rose-600"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-price" className="text-[9px] font-bold text-emerald-600 uppercase">Consumer Price (S)</Label>
                      <Input 
                        type="number" 
                        id="edit-price" 
                        min="0" 
                        value={editSparePrice} 
                        onChange={(e) => setEditSparePrice(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-semibold tabular-nums text-emerald-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-svcharge" className="text-[9px] font-bold text-amber-600 uppercase">SV Charge (W)</Label>
                      <Input 
                        type="number" 
                        id="edit-svcharge" 
                        min="0" 
                        value={editServiceCharge} 
                        onChange={(e) => setEditServiceCharge(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-semibold tabular-nums text-amber-600"
                      />
                    </div>
                  </div>

                  {/* Math Splits Preview */}
                  <div className="rounded-md bg-primary/5 p-3 border border-primary/20 flex flex-col gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span className="font-bold text-foreground">Spare Commission (T = S - R)</span>
                      <span className="font-bold text-primary tabular-nums">₹{Math.max(0, editSparePrice - editSpareCost)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Tech Commission (U = T × 70%):</span>
                      <span className="font-semibold text-foreground tabular-nums">₹{(Math.max(0, editSparePrice - editSpareCost) * 0.7).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Company Commission (V = T × 30%):</span>
                      <span className="font-semibold text-foreground tabular-nums">₹{(Math.max(0, editSparePrice - editSpareCost) * 0.3).toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-border/40 my-0.5" />

                    <div className="flex justify-between">
                      <span>Tech Service Commission (X = W × 70%):</span>
                      <span className="font-semibold text-foreground tabular-nums">₹{(editServiceCharge * 0.7).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Company Service Commission (Y = W × 30%):</span>
                      <span className="font-semibold text-foreground tabular-nums">₹{(editServiceCharge * 0.3).toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-border/40 my-0.5" />

                    <div className="flex justify-between font-bold text-foreground">
                      <span>Total Technician Payout (U + X):</span>
                      <span className="text-emerald-600 tabular-nums">₹{(Math.max(0, editSparePrice - editSpareCost) * 0.7 + editServiceCharge * 0.7).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-bold text-foreground">
                      <span>Total Company Earnings (V + Y):</span>
                      <span className="text-cyan-600 tabular-nums">₹{(Math.max(0, editSparePrice - editSpareCost) * 0.3 + editServiceCharge * 0.3).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-extrabold text-foreground border-t border-border/40 pt-1 mt-1 text-xs">
                      <span className="text-primary uppercase tracking-wide">Consumer Grand Total (S + W)</span>
                      <span className="text-primary tabular-nums">₹{(editSparePrice + editServiceCharge).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>

              <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
                <Button type="submit" className="flex-1">Update Row Details</Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">Discard Edits</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          )}
        </DrawerContent>
      </Drawer>

      {/* ==========================================
          6. BOOKING CREATION MODAL / DIALOG
         ========================================== */}
      <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleCreateSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">New Appliance Service Booking</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log a customer work order request. CIN codes, inline customer records, and technician splits are handled dynamically.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                
                {/* Customer Selector / Mode Toggle */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Customer Registration Channel</Label>
                  <div className="flex gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/40 w-fit">
                    <button 
                      type="button"
                      onClick={() => setCustomerMode("existing")}
                      className={`text-xs font-bold h-7 px-3 rounded-md transition-all ${
                        customerMode === "existing" 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Registered Client
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCustomerMode("new")}
                      className={`text-xs font-bold h-7 px-3 rounded-md transition-all ${
                        customerMode === "new" 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      New Client (Inline)
                    </button>
                  </div>
                </div>

                {customerMode === "existing" ? (
                  /* Existing customer list Selector with Search */
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="cust-search" className="text-xs font-bold text-muted-foreground">Select Registered Customer</Label>
                    <div className="relative">
                      <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="cust-search"
                        placeholder="Search by name, mobile, address or CIN..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-9 bg-background h-9 text-xs border-border/60"
                      />
                    </div>
                    
                    <div className="border border-border/60 rounded-lg max-h-40 overflow-y-auto bg-muted/10 divide-y divide-border/40">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-3 text-xs text-muted-foreground text-center">No customers found matching "{customerSearch}"</div>
                      ) : (
                        filteredCustomers.map(c => {
                          const isSelected = formCustomerId === c.id
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setFormCustomerId(c.id)}
                              className={`w-full text-left p-2.5 text-xs flex items-center justify-between transition-colors ${
                                isSelected 
                                  ? "bg-primary/20 text-primary font-semibold" 
                                  : "hover:bg-muted/50 text-foreground"
                              }`}
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
                              {isSelected && (
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2.5} className="size-4 text-primary shrink-0" />
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  /* Inline Client Form */
                  <div className="flex flex-col gap-3.5 p-4 rounded-xl border border-dashed border-border/60 bg-muted/10 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="new-cust-name" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Client Name *</Label>
                      <Input 
                        id="new-cust-name" 
                        placeholder="E.g., Ramesh Sen"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="new-cust-mob" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Mobile Number *</Label>
                      <Input 
                        id="new-cust-mob" 
                        placeholder="E.g., 9911223344"
                        value={newCustMobile}
                        onChange={(e) => setNewCustMobile(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="new-cust-addr" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Service Address *</Label>
                      <Input 
                        id="new-cust-addr" 
                        placeholder="E.g., flat 402 Oakwood Apts"
                        value={newCustAddress}
                        onChange={(e) => setNewCustAddress(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="new-cust-ref" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Referral Source</Label>
                      <Select value={newCustReferral} onValueChange={setNewCustReferral}>
                        <SelectTrigger id="new-cust-ref">
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
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="new-cust-note" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Staff Notes (Optional)</Label>
                      <Input 
                        id="new-cust-note" 
                        placeholder="Gate code, dog warning..."
                        value={newCustNotes}
                        onChange={(e) => setNewCustNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Appliance Input */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="appliance" className="text-xs font-bold text-muted-foreground">Appliance</Label>
                  <Input 
                    id="appliance" 
                    placeholder="E.g., AC, TV, Refrigerator"
                    value={formAppliance}
                    onChange={(e) => setFormAppliance(e.target.value)}
                    className="bg-background"
                    required
                  />
                </div>

                {/* Service Type Selector */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="serv-type" className="text-xs font-bold text-muted-foreground">Service Type</Label>
                  <Select value={formServiceType} onValueChange={setFormServiceType}>
                    <SelectTrigger id="serv-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Installation">Installation</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Gas Filling">Gas Filling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Issue Text Box */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="issue" className="text-xs font-bold text-muted-foreground">Customer Complaint / Issue</Label>
                  <Input 
                    id="issue" 
                    placeholder="E.g., Coil leakage, ice buildup, motor noise"
                    value={formIssue}
                    onChange={(e) => setFormIssue(e.target.value)}
                    required
                  />
                </div>

                {/* Dispatch Tech Selector */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tech" className="text-xs font-bold text-muted-foreground">Assign Dispatch Technician</Label>
                  <Select value={formTechId} onValueChange={setFormTechId}>
                    <SelectTrigger id="tech">
                      <SelectValue placeholder="Dispatch Technician..." />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.skills.join(", ")})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Right Column: Pricing & Spares */}
              <div className="flex flex-col gap-4">

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="date" className="text-xs font-bold text-muted-foreground">Booking Date</Label>
                  <Input 
                    type="date" 
                    id="date" 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>
                
                {/* Spares Inventory Link */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="spare-item" className="text-xs font-bold text-muted-foreground">Link Spare parts inventory (Optional)</Label>
                  <Select value={formSpareId} onValueChange={setFormSpareId}>
                    <SelectTrigger id="spare-item">
                      <SelectValue placeholder="No Spares linked..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No Spare Parts used (None)</SelectItem>
                      {spares.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} (Stock: {s.stockQty} left)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Actual Spare Cost (R) */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="spare-cost" className="text-xs font-bold text-muted-foreground">Actual Spare Cost (R)</Label>
                    <Input 
                      type="number"
                      id="spare-cost" 
                      min="0"
                      value={formSpareCost}
                      onChange={(e) => setFormSpareCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Consumer Spare Selling Price (S) */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="spare-price" className="text-xs font-bold text-muted-foreground">Consumer Selling Cost (S)</Label>
                    <Input 
                      type="number"
                      id="spare-price" 
                      min="0"
                      value={formSparePrice}
                      onChange={(e) => setFormSparePrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Service Charge (W) */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="serv-charge" className="text-xs font-bold text-muted-foreground">Technician Workmanship/Service Charge (W)</Label>
                  <Input 
                    type="number"
                    id="serv-charge" 
                    min="0"
                    placeholder="Workmanship fee, e.g., 500"
                    value={formServiceCharge}
                    onChange={(e) => setFormServiceCharge(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Simulated Math Splits Preview */}
                <div className="mt-2 rounded-lg bg-primary/5 p-3.5 border border-primary/10 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="font-bold text-primary uppercase text-[10px] tracking-wider">Formula Preview splits (Real-Time)</span>
                  <div className="flex justify-between">
                    <span>Commission (T = S - R):</span>
                    <span className="font-semibold text-foreground">₹{Math.max(0, formSparePrice - formSpareCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tech Payout (70% split = U + X):</span>
                    <span className="font-semibold text-foreground">₹{(Math.max(0, formSparePrice - formSpareCost) * 0.7 + formServiceCharge * 0.7).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consumer Grand Bill (S + W):</span>
                    <span className="font-bold text-primary">₹{(formSparePrice + formServiceCharge).toFixed(2)}</span>
                  </div>
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Confirm Service Booking</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Request</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

    </div>
  )
}
