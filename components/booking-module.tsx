"use client"

import * as React from "react"
import { useCRM, Booking, Customer, Technician, Spare, BookingSpare, compareIdsNumerically, getDisplayNotes } from "@/context/crm-context"
import { CustomerModule } from "@/components/customer-module"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Analytics01Icon,
  Alert02Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export const getReviewDotColor = (review: string) => {
  const r = review || ""
  if (r === "Positive") return "bg-emerald-500"
  if (r === "Negative") return "bg-rose-500"
  if (r === "Call didn't receive") return "bg-orange-500"
  return "bg-blue-500" // Review not done
}

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
  const [reviewFilter, setReviewFilter] = React.useState("ALL")
  const [dateFilterType, setDateFilterType] = React.useState<"ALL" | "today" | "yesterday" | "this-week" | "this-month" | "custom">("ALL")
  const [startDateFilter, setStartDateFilter] = React.useState("")
  const [endDateFilter, setEndDateFilter] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"sheet" | "table" | "cards">("table")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(8)

  // Details & Row Editing State
  const [editAppliance, setEditAppliance] = React.useState<any>("AC")
  const [editServiceType, setEditServiceType] = React.useState<any>("Repair")
  const [editIssue, setEditIssue] = React.useState("")
  const [editTechId, setEditTechId] = React.useState("")
  const [selectedEditTechIds, setSelectedEditTechIds] = React.useState<string[]>([])
  
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
  const [editCustReviewStatus, setEditCustReviewStatus] = React.useState("Review not done")
  const [editDate, setEditDate] = React.useState("")
  const [editWorkCompletedDate, setEditWorkCompletedDate] = React.useState("")
  const [editComplaint, setEditComplaint] = React.useState("")
  const [editComplaintDate, setEditComplaintDate] = React.useState("")
  const [editComplaintStatus, setEditComplaintStatus] = React.useState("")
  const [loadedBookingId, setLoadedBookingId] = React.useState<string | null>(null)

  // Edit Calculation override states
  const [editTotalCommission, setEditTotalCommission] = React.useState(0)
  const [editTechnicianCommission, setEditTechnicianCommission] = React.useState(0)
  const [editCompanyCommission, setEditCompanyCommission] = React.useState(0)
  const [editTechnicianServiceCommission, setEditTechnicianServiceCommission] = React.useState(0)
  const [editCompanyServiceCommission, setEditCompanyServiceCommission] = React.useState(0)
  const [editTotalTechnicianAmount, setEditTotalTechnicianAmount] = React.useState(0)
  const [editTotalCompanyAmount, setEditTotalCompanyAmount] = React.useState(0)
  const [editTotalConsumerAmount, setEditTotalConsumerAmount] = React.useState(0)

  // Dynamic Spares arrays
  const [formSpares, setFormSpares] = React.useState<BookingSpare[]>([])
  const [editSpares, setEditSpares] = React.useState<BookingSpare[]>([])
  
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
  const [selectedFormTechIds, setSelectedFormTechIds] = React.useState<string[]>([])
  
  const [formSpareCost, setFormSpareCost] = React.useState(0)
  const [formSparePrice, setFormSparePrice] = React.useState(0)
  const [formServiceCharge, setFormServiceCharge] = React.useState(0)
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split("T")[0])
  const [formWorkCompletedDate, setFormWorkCompletedDate] = React.useState("")

  // ==========================================
  // Form Auto-fill Logic for spares array
  // ==========================================
  const calculatedFormSpareCost = React.useMemo(() => {
    return formSpares.reduce((sum, s) => sum + s.cost * s.qty, 0)
  }, [formSpares])

  const calculatedFormSparePrice = React.useMemo(() => {
    return formSpares.reduce((sum, s) => sum + s.price * s.qty, 0)
  }, [formSpares])

  const calculatedFormSpareName = React.useMemo(() => {
    return formSpares.length > 0 
      ? formSpares.map(s => `${s.name} (x${s.qty})`).join(", ") 
      : "None"
  }, [formSpares])

  const calculatedEditSpareCost = React.useMemo(() => {
    return editSpares.reduce((sum, s) => sum + s.cost * s.qty, 0)
  }, [editSpares])

  const calculatedEditSparePrice = React.useMemo(() => {
    return editSpares.reduce((sum, s) => sum + s.price * s.qty, 0)
  }, [editSpares])

  const calculatedEditSpareName = React.useMemo(() => {
    return editSpares.length > 0 
      ? editSpares.map(s => `${s.name} (x${s.qty})`).join(", ") 
      : "None"
  }, [editSpares])

  React.useEffect(() => {
    setFormSpareCost(calculatedFormSpareCost)
    setFormSparePrice(calculatedFormSparePrice)
  }, [calculatedFormSpareCost, calculatedFormSparePrice])

  React.useEffect(() => {
    setEditSpareCost(calculatedEditSpareCost)
    setEditSparePrice(calculatedEditSparePrice)
  }, [calculatedEditSpareCost, calculatedEditSparePrice])

  // Calculation Recalculator Effect for edits
  React.useEffect(() => {
    if (selectedBooking && selectedBooking.id === loadedBookingId) {
      const matchesCost = editSpareCost === selectedBooking.spareCost
      const matchesPrice = editSparePrice === selectedBooking.sparePrice
      const matchesCharge = editServiceCharge === selectedBooking.serviceCharge
      
      if (matchesCost && matchesPrice && matchesCharge) {
        return
      } else {
        setLoadedBookingId(null)
      }
    }

    const totalCommission = Math.max(0, editSparePrice - editSpareCost)
    const technicianCommission = Math.round(totalCommission * 0.7 * 100) / 100
    const companyCommission = Math.round(totalCommission * 0.3 * 100) / 100
    const technicianServiceCommission = Math.round(editServiceCharge * 0.7 * 100) / 100
    const companyServiceCommission = Math.round(editServiceCharge * 0.3 * 100) / 100
    const totalTechnicianAmount = Math.round((technicianCommission + technicianServiceCommission) * 100) / 100
    const totalCompanyAmount = Math.round((companyCommission + companyServiceCommission) * 100) / 100
    const totalConsumerAmount = Math.round((editSpareCost + technicianCommission + companyCommission + technicianServiceCommission + companyServiceCommission) * 100) / 100

    setEditTotalCommission(totalCommission)
    setEditTechnicianCommission(technicianCommission)
    setEditCompanyCommission(companyCommission)
    setEditTechnicianServiceCommission(technicianServiceCommission)
    setEditCompanyServiceCommission(companyServiceCommission)
    setEditTotalTechnicianAmount(totalTechnicianAmount)
    setEditTotalCompanyAmount(totalCompanyAmount)
    setEditTotalConsumerAmount(totalConsumerAmount)
  }, [editSpareCost, editSparePrice, editServiceCharge, selectedBooking, loadedBookingId])

  // Helpers for multi-technician displays
  const getTechNames = (idString: string) => {
    if (!idString) return "Unassigned"
    const ids = idString.split(",").map(id => id.trim()).filter(Boolean)
    if (ids.length === 0) return "Unassigned"
    const names = ids.map(id => technicians.find(t => t.id === id)?.name || id)
    return names.join(", ")
  }

  // Confirm and Delete booking wrapper
  const handleDeleteBooking = (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking request?")) {
      deleteBooking(id)
    }
  }

  // Select a booking to review in side panel
  const handleSelectBookingForDetails = (b: Booking) => {
    setSelectedBooking(b)
    setLoadedBookingId(b.id)
    const cust = customers.find(c => c.id === b.customerId)
    
    setEditAppliance(b.appliance)
    setEditServiceType(b.serviceType)
    setEditIssue(b.issue)
    setEditTechId(b.assignedTechnicianId)
    setSelectedEditTechIds(b.assignedTechnicianId ? b.assignedTechnicianId.split(",").map(s => s.trim()).filter(Boolean) : [])
    setEditDate(b.date || "")
    setEditWorkCompletedDate(b.workCompletedDate || "")
    setEditComplaint(b.complaint || "")
    setEditComplaintDate(b.complaintDate || "")
    setEditComplaintStatus(b.complaintStatus || "")
    
    setEditSpareName(b.spareName)
    setEditSpareCost(b.spareCost)
    setEditSparePrice(b.sparePrice)
    setEditServiceCharge(b.serviceCharge)
    setEditStatus(b.status)
    
    setEditCustName(cust?.name || "")
    setEditCustMobile(cust?.mobile || "")
    setEditCustAddress(cust?.address || "")
    setEditCustReferral(cust?.referralSource || "Ad")
    setEditCustNotes(getDisplayNotes(b.notes) || "")
    setEditCustReview(b.review || "")
    setEditCustReviewStatus(b.reviewStatus || "Review not done")

    // Seed calculations
    const spareCost = b.spareCost || 0
    const sparePrice = b.sparePrice || 0
    const serviceCharge = b.serviceCharge || 0
    const totalCommission = Math.max(0, sparePrice - spareCost)
    const technicianCommission = b.technicianCommission !== undefined ? b.technicianCommission : Math.round(totalCommission * 0.7 * 100) / 100
    const companyCommission = b.companyCommission !== undefined ? b.companyCommission : Math.round(totalCommission * 0.3 * 100) / 100
    const technicianServiceCommission = b.technicianServiceCommission !== undefined ? b.technicianServiceCommission : Math.round(serviceCharge * 0.7 * 100) / 100
    const companyServiceCommission = b.companyServiceCommission !== undefined ? b.companyServiceCommission : Math.round(serviceCharge * 0.3 * 100) / 100
    const calculatedConsumerAmount = Math.round((spareCost + technicianCommission + companyCommission + technicianServiceCommission + companyServiceCommission) * 100) / 100

    setEditTotalCommission(b.totalCommission !== undefined ? b.totalCommission : totalCommission)
    setEditTechnicianCommission(b.technicianCommission !== undefined ? b.technicianCommission : technicianCommission)
    setEditCompanyCommission(b.companyCommission !== undefined ? b.companyCommission : companyCommission)
    setEditTechnicianServiceCommission(b.technicianServiceCommission !== undefined ? b.technicianServiceCommission : technicianServiceCommission)
    setEditCompanyServiceCommission(b.companyServiceCommission !== undefined ? b.companyServiceCommission : companyServiceCommission)
    setEditTotalTechnicianAmount(b.totalTechnicianAmount !== undefined ? b.totalTechnicianAmount : Math.round((technicianCommission + technicianServiceCommission) * 100) / 100)
    setEditTotalCompanyAmount(b.totalCompanyAmount !== undefined ? b.totalCompanyAmount : Math.round((companyCommission + companyServiceCommission) * 100) / 100)
    setEditTotalConsumerAmount(b.totalConsumerAmount !== undefined ? b.totalConsumerAmount : calculatedConsumerAmount)

    // Seed sparesUsed
    setEditSpares(b.sparesUsed || (b.spareName && b.spareName !== "None" ? [{ name: b.spareName, cost: b.spareCost, price: b.sparePrice, qty: 1 }] : []))
    
    setIsDetailsOpen(true)
  }

  // Update CRM & Booking details
  const handleSaveDetailsEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    
    const finalTechId = selectedEditTechIds.join(",")
    
    // Save booking updates
    updateBooking(selectedBooking.id, {
      date: editDate,
      workCompletedDate: editWorkCompletedDate || undefined,
      complaint: editComplaint,
      complaintDate: editComplaintDate || (editComplaint ? new Date().toISOString().split("T")[0] : ""),
      complaintStatus: (editComplaintStatus as any) || (editComplaint ? "Open" : undefined),
      appliance: editAppliance,
      serviceType: editServiceType,
      issue: editIssue,
      assignedTechnicianId: finalTechId,
      spareName: calculatedEditSpareName,
      spareCost: editSpareCost,
      sparePrice: editSparePrice,
      serviceCharge: editServiceCharge,
      status: editStatus,
      sparesUsed: editSpares,
      totalCommission: editTotalCommission,
      technicianCommission: editTechnicianCommission,
      companyCommission: editCompanyCommission,
      technicianServiceCommission: editTechnicianServiceCommission,
      companyServiceCommission: editCompanyServiceCommission,
      totalTechnicianAmount: editTotalTechnicianAmount,
      totalCompanyAmount: editTotalCompanyAmount,
      totalConsumerAmount: editTotalConsumerAmount,
      notes: editCustNotes,
      review: editCustReview,
      reviewStatus: editCustReviewStatus as any
    })
    
    // Save customer updates
    updateCustomer(selectedBooking.customerId, {
      name: editCustName,
      mobile: editCustMobile,
      address: editCustAddress,
      referralSource: editCustReferral
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
      "Review", "Satisfaction Status", "Referral Source", "Notes", "Status"
    ]
    
    const rows = filteredBookings.map(b => {
      const cust = customers.find(c => c.id === b.customerId)
      
      return [
        b.id,
        b.date,
        `"${(cust?.name || "Unknown").replace(/"/g, '""')}"`,
        `"${(cust?.mobile || "").replace(/"/g, '""')}"`,
        `"${(cust?.address || "").replace(/"/g, '""')}"`,
        b.appliance,
        `"${b.issue.replace(/"/g, '""')}"`,
        `"${getTechNames(b.assignedTechnicianId).replace(/"/g, '""')}"`,
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
        `"${(b.review || "").replace(/"/g, '""')}"`,
        `"${(b.reviewStatus || "Review not done").replace(/"/g, '""')}"`,
        cust?.referralSource || "",
        `"${(getDisplayNotes(b.notes) || "").replace(/"/g, '""')}"`,
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
      
      const techNames = b.assignedTechnicianId 
        ? b.assignedTechnicianId.split(",").map(id => technicians.find(t => t.id === id.trim())?.name || "").filter(Boolean).join(" ")
        : ""
      const searchString = `${b.id} ${b.issue} ${cust?.name || ""} ${techNames}`.toLowerCase()
      const matchesSearch = searchString.includes(search.toLowerCase())
      
      const matchesAppliance = applianceFilter === "ALL" || b.appliance === applianceFilter
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter
      const matchesReview = reviewFilter === "ALL" || (b.reviewStatus || "Review not done") === reviewFilter

      // Date filtering logic
      let matchesDate = true
      if (dateFilterType === "today") {
        const todayStr = new Date().toISOString().split("T")[0]
        matchesDate = b.date === todayStr
      } else if (dateFilterType === "yesterday") {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split("T")[0]
        matchesDate = b.date === yesterdayStr
      } else if (dateFilterType === "this-week") {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
        const startStr = startOfWeek.toISOString().split("T")[0]
        matchesDate = b.date >= startStr
      } else if (dateFilterType === "this-month") {
        const todayStr = new Date().toISOString().split("T")[0]
        const currentMonthPrefix = todayStr.substring(0, 7) // YYYY-MM
        matchesDate = (b.date || "").startsWith(currentMonthPrefix)
      } else if (dateFilterType === "custom") {
        if (startDateFilter && endDateFilter) {
          matchesDate = b.date >= startDateFilter && b.date <= endDateFilter
        } else if (startDateFilter) {
          matchesDate = b.date >= startDateFilter
        } else if (endDateFilter) {
          matchesDate = b.date <= endDateFilter
        }
      }

      return matchesSearch && matchesAppliance && matchesStatus && matchesReview && matchesDate
    }).sort((a, b) => {
      const dateA = a.workCompletedDate || "";
      const dateB = b.workCompletedDate || "";
      if (dateA && dateB) {
        return dateB.localeCompare(dateA);
      }
      if (dateA) return -1;
      if (dateB) return 1;
      const bDateA = a.date || "";
      const bDateB = b.date || "";
      if (bDateA !== bDateB) {
        return bDateB.localeCompare(bDateA);
      }
      return compareIdsNumerically(b.id, a.id);
    })
  }, [bookings, customers, technicians, search, applianceFilter, statusFilter, reviewFilter, dateFilterType, startDateFilter, endDateFilter])

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
  }, [search, applianceFilter, statusFilter, reviewFilter, dateFilterType, startDateFilter, endDateFilter])

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
        notes: newCustNotes || "",
        review: "Review not done",
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

    const finalTechId = selectedFormTechIds.join(",")

    addBooking({
      date: formDate,
      workCompletedDate: formWorkCompletedDate || undefined,
      customerId: finalCustomerId,
      appliance: formAppliance,
      serviceType: formServiceType,
      issue: formIssue,
      assignedTechnicianId: finalTechId,
      spareName: calculatedFormSpareName,
      spareCost: formSpareCost,
      sparePrice: formSparePrice,
      serviceCharge: formServiceCharge,
      status: "Not Started",
      sparesUsed: formSpares
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
    setSelectedFormTechIds([])
    setFormSpares([])
    setFormSpareCost(0)
    setFormSparePrice(0)
    setFormServiceCharge(0)
    setFormWorkCompletedDate("")
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
                    {bookings.filter(b => b.status === "In Progress" || b.status === "Not Started" || b.status === "Inspected").length}
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
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Customers</CardDescription>
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2.5} className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground">{customers.length}</span>
                  <span className="text-xs text-muted-foreground font-medium">clients onboarded</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1.5">
                  Repeat clients: {customers.filter(c => bookings.filter(b => b.customerId === c.id).length > 1).length}
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
                {/* Date Filter */}
                <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Date:</Label>
                  <Select value={dateFilterType} onValueChange={(val: any) => {
                    setDateFilterType(val)
                    if (val !== "custom") {
                      setStartDateFilter("")
                      setEndDateFilter("")
                    }
                  }}>
                    <SelectTrigger className="w-full md:w-36">
                      <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateFilterType === "custom" && (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1 duration-150 flex-1 md:flex-none">
                    <Input
                      type="date"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="h-9 text-xs w-28 bg-muted/20 border-border/60 focus:bg-background"
                      placeholder="Start Date"
                    />
                    <span className="text-muted-foreground text-xs font-semibold">to</span>
                    <Input
                      type="date"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="h-9 text-xs w-28 bg-muted/20 border-border/60 focus:bg-background"
                      placeholder="End Date"
                    />
                  </div>
                )}

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
                      <SelectItem value="Inspected">Inspected</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Review Filter */}
                <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Review:</Label>
                  <Select value={reviewFilter} onValueChange={setReviewFilter}>
                    <SelectTrigger className="w-full md:w-36">
                      <SelectValue placeholder="All Reviews" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Reviews</SelectItem>
                      <SelectItem value="Review not done">Review not done</SelectItem>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="Call didn't receive">Call didn't receive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Master Combined spreadsheet vs compact table list rendering */}
          {viewMode === "sheet" ? (
            /* ========================================================
               A. Master Spreadsheet View (Fullscreen Overlay)
               ======================================================== */
            <div className="fixed inset-0 bg-background z-40 flex flex-col p-6 overflow-hidden animate-in fade-in duration-200">
              {/* Header Bar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 shrink-0">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2.5} className="size-5 text-primary" />
                    Master Spreadsheet Ledger
                  </h2>
                  <p className="text-xs text-muted-foreground">Comprehensive grid representing all customer jobs, warranty fields, and financial splits.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* View Switcher */}
                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 text-xs font-semibold mr-2 shrink-0">
                    <button
                      onClick={() => setViewMode("table")}
                      className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                    >
                      Table List
                    </button>
                    <button
                      onClick={() => setViewMode("cards")}
                      className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                    >
                      Card Grid
                    </button>
                    <button
                      className="px-2.5 py-1.5 rounded-md bg-background text-foreground shadow-sm font-bold cursor-pointer transition-all"
                    >
                      Spreadsheet
                    </button>
                  </div>

                  <Button onClick={handleExportCSV} variant="outline" size="sm" className="h-9">
                    <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} className="size-4" />
                    Export CSV
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setViewMode("table")}
                    className="h-9 px-4 hover:bg-muted/80 font-bold"
                  >
                    Close Sheet
                  </Button>
                </div>
              </div>

              {/* Filters Panel inside Fullscreen */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-3 shrink-0 border-b border-border/20">
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
                      <SelectTrigger className="w-full md:w-44 h-8 text-xs">
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
                      <SelectTrigger className="w-full md:w-36 h-8 text-xs">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Inspected">Inspected</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Review Filter */}
                  <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Review:</Label>
                    <Select value={reviewFilter} onValueChange={setReviewFilter}>
                      <SelectTrigger className="w-full md:w-36 h-8 text-xs">
                        <SelectValue placeholder="All Reviews" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Reviews</SelectItem>
                        <SelectItem value="Review not done">Review not done</SelectItem>
                        <SelectItem value="Positive">Positive</SelectItem>
                        <SelectItem value="Negative">Negative</SelectItem>
                        <SelectItem value="Call didn't receive">Call didn't receive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Scrollable table container */}
              <div className="flex-1 overflow-auto w-full mt-4 border border-border rounded-xl shadow-xs">
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
                      <th className="px-3 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 w-36 text-left">Satisfaction</th>
                      <th className="px-3 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 w-56 text-left">Customer Notes</th>
 
                      {/* Booking & Job headers */}
                      <th className="px-3 py-3 bg-purple-50/40 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 w-28 text-left">Booking Date</th>
                      <th className="px-3 py-3 bg-purple-50/40 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 w-36 text-left">Work Completed Date</th>
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
                      <th className="px-3 py-3 bg-primary/10 dark:bg-primary/30 font-black text-primary w-36 text-right">Total Consumer (R+U+V+X+Y)</th>
 
                      <th className="px-3 py-3 w-28 text-left">Status</th>
                      <th className="px-3 py-3 text-right w-24 sticky right-0 bg-background dark:bg-slate-900 z-10 border-l border-border/40 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={25} className="text-center py-12 text-muted-foreground font-medium bg-card">
                          No matching service bookings logged.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const cust = customers.find(c => c.id === b.customerId)
                        const hasComplaint = !!b.complaint
                        const isComplaintActive = hasComplaint && b.complaintStatus !== "Resolved" && b.complaintStatus !== "Dismissed"
 
                        const rowBgClass = isComplaintActive 
                          ? "bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-900/30" 
                          : hasComplaint 
                          ? "bg-rose-50/30 hover:bg-rose-100/30 dark:bg-rose-950/10 dark:hover:bg-rose-900/20"
                          : "bg-card/25 hover:bg-muted/30"
 
                        const stickyBgClass = isComplaintActive 
                          ? "bg-rose-50 dark:bg-rose-950/40" 
                          : hasComplaint 
                          ? "bg-rose-50/60 dark:bg-rose-950/20"
                          : "bg-background dark:bg-slate-900"
 
                        return (
                          <tr key={b.id} className={`transition-colors text-xs ${rowBgClass}`}>
                            {/* Frozen columns CIN */}
                            <td className={`px-3 py-2.5 font-bold text-foreground sticky left-0 border-r border-border/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] z-10 ${stickyBgClass}`}>
                              {b.id}
                            </td>
                            
                            {/* Frozen customer name */}
                            <td className={`px-3 py-2.5 font-bold text-foreground sticky left-24 border-r border-border/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] z-10 truncate max-w-[150px] ${stickyBgClass}`}>
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
                            <td className="px-3 py-2.5 text-foreground font-medium truncate max-w-[200px]" title={b.review}>
                              {b.review || <span className="text-[9px] text-muted-foreground/45">No review text</span>}
                            </td>
                            <td className="px-3 py-2.5">
                              <Select 
                                value={b.reviewStatus || "Review not done"} 
                                onValueChange={(val) => {
                                  updateBooking(b.id, { reviewStatus: val as any })
                                }}
                              >
                                <SelectTrigger className={`h-6 text-[9px] font-extrabold py-0.5 px-1.5 w-32 rounded-md border ${
                                  (b.reviewStatus || "Review not done") === "Positive" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                    : (b.reviewStatus || "Review not done") === "Negative" 
                                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                                    : (b.reviewStatus || "Review not done") === "Call didn't receive"
                                    ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400"
                                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                                }`}>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${getReviewDotColor(b.reviewStatus || "Review not done")}`} />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Review not done">Review not done</SelectItem>
                                  <SelectItem value="Positive">Positive</SelectItem>
                                  <SelectItem value="Negative">Negative</SelectItem>
                                  <SelectItem value="Call didn't receive">Call didn't receive</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[200px]" title={getDisplayNotes(b.notes)}>
                              {getDisplayNotes(b.notes) || <span className="text-[9px] text-muted-foreground/45">None</span>}
                            </td>
 
                            {/* Booking columns */}
                            <td className="px-3 py-2.5 text-muted-foreground font-semibold tabular-nums">{b.date}</td>
                            <td className="px-3 py-2.5 text-muted-foreground font-semibold tabular-nums">{b.workCompletedDate || <span className="text-muted-foreground/40">—</span>}</td>
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
                            <td className="px-3 py-2.5 font-medium text-foreground max-w-[200px]" title={b.issue}>
                              <div className="flex flex-col gap-0.5">
                                <span className="truncate block">{b.issue}</span>
                                {hasComplaint && (
                                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5 leading-tight">
                                    ⚠️ Complaint ({b.complaintStatus || "Open"}): {b.complaint}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-foreground">{getTechNames(b.assignedTechnicianId)}</td>
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
                                    : b.status === "Inspected"
                                    ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400"
                                    : b.status === "Cancelled"
                                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                                }`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Not Started">Not Started</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Inspected">Inspected</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
 
                            {/* Edit Row button in sticky end column */}
                            <td className={`px-3 py-2.5 text-right sticky right-0 z-10 border-l border-border/40 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] ${stickyBgClass}`}>
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
                                    onClick={() => handleDeleteBooking(b.id)}
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
            </div>
          ) : viewMode === "table" ? (
            <Card className="border-border/60 overflow-hidden shadow-xs flex flex-col justify-between">
              <CardContent className="p-0">
                <div className="overflow-x-auto min-w-0 max-w-full">
                  <Table>
                    <TableHeader className="bg-muted/60 border-b border-border/50">
                      <TableRow>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">CIN</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Date</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Work Completed Date</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Customer</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Review</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Satisfaction</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Appliance & Type</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Service Issue</TableHead>
                        <TableHead className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Notes</TableHead>
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
                          <TableCell colSpan={15} className="text-center py-12 text-muted-foreground font-medium">
                            No service bookings match query.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedBookings.map((b) => {
                          const cust = customers.find(c => c.id === b.customerId)
                          const hasComplaint = !!b.complaint
                          const isComplaintActive = hasComplaint && b.complaintStatus !== "Resolved" && b.complaintStatus !== "Dismissed"

                          const rowBgClass = isComplaintActive 
                            ? "bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-900/30" 
                            : hasComplaint 
                            ? "bg-rose-50/30 hover:bg-rose-100/30 dark:bg-rose-950/10 dark:hover:bg-rose-900/20"
                            : "hover:bg-muted/20"

                          return (
                            <TableRow key={b.id} className={`transition-colors text-xs ${rowBgClass}`}>
                              <TableCell className="px-4 py-4 font-bold text-foreground tabular-nums">{b.id}</TableCell>
                              <TableCell className="px-4 py-4 font-semibold text-muted-foreground tabular-nums">{b.date}</TableCell>
                              <TableCell className="px-4 py-4 font-semibold text-muted-foreground tabular-nums">
                                {b.workCompletedDate || <span className="text-muted-foreground/40">—</span>}
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground">{cust?.name || "Unknown"}</span>
                                  <span className="text-[10px] text-muted-foreground tabular-nums">{cust?.mobile}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-4 max-w-[150px] truncate font-medium text-foreground" title={b.review || ""}>
                                {b.review || <span className="text-muted-foreground/45">—</span>}
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <Select 
                                  value={b.reviewStatus || "Review not done"} 
                                  onValueChange={(val) => {
                                    updateBooking(b.id, { reviewStatus: val as any })
                                  }}
                                >
                                  <SelectTrigger className={`h-6 text-[9px] font-extrabold py-0.5 px-1.5 w-32 rounded-md border ${
                                    (b.reviewStatus || "Review not done") === "Positive" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                      : (b.reviewStatus || "Review not done") === "Negative" 
                                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                                      : (b.reviewStatus || "Review not done") === "Call didn't receive"
                                      ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400"
                                      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                                  }`}>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${getReviewDotColor(b.reviewStatus || "Review not done")}`} />
                                      <SelectValue />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Review not done">Review not done</SelectItem>
                                    <SelectItem value="Positive">Positive</SelectItem>
                                    <SelectItem value="Negative">Negative</SelectItem>
                                    <SelectItem value="Call didn't receive">Call didn't receive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <div className="flex flex-col gap-1">
                                  <Badge className="w-fit text-[9px] font-bold py-0.5 px-1.5 bg-indigo-50/10 border-indigo-200/40 text-indigo-600 dark:text-indigo-400">
                                    {b.appliance === "TL-WM (Top Load Washing Machine)" ? "TL-WM" : b.appliance}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground font-semibold">{b.serviceType}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-4 max-w-[200px]" title={b.issue}>
                                <div className="flex flex-col gap-0.5">
                                  <span className="truncate block">{b.issue}</span>
                                  {hasComplaint && (
                                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5 leading-tight">
                                      ⚠️ Complaint ({b.complaintStatus || "Open"}): {b.complaint}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-4 max-w-[150px] truncate font-medium text-muted-foreground" title={getDisplayNotes(b.notes) || ""}>
                                {getDisplayNotes(b.notes) || <span className="text-muted-foreground/45">None</span>}
                              </TableCell>
                              <TableCell className="px-4 py-4 font-semibold text-foreground">
                                {getTechNames(b.assignedTechnicianId)}
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
                                      : b.status === "Inspected"
                                      ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400"
                                      : b.status === "Cancelled"
                                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                                  }`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Not Started">Not Started</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Inspected">Inspected</SelectItem>
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
                                      onClick={() => handleDeleteBooking(b.id)}
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
                    const hasComplaint = !!b.complaint
                    const isComplaintActive = hasComplaint && b.complaintStatus !== "Resolved" && b.complaintStatus !== "Dismissed"
                    return (
                      <Card key={b.id} className={`border-border/60 hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between shadow-xs bg-card/40 backdrop-blur-xs ${
                        isComplaintActive ? "border-rose-500/50 shadow-rose-100/50 dark:shadow-none ring-1 ring-rose-500/20" : hasComplaint ? "border-rose-400/30 ring-1 ring-rose-400/10" : ""
                      }`}>
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
                                  : b.status === "Inspected"
                                  ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400"
                                  : b.status === "Cancelled"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Inspected">Inspected</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <CardTitle className="text-sm font-bold text-foreground mt-2.5 flex items-center justify-between gap-2">
                            <span className="truncate">{cust?.name || "Unknown"}</span>
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getReviewDotColor(cust?.reviewStatus || "Review not done")}`} title={cust?.reviewStatus || "Review not done"} />
                          </CardTitle>
                          <CardDescription className="text-[10px] font-semibold text-muted-foreground flex gap-1 items-center mt-0.5">
                            <Badge className="text-[9px] font-bold py-0 bg-indigo-50/10 border-indigo-200/40 text-indigo-600 dark:text-indigo-400">
                              {b.appliance === "TL-WM (Top Load Washing Machine)" ? "TL-WM" : b.appliance}
                            </Badge>
                            <span>• {b.serviceType}</span>
                          </CardDescription>
                        </CardHeader>
                        
                        {hasComplaint && (
                          <div className={`px-4 py-2 border-y text-xs flex flex-col gap-0.5 ${
                            isComplaintActive 
                              ? "bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/40" 
                              : "bg-rose-50/40 text-rose-700 border-rose-100/30 dark:bg-rose-950/10 dark:text-rose-400/80 dark:border-rose-950/20"
                          }`}>
                            <div className="flex items-center justify-between font-bold text-[10px] uppercase tracking-wider">
                              <span className="flex items-center gap-1">⚠️ Customer Complaint</span>
                              <Badge className={`text-[8px] px-1 py-0 h-4 font-extrabold ${
                                b.complaintStatus === "Resolved" 
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" 
                                  : b.complaintStatus === "Dismissed"
                                  ? "bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-400"
                                  : "bg-rose-100 text-rose-800 animate-pulse dark:bg-rose-950/40 dark:text-rose-400"
                              }`}>
                                {b.complaintStatus || "Open"}
                              </Badge>
                            </div>
                            <p className="mt-1 font-semibold leading-relaxed line-clamp-3">{b.complaint}</p>
                            {b.complaintDate && <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">Logged on {b.complaintDate}</span>}
                          </div>
                        )}
                        
                        <CardContent className="pb-3 text-xs flex flex-col gap-2">
                          <div className="flex flex-col gap-1 text-muted-foreground leading-relaxed">
                            <div>
                              <span className="font-bold text-foreground">Tech Assigned:</span>{" "}
                              <span>{getTechNames(b.assignedTechnicianId)}</span>
                            </div>
                            <div className="line-clamp-2">
                              <span className="font-bold text-foreground">Complaint:</span> {b.issue}
                            </div>
                            {getDisplayNotes(b.notes) && (
                              <div className="line-clamp-1">
                                <span className="font-bold text-foreground">Notes:</span> {getDisplayNotes(b.notes)}
                              </div>
                            )}
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
                              onClick={() => handleDeleteBooking(b.id)}
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
        <DrawerContent className="h-full w-full data-[vaul-drawer-direction=right]:sm:max-w-5xl ml-auto bg-card rounded-l-2xl border-l p-0 flex flex-col">
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
                        : editStatus === "Inspected"
                        ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400"
                        : editStatus === "Cancelled"
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Inspected">Inspected</SelectItem>
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
                      <Label htmlFor="edit-cust-ref" className="text-[10px] font-bold text-muted-foreground uppercase">Referral Source</Label>
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
                      <Label htmlFor="edit-cust-review-status" className="text-[10px] font-bold text-muted-foreground uppercase">Satisfaction Status</Label>
                      <Select value={editCustReviewStatus} onValueChange={setEditCustReviewStatus}>
                        <SelectTrigger id="edit-cust-review-status" className="h-8 text-xs">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Review not done">Review not done</SelectItem>
                          <SelectItem value="Positive">Positive</SelectItem>
                          <SelectItem value="Negative">Negative</SelectItem>
                          <SelectItem value="Call didn't receive">Call didn't receive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-cust-review" className="text-[10px] font-bold text-muted-foreground uppercase">Customer Review</Label>
                    <Input 
                      id="edit-cust-review" 
                      placeholder="Feedback comments"
                      value={editCustReview} 
                      onChange={(e) => setEditCustReview(e.target.value)} 
                      className="h-8 text-xs" 
                    />
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
                      <Label htmlFor="edit-date" className="text-[10px] font-bold text-muted-foreground uppercase">Booking Date</Label>
                      <Input
                        type="date"
                        id="edit-date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-work-completed-date" className="text-[10px] font-bold text-muted-foreground uppercase">Work Completed Date</Label>
                      <Input
                        type="date"
                        id="edit-work-completed-date"
                        value={editWorkCompletedDate || ""}
                        onChange={(e) => setEditWorkCompletedDate(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-appliance" className="text-[10px] font-bold text-muted-foreground uppercase">Appliance</Label>
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

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Appointed Technician(s) (Optional)</Label>
                      <div className="flex flex-col gap-1.5 border border-border/60 rounded-lg p-2.5 max-h-40 overflow-y-auto bg-background">
                        {technicians.map(t => {
                          const isChecked = selectedEditTechIds.includes(t.id)
                          return (
                            <label key={t.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer p-1 rounded-md hover:bg-muted/40 text-foreground">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedEditTechIds(selectedEditTechIds.filter(id => id !== t.id))
                                  } else {
                                    setSelectedEditTechIds([...selectedEditTechIds, t.id])
                                  }
                                }}
                                className="size-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                              <span>{t.name} ({t.skills.join(", ")})</span>
                            </label>
                          )
                        })}
                        {technicians.length === 0 && <span className="text-xs text-muted-foreground">No technicians available</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Spares Section */}
                <div className="flex flex-col gap-3 border border-border bg-muted/20 p-3.5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Spare Parts Used</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditSpares([...editSpares, { name: "", cost: 0, price: 0, qty: 1 }])}
                      className="h-7 text-[10px] font-bold"
                    >
                      + Add Spare Item
                    </Button>
                  </div>
                  
                  {editSpares.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">No spares added yet.</span>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {editSpares.map((sp, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-2 border rounded-lg bg-background relative">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setEditSpares(editSpares.filter((_, i) => i !== idx))}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-destructive hover:bg-destructive/10 p-0 text-[10px]"
                          >
                            ×
                          </Button>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Select from Catalog or Custom</Label>
                              <Select 
                                value={spares.find(s => s.name === sp.name)?.id || "CUSTOM"}
                                onValueChange={(val) => {
                                  const updated = [...editSpares]
                                  if (val === "CUSTOM") {
                                    updated[idx] = { ...updated[idx], name: "", cost: 0, price: 0 }
                                  } else {
                                    const match = spares.find(s => s.id === val)
                                    if (match) {
                                      updated[idx] = { ...updated[idx], name: match.name, cost: match.unitCost, price: match.sellingCost }
                                    }
                                  }
                                  setEditSpares(updated)
                                }}
                              >
                                <SelectTrigger className="h-7 text-[11px]">
                                  <SelectValue placeholder="Custom / Manual Entry" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CUSTOM">Custom Spare (Type Manually)</SelectItem>
                                  {spares.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name} (Stock: {s.stockQty})</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Spare Item Name</Label>
                              <Input 
                                placeholder="E.g., 2.5 MFD Capacitor" 
                                value={sp.name}
                                onChange={(e) => {
                                  const updated = [...editSpares]
                                  updated[idx].name = e.target.value
                                  setEditSpares(updated)
                                }}
                                className="h-7 text-xs"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Cost (R)</Label>
                              <Input 
                                type="number" 
                                min="0"
                                value={sp.cost}
                                onChange={(e) => {
                                  const updated = [...editSpares]
                                  updated[idx].cost = parseFloat(e.target.value) || 0
                                  setEditSpares(updated)
                                }}
                                className="h-7 text-xs font-semibold tabular-nums"
                                required
                              />
                            </div>
                            
                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Price (S)</Label>
                              <Input 
                                type="number" 
                                min="0"
                                value={sp.price}
                                onChange={(e) => {
                                  const updated = [...editSpares]
                                  updated[idx].price = parseFloat(e.target.value) || 0
                                  setEditSpares(updated)
                                }}
                                className="h-7 text-xs font-semibold tabular-nums"
                                required
                              />
                            </div>

                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Quantity</Label>
                              <Input 
                                type="number" 
                                min="1"
                                value={sp.qty}
                                onChange={(e) => {
                                  const updated = [...editSpares]
                                  updated[idx].qty = parseInt(e.target.value) || 1
                                  setEditSpares(updated)
                                }}
                                className="h-7 text-xs font-semibold tabular-nums"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] border-t border-border/40 pt-2 font-bold text-muted-foreground mt-1">
                    <span>Total Cost (R): ₹{editSpareCost}</span>
                    <span>Total Price (S): ₹{editSparePrice}</span>
                  </div>
                </div>

                {/* 4. Pricing inputs */}
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Additional Workmanship Fees</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-svcharge" className="text-[10px] font-bold text-amber-600 uppercase">SV Charge (W)</Label>
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

                {/* 5. Pricing splits overrides */}
                <div className="rounded-lg border border-border bg-primary/5 p-3.5 flex flex-col gap-3.5">
                  <span className="font-bold text-foreground border-b border-border/40 pb-1 flex justify-between items-center text-[10px]">
                    <span>FINANCIAL CALCULATION ENGINE (EDITABLE OVERRIDES)</span>
                    <Badge variant="secondary" className="text-[9px] py-0 px-1 hover:opacity-85 cursor-pointer" onClick={() => {
                      const totalCommission = Math.max(0, editSparePrice - editSpareCost)
                      const technicianCommission = Math.round(totalCommission * 0.7 * 100) / 100
                      const companyCommission = Math.round(totalCommission * 0.3 * 100) / 100
                      const technicianServiceCommission = Math.round(editServiceCharge * 0.7 * 100) / 100
                      const companyServiceCommission = Math.round(editServiceCharge * 0.3 * 100) / 100
                      const totalTechnicianAmount = Math.round((technicianCommission + technicianServiceCommission) * 100) / 100
                      const totalCompanyAmount = Math.round((companyCommission + companyServiceCommission) * 100) / 100
                      const totalConsumerAmount = Math.round((editSpareCost + technicianCommission + companyCommission + technicianServiceCommission + companyServiceCommission) * 100) / 100

                      setEditTotalCommission(totalCommission)
                      setEditTechnicianCommission(technicianCommission)
                      setEditCompanyCommission(companyCommission)
                      setEditTechnicianServiceCommission(technicianServiceCommission)
                      setEditCompanyServiceCommission(companyServiceCommission)
                      setEditTotalTechnicianAmount(totalTechnicianAmount)
                      setEditTotalCompanyAmount(totalCompanyAmount)
                      setEditTotalConsumerAmount(totalConsumerAmount)
                      toast.info("Defaults restored.")
                    }}>Reset formulas</Badge>
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-[9px] font-bold text-muted-foreground uppercase">Spare Comm (T = S-R)</Label>
                      <Input 
                        type="number" 
                        value={editTotalCommission} 
                        onChange={(e) => setEditTotalCommission(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-semibold tabular-nums"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Label className="text-[9px] font-bold text-muted-foreground uppercase">Tech Comm (U = T * 70%)</Label>
                      <Input 
                        type="number" 
                        value={editTechnicianCommission} 
                        onChange={(e) => setEditTechnicianCommission(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-semibold tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-[9px] font-bold text-muted-foreground uppercase">Comp Comm (V = T * 30%)</Label>
                      <Input 
                        type="number" 
                        value={editCompanyCommission} 
                        onChange={(e) => setEditCompanyCommission(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-semibold tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-[9px] font-bold text-muted-foreground uppercase">Tech Serv Comm (X = W * 70%)</Label>
                      <Input 
                        type="number" 
                        value={editTechnicianServiceCommission} 
                        onChange={(e) => setEditTechnicianServiceCommission(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-semibold tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-[9px] font-bold text-muted-foreground uppercase">Comp Serv Comm (Y = W * 30%)</Label>
                      <Input 
                        type="number" 
                        value={editCompanyServiceCommission} 
                        onChange={(e) => setEditCompanyServiceCommission(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-semibold tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-[9px] font-bold text-emerald-600 uppercase font-black">Total Tech Payout (U+X)</Label>
                      <Input 
                        type="number" 
                        value={editTotalTechnicianAmount} 
                        onChange={(e) => setEditTotalTechnicianAmount(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-[9px] font-bold text-cyan-600 uppercase font-black">Total Company Share (V+Y)</Label>
                      <Input 
                        type="number" 
                        value={editTotalCompanyAmount} 
                        onChange={(e) => setEditTotalCompanyAmount(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-bold text-cyan-600 dark:text-cyan-400 tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-[9px] font-bold text-primary uppercase font-black">Total Consumer Bill (R+U+V+X+Y)</Label>
                      <Input 
                        type="number" 
                        value={editTotalConsumerAmount} 
                        onChange={(e) => setEditTotalConsumerAmount(parseFloat(e.target.value) || 0)} 
                        className="h-8 text-xs font-bold text-primary tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Complaint Panel Section */}
                <div className="rounded-lg border border-rose-200/30 bg-rose-50/5 dark:bg-rose-950/5 p-3.5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-rose-500/10 text-rose-500">
                      <HugeiconsIcon icon={Alert02Icon} strokeWidth={2.5} className="size-4" />
                    </div>
                    <h4 className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Raise / Manage Complaint</h4>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-complaint" className="text-[10px] font-bold text-muted-foreground uppercase">Complaint Details</Label>
                    <Textarea 
                      id="edit-complaint" 
                      placeholder="Describe the complaint/issue reported by the customer..."
                      value={editComplaint} 
                      onChange={(e) => {
                        setEditComplaint(e.target.value)
                        if (e.target.value && !editComplaintStatus) {
                          setEditComplaintStatus("Open")
                        }
                        if (e.target.value && !editComplaintDate) {
                          setEditComplaintDate(new Date().toISOString().split("T")[0])
                        }
                      }}
                      className="min-h-[70px] text-xs bg-background/50 border-rose-200/20"
                    />
                  </div>

                  {editComplaint && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="edit-complaint-date" className="text-[10px] font-bold text-muted-foreground uppercase">Date Logged</Label>
                        <Input 
                          type="date"
                          id="edit-complaint-date" 
                          value={editComplaintDate} 
                          onChange={(e) => setEditComplaintDate(e.target.value)} 
                          className="h-8 text-xs bg-background/50"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="edit-complaint-status" className="text-[10px] font-bold text-muted-foreground uppercase">Complaint Status</Label>
                        <Select 
                          value={editComplaintStatus} 
                          onValueChange={(val: any) => setEditComplaintStatus(val)}
                        >
                          <SelectTrigger id="edit-complaint-status" className="h-8 text-xs bg-background/50">
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
                    </div>
                  )}
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

                {/* Appointed Technician(s) (Optional) */}
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Appointed Technician(s) (Optional)</Label>
                  <div className="flex flex-col gap-1.5 border border-border/60 rounded-lg p-2.5 max-h-40 overflow-y-auto bg-background">
                    {technicians.map(t => {
                      const isChecked = selectedFormTechIds.includes(t.id)
                      return (
                        <label key={t.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer p-1 rounded-md hover:bg-muted/40 text-foreground">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedFormTechIds(selectedFormTechIds.filter(id => id !== t.id))
                              } else {
                                setSelectedFormTechIds([...selectedFormTechIds, t.id])
                              }
                            }}
                            className="size-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                          <span>{t.name} ({t.skills.join(", ")})</span>
                        </label>
                      )
                    })}
                    {technicians.length === 0 && <span className="text-xs text-muted-foreground">No technicians available</span>}
                  </div>
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
                
                {/* Spares Section */}
                <div className="flex flex-col gap-3 border border-border bg-muted/20 p-3.5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Spare Parts Used</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFormSpares([...formSpares, { name: "", cost: 0, price: 0, qty: 1 }])}
                      className="h-7 text-[10px] font-bold"
                    >
                      + Add Spare Item
                    </Button>
                  </div>
                  
                  {formSpares.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">No spares added yet.</span>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {formSpares.map((sp, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-2 border rounded-lg bg-background relative">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setFormSpares(formSpares.filter((_, i) => i !== idx))}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-destructive hover:bg-destructive/10 p-0 text-[10px]"
                          >
                            ×
                          </Button>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Select from Catalog or Custom</Label>
                              <Select 
                                value={spares.find(s => s.name === sp.name)?.id || "CUSTOM"}
                                onValueChange={(val) => {
                                  const updated = [...formSpares]
                                  if (val === "CUSTOM") {
                                    updated[idx] = { ...updated[idx], name: "", cost: 0, price: 0 }
                                  } else {
                                    const match = spares.find(s => s.id === val)
                                    if (match) {
                                      updated[idx] = { ...updated[idx], name: match.name, cost: match.unitCost, price: match.sellingCost }
                                    }
                                  }
                                  setFormSpares(updated)
                                }}
                              >
                                <SelectTrigger className="h-7 text-[11px]">
                                  <SelectValue placeholder="Custom / Manual Entry" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CUSTOM">Custom Spare (Type Manually)</SelectItem>
                                  {spares.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name} (Stock: {s.stockQty})</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Spare Item Name</Label>
                              <Input 
                                placeholder="E.g., 2.5 MFD Capacitor" 
                                value={sp.name}
                                onChange={(e) => {
                                  const updated = [...formSpares]
                                  updated[idx].name = e.target.value
                                  setFormSpares(updated)
                                }}
                                className="h-7 text-xs"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Cost (R)</Label>
                              <Input 
                                type="number" 
                                min="0"
                                value={sp.cost}
                                onChange={(e) => {
                                  const updated = [...formSpares]
                                  updated[idx].cost = parseFloat(e.target.value) || 0
                                  setFormSpares(updated)
                                }}
                                className="h-7 text-xs font-semibold tabular-nums"
                                required
                              />
                            </div>
                            
                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Price (S)</Label>
                              <Input 
                                type="number" 
                                min="0"
                                value={sp.price}
                                onChange={(e) => {
                                  const updated = [...formSpares]
                                  updated[idx].price = parseFloat(e.target.value) || 0
                                  setFormSpares(updated)
                                }}
                                className="h-7 text-xs font-semibold tabular-nums"
                                required
                              />
                            </div>

                            <div>
                              <Label className="text-[10px] font-bold text-muted-foreground">Quantity</Label>
                              <Input 
                                type="number" 
                                min="1"
                                value={sp.qty}
                                onChange={(e) => {
                                  const updated = [...formSpares]
                                  updated[idx].qty = parseInt(e.target.value) || 1
                                  setFormSpares(updated)
                                }}
                                className="h-7 text-xs font-semibold tabular-nums"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] border-t border-border/40 pt-2 font-bold text-muted-foreground mt-1">
                    <span>Total Cost (R): ₹{formSpareCost}</span>
                    <span>Total Price (S): ₹{formSparePrice}</span>
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
