"use client"

import * as React from "react"
import { useCRM, Customer, compareIdsNumerically, getDisplayNotes } from "@/context/crm-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
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
  UserGroupIcon,
  CheckmarkCircle01Icon,
  HelpCircleIcon,
  InvoiceIcon,
  Database01Icon,
  MoreHorizontalCircle01Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

const getReviewDotColor = (status: string) => {
  switch (status) {
    case "Positive": return "bg-green-500"
    case "Negative": return "bg-red-500"
    case "Call didn't receive": return "bg-amber-500"
    case "Cancel Order": return "bg-zinc-500"
    default: return "bg-slate-300"
  }
}

interface CustomerModuleProps {
  hideHeader?: boolean
}

export function CustomerModule({ hideHeader = false }: CustomerModuleProps) {
  const { customers, bookings, addCustomer, updateCustomer, deleteCustomer, currentRole, setActiveTab } = useCRM()
  const [search, setSearch] = React.useState("")
  const [sourceFilter, setSourceFilter] = React.useState("ALL")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  
  // Custom View Toggle: Table vs Cards
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table")

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(8) // Standard card/row allocation

  // Form State
  const [name, setName] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [referralSource, setReferralSource] = React.useState<any>("Ad")
  const [notes, setNotes] = React.useState("")
  const [review, setReview] = React.useState("")
  const [reviewStatus, setReviewStatus] = React.useState<any>("Review not done")
  const [status, setStatus] = React.useState<any>("Active")

  // Edit Form State
  const [editName, setEditName] = React.useState("")
  const [editMobile, setEditMobile] = React.useState("")
  const [editAddress, setEditAddress] = React.useState("")
  const [editReferralSource, setEditReferralSource] = React.useState<any>("Ad")
  const [editNotes, setEditNotes] = React.useState("")
  const [editReview, setEditReview] = React.useState("")
  const [editReviewStatus, setEditReviewStatus] = React.useState<any>("Review not done")
  const [editStatus, setEditStatus] = React.useState<any>("Active")

  const [mobileError, setMobileError] = React.useState("")
  const [editMobileError, setEditMobileError] = React.useState("")

  // Reset errors when dialog status changes
  React.useEffect(() => {
    if (!isAddOpen) setMobileError("")
  }, [isAddOpen])

  React.useEffect(() => {
    if (!isEditOpen) setEditMobileError("")
  }, [isEditOpen])

  // Customer database CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      "CIN", "Name", "Mobile Number", "Address", "Referral Channel", 
      "Satisfaction Status", "Client Feedback", "Internal Notes", "Status", "Created Date"
    ]
    
    const rows = filteredCustomers.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.mobile.replace(/"/g, '""')}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.referralSource || "",
      `"${(c.reviewStatus || "Review not done").replace(/"/g, '""')}"`,
      `"${(c.review || "").replace(/"/g, '""')}"`,
      `"${(getDisplayNotes(c.notes) || "").replace(/"/g, '""')}"`,
      c.status,
      c.createdAt || ""
    ])
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `ServiceBuddy_CRM_Customers_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Customer list exported to CSV!")
  }

  // Open Edit Drawer
  const handleOpenEdit = (c: Customer) => {
    setSelectedCustomer(c)
    setEditName(c.name)
    setEditMobile(c.mobile)
    setEditAddress(c.address)
    setEditReferralSource(c.referralSource)
    setEditNotes(c.notes || "")
    setEditReview(c.review || "")
    setEditReviewStatus(c.reviewStatus || "Review not done")
    setEditStatus(c.status)
    setEditMobileError("")
    setIsEditOpen(true)
  }

  // Submit Edit Customer
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    if (!/^\d{10}$/.test(editMobile)) {
      setEditMobileError("Mobile number must be exactly 10 digits.")
      toast.error("Invalid Mobile Number", { description: "Mobile number must be exactly 10 digits." })
      return
    }
    setEditMobileError("")

    updateCustomer(selectedCustomer.id, {
      name: editName,
      mobile: editMobile,
      address: editAddress,
      referralSource: editReferralSource,
      notes: editNotes,
      review: editReview,
      reviewStatus: editReviewStatus,
      status: editStatus
    })

    setIsEditOpen(false)
  }

  // Filtered List
  const filteredCustomers = React.useMemo(() => {
    return customers.filter(c => {
      const searchString = `${c.id} ${c.name} ${c.mobile} ${c.address}`.toLowerCase()
      const matchesSearch = searchString.includes(search.toLowerCase())
      const matchesSource = sourceFilter === "ALL" || c.referralSource === sourceFilter

      return matchesSearch && matchesSource
    }).sort((a, b) => compareIdsNumerically(a.id, b.id))
  }, [customers, search, sourceFilter])

  const stats = React.useMemo(() => {
    const total = filteredCustomers.length
    const active = filteredCustomers.filter(c => c.status === "Active").length
    const repeat = filteredCustomers.filter(c => bookings.filter(b => b.customerId === c.id).length > 1).length
    
    // Satisfaction rate only on Completed and Inspected bookings
    const customerIds = new Set(filteredCustomers.map(c => c.id))
    const relevantBookings = bookings.filter(b => customerIds.has(b.customerId) && (b.status === "Completed" || b.status === "Inspected"))
    
    const positive = relevantBookings.filter(b => b.reviewStatus === "Positive").length
    const negative = relevantBookings.filter(b => b.reviewStatus === "Negative").length
    const unreachable = relevantBookings.filter(b => b.reviewStatus === "Call didn't receive").length
    const cancelOrder = relevantBookings.filter(b => b.reviewStatus === "Cancel Order").length
    
    const reviewsDone = positive + negative + unreachable + cancelOrder
    const satRate = reviewsDone > 0 ? Math.round((positive / reviewsDone) * 100) : 0
    
    return { total, active, repeat, satRate, reviewsDone }
  }, [filteredCustomers, bookings])

  // Pagination Math
  const totalPages = Math.ceil(filteredCustomers.length / pageSize)
  const paginatedCustomers = React.useMemo(() => {
    return filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filteredCustomers, currentPage, pageSize])

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, sourceFilter])

  // Submit Customer Add
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(mobile)) {
      setMobileError("Mobile number must be exactly 10 digits.")
      toast.error("Invalid Mobile Number", { description: "Mobile number must be exactly 10 digits." })
      return
    }
    setMobileError("")
    addCustomer({
      name,
      mobile,
      address,
      referralSource,
      notes,
      review,
      reviewStatus,
      status
    })

    // Reset Form
    setName("")
    setMobile("")
    setAddress("")
    setReferralSource("Ad")
    setNotes("")
    setReview("")
    setReviewStatus("Review not done")
    setStatus("Active")
    setIsAddOpen(false)
  }

  return (
    <div className={hideHeader ? "flex flex-col gap-6 animate-in fade-in duration-200" : "flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200"}>
      
      {/* Page Header */}
      {!hideHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Customer Management</h2>
            <p className="text-sm text-muted-foreground">Manage client directories, track automated customer ID codes (CIN), and record satisfaction reviews.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={() => setActiveTab("import")} variant="outline" className="w-fit cursor-pointer gap-1.5 h-10 text-xs font-bold">
              <HugeiconsIcon icon={Database01Icon} strokeWidth={2} className="size-4" />
              Import Customers
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="w-fit cursor-pointer gap-1.5 h-10 text-xs font-bold">
              <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} className="size-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddOpen(true)} className="w-fit cursor-pointer gap-1.5 h-10 text-xs font-bold">
              <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} className="size-4" />
              Onboard Customer
            </Button>
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Customer Directory Registry</h3>
            <p className="text-xs text-muted-foreground">Monitor client contact records, satisfaction levels, and active status codes.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={() => setActiveTab("import")} variant="outline" size="sm" className="cursor-pointer gap-1.5 h-9 text-xs font-bold">
              <HugeiconsIcon icon={Database01Icon} strokeWidth={2} className="size-3.5" />
              Import Customers
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="cursor-pointer gap-1.5 h-9 text-xs font-bold">
              <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} className="size-3.5" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddOpen(true)} size="sm" className="cursor-pointer gap-1.5 h-9 text-xs font-bold">
              <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} className="size-3.5" />
              Onboard Customer
            </Button>
          </div>
        </div>
      )}

      {/* Analytics: Customer directory parameters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="border-border/60">
          <CardHeader className="py-3">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Directory</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <span className="text-2xl font-bold tracking-tight">{stats.total}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">Total registered customers</span>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="py-3">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active Accounts</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{stats.active}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">Currently active status</span>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="py-3">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Repeat Clients</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <span className="text-2xl font-bold tracking-tight">{stats.repeat}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">Inbound repeat buyers</span>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="py-3">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary">Satisfaction Rate</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <span className="text-2xl font-bold tracking-tight text-primary">{stats.satRate}%</span>
            <span className="text-xs text-muted-foreground block mt-0.5">Based on {stats.reviewsDone} reviews</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table Panel */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search by CIN, name, phone or address..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* View Mode Segmented Toggler */}
            <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40 shrink-0">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-7 text-xs font-semibold py-0.5 px-2.5 rounded-md shadow-xs cursor-pointer"
              >
                Table View
              </Button>
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="h-7 text-xs font-semibold py-0.5 px-2.5 rounded-md shadow-xs cursor-pointer"
              >
                Card View
              </Button>
            </div>

            <div className="flex items-center gap-1.5 flex-1 md:flex-initial">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Channel:</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue placeholder="All Referral Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Referral Channels</SelectItem>
                  <SelectItem value="Ad">Ad</SelectItem>
                  <SelectItem value="Contact">Contact</SelectItem>
                  <SelectItem value="Repeat Consumer">Repeat Consumer</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Table View vs Card Grid View */}
      {viewMode === "table" ? (
        <Card className="border-border/60 overflow-hidden shadow-xs flex flex-col justify-between">
          <CardContent className="p-0">
            <div className="overflow-x-auto min-w-0 max-w-full">
              <Table>
                <TableHeader className="bg-muted/60 border-b border-border/50">
                  <TableRow>
                    <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">CIN</TableHead>
                    <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Name</TableHead>
                    <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Mobile Number</TableHead>
                    <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Address</TableHead>
                    <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Referral Channel</TableHead>
                    <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Client Feedback</TableHead>
                    <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                    {(currentRole === "Admin" || currentRole === "Manager") && <TableHead className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={currentRole === "Admin" ? 8 : 7} className="text-center py-12 text-muted-foreground font-medium">
                        No customer files match query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCustomers.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{c.id}</TableCell>
                        <TableCell className="px-4 py-4 text-xs font-semibold text-foreground">{c.name}</TableCell>
                        <TableCell className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{c.mobile}</TableCell>
                        <TableCell className="px-4 py-4 max-w-xs text-xs font-medium text-foreground truncate">{c.address}</TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge variant="outline" className="text-[10px] font-semibold">{c.referralSource}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 max-w-xs">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${getReviewDotColor(c.reviewStatus || "Review not done")}`} title={c.reviewStatus || "Review not done"} />
                              {c.review ? (
                                <span className="text-xs italic text-foreground font-semibold line-clamp-1">"{c.review}"</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-medium">No review comments yet</span>
                              )}
                            </div>
                            {getDisplayNotes(c.notes) && <span className="text-[9px] text-muted-foreground font-medium">Notes: {getDisplayNotes(c.notes)}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge 
                            variant="outline"
                            onClick={() => updateCustomer(c.id, { status: c.status === "Active" ? "Inactive" : "Active" })}
                            className={`text-[10px] font-bold py-0.5 px-1.5 cursor-pointer hover:opacity-85 ${
                              c.status === "Active" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                : "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800/40 dark:text-zinc-400"
                            }`}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        {(currentRole === "Admin" || currentRole === "Manager") && (
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
                                <DropdownMenuItem onClick={() => handleOpenEdit(c)} className="cursor-pointer">
                                  Edit
                                </DropdownMenuItem>
                                {currentRole === "Admin" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => deleteCustomer(c.id)}
                                      className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-semibold"
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-border/40 bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Showing {Math.min(filteredCustomers.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredCustomers.length, currentPage * pageSize)} of {filteredCustomers.length} records
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
        // Grid Card View of Customers
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedCustomers.length === 0 ? (
              <Card className="col-span-full border-border/60 py-12 text-center text-muted-foreground font-medium">
                No customer files match query.
              </Card>
            ) : (
              paginatedCustomers.map((c) => (
                <Card key={c.id} className="border-border/60 hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between shadow-xs bg-card/40 backdrop-blur-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-bold tabular-nums">
                        {c.id}
                      </Badge>
                      <Badge 
                        variant="outline"
                        onClick={() => updateCustomer(c.id, { status: c.status === "Active" ? "Inactive" : "Active" })}
                        className={`text-[10px] font-bold py-0.5 px-1.5 cursor-pointer hover:opacity-85 ${
                          c.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                            : "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800/40 dark:text-zinc-400"
                        }`}
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground mt-2.5 truncate">{c.name}</CardTitle>
                    <CardDescription className="text-[10px] font-semibold text-muted-foreground">
                      Referral: {c.referralSource}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 text-xs flex flex-col gap-2">
                    <div className="flex flex-col gap-1 text-muted-foreground leading-relaxed">
                      <div><span className="font-bold text-foreground">Mobile:</span> <span className="tabular-nums">{c.mobile}</span></div>
                      <div className="line-clamp-2"><span className="font-bold text-foreground">Address:</span> {c.address}</div>
                    </div>
                    
                    {(c.review || c.notes) && (
                      <div className="rounded-lg bg-muted/40 p-2 border border-border/20 flex flex-col gap-1.5 mt-1">
                        {c.review && (
                          <div>
                            <div className="text-[8px] uppercase tracking-wide font-extrabold text-muted-foreground">Feedback</div>
                            <div className="text-[11px] font-medium italic text-foreground leading-snug line-clamp-2">"{c.review}"</div>
                          </div>
                        )}
                        {getDisplayNotes(c.notes) && (
                          <div>
                            <div className="text-[8px] uppercase tracking-wide font-extrabold text-muted-foreground">Internal Notes</div>
                            <div className="text-[11px] leading-snug text-muted-foreground line-clamp-2">{getDisplayNotes(c.notes)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  {(currentRole === "Admin" || currentRole === "Manager") && (
                    <CardFooter className="pt-0 border-t border-border/40 py-2.5 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleOpenEdit(c)}
                        className="h-8 text-xs font-bold bg-background hover:bg-muted cursor-pointer px-2.5"
                      >
                        Edit Customer
                      </Button>
                      {currentRole === "Admin" && (
                        <Button 
                          variant="ghost" 
                          onClick={() => deleteCustomer(c.id)}
                          className="h-8 text-xs font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          Delete Customer
                        </Button>
                      )}
                    </CardFooter>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Pagination Controls for Cards */}
          {totalPages > 1 && (
            <Card className="border-border/60 bg-muted/20 py-3.5 px-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {Math.min(filteredCustomers.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredCustomers.length, currentPage * pageSize)} of {filteredCustomers.length} records
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

      {/* Customer Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Onboard New Customer Profile</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log detailed customer parameters. Auto assigns customer codes (CIN) for workflow tracking.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cust-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
                  <Input 
                    id="cust-name"
                    placeholder="E.g., Ramesh Sen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cust-mob" className="text-xs font-bold text-muted-foreground">Mobile Phone Number</Label>
                  <Input 
                    id="cust-phone" 
                    type="tel" 
                    inputMode="numeric"
                    placeholder="E.g., 9899001122" 
                    value={mobile} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setMobile(val)
                      if (mobileError && /^\d{10}$/.test(val)) setMobileError("")
                    }} 
                    className={mobileError ? "border-destructive focus-visible:ring-destructive" : ""}
                    required 
                  />
                  {mobileError && (
                    <span className="text-[10px] text-destructive font-semibold">{mobileError}</span>
                  )}
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cust-address" className="text-xs font-bold text-muted-foreground">Service Address Details</Label>
                  <Input 
                    id="cust-address"
                    placeholder="Street, Tower, Villa details"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Source Selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cust-source" className="text-xs font-bold text-muted-foreground">Referral Acquisition Source</Label>
                  <Select value={referralSource} onValueChange={setReferralSource}>
                    <SelectTrigger id="cust-source">
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

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cust-notes" className="text-xs font-bold text-muted-foreground">Internal CRM Staff Notes</Label>
                  <Input 
                    id="cust-notes"
                    placeholder="Gate codes, timing preferences, dog indicators"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Review */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cust-review" className="text-xs font-bold text-muted-foreground">Satisfaction Review Comments (Optional)</Label>
                  <Input 
                    id="cust-review"
                    placeholder="Client's satisfaction quote"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </div>

                {/* Satisfaction Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cust-review-status" className="text-xs font-bold text-muted-foreground">Satisfaction Status</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger id="cust-review-status" className="h-8 text-xs">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Review not done">Review not done</SelectItem>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="Call didn't receive">Call didn't receive</SelectItem>
                      <SelectItem value="Cancel Order" className="text-rose-600 dark:text-rose-400 font-bold">Cancel Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Onboard Profile</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Profile</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Customer Edit Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Customer Profile</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify detailed customer profile parameters.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cust-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
                  <Input 
                    id="edit-cust-name"
                    placeholder="E.g., Ramesh Sen"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cust-mob" className="text-xs font-bold text-muted-foreground">Mobile Phone Number</Label>
                  <Input 
                    id="edit-cust-phone" 
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
                  />
                  {editMobileError && (
                    <span className="text-[10px] text-destructive font-semibold">{editMobileError}</span>
                  )}
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cust-address" className="text-xs font-bold text-muted-foreground">Service Address Details</Label>
                  <Input 
                    id="edit-cust-address"
                    placeholder="Street, Tower, Villa details"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Status Selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cust-status" className="text-xs font-bold text-muted-foreground">Customer Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="edit-cust-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Source Selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cust-source" className="text-xs font-bold text-muted-foreground">Referral Acquisition Source</Label>
                  <Select value={editReferralSource} onValueChange={setEditReferralSource}>
                    <SelectTrigger id="edit-cust-source">
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

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cust-notes" className="text-xs font-bold text-muted-foreground">Internal CRM Staff Notes</Label>
                  <Input 
                    id="edit-cust-notes"
                    placeholder="Gate codes, timing preferences, dog indicators"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                {/* Review */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cust-review" className="text-xs font-bold text-muted-foreground">Satisfaction Review Comments (Optional)</Label>
                  <Input 
                    id="edit-cust-review"
                    placeholder="Client's satisfaction quote"
                    value={editReview}
                    onChange={(e) => setEditReview(e.target.value)}
                  />
                </div>

                {/* Satisfaction Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cust-review-status" className="text-xs font-bold text-muted-foreground">Satisfaction Status</Label>
                  <Select value={editReviewStatus} onValueChange={setEditReviewStatus}>
                    <SelectTrigger id="edit-cust-review-status" className="h-8 text-xs">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Review not done">Review not done</SelectItem>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="Call didn't receive">Call didn't receive</SelectItem>
                      <SelectItem value="Cancel Order" className="text-rose-600 dark:text-rose-400 font-bold">Cancel Order</SelectItem>
                    </SelectContent>
                  </Select>
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
