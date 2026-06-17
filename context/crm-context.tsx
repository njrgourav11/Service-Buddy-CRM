"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import { isFirebaseEnabled, auth, db } from "@/lib/firebase"

// Standard Firestore SDK imports
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc as firestoreSetDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs,
  writeBatch
} from "firebase/firestore"

// Helper to remove undefined properties from objects so Firestore doesn't throw errors
function cleanUndefined<T extends object>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj
  const result = { ...obj } as any
  Object.keys(result).forEach(key => {
    if (result[key] === undefined) {
      delete result[key]
    }
  })
  return result
}

const setDoc = (reference: any, data: any, options?: any) => {
  return firestoreSetDoc(reference, cleanUndefined(data), options)
}

const updateDoc = (reference: any, data: any) => {
  return firestoreUpdateDoc(reference, cleanUndefined(data))
}

// Standard Auth SDK imports
import { 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "firebase/auth"

// ==========================================
// 1. Data Schema Interfaces
// ==========================================

export interface Customer {
  id: string // CIN, auto-generated e.g., CUST-1001
  name: string
  mobile: string
  address: string
  referralSource: "Ad" | "Contact" | "Repeat Consumer" | "Other"
  review: string
  reviewStatus?: "Review not done" | "Positive" | "Negative" | "Call didn't receive"
  notes: string
  status: "Active" | "Inactive"
  createdAt: string
}

export interface BookingSpare {
  name: string
  cost: number
  price: number
  qty: number
}

export interface Booking {
  id: string // Auto-generated e.g., B-1001
  date: string
  customerId: string
  appliance: string
  serviceType: "Repair" | "Installation" | "Service" | "Gas Filling"
  issue: string
  assignedTechnicianId: string
  spareName: string
  spareCost: number // Actual Spare Cost (R) - Supplier purchase cost
  sparePrice: number // Consumer Spare Price (S) - Price sold to customer
  serviceCharge: number // Service Fee (W)
  status: "Not Started" | "In Progress" | "Inspected" | "Completed" | "Cancelled"
  sparesUsed?: BookingSpare[]
  workCompletedDate?: string
  complaint?: string
  complaintDate?: string
  complaintStatus?: "Open" | "In Review" | "Resolved" | "Dismissed"
  notes?: string
  review?: string
  reviewStatus?: "Review not done" | "Positive" | "Negative" | "Call didn't receive"
  payoutEditedCount?: number

  
  // Financial computed properties stored or calculated
  totalCommission?: number // T = S - R
  technicianCommission?: number // U = T * 70%
  companyCommission?: number // V = T * 30%
  technicianServiceCommission?: number // X = W * 70%
  companyServiceCommission?: number // Y = W * 30%
  totalTechnicianAmount?: number // Total Tech = U + X
  totalCompanyAmount?: number // Total Company = V + Y
  totalConsumerAmount?: number // Total Consumer = S + W
}

export interface Technician {
  id: string // TECH-1001
  name: string
  mobile: string
  address: string
  skills: string[]
  status: "Active" | "Inactive"
  joiningDate: string
  advanceTaken: number
  dueAmount: number
}

export interface Payout {
  id: string // PAY-1001
  technicianId: string
  date: string
  dailyEarnings: number
  totalPayout: number
  advance: number
  extra: number
  due: number
  paymentStatus: "Paid" | "Pending"
  customerName?: string
  cinNumber?: string
  bookingId?: string
}

export interface Spare {
  id: string // SPIN-1001
  name: string
  category: string
  stockQty: number
  unitCost: number // Supplier price (R)
  sellingCost: number // Consumer selling price (S)
  availableQty: number
  reorderLevel: number
}

export interface Expense {
  id: string // EXP-1001
  date: string
  item: string
  category: 
    | "Working expenses (beneficiary)"
    | "Outstanding"
    | "Tools and maintenance"
    | "Exp item"
    | "Non beneficiary items"
    | "Office expenses"
    | "Tools and subscriptions"
    | "Refunds"
  amount: number
  beneficiary: string
  remarks: string
}

export interface OutstandingDue {
  id: string // DUE-1001
  recipient: string // Technician or Vendor
  amount: number
  reason: string
  date: string
  status: "Pending" | "Settled"
}

export interface Lead {
  id: string // LEAD-1001
  name: string
  mobile: string
  address: string
  source: "Ad" | "Contact" | "Repeat Consumer" | "Other"
  appliance: string
  requirement: string
  assignedTo: string
  status: "New" | "Contacted" | "In Progress" | "Converted" | "Lost"
  createdAt: string
  customerNotes?: string
  staffNotes?: string
  customerId?: string
}

export interface Contact {
  id: string // CONT-1001
  name: string
  mobile: string
  address: string
  customerType: "Regular" | "VIP" | "Corporate"
  notes: string
  lastServiceDate: string
}

export interface Reminder {
  id: string // REM-1001
  type: "Service Follow-up" | "Technician Payout Due" | "Inventory Refill" | "Customer AMC Renewal" | "Outstanding Recovery" | "General"
  title: string
  description: string
  date: string
  status: "Active" | "Dismissed"
  autoGenerated?: boolean
}

export interface Asset {
  id: string // AST-1001
  name: string
  type: "Tools" | "Machines" | "Company Equipment" | "Other"
  purchaseDate: string
  cost: number
  assignedTo: string
  status: "Active" | "In Repair" | "Retired"
  qty?: number
}

export interface Employee {
  id: string // EMP-1001
  name: string
  role: "Admin" | "Manager"
  mobile: string
  salary: number
  joiningDate: string
  status: "Active" | "Inactive"
}

// User Role Options
export type UserRole = "Admin" | "Manager"

// ==========================================
// 2. Initial Mock Data Definitions
// ==========================================

const INITIAL_CUSTOMERS: Customer[] = []
const INITIAL_TECHNICIANS: Technician[] = []
const INITIAL_SPARES: Spare[] = []
const INITIAL_BOOKINGS: Booking[] = []
const INITIAL_PAYOUTS: Payout[] = []
const INITIAL_EXPENSES: Expense[] = []
const INITIAL_OUTSTANDING: OutstandingDue[] = []
const INITIAL_LEADS: Lead[] = []
const INITIAL_CONTACTS: Contact[] = []
const INITIAL_ASSETS: Asset[] = []
const INITIAL_EMPLOYEES: Employee[] = []

// ==========================================
// 3. CRM Context Setup & Interfaces
// ==========================================

export interface CRMContextProps {
  customers: Customer[]
  bookings: Booking[]
  technicians: Technician[]
  payouts: Payout[]
  spares: Spare[]
  expenses: Expense[]
  outstandingDues: OutstandingDue[]
  leads: Lead[]
  contacts: Contact[]
  reminders: Reminder[]
  assets: Asset[]
  employees: Employee[]
  currentRole: UserRole
  activeTab: string
  
  // Tab Switcher
  setActiveTab: (tab: string) => void
  
  // Set Simulated User Role
  setCurrentRole: (role: UserRole) => void
  
  // CRUD Handlers
  addCustomer: (cust: Omit<Customer, "id" | "createdAt"> & { id?: string }) => Customer
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  
  addBooking: (book: Omit<Booking, "id"> & { id?: string }) => Booking
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  
  addTechnician: (tech: Omit<Technician, "id" | "advanceTaken" | "dueAmount">) => Technician
  updateTechnician: (id: string, updates: Partial<Technician>) => void
  deleteTechnician: (id: string) => void
  
  addPayout: (pay: Omit<Payout, "id" | "due">) => Payout
  updatePayout: (id: string, updates: Partial<Payout>) => void
  deletePayout: (id: string) => void
  
  addSpare: (spare: Omit<Spare, "id" | "availableQty">) => Spare
  updateSpare: (id: string, updates: Partial<Spare>) => void
  deleteSpare: (id: string) => void
  
  addExpense: (expense: Omit<Expense, "id">) => Expense
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  
  addOutstandingDue: (due: Omit<OutstandingDue, "id">) => OutstandingDue
  updateOutstandingDue: (id: string, updates: Partial<OutstandingDue>) => void
  deleteOutstandingDue: (id: string) => void
  
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => Lead
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  convertLeadToBooking: (leadId: string, assignedTechId: string, serviceCharge: number) => void
  
  addContact: (contact: Omit<Contact, "id">) => Contact
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
  
  addReminder: (rem: Omit<Reminder, "id">) => Reminder
  dismissReminder: (id: string) => void
  
  addAsset: (asset: Omit<Asset, "id">) => Asset
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  
  addEmployee: (emp: Omit<Employee, "id">) => Employee
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  // Formula Calculations Helper
  calculateBookingFinance: (spareCost: number, sparePrice: number, serviceCharge: number) => {
    totalCommission: number
    technicianCommission: number
    companyCommission: number
    technicianServiceCommission: number
    companyServiceCommission: number
    totalTechnicianAmount: number
    totalCompanyAmount: number
    totalConsumerAmount: number
  }
}

export const compareIdsNumerically = (aId: string, bId: string) => {
  const partsA = (aId || "").split("-")
  const partsB = (bId || "").split("-")
  const numA = partsA.length > 1 ? parseInt(partsA[1]) : parseInt((aId || "").replace(/\D/g, ""))
  const numB = partsB.length > 1 ? parseInt(partsB[1]) : parseInt((bId || "").replace(/\D/g, ""))
  if (isNaN(numA) || isNaN(numB)) {
    return (aId || "").localeCompare(bId || "")
  }
  return numA - numB
}

export const sortBookingsByCompletedDate = (a: Booking, b: Booking) => {
  const dateA = a.workCompletedDate;
  const dateB = b.workCompletedDate;

  // Bookings without completed date should be at the top
  if (!dateA && !dateB) {
    return compareIdsNumerically(b.id, a.id);
  }
  if (!dateA) return -1;
  if (!dateB) return 1;

  // Both have completed dates. Sort by proximity to today (closest first).
  const timeA = new Date(dateA).getTime();
  const timeB = new Date(dateB).getTime();

  if (isNaN(timeA) && isNaN(timeB)) {
    return compareIdsNumerically(b.id, a.id);
  }
  if (isNaN(timeA)) return 1;
  if (isNaN(timeB)) return -1;

  return timeB - timeA; // Descending (latest / closest to today first)
}


const CRMContext = createContext<CRMContextProps | undefined>(undefined)

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global View Navigation
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [currentRole, setCurrentRole] = useState<UserRole>("Admin")

  // Core Module States
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [spares, setSpares] = useState<Spare[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [outstandingDues, setOutstandingDues] = useState<OutstandingDue[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  // Redirect to login if role is missing (unauthorized access check) and load active tab
  useEffect(() => {
    const role = localStorage.getItem("servicebuddy_role")
    if (!role) {
      window.location.href = "/"
    } else {
      const savedTab = localStorage.getItem("servicebuddy_active_tab")
      if (savedTab) {
        setActiveTab(savedTab)
      }
    }
  }, [])

  // Persist active tab to LocalStorage on change
  useEffect(() => {
    localStorage.setItem("servicebuddy_active_tab", activeTab)
  }, [activeTab])

  // ==========================================
  // 4. Financial Calculations Engine
  // ==========================================

  const calculateBookingFinance = (spareCost: number, sparePrice: number, serviceCharge: number) => {
    const totalCommission = Math.max(0, sparePrice - spareCost)
    const technicianCommission = Math.round(totalCommission * 0.7 * 100) / 100
    const companyCommission = Math.round(totalCommission * 0.3 * 100) / 100
    const technicianServiceCommission = Math.round(serviceCharge * 0.7 * 100) / 100
    const companyServiceCommission = Math.round(serviceCharge * 0.3 * 100) / 100
    const totalTechnicianAmount = Math.round((technicianCommission + technicianServiceCommission) * 100) / 100
    const totalCompanyAmount = Math.round((companyCommission + companyServiceCommission) * 100) / 100
    const totalConsumerAmount = Math.round((spareCost + technicianCommission + companyCommission + technicianServiceCommission + companyServiceCommission) * 100) / 100

    return {
      totalCommission,
      technicianCommission,
      companyCommission,
      technicianServiceCommission,
      companyServiceCommission,
      totalTechnicianAmount,
      totalCompanyAmount,
      totalConsumerAmount
    }
  }

  const computeBookingFinance = (booking: Booking, forceRecalculate = false): Booking => {
    const calculations = calculateBookingFinance(booking.spareCost || 0, booking.sparePrice || 0, booking.serviceCharge || 0)
    
    const totalComm = booking.totalCommission !== undefined && booking.totalCommission !== null ? booking.totalCommission : calculations.totalCommission
    const techComm = booking.technicianCommission !== undefined && booking.technicianCommission !== null ? booking.technicianCommission : calculations.technicianCommission
    const compComm = booking.companyCommission !== undefined && booking.companyCommission !== null ? booking.companyCommission : calculations.companyCommission
    const techServComm = booking.technicianServiceCommission !== undefined && booking.technicianServiceCommission !== null ? booking.technicianServiceCommission : calculations.technicianServiceCommission
    const compServComm = booking.companyServiceCommission !== undefined && booking.companyServiceCommission !== null ? booking.companyServiceCommission : calculations.companyServiceCommission

    const totalTech = Math.round((techComm + techServComm) * 100) / 100
    const totalComp = Math.round((compComm + compServComm) * 100) / 100
    const totalConsumer = Math.round(((booking.spareCost || 0) + techComm + compComm + techServComm + compServComm) * 100) / 100

    return {
      ...booking,
      totalCommission: totalComm,
      technicianCommission: techComm,
      companyCommission: compComm,
      technicianServiceCommission: techServComm,
      companyServiceCommission: compServComm,
      totalTechnicianAmount: totalTech,
      totalCompanyAmount: totalComp,
      totalConsumerAmount: totalConsumer,
    }
  }

  // ==========================================
  // 5. Cloud Firestore / Local Database Auto-Mapping
  // ==========================================

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      // Offline fallback: load from local storage
      const loadState = <T,>(key: string, initial: T[]): T[] => {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`servicebuddy_${key}`)
          return stored ? JSON.parse(stored) : initial
        }
        return initial
      }

      setCustomers(loadState("customers", INITIAL_CUSTOMERS))
      setTechnicians(loadState("technicians", INITIAL_TECHNICIANS))
      setSpares(loadState("spares", INITIAL_SPARES))
      setExpenses(loadState("expenses", INITIAL_EXPENSES))
      setOutstandingDues(loadState("outstanding", INITIAL_OUTSTANDING))
      setLeads(loadState("leads", INITIAL_LEADS))
      setContacts(loadState("contacts", INITIAL_CONTACTS))
      setAssets(loadState("assets", INITIAL_ASSETS))
      setEmployees(loadState("employees", INITIAL_EMPLOYEES))
      setPayouts(loadState("payouts", INITIAL_PAYOUTS))
      
      const loadedBookings = loadState("bookings", INITIAL_BOOKINGS)
      setBookings(loadedBookings.map(b => computeBookingFinance(b)).sort(sortBookingsByCompletedDate))

      const storedRole = localStorage.getItem("servicebuddy_role")
      if (storedRole) setCurrentRole(storedRole as UserRole)
      return
    }

    // Online mode: real-time Firestore listeners
    // ------------------------------------------
    console.log("☁️ ServiceBuddy: Synchronizing databases with Google Cloud Firestore...")

    let hasAlertedPermission = false

    const handleListenerError = (error: any, collectionName: string) => {
      console.warn(`⚠️ Firestore onSnapshot "${collectionName}" listener failed:`, error)
      
      if (error.code === "permission-denied" || error.message?.toLowerCase().includes("permission")) {
        if (!hasAlertedPermission) {
          hasAlertedPermission = true
          toast.error("Firestore Access Denied", {
            description: "Missing or insufficient permissions. Falling back to local offline mode.",
            duration: 8000
          })
        }
        
        // Fall back to LocalStorage or mock data for this collection
        const loadCollectionState = <T,>(key: string, initial: T[]): T[] => {
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem(`servicebuddy_${key}`)
            return stored ? JSON.parse(stored) : initial
          }
          return initial
        }

        if (collectionName === "customers") setCustomers(loadCollectionState("customers", INITIAL_CUSTOMERS))
        if (collectionName === "bookings") {
          const loaded = loadCollectionState("bookings", INITIAL_BOOKINGS)
          setBookings(loaded.map(b => computeBookingFinance(b)).sort((a, b) => compareIdsNumerically(b.id, a.id)))
        }
        if (collectionName === "technicians") setTechnicians(loadCollectionState("technicians", INITIAL_TECHNICIANS))
        if (collectionName === "payouts") setPayouts(loadCollectionState("payouts", INITIAL_PAYOUTS))
        if (collectionName === "spares") setSpares(loadCollectionState("spares", INITIAL_SPARES))
        if (collectionName === "expenses") setExpenses(loadCollectionState("expenses", INITIAL_EXPENSES))
        if (collectionName === "outstanding") setOutstandingDues(loadCollectionState("outstanding", INITIAL_OUTSTANDING))
        if (collectionName === "leads") setLeads(loadCollectionState("leads", INITIAL_LEADS))
        if (collectionName === "contacts") setContacts(loadCollectionState("contacts", INITIAL_CONTACTS))
        if (collectionName === "assets") setAssets(loadCollectionState("assets", INITIAL_ASSETS))
        if (collectionName === "employees") setEmployees(loadCollectionState("employees", INITIAL_EMPLOYEES))
      }
    }

    const unsubscribes = [
      onSnapshot(collection(db, "customers"), (snap) => {
        const list: Customer[] = []
        snap.forEach(d => list.push(d.data() as Customer))
        if (list.length > 0) {
          list.sort((a,b) => compareIdsNumerically(a.id, b.id))
          setCustomers(list)
        } else {
          setCustomers([])
          localStorage.setItem("servicebuddy_customers", JSON.stringify([]))
          // Auto-seed collection if completely empty
          INITIAL_CUSTOMERS.forEach(c => setDoc(doc(db!, "customers", c.id), c))
        }
      }, (err) => handleListenerError(err, "customers")),

      onSnapshot(collection(db, "bookings"), (snap) => {
        const list: Booking[] = []
        snap.forEach(d => list.push(computeBookingFinance(d.data() as Booking)))
        if (list.length > 0) {
          list.sort(sortBookingsByCompletedDate)
          setBookings(list)
        } else {
          setBookings([])
          localStorage.setItem("servicebuddy_bookings", JSON.stringify([]))
          INITIAL_BOOKINGS.forEach(b => setDoc(doc(db!, "bookings", b.id), b))
        }
      }, (err) => handleListenerError(err, "bookings")),

      onSnapshot(collection(db, "technicians"), (snap) => {
        const list: Technician[] = []
        snap.forEach(d => list.push(d.data() as Technician))
        if (list.length > 0) {
          list.sort((a,b) => compareIdsNumerically(a.id, b.id))
          setTechnicians(list)
        } else {
          setTechnicians([])
          localStorage.setItem("servicebuddy_technicians", JSON.stringify([]))
          INITIAL_TECHNICIANS.forEach(t => setDoc(doc(db!, "technicians", t.id), t))
        }
      }, (err) => handleListenerError(err, "technicians")),

      onSnapshot(collection(db, "payouts"), (snap) => {
        const list: Payout[] = []
        snap.forEach(d => list.push(d.data() as Payout))
        if (list.length > 0) {
          list.sort((a,b) => b.date.localeCompare(a.date))
          setPayouts(list)
        } else {
          setPayouts([])
          localStorage.setItem("servicebuddy_payouts", JSON.stringify([]))
          INITIAL_PAYOUTS.forEach(p => setDoc(doc(db!, "payouts", p.id), p))
        }
      }, (err) => handleListenerError(err, "payouts")),

      onSnapshot(collection(db, "spares"), (snap) => {
        const list: Spare[] = []
        snap.forEach(d => list.push(d.data() as Spare))
        if (list.length > 0) {
          list.sort((a,b) => compareIdsNumerically(a.id, b.id))
          setSpares(list)
        } else {
          setSpares([])
          localStorage.setItem("servicebuddy_spares", JSON.stringify([]))
          INITIAL_SPARES.forEach(s => setDoc(doc(db!, "spares", s.id), s))
        }
      }, (err) => handleListenerError(err, "spares")),

      onSnapshot(collection(db, "expenses"), (snap) => {
        const list: Expense[] = []
        snap.forEach(d => list.push(d.data() as Expense))
        if (list.length > 0) {
          list.sort((a,b) => b.date.localeCompare(a.date))
          setExpenses(list)
        } else {
          setExpenses([])
          localStorage.setItem("servicebuddy_expenses", JSON.stringify([]))
          INITIAL_EXPENSES.forEach(e => setDoc(doc(db!, "expenses", e.id), e))
        }
      }, (err) => handleListenerError(err, "expenses")),

      onSnapshot(collection(db, "outstanding"), (snap) => {
        const list: OutstandingDue[] = []
        snap.forEach(d => list.push(d.data() as OutstandingDue))
        if (list.length > 0) {
          list.sort((a,b) => compareIdsNumerically(a.id, b.id))
          setOutstandingDues(list)
        } else {
          setOutstandingDues([])
          localStorage.setItem("servicebuddy_outstanding", JSON.stringify([]))
          INITIAL_OUTSTANDING.forEach(o => setDoc(doc(db!, "outstanding", o.id), o))
        }
      }, (err) => handleListenerError(err, "outstanding")),

      onSnapshot(collection(db, "leads"), (snap) => {
        const list: Lead[] = []
        snap.forEach(d => list.push(d.data() as Lead))
        if (list.length > 0) {
          list.sort((a,b) => b.createdAt.localeCompare(a.createdAt))
          setLeads(list)
        } else {
          setLeads([])
          localStorage.setItem("servicebuddy_leads", JSON.stringify([]))
          INITIAL_LEADS.forEach(l => setDoc(doc(db!, "leads", l.id), l))
        }
      }, (err) => handleListenerError(err, "leads")),

      onSnapshot(collection(db, "contacts"), (snap) => {
        const list: Contact[] = []
        snap.forEach(d => list.push(d.data() as Contact))
        if (list.length > 0) {
          list.sort((a,b) => compareIdsNumerically(a.id, b.id))
          setContacts(list)
        } else {
          setContacts([])
          localStorage.setItem("servicebuddy_contacts", JSON.stringify([]))
          INITIAL_CONTACTS.forEach(c => setDoc(doc(db!, "contacts", c.id), c))
        }
      }, (err) => handleListenerError(err, "contacts")),

      onSnapshot(collection(db, "assets"), (snap) => {
        const list: Asset[] = []
        snap.forEach(d => list.push(d.data() as Asset))
        if (list.length > 0) {
          list.sort((a,b) => compareIdsNumerically(a.id, b.id))
          setAssets(list)
        } else {
          setAssets([])
          localStorage.setItem("servicebuddy_assets", JSON.stringify([]))
          INITIAL_ASSETS.forEach(a => setDoc(doc(db!, "assets", a.id), a))
        }
      }, (err) => handleListenerError(err, "assets")),

      onSnapshot(collection(db, "employees"), (snap) => {
        const list: Employee[] = []
        snap.forEach(d => list.push(d.data() as Employee))
        if (list.length > 0) {
          list.sort((a,b) => compareIdsNumerically(a.id, b.id))
          setEmployees(list)
        } else {
          setEmployees([])
          localStorage.setItem("servicebuddy_employees", JSON.stringify([]))
          INITIAL_EMPLOYEES.forEach(e => setDoc(doc(db!, "employees", e.id), e))
        }
      }, (err) => handleListenerError(err, "employees"))
    ]

    // Listen to Firebase Auth state
    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Retrieve active user role logged locally
        const storedRole = localStorage.getItem("servicebuddy_role")
        if (storedRole) {
          setCurrentRole(storedRole as UserRole)
        } else {
          setCurrentRole("Admin")
        }
      } else {
        if (isFirebaseEnabled) {
          localStorage.removeItem("servicebuddy_role")
          window.location.href = "/"
        }
      }
    })

    return () => {
      unsubscribes.forEach(unsub => unsub())
      authUnsub()
    }
  }, [])

  // Sync to LocalStorage for local caching and offline recovery
  useEffect(() => {
    if (customers.length) localStorage.setItem("servicebuddy_customers", JSON.stringify(customers))
  }, [customers])
  useEffect(() => {
    if (bookings.length) localStorage.setItem("servicebuddy_bookings", JSON.stringify(bookings))
  }, [bookings])
  useEffect(() => {
    if (technicians.length) localStorage.setItem("servicebuddy_technicians", JSON.stringify(technicians))
  }, [technicians])
  useEffect(() => {
    if (payouts.length) localStorage.setItem("servicebuddy_payouts", JSON.stringify(payouts))
  }, [payouts])
  useEffect(() => {
    if (spares.length) localStorage.setItem("servicebuddy_spares", JSON.stringify(spares))
  }, [spares])
  useEffect(() => {
    if (expenses.length) localStorage.setItem("servicebuddy_expenses", JSON.stringify(expenses))
  }, [expenses])
  useEffect(() => {
    if (outstandingDues.length) localStorage.setItem("servicebuddy_outstanding", JSON.stringify(outstandingDues))
  }, [outstandingDues])
  useEffect(() => {
    if (leads.length) localStorage.setItem("servicebuddy_leads", JSON.stringify(leads))
  }, [leads])
  useEffect(() => {
    if (contacts.length) localStorage.setItem("servicebuddy_contacts", JSON.stringify(contacts))
  }, [contacts])
  useEffect(() => {
    if (assets.length) localStorage.setItem("servicebuddy_assets", JSON.stringify(assets))
  }, [assets])
  useEffect(() => {
    if (employees.length) localStorage.setItem("servicebuddy_employees", JSON.stringify(employees))
  }, [employees])
  useEffect(() => {
    localStorage.setItem("servicebuddy_role", currentRole)
  }, [currentRole])

  // Auto-heal corrupted "Paid" payouts with 0 totalPayout
  useEffect(() => {
    payouts.forEach(p => {
      if (p.paymentStatus === "Paid" && p.totalPayout === 0) {
        updatePayout(p.id, { paymentStatus: "Paid" })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payouts])

  // Reactive warnings compiler
  useEffect(() => {
    const list: Reminder[] = []
    
    // 1. Spares replenishment trigger
    spares.forEach(s => {
      if (s.stockQty <= s.reorderLevel) {
        list.push({
          id: `AUTO-REFILL-${s.id}`,
          type: "Inventory Refill",
          title: `Refill Spares: ${s.name}`,
          description: `Stock level of '${s.name}' is critical (${s.stockQty} items left). Reorder limit is ${s.reorderLevel}.`,
          date: new Date().toISOString().split("T")[0],
          status: "Active",
          autoGenerated: true
        })
      }
    })

    // 2. Technician payouts due trigger
    technicians.forEach(t => {
      if (t.dueAmount > 2000) {
        list.push({
          id: `AUTO-PAY-${t.id}`,
          type: "Technician Payout Due",
          title: `Payout Due: ${t.name}`,
          description: `${t.name} has accumulated dues of ₹${t.dueAmount}. Standard settlement is recommended.`,
          date: new Date().toISOString().split("T")[0],
          status: "Active",
          autoGenerated: true
        })
      }
    })

    // 3. Outstanding Recovery triggers
    outstandingDues.forEach(d => {
      if (d.status === "Pending") {
        list.push({
          id: `AUTO-REC-${d.id}`,
          type: "Outstanding Recovery",
          title: `Recovery: ${d.recipient}`,
          description: `Outstanding due of ₹${d.amount} for ${d.reason} is outstanding.`,
          date: d.date,
          status: "Active",
          autoGenerated: true
        })
      }
    })

    setReminders(list)
  }, [spares, technicians, outstandingDues])

  // ==========================================
  // 6. CRUD Database Operations Handlers
  // ==========================================

  // --- Customers ---
  const addCustomer = (cust: Omit<Customer, "id" | "createdAt"> & { id?: string }) => {
    const duplicate = customers.find(c => c.name.toLowerCase() === cust.name.toLowerCase() && c.mobile === cust.mobile)
    if (duplicate) {
      toast.error(`Customer ${cust.name} with mobile ${cust.mobile} already exists!`)
      return duplicate
    }

    let finalId = cust.id
    if (!finalId) {
      const cinNum = customers.length ? Math.max(...customers.map(c => parseInt(c.id.split("-")[1]))) + 1 : 1001
      finalId = `CUST-${cinNum}`
    }
    const newCust: Customer = {
      ...cust,
      id: finalId,
      createdAt: new Date().toISOString().split("T")[0]
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "customers", newCust.id), newCust)
    } else {
      setCustomers(prev => [...prev, newCust])
    }
    
    // Auto-create Contact as well
    addContact({
      name: cust.name,
      mobile: cust.mobile,
      address: cust.address,
      customerType: "Regular",
      notes: cust.notes || "",
      lastServiceDate: "No service logged yet"
    })

    toast.success(`Customer ${newCust.name} created successfully! (CIN: ${newCust.id})`)
    return newCust
  }

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    if (updates.name !== undefined || updates.mobile !== undefined) {
      const current = customers.find(c => c.id === id)
      const nameToCheck = (updates.name !== undefined ? updates.name : current?.name || "").toLowerCase().trim()
      const mobileToCheck = (updates.mobile !== undefined ? updates.mobile : current?.mobile || "").trim()
      const duplicate = customers.find(c => c.id !== id && c.name.toLowerCase().trim() === nameToCheck && c.mobile === mobileToCheck)
      if (duplicate) {
        toast.error(`Cannot update: Another customer "${duplicate.name}" with mobile ${duplicate.mobile} already exists!`)
        return
      }
    }

    if (isFirebaseEnabled && db) {
      updateDoc(doc(db, "customers", id), updates)
    } else {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    }
    toast.success("Customer profile updated.")
  }

  const deleteCustomer = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "customers", id))
    } else {
      setCustomers(prev => prev.filter(c => c.id !== id))
    }
    toast.info("Customer removed.")
  }

  // --- Service Bookings ---
  const addBooking = (book: Omit<Booking, "id"> & { id?: string }) => {
    const duplicate = bookings.find(
      b => b.customerId === book.customerId && 
           b.date === book.date && 
           b.appliance === book.appliance && 
           b.serviceType === book.serviceType
    )
    if (duplicate) {
      toast.error(`A booking for this customer on this date for ${book.appliance} (${book.serviceType}) already exists!`)
      return duplicate
    }

    let finalId = book.id
    if (!finalId) {
      const parsedNums = bookings.map(b => {
        const p = b.id.split("-")
        return p.length > 1 ? parseInt(p[1]) : 0
      }).filter(n => !isNaN(n))
      const bookNum = parsedNums.length ? Math.max(...parsedNums) + 1 : 1001
      finalId = `B-${bookNum}`
    }
    const rawBooking: Booking = {
      ...book,
      id: finalId
    }
    const finalBooking = computeBookingFinance(rawBooking)

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "bookings", finalBooking.id), finalBooking)
    } else {
      setBookings(prev => [...prev, finalBooking])
    }

    // Decrement inventory stock if a valid matching spare is chosen
    if (book.spareName && book.spareName !== "None") {
      const match = spares.find(s => s.name.toLowerCase() === book.spareName.toLowerCase())
      if (match) {
        updateSpare(match.id, {
          stockQty: Math.max(0, match.stockQty - 1)
        })
      }
    }

    // Auto-payout calculation logic if booked as Completed
    if (book.status === "Completed" && book.assignedTechnicianId) {
      handleTechnicianCompletionImpact(book.assignedTechnicianId, finalBooking)
    }

    // Update last service date in contacts
    const cust = customers.find(c => c.id === book.customerId)
    if (cust) {
      const contactMatch = contacts.find(c => c.name.toLowerCase() === cust.name.toLowerCase() || c.mobile === cust.mobile)
      if (contactMatch) {
        updateContact(contactMatch.id, { lastServiceDate: book.date })
      }
    }

    toast.success(`Booking ${finalBooking.id} created for ${finalBooking.appliance}!`)
    return finalBooking
  }

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    const b = bookings.find(item => item.id === id)
    if (!b) return

    const customerIdToCheck = updates.customerId !== undefined ? updates.customerId : b.customerId
    const dateToCheck = updates.date !== undefined ? updates.date : b.date
    const applianceToCheck = updates.appliance !== undefined ? updates.appliance : b.appliance
    const serviceTypeToCheck = updates.serviceType !== undefined ? updates.serviceType : b.serviceType

    const duplicate = bookings.find(item => 
      item.id !== id && 
      item.customerId === customerIdToCheck && 
      item.date === dateToCheck && 
      item.appliance === applianceToCheck && 
      item.serviceType === serviceTypeToCheck
    )
    if (duplicate) {
      toast.error("Cannot update: A booking for this customer on this date for this service already exists!")
      return
    }

    const oldStatus = b.status
    const newStatus = updates.status || b.status
    
    if (oldStatus === "Completed" && newStatus !== "Completed") {
      handleTechnicianReversal(b.id)
    }

    // Check if any payout/financial parameters have changed from their original values
    const financialChanged =
      (updates.spareCost !== undefined && updates.spareCost !== b.spareCost) ||
      (updates.sparePrice !== undefined && updates.sparePrice !== b.sparePrice) ||
      (updates.serviceCharge !== undefined && updates.serviceCharge !== b.serviceCharge) ||
      (updates.totalCommission !== undefined && updates.totalCommission !== b.totalCommission) ||
      (updates.technicianCommission !== undefined && updates.technicianCommission !== b.technicianCommission) ||
      (updates.companyCommission !== undefined && updates.companyCommission !== b.companyCommission) ||
      (updates.technicianServiceCommission !== undefined && updates.technicianServiceCommission !== b.technicianServiceCommission) ||
      (updates.companyServiceCommission !== undefined && updates.companyServiceCommission !== b.companyServiceCommission) ||
      (updates.totalTechnicianAmount !== undefined && updates.totalTechnicianAmount !== b.totalTechnicianAmount) ||
      (updates.totalCompanyAmount !== undefined && updates.totalCompanyAmount !== b.totalCompanyAmount) ||
      (updates.totalConsumerAmount !== undefined && updates.totalConsumerAmount !== b.totalConsumerAmount)

    if (currentRole === "Manager" && (b.payoutEditedCount ?? 0) >= 1 && financialChanged) {
      toast.error("Managers are not allowed to edit booking payout details more than once.")
      return
    }

    const combined = { 
      ...b, 
      ...updates,
      payoutEditedCount: financialChanged ? (b.payoutEditedCount ?? 0) + 1 : b.payoutEditedCount
    }
    
    const oldSpareCost = b.spareCost || 0
    const oldSparePrice = b.sparePrice || 0
    const oldServiceCharge = b.serviceCharge || 0

    const newSpareCost = updates.spareCost !== undefined ? (updates.spareCost || 0) : oldSpareCost
    const newSparePrice = updates.sparePrice !== undefined ? (updates.sparePrice || 0) : oldSparePrice
    const newServiceCharge = updates.serviceCharge !== undefined ? (updates.serviceCharge || 0) : oldServiceCharge

    const priceInputsChanged = 
      newSpareCost !== oldSpareCost ||
      newSparePrice !== oldSparePrice ||
      newServiceCharge !== oldServiceCharge

    const hasExplicitSplits = 
      updates.technicianCommission !== undefined || 
      updates.technicianServiceCommission !== undefined || 
      updates.companyCommission !== undefined || 
      updates.companyServiceCommission !== undefined

    const currentCalculations = calculateBookingFinance(oldSpareCost, oldSparePrice, oldServiceCharge)
    const hadCustomSplits = 
      (b.technicianCommission !== undefined && b.technicianCommission !== currentCalculations.technicianCommission) ||
      (b.companyCommission !== undefined && b.companyCommission !== currentCalculations.companyCommission) ||
      (b.technicianServiceCommission !== undefined && b.technicianServiceCommission !== currentCalculations.technicianServiceCommission) ||
      (b.companyServiceCommission !== undefined && b.companyServiceCommission !== currentCalculations.companyServiceCommission)

    let calculated: Booking
    if (priceInputsChanged && !hasExplicitSplits && !hadCustomSplits) {
      const calculations = calculateBookingFinance(combined.spareCost || 0, combined.sparePrice || 0, combined.serviceCharge || 0)
      calculated = {
        ...combined,
        ...calculations
      }
    } else {
      calculated = computeBookingFinance(combined)
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "bookings", id), calculated)
    } else {
      setBookings(prev => prev.map(item => item.id === id ? calculated : item))
    }

    // Sync review status and notes to customer profile silently if updated on the booking
    if (updates.reviewStatus !== undefined || updates.review !== undefined || updates.notes !== undefined) {
      const custUpdates: Partial<Customer> = {}
      if (updates.reviewStatus !== undefined) custUpdates.reviewStatus = updates.reviewStatus
      if (updates.review !== undefined) custUpdates.review = updates.review
      if (updates.notes !== undefined) custUpdates.notes = updates.notes

      if (isFirebaseEnabled && db) {
        updateDoc(doc(db, "customers", b.customerId), custUpdates)
      } else {
        setCustomers(prev => prev.map(c => c.id === b.customerId ? { ...c, ...custUpdates } : c))
      }
    }

    // Impact technician payout balances if status flipped to Completed or remains Completed
    if (newStatus === "Completed" && calculated.assignedTechnicianId) {
      handleTechnicianCompletionImpact(calculated.assignedTechnicianId, calculated)
    }

    toast.success("Service Booking updated successfully.")
  }

  const deleteBooking = (id: string) => {
    const b = bookings.find(item => item.id === id)
    if (b && b.status === "Completed") {
      handleTechnicianReversal(b.id)
    }

    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "bookings", id))
    } else {
      setBookings(prev => prev.filter(b => b.id !== id))
    }
    toast.info("Booking entry deleted.")
  }

  const handleTechnicianReversal = (bookingId: string) => {
    // For legacy bookings that might have had auto-created payouts, we clean them up.
    const matchingPayouts = payouts.filter(p => p.cinNumber === bookingId)
    if (matchingPayouts.length === 0) return

    matchingPayouts.forEach(pay => {
      // Find technician
      const tech = technicians.find(t => t.id === pay.technicianId)
      if (tech) {
        // Undo this payout's impact on technician's dueAmount and advanceTaken
        const revertedDue = tech.dueAmount - pay.dailyEarnings - pay.extra + pay.totalPayout + pay.advance
        const revertedAdvance = tech.advanceTaken + pay.advance
        
        updateTechnician(pay.technicianId, {
          dueAmount: Math.max(0, revertedDue),
          advanceTaken: Math.max(0, revertedAdvance)
        })
      }

      // Delete the payout record
      if (isFirebaseEnabled && db) {
        deleteDoc(doc(db, "payouts", pay.id))
      } else {
        setPayouts(prev => prev.filter(p => p.id !== pay.id))
      }
    })
  }

  const handleTechnicianCompletionImpact = (techIdStr: string, calculatedBooking: Booking) => {
    // Disabled auto-calculation of technician earnings/dues from bookings.
    // Technician earnings are managed manually via the Payouts Ledger.
  }

  // --- Technicians ---
  const addTechnician = (tech: Omit<Technician, "id" | "advanceTaken" | "dueAmount">) => {
    const duplicate = technicians.find(t => t.name.toLowerCase() === tech.name.toLowerCase() && t.mobile === tech.mobile)
    if (duplicate) {
      toast.error(`Technician ${tech.name} with mobile ${tech.mobile} already exists!`)
      return duplicate
    }

    const techNum = technicians.length ? Math.max(...technicians.map(t => parseInt(t.id.split("-")[1]))) + 1 : 1001
    const newTech: Technician = {
      ...tech,
      id: `TECH-${techNum}`,
      advanceTaken: 0,
      dueAmount: 0
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "technicians", newTech.id), newTech)
    } else {
      setTechnicians(prev => [...prev, newTech])
    }
    toast.success(`Technician ${newTech.name} added!`)
    return newTech
  }

  const updateTechnician = (id: string, updates: Partial<Technician>) => {
    if (updates.name !== undefined || updates.mobile !== undefined) {
      const current = technicians.find(t => t.id === id)
      const nameToCheck = (updates.name !== undefined ? updates.name : current?.name || "").toLowerCase().trim()
      const mobileToCheck = (updates.mobile !== undefined ? updates.mobile : current?.mobile || "").trim()
      const duplicate = technicians.find(t => t.id !== id && t.name.toLowerCase().trim() === nameToCheck && t.mobile === mobileToCheck)
      if (duplicate) {
        toast.error(`Cannot update: Another technician "${duplicate.name}" with mobile ${duplicate.mobile} already exists!`)
        return
      }
    }

    if (isFirebaseEnabled && db) {
      updateDoc(doc(db, "technicians", id), updates)
    } else {
      setTechnicians(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    }
  }

  const deleteTechnician = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "technicians", id))
    } else {
      setTechnicians(prev => prev.filter(t => t.id !== id))
    }
    toast.info("Technician profile archived.")
  }

  // --- Technician Payouts ---
  const addPayout = (pay: Omit<Payout, "id" | "due">) => {
    const duplicate = payouts.find(
      p => p.technicianId === pay.technicianId && 
           p.date === pay.date && 
           p.dailyEarnings === pay.dailyEarnings &&
           p.totalPayout === pay.totalPayout && 
           p.advance === pay.advance && 
           p.extra === pay.extra
    )
    if (duplicate) {
      toast.error(`A matching payout transaction for this technician has already been logged.`)
      return duplicate
    }

    const payNum = payouts.length ? Math.max(...payouts.map(p => {
      const parts = p.id.split("-")
      const num = parts.length > 1 ? parseInt(parts[1]) : 0
      return isNaN(num) ? 0 : num
    })) + 1 : 1001
    
    // Get technician record to fetch running balances
    const tech = technicians.find(t => t.id === pay.technicianId)
    const prevDue = tech ? tech.dueAmount : 0
    
    const finalPaid = pay.totalPayout
    const finalAdvance = pay.advance
    const finalExtra = pay.extra
    const finalDue = Math.max(0, prevDue + pay.dailyEarnings + finalExtra - finalPaid - finalAdvance)

    const newPayout: Payout = {
      ...pay,
      id: `PAY-${payNum}`,
      due: finalDue
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "payouts", newPayout.id), newPayout)
    } else {
      setPayouts(prev => [newPayout, ...prev])
    }

    // Update technician dues & advances
    updateTechnician(pay.technicianId, {
      dueAmount: finalDue,
      advanceTaken: tech ? Math.max(0, tech.advanceTaken - finalAdvance) : 0
    })

    toast.success(`Payout entry recorded for technician. Settled ₹${finalPaid}.`)
    return newPayout
  }

  function updatePayout(id: string, updates: Partial<Payout>) {
    const oldPay = payouts.find(p => p.id === id)
    if (!oldPay) return

    // Auto-update totalPayout on status changes if totalPayout wasn't explicitly set to a new custom non-zero value
    if (updates.paymentStatus !== undefined && updates.paymentStatus !== oldPay.paymentStatus) {
      if (updates.paymentStatus === "Paid") {
        if (updates.totalPayout === undefined || updates.totalPayout === 0) {
          const earnings = updates.dailyEarnings !== undefined ? updates.dailyEarnings : oldPay.dailyEarnings
          const extra = updates.extra !== undefined ? updates.extra : oldPay.extra
          const advance = updates.advance !== undefined ? updates.advance : oldPay.advance
          updates.totalPayout = Math.max(0, earnings + extra - advance)
        }
      } else if (updates.paymentStatus === "Pending") {
        if (updates.totalPayout === undefined || updates.totalPayout === oldPay.totalPayout) {
          updates.totalPayout = 0
        }
      }
    }

    // Additional safety: if the final status is "Paid" and totalPayout is still 0 (or undefined), auto-fill it
    const finalStatus = updates.paymentStatus !== undefined ? updates.paymentStatus : oldPay.paymentStatus
    if (finalStatus === "Paid") {
      const currentPaid = updates.totalPayout !== undefined ? updates.totalPayout : oldPay.totalPayout
      if (currentPaid === 0) {
        const earnings = updates.dailyEarnings !== undefined ? updates.dailyEarnings : oldPay.dailyEarnings
        const extra = updates.extra !== undefined ? updates.extra : oldPay.extra
        const advance = updates.advance !== undefined ? updates.advance : oldPay.advance
        updates.totalPayout = Math.max(0, earnings + extra - advance)
      }
    }

    const techIdToCheck = updates.technicianId !== undefined ? updates.technicianId : oldPay.technicianId
    const dateToCheck = updates.date !== undefined ? updates.date : oldPay.date
    const dailyEarningsToCheck = updates.dailyEarnings !== undefined ? updates.dailyEarnings : oldPay.dailyEarnings
    const totalPayoutToCheck = updates.totalPayout !== undefined ? updates.totalPayout : oldPay.totalPayout
    const advanceToCheck = updates.advance !== undefined ? updates.advance : oldPay.advance
    const extraToCheck = updates.extra !== undefined ? updates.extra : oldPay.extra

    const duplicate = payouts.find(p => 
      p.id !== id && 
      p.technicianId === techIdToCheck && 
      p.date === dateToCheck && 
      p.dailyEarnings === dailyEarningsToCheck && 
      p.totalPayout === totalPayoutToCheck && 
      p.advance === advanceToCheck && 
      p.extra === extraToCheck
    )
    if (duplicate) {
      toast.error("Cannot update: A matching payout transaction for this technician has already been logged.")
      return
    }

    // Reconcile technician dues
    const tech = technicians.find(t => t.id === oldPay.technicianId)
    let finalDue = oldPay.due
    let finalAdvance = tech ? tech.advanceTaken : 0

    if (tech) {
      // First, undo old payout impact
      const undowedDue = tech.dueAmount - oldPay.dailyEarnings - oldPay.extra + oldPay.totalPayout + oldPay.advance
      const undowedAdvance = tech.advanceTaken + oldPay.advance
      
      // Then, apply new payout impact
      finalDue = Math.max(0, undowedDue + (updates.dailyEarnings !== undefined ? updates.dailyEarnings : oldPay.dailyEarnings) + (updates.extra !== undefined ? updates.extra : oldPay.extra) - (updates.totalPayout !== undefined ? updates.totalPayout : oldPay.totalPayout) - (updates.advance !== undefined ? updates.advance : oldPay.advance))
      finalAdvance = Math.max(0, undowedAdvance - (updates.advance !== undefined ? updates.advance : oldPay.advance))

      updateTechnician(oldPay.technicianId, {
        dueAmount: finalDue,
        advanceTaken: finalAdvance
      })
    }

    const combined = { ...oldPay, ...updates, due: finalDue }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "payouts", id), combined)
    } else {
      setPayouts(prev => prev.map(p => p.id === id ? combined : p))
    }
    toast.success("Payout details updated and technician balance reconciled.")
  }

  const deletePayout = (id: string) => {
    const oldPay = payouts.find(p => p.id === id)
    if (!oldPay) return

    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "payouts", id))
    } else {
      setPayouts(prev => prev.filter(p => p.id !== id))
    }

    // Reconcile technician dues by undoing the payout
    const tech = technicians.find(t => t.id === oldPay.technicianId)
    if (tech) {
      const finalDue = tech.dueAmount - oldPay.dailyEarnings - oldPay.extra + oldPay.totalPayout + oldPay.advance
      const finalAdvance = tech.advanceTaken + oldPay.advance
      updateTechnician(oldPay.technicianId, {
        dueAmount: finalDue,
        advanceTaken: finalAdvance
      })
    }
    toast.info("Payout entry deleted and technician balance restored.")
  }

  // --- Spares (Inventory) ---
  const addSpare = (spare: Omit<Spare, "id" | "availableQty">) => {
    const duplicate = spares.find(s => s.name.toLowerCase() === spare.name.toLowerCase())
    if (duplicate) {
      toast.error(`Spare part '${spare.name}' is already in catalog!`)
      return duplicate
    }

    const spareNum = spares.length ? Math.max(...spares.map(s => parseInt(s.id.split("-")[1]))) + 1 : 1001
    const newSpare: Spare = {
      ...spare,
      id: `SPIN-${spareNum}`,
      availableQty: spare.stockQty
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "spares", newSpare.id), newSpare)
    } else {
      setSpares(prev => [...prev, newSpare])
    }
    toast.success(`Spare parts item ${newSpare.name} added to catalog!`)
    return newSpare
  }

  const updateSpare = (id: string, updates: Partial<Spare>) => {
    const s = spares.find(item => item.id === id)
    if (!s) return

    if (updates.name !== undefined) {
      const nameToCheck = updates.name.toLowerCase().trim()
      const duplicate = spares.find(item => item.id !== id && item.name.toLowerCase().trim() === nameToCheck)
      if (duplicate) {
        toast.error(`Cannot update: Spare part '${updates.name}' is already in catalog!`)
        return
      }
    }

    const combined = { ...s, ...updates }
    const finalUpdate = {
      ...combined,
      availableQty: combined.stockQty
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "spares", id), finalUpdate)
    } else {
      setSpares(prev => prev.map(item => item.id === id ? finalUpdate : item))
    }
  }

  const deleteSpare = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "spares", id))
    } else {
      setSpares(prev => prev.filter(s => s.id !== id))
    }
    toast.info("Item removed from catalog.")
  }

  // --- Expenditures ---
  const addExpense = (expense: Omit<Expense, "id">) => {
    const duplicate = expenses.find(
      e => e.item.toLowerCase() === expense.item.toLowerCase() && 
           e.amount === expense.amount && 
           e.date === expense.date && 
           e.beneficiary === expense.beneficiary
    )
    if (duplicate) {
      toast.error(`This expense voucher has already been logged.`)
      return duplicate
    }

    const expNum = expenses.length ? Math.max(...expenses.map(e => parseInt(e.id.split("-")[1]))) + 1 : 1001
    const newExpense: Expense = {
      ...expense,
      id: `EXP-${expNum}`
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "expenses", newExpense.id), newExpense)
    } else {
      setExpenses(prev => [...prev, newExpense])
    }
    toast.success(`Logged expense of ₹${newExpense.amount} for ${newExpense.category}.`)
    return newExpense
  }

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const current = expenses.find(e => e.id === id)
    if (current && (updates.item !== undefined || updates.amount !== undefined || updates.date !== undefined || updates.beneficiary !== undefined)) {
      const itemToCheck = (updates.item !== undefined ? updates.item : current.item).toLowerCase().trim()
      const amountToCheck = updates.amount !== undefined ? updates.amount : current.amount
      const dateToCheck = updates.date !== undefined ? updates.date : current.date
      const beneficiaryToCheck = (updates.beneficiary !== undefined ? updates.beneficiary : current.beneficiary).toLowerCase().trim()

      const duplicate = expenses.find(e => 
        e.id !== id && 
        e.item.toLowerCase().trim() === itemToCheck && 
        e.amount === amountToCheck && 
        e.date === dateToCheck && 
        e.beneficiary.toLowerCase().trim() === beneficiaryToCheck
      )
      if (duplicate) {
        toast.error("Cannot update: A matching expense voucher has already been logged.")
        return
      }
    }

    if (isFirebaseEnabled && db) {
      updateDoc(doc(db, "expenses", id), updates)
    } else {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    }
  }

  const deleteExpense = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "expenses", id))
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id))
    }
    toast.info("Expense voucher deleted.")
  }

  // --- Outstanding Dues ---
  const addOutstandingDue = (due: Omit<OutstandingDue, "id">) => {
    const duplicate = outstandingDues.find(
      d => d.recipient.toLowerCase() === due.recipient.toLowerCase() && 
           d.amount === due.amount && 
           d.reason.toLowerCase() === due.reason.toLowerCase() && 
           d.date === due.date
    )
    if (duplicate) {
      toast.error(`This outstanding due entry has already been logged.`)
      return duplicate
    }

    const dueNum = outstandingDues.length ? Math.max(...outstandingDues.map(d => parseInt(d.id.split("-")[1]))) + 1 : 1001
    const newDue: OutstandingDue = {
      ...due,
      id: `DUE-${dueNum}`
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "outstanding", newDue.id), newDue)
    } else {
      setOutstandingDues(prev => [...prev, newDue])
    }
    toast.success(`Outstanding due of ₹${newDue.amount} logged.`)
    return newDue
  }

  const updateOutstandingDue = (id: string, updates: Partial<OutstandingDue>) => {
    const current = outstandingDues.find(d => d.id === id)
    if (current && (updates.recipient !== undefined || updates.amount !== undefined || updates.reason !== undefined || updates.date !== undefined)) {
      const recipientToCheck = (updates.recipient !== undefined ? updates.recipient : current.recipient).toLowerCase().trim()
      const amountToCheck = updates.amount !== undefined ? updates.amount : current.amount
      const reasonToCheck = (updates.reason !== undefined ? updates.reason : current.reason).toLowerCase().trim()
      const dateToCheck = updates.date !== undefined ? updates.date : current.date

      const duplicate = outstandingDues.find(d => 
        d.id !== id && 
        d.recipient.toLowerCase().trim() === recipientToCheck && 
        d.amount === amountToCheck && 
        d.reason.toLowerCase().trim() === reasonToCheck && 
        d.date === dateToCheck
      )
      if (duplicate) {
        toast.error("Cannot update: A matching outstanding due entry has already been logged.")
        return
      }
    }

    if (isFirebaseEnabled && db) {
      updateDoc(doc(db, "outstanding", id), updates)
    } else {
      setOutstandingDues(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
    }
  }

  const deleteOutstandingDue = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "outstanding", id))
    } else {
      setOutstandingDues(prev => prev.filter(d => d.id !== id))
    }
  }

  // --- Leads ---
  const addLead = (lead: Omit<Lead, "id" | "createdAt">) => {
    const duplicate = leads.find(
      l => l.name.toLowerCase() === lead.name.toLowerCase() && 
           l.mobile === lead.mobile && 
           l.appliance === lead.appliance
    )
    if (duplicate) {
      toast.error(`A lead with this name, mobile, and appliance already exists!`)
      return duplicate
    }

    const leadNum = leads.length ? Math.max(...leads.map(l => parseInt(l.id.split("-")[1]))) + 1 : 1001
    const newLead: Lead = {
      ...lead,
      id: `LEAD-${leadNum}`,
      createdAt: new Date().toISOString().split("T")[0]
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "leads", newLead.id), newLead)
    } else {
      setLeads(prev => [...prev, newLead])
    }
    toast.success(`Lead created for ${newLead.name} via ${newLead.source}!`)
    return newLead
  }

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const current = leads.find(l => l.id === id)
    if (current && (updates.name !== undefined || updates.mobile !== undefined || updates.appliance !== undefined)) {
      const nameToCheck = (updates.name !== undefined ? updates.name : current.name).toLowerCase().trim()
      const mobileToCheck = (updates.mobile !== undefined ? updates.mobile : current.mobile).trim()
      const applianceToCheck = (updates.appliance !== undefined ? updates.appliance : current.appliance).toLowerCase().trim()

      const duplicate = leads.find(l => 
        l.id !== id && 
        l.name.toLowerCase().trim() === nameToCheck && 
        l.mobile === mobileToCheck && 
        l.appliance.toLowerCase().trim() === applianceToCheck
      )
      if (duplicate) {
        toast.error("Cannot update: A lead with this name, mobile, and appliance already exists!")
        return
      }
    }

    if (isFirebaseEnabled && db) {
      updateDoc(doc(db, "leads", id), updates)
    } else {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
    }
  }

  const deleteLead = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "leads", id))
    } else {
      setLeads(prev => prev.filter(l => l.id !== id))
    }
  }

  const convertLeadToBooking = (leadId: string, assignedTechId: string, serviceCharge: number) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    // 1. Convert Lead to Customer first (or link to existing if customerId exists)
    let cust = lead.customerId ? customers.find(c => c.id === lead.customerId) : null
    if (!cust) {
      cust = addCustomer({
        name: lead.name,
        mobile: lead.mobile,
        address: lead.address,
        referralSource: lead.source,
        review: "",
        reviewStatus: "Review not done",
        notes: `Converted from lead with requirements: ${lead.requirement}${lead.customerNotes ? `\nCustomer Notes: ${lead.customerNotes}` : ""}${lead.staffNotes ? `\nStaff Notes: ${lead.staffNotes}` : ""}`,
        status: "Active"
      })
    }

    // 2. Auto match spare part if possible
    let spareName = "None"
    let spareCost = 0
    let sparePrice = 0
    
    if (lead.appliance.toLowerCase() === "ac") {
      const match = spares.find(s => s.name.includes("Pipe"))
      if (match) {
        spareName = match.name
        spareCost = match.unitCost
        sparePrice = match.sellingCost
      }
    }

    // 3. Create service booking
    addBooking({
      date: new Date().toISOString().split("T")[0],
      customerId: cust.id,
      appliance: lead.appliance,
      serviceType: "Repair",
      issue: lead.requirement,
      assignedTechnicianId: assignedTechId,
      spareName,
      spareCost,
      sparePrice,
      serviceCharge,
      status: "In Progress"
    })

    // 4. Update Lead Status
    updateLead(leadId, { status: "Converted" })
    toast.success(`Successfully converted Lead into Customer (${cust.id}) and created a Work Order!`)
  }

  // --- Contacts ---
  const addContact = (contact: Omit<Contact, "id">) => {
    const duplicate = contacts.find(c => c.name.toLowerCase() === contact.name.toLowerCase() && c.mobile === contact.mobile)
    if (duplicate) {
      return duplicate
    }

    const contactNum = contacts.length ? Math.max(...contacts.map(c => parseInt(c.id.split("-")[1]))) + 1 : 1001
    const newCont: Contact = {
      ...contact,
      id: `CONT-${contactNum}`
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "contacts", newCont.id), newCont)
    } else {
      setContacts(prev => [...prev, newCont])
    }
    return newCont
  }

  const updateContact = (id: string, updates: Partial<Contact>) => {
    if (updates.name !== undefined || updates.mobile !== undefined) {
      const current = contacts.find(c => c.id === id)
      const nameToCheck = (updates.name !== undefined ? updates.name : current?.name || "").toLowerCase().trim()
      const mobileToCheck = (updates.mobile !== undefined ? updates.mobile : current?.mobile || "").trim()
      const duplicate = contacts.find(c => c.id !== id && c.name.toLowerCase().trim() === nameToCheck && c.mobile === mobileToCheck)
      if (duplicate) {
        toast.error(`Cannot update: Another contact "${duplicate.name}" with mobile ${duplicate.mobile} already exists!`)
        return
      }
    }

    if (isFirebaseEnabled && db) {
      updateDoc(doc(db, "contacts", id), updates)
    } else {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    }
  }

  const deleteContact = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "contacts", id))
    } else {
      setContacts(prev => prev.filter(c => c.id !== id))
    }
  }

  // --- Reminders ---
  const addReminder = (rem: Omit<Reminder, "id">) => {
    const remNum = reminders.length ? Math.max(...reminders.map(r => parseInt(r.id.split("-")[1]))) + 1 : 1001
    const newRem: Reminder = {
      ...rem,
      id: `REM-${remNum}`
    }
    setReminders(prev => [newRem, ...prev])
    return newRem
  }

  const dismissReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
    toast.success("Reminder cleared.")
  }

  // --- Assets ---
  const addAsset = (asset: Omit<Asset, "id">) => {
    const duplicate = assets.find(a => a.name.toLowerCase() === asset.name.toLowerCase() && a.purchaseDate === asset.purchaseDate)
    if (duplicate) {
      toast.error(`Asset '${asset.name}' is already registered on this date!`)
      return duplicate
    }

    const assetNum = assets.length ? Math.max(...assets.map(a => parseInt(a.id.split("-")[1]))) + 1 : 1001
    const newAsset: Asset = {
      ...asset,
      id: `AST-${assetNum}`
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "assets", newAsset.id), newAsset)
    } else {
      setAssets(prev => [...prev, newAsset])
    }
    toast.success(`Asset '${newAsset.name}' registered.`)
    return newAsset
  }

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const current = assets.find(a => a.id === id)
    if (current && (updates.name !== undefined || updates.purchaseDate !== undefined)) {
      const nameToCheck = (updates.name !== undefined ? updates.name : current.name).toLowerCase().trim()
      const dateToCheck = updates.purchaseDate !== undefined ? updates.purchaseDate : current.purchaseDate
      const duplicate = assets.find(a => a.id !== id && a.name.toLowerCase().trim() === nameToCheck && a.purchaseDate === dateToCheck)
      if (duplicate) {
        toast.error(`Cannot update: Asset '${updates.name || current.name}' is already registered on this date!`)
        return
      }
    }

    if (isFirebaseEnabled && db) {
      updateDoc(doc(db, "assets", id), updates)
    } else {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
    }
  }

  const deleteAsset = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "assets", id))
    } else {
      setAssets(prev => prev.filter(a => a.id !== id))
    }
    toast.info("Asset retired from service.")
  }

  // --- Employees ---
  const addEmployee = (emp: Omit<Employee, "id">) => {
    const duplicate = employees.find(e => e.name.toLowerCase() === emp.name.toLowerCase() && e.mobile === emp.mobile)
    if (duplicate) {
      toast.error(`Staff profile for ${emp.name} already exists!`)
      return duplicate
    }

    const empNum = employees.length ? Math.max(...employees.map(e => parseInt(e.id.split("-")[1]))) + 1 : 1001
    const newEmp: Employee = {
      ...emp,
      id: `EMP-${empNum}`
    }

    if (isFirebaseEnabled && db) {
      setDoc(doc(db, "employees", newEmp.id), newEmp)
    } else {
      setEmployees(prev => [...prev, newEmp])
    }
    toast.success(`Staff profile created for ${newEmp.name}.`)
    return newEmp
  }

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    if (updates.name !== undefined || updates.mobile !== undefined) {
      const current = employees.find(e => e.id === id)
      const nameToCheck = (updates.name !== undefined ? updates.name : current?.name || "").toLowerCase().trim()
      const mobileToCheck = (updates.mobile !== undefined ? updates.mobile : current?.mobile || "").trim()
      const duplicate = employees.find(e => e.id !== id && e.name.toLowerCase().trim() === nameToCheck && e.mobile === mobileToCheck)
      if (duplicate) {
        toast.error(`Cannot update: Staff profile for ${updates.name || current?.name} already exists!`)
        return
      }
    }

    if (isFirebaseEnabled && db) {
      updateDoc(doc(db, "employees", id), updates)
    } else {
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    }
    toast.success("Staff profile updated.")
  }

  const deleteEmployee = (id: string) => {
    if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, "employees", id))
    } else {
      setEmployees(prev => prev.filter(e => e.id !== id))
    }
    toast.info("Employee archived.")
  }

  // ==========================================
  // Render Context Provider wrapper
  // ==========================================
  return (
    <CRMContext.Provider
      value={{
        customers,
        bookings,
        technicians,
        payouts,
        spares,
        expenses,
        outstandingDues,
        leads,
        contacts,
        reminders,
        assets,
        employees,
        currentRole,
        activeTab,
        
        setActiveTab,
        setCurrentRole,
        
        addCustomer,
        updateCustomer,
        deleteCustomer,
        
        addBooking,
        updateBooking,
        deleteBooking,
        
        addTechnician,
        updateTechnician,
        deleteTechnician,
        
        addPayout,
        updatePayout,
        deletePayout,
        
        addSpare,
        updateSpare,
        deleteSpare,
        
        addExpense,
        updateExpense,
        deleteExpense,
        
        addOutstandingDue,
        updateOutstandingDue,
        deleteOutstandingDue,
        
        addLead,
        updateLead,
        deleteLead,
        convertLeadToBooking,
        
        addContact,
        updateContact,
        deleteContact,
        
        addReminder,
        dismissReminder,
        
        addAsset,
        updateAsset,
        deleteAsset,
        
        addEmployee,
        updateEmployee,
        deleteEmployee,

        calculateBookingFinance
      }}
    >
      {children}
    </CRMContext.Provider>
  )
}

export const useCRM = () => {
  const context = useContext(CRMContext)
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider")
  }
  return context
}

export const getDisplayNotes = (notes?: string) => {
  if (!notes) return ""
  const trimmed = notes.trim()
  if (
    trimmed === "Registered inline during booking order creation" ||
    trimmed === "Auto-created via customer registration" ||
    trimmed === "Registered inline during booking order creation." ||
    trimmed === "Auto-created via customer registration."
  ) {
    return ""
  }
  return notes
}
