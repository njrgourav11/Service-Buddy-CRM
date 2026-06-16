"use client"

import * as React from "react"
import { useCRM, Customer, Booking, Technician, Spare, Expense, OutstandingDue, Lead, Contact } from "@/context/crm-context"
import { isFirebaseEnabled, db } from "@/lib/firebase"
import { setDoc, doc, writeBatch } from "firebase/firestore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  File01Icon, 
  CheckmarkCircle01Icon, 
  Loading03Icon, 
  Database01Icon,
  PlusSignCircleIcon,
  AlertCircleIcon,
  InvoiceIcon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import * as XLSX from "xlsx"

type ImportTarget = "customers" | "bookings" | "technicians" | "spares" | "expenses" | "outstanding" | "leads" | "contacts" | "payouts"

interface ColumnMapping {
  dbField: string
  label: string
  excelHeader: string
  required: boolean
  type: "string" | "number" | "date"
}

const cleanReviewStatus = (status?: string): "Review not done" | "Positive" | "Negative" | "Call didn't receive" => {
  if (!status) return "Review not done"
  const s = status.trim().toLowerCase()
  if (s === "positive") return "Positive"
  if (s === "negative") return "Negative"
  if (s === "unreachable" || s === "call didn't receive" || s === "call didnt receive") return "Call didn't receive"
  if (s === "pending" || s === "review not done" || s === "not done") return "Review not done"
  return "Review not done"
}

export function ImportModule() {
  const crm = useCRM()
  
  // File state
  const [file, setFile] = React.useState<File | null>(null)
  const [workbook, setWorkbook] = React.useState<XLSX.WorkBook | null>(null)
  const [sheets, setSheets] = React.useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = React.useState<string>("")
  const [excelHeaders, setExcelHeaders] = React.useState<string[]>([])
  const [excelRows, setExcelRows] = React.useState<any[][]>([])
  
  // Importer settings
  const [importTarget, setImportTarget] = React.useState<ImportTarget>("contacts")
  const [mappings, setMappings] = React.useState<ColumnMapping[]>([])
  const [previewRows, setPreviewRows] = React.useState<any[]>([])
  const [importing, setImporting] = React.useState(false)
  const [importLogs, setImportLogs] = React.useState<string[]>([])

  // ==========================================
  // Target Schema Fields Definitions
  // ==========================================
  const targetSchemas: Record<ImportTarget, Omit<ColumnMapping, "excelHeader">[]> = {
    customers: [
      { dbField: "name", label: "Client Name", required: true, type: "string" },
      { dbField: "mobile", label: "Mobile Number", required: false, type: "string" },
      { dbField: "address", label: "Service Address", required: false, type: "string" },
      { dbField: "referralSource", label: "Referral Channel (Source)", required: false, type: "string" },
      { dbField: "notes", label: "Internal Memo Notes", required: false, type: "string" },
      { dbField: "review", label: "Satisfaction Review", required: false, type: "string" },
      { dbField: "reviewStatus", label: "Satisfaction Status", required: false, type: "string" },
    ],
    bookings: [
      { dbField: "id", label: "CIN / Booking Ref (Auto-generates if blank)", required: false, type: "string" },
      { dbField: "date", label: "Booking Date", required: false, type: "date" },
      { dbField: "customerName", label: "Customer Name", required: true, type: "string" },
      { dbField: "customerMobile", label: "Customer Phone", required: false, type: "string" },
      { dbField: "customerAddress", label: "Customer Address", required: false, type: "string" },
      { dbField: "referralSource", label: "Referral Source", required: false, type: "string" },
      { dbField: "notes", label: "Customer Notes", required: false, type: "string" },
      { dbField: "review", label: "Satisfaction Review", required: false, type: "string" },
      { dbField: "reviewStatus", label: "Satisfaction Status", required: false, type: "string" },
      { dbField: "appliance", label: "Appliance (AC, TV, etc.)", required: false, type: "string" },
      { dbField: "serviceType", label: "Service Type", required: false, type: "string" },
      { dbField: "issue", label: "Issue Details", required: false, type: "string" },
      { dbField: "assignedTechnicianId", label: "Assigned Tech Name", required: false, type: "string" },
      { dbField: "spareName", label: "Spare Part Linked", required: false, type: "string" },
      { dbField: "spareCost", label: "Actual Spare Cost (R)", required: false, type: "number" },
      { dbField: "sparePrice", label: "Consumer Selling Price (S)", required: false, type: "number" },
      { dbField: "totalCommission", label: "Total Commission", required: false, type: "number" },
      { dbField: "technicianCommission", label: "Technician Commission (Spare)", required: false, type: "number" },
      { dbField: "companyCommission", label: "Company Commission (Spare)", required: false, type: "number" },
      { dbField: "serviceCharge", label: "Service Fee (W)", required: false, type: "number" },
      { dbField: "technicianServiceCommission", label: "Technician Commission (Service)", required: false, type: "number" },
      { dbField: "companyServiceCommission", label: "Company Commission (Service)", required: false, type: "number" },
      { dbField: "totalTechnicianAmount", label: "Total Technician Amount", required: false, type: "number" },
      { dbField: "totalCompanyAmount", label: "Total Company Amount", required: false, type: "number" },
      { dbField: "totalConsumerAmount", label: "Total Consumer Amount", required: false, type: "number" },
      { dbField: "status", label: "Payment/Job Status", required: false, type: "string" },
    ],
    technicians: [
      { dbField: "name", label: "Technician Name", required: true, type: "string" },
      { dbField: "dueAmount", label: "Due", required: true, type: "number" },
      { dbField: "advanceTaken", label: "Total Advance", required: true, type: "number" },
    ],
    spares: [
      { dbField: "name", label: "Spare Part Name", required: true, type: "string" },
      { dbField: "category", label: "Spare Category", required: true, type: "string" },
      { dbField: "stockQty", label: "Stock Quantity", required: true, type: "number" },
      { dbField: "unitCost", label: "Supplier Cost (R)", required: true, type: "number" },
      { dbField: "sellingCost", label: "Consumer Cost (S)", required: true, type: "number" },
      { dbField: "reorderLevel", label: "Reorder Alarm Level", required: true, type: "number" },
    ],
    expenses: [
      { dbField: "date", label: "Expense Date", required: true, type: "date" },
      { dbField: "item", label: "Item Description", required: true, type: "string" },
      { dbField: "category", label: "Expense Category", required: true, type: "string" },
      { dbField: "amount", label: "Amount Paid", required: true, type: "number" },
      { dbField: "beneficiary", label: "Beneficiary / Supplier", required: true, type: "string" },
      { dbField: "remarks", label: "Voucher Remarks", required: false, type: "string" },
    ],
    outstanding: [
      { dbField: "recipient", label: "Recipient Name", required: true, type: "string" },
      { dbField: "amount", label: "Outstanding Dues Amount", required: true, type: "number" },
      { dbField: "reason", label: "Outstanding Reason", required: true, type: "string" },
      { dbField: "date", label: "Liability Date", required: true, type: "date" },
    ],
    leads: [
      { dbField: "name", label: "Lead Client Name", required: true, type: "string" },
      { dbField: "mobile", label: "Mobile Phone", required: true, type: "string" },
      { dbField: "address", label: "Location address", required: true, type: "string" },
      { dbField: "source", label: "Lead Acquisition Source", required: true, type: "string" },
      { dbField: "appliance", label: "Appliance", required: true, type: "string" },
      { dbField: "requirement", label: "Requirement details", required: true, type: "string" },
    ],
    contacts: [
      { dbField: "name", label: "Full Name", required: true, type: "string" },
      { dbField: "mobile", label: "Mobile Line", required: true, type: "string" },
      { dbField: "address", label: "Address details", required: true, type: "string" },
      { dbField: "customerType", label: "Profile type", required: true, type: "string" },
      { dbField: "notes", label: "Contact Memo Notes", required: false, type: "string" },
    ],
    payouts: [
      { dbField: "technicianName", label: "Technician Name", required: true, type: "string" },
      { dbField: "dailyEarnings", label: "Total", required: true, type: "number" },
      { dbField: "due", label: "Due", required: true, type: "number" },
      { dbField: "advance", label: "Total Advance", required: true, type: "number" }
    ]
  }

  // ==========================================
  // Smart Guessing & Auto-Matching Alg
  // ==========================================
  const guessMatchingHeader = (dbField: string, rawExcelCols: string[]): string => {
    const fieldName = dbField.toLowerCase()
    const excelCols = (rawExcelCols || []).filter((c): c is string => typeof c === "string")
    
    // Custom variations for high-precision matching
    if (fieldName === "totalcommission") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl.includes("total com") || cl.includes("total commission") || cl.includes("total commision")
      })
      if (match) return match
    }
    if (fieldName === "techniciancommission") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        const isTech = cl.includes("tech")
        const isSpare = !cl.includes(".1") && !cl.includes("service") && !cl.includes("sv") && !cl.includes("charge") && !cl.includes("(2") && !cl.includes(" 2") && !cl.includes("(3")
        return isTech && isSpare
      })
      if (match) return match
    }
    if (fieldName === "companycommission") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        const isCompany = cl.includes("company") || cl.includes("co")
        const isSpare = !cl.includes(".1") && !cl.includes("service") && !cl.includes("sv") && !cl.includes("charge") && !cl.includes("(2") && !cl.includes(" 2") && !cl.includes("(3")
        return isCompany && isSpare && !cl.includes("total")
      })
      if (match) return match
    }
    if (fieldName === "technicianservicecommission") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        const isTech = cl.includes("tech")
        const isService = cl.includes(".1") || cl.includes("service") || cl.includes("sv") || cl.includes("charge") || cl.includes("(2") || cl.includes(" 2") || cl.includes("(3")
        return isTech && isService
      })
      if (match) return match
    }
    if (fieldName === "companyservicecommission") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        const isCompany = cl.includes("company") || cl.includes("co")
        const isService = cl.includes(".1") || cl.includes("service") || cl.includes("sv") || cl.includes("charge") || cl.includes("(2") || cl.includes(" 2") || cl.includes("(3")
        return isCompany && isService && !cl.includes("total")
      })
      if (match) return match
    }
    if (fieldName === "totaltechnicianamount") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl.includes("total tech") || cl.includes("total technician")
      })
      if (match) return match
    }
    if (fieldName === "totalcompanyamount") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return (cl.includes("total company") || cl.includes("total co") || cl === "total co") && !cl.includes("tech")
      })
      if (match) return match
    }
    if (fieldName === "totalconsumeramount") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl.includes("total consumer") || cl.includes("total cons")
      })
      if (match) return match
    }
    if (fieldName === "id" || fieldName === "cin" || fieldName === "cin no") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "cin" || cl === "cin no" || cl === "booking reference" || cl === "id" || cl === "booking id" || cl === "cin_no" || cl === "cinno"
      })
      if (match) return match
    }
    if (fieldName === "status") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "status" || cl.includes("pay") || cl.includes("status") || cl === "job status" || cl === "payment status"
      })
      if (match) return match
    }
    if (fieldName === "customername" || fieldName === "name") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase().trim()
        return cl === "name" || cl === "customer name" || cl === "client name" || cl === "customer" || cl === "client" || cl === "cust" || cl === "consumer" || cl === "full name" || cl === "fullname" || cl.includes("customer") || cl.includes("client") || cl.includes("consumer")
      })
      if (match) return match
    }
    if (fieldName === "customermobile" || fieldName === "mobile" || fieldName === "mobile number") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "number" || cl === "phone" || cl === "mobile" || cl === "phone number" || cl === "mobile number" || cl.includes("tel") || cl.includes("mob") || cl.includes("phone") || cl.includes("contact")
      })
      if (match) return match
    }
    if (fieldName === "customeraddress" || fieldName === "address") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "address" || cl === "service address" || cl.includes("addr") || cl.includes("loc") || cl.includes("site") || cl.includes("place")
      })
      if (match) return match
    }
    if (fieldName === "item" || fieldName === "item description") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "item" || cl === "item description" || cl.includes("working exp") || cl.includes("beneficiary") || cl.includes("exp")
      })
      if (match) return match
    }
    if (fieldName === "beneficiary") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "beneficiary" || cl.includes("working exp") || cl.includes("beneficiary")
      })
      if (match) return match
    }
    if (fieldName === "recipient") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "recipient" || cl.includes("outstanding") || cl.includes("benificiary")
      })
      if (match) return match
    }
    if (fieldName === "amount" || fieldName === "amount paid") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "amount" || cl === "amount paid" || cl === "amt" || cl.includes("amt") || cl.includes("amount")
      })
      if (match) return match
    }
    if (fieldName === "assignedtechnicianid" || fieldName === "appointed technician") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl.includes("appointed") || cl.includes("tech") || cl.includes("assign")
      })
      if (match) return match
    }
    if (fieldName === "sparename" || fieldName === "spare used") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "spare name" || cl === "spare used" || cl.includes("spare name") || cl.includes("spare used") || cl.includes("part name")
      })
      if (match) return match
    }
    if (fieldName === "sparecost" || fieldName === "actual spare") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "actual spare" || cl === "actual cost" || cl === "spare cost" || cl === "supplier cost" || cl.includes("actual") || cl.includes("supplier")
      })
      if (match) return match
    }
    if (fieldName === "spareprice" || fieldName === "spare amt") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "spare amt" || cl === "spare price" || cl === "spare amount" || cl === "selling price" || cl === "consumer spare" || cl === "customer charged amount" || cl.includes("consumer") || cl.includes("price") || cl.includes("amt")
      })
      if (match) return match
    }
    if (fieldName === "servicecharge" || fieldName === "sv charge") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "sv charge" || cl === "service charge" || cl === "service fee" || cl.includes("charge") || cl.includes("service ch") || cl.includes("service c")
      })
      if (match) return match
    }
    if (fieldName === "referralsource" || fieldName === "referal") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "referal" || cl === "referral" || cl === "referral source" || cl === "lead source" || cl.includes("source") || cl.includes("refer")
      })
      if (match) return match
    }
    if (fieldName === "notes" || fieldName === "note") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "notes" || cl === "note" || cl.includes("note") || cl.includes("memo") || cl.includes("remark")
      })
      if (match) return match
    }
    if (fieldName === "review") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "review" || cl === "customer review" || cl === "feedback" || cl.includes("rev") || cl.includes("critique")
      })
      if (match) return match
    }
    if (fieldName === "appliance") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "appliance" || cl === "appliance type" || cl.includes("appliance") || cl.includes("device") || cl.includes("unit")
      })
      if (match) return match
    }
    if (fieldName === "issue") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "issue" || cl === "service issue" || cl.includes("issue") || cl.includes("complaint") || cl.includes("problem") || cl.includes("defect")
      })
      if (match) return match
    }
    if (fieldName === "servicetype") {
      const match = excelCols.find(c => {
        const cl = c.toLowerCase()
        return cl === "service type" || cl.includes("type")
      })
      if (match) return match
    }

    // Exact match or contains matches
    const exact = excelCols.find(col => col.toLowerCase() === fieldName)
    if (exact) return exact

    const contains = excelCols.find(col => {
      const cLower = col.toLowerCase()
      return cLower.includes(fieldName) || fieldName.includes(cLower)
    })
    if (contains) return contains

    return "NONE"
  }

  // Re-map fields when target module or Excel headers change
  React.useEffect(() => {
    if (excelHeaders.length === 0) return

    const schema = targetSchemas[importTarget]
    const updated = schema.map(field => {
      const excelHeader = guessMatchingHeader(field.dbField, excelHeaders)
      return { ...field, excelHeader }
    })
    
    setMappings(updated)
  }, [importTarget, excelHeaders])

  // ==========================================
  // File Upload parsing
  // ==========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const uploaded = files[0]
    setFile(uploaded)
    
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        setWorkbook(wb)
        setSheets(wb.SheetNames)
        
        // Select first sheet automatically
        if (wb.SheetNames.length > 0) {
          handleSheetSelection(wb.SheetNames[0], wb)
        }
        
        toast.success(`Spreadsheet parsed! Found ${wb.SheetNames.length} sheet tables.`)
      } catch (err) {
        toast.error("Failed to parse the Excel spreadsheet.")
      }
    }
    reader.readAsArrayBuffer(uploaded)
  }

  // Automated parser for complex stacked matrix payout sheets
  const parsePayoutMatrixSheet = (worksheet: XLSX.WorkSheet) => {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][]
    if (jsonData.length === 0) return { headers: [], rows: [] }

    // Find row 0 header (must contain "NAME" and Excel serial dates or similar)
    const headerRow = jsonData[0] || []
    
    // Find all date columns. Date headers are typically numeric (e.g. 46143)
    const dateCols: { index: number; dateStr: string }[] = []
    headerRow.forEach((val, idx) => {
      const num = parseFloat(String(val));
      if (!isNaN(num) && num > 40000 && num < 50000) {
        // Convert Excel serial date to YYYY-MM-DD
        const dateObj = new Date(Date.UTC(1899, 11, 30 + Math.round(num)));
        const dateStr = dateObj.toISOString().split("T")[0];
        dateCols.push({ index: idx, dateStr });
      }
    });

    if (dateCols.length === 0) {
      throw new Error("Invalid Payout sheet: Could not find daily date columns (e.g. May 1st to 30th represented as Excel serial numbers).");
    }

    // Find the end index of the total daily earnings table (Table 1)
    // Table 1 goes from Row 1 until we hit a row starting with "ADVANCE PAYMENT" or empty.
    let table1EndRow = jsonData.length;
    let table2StartRow = -1;

    for (let r = 1; r < jsonData.length; r++) {
      const firstCell = String(jsonData[r][0] || "").trim().toUpperCase();
      if (firstCell.includes("ADVANCE PAYMENT") || firstCell.includes("ADVANCE")) {
        table1EndRow = r;
        break;
      }
    }

    // Table 2 (Advances) starts after the header row inside Table 2.
    // Let's find the row that has "NAME" inside Table 2.
    for (let r = table1EndRow; r < jsonData.length; r++) {
      const firstCell = String(jsonData[r][0] || "").trim().toUpperCase();
      if (firstCell === "NAME" || firstCell === "NAME ") {
        table2StartRow = r + 1;
        break;
      }
    }

    if (table2StartRow === -1) {
      table2StartRow = table1EndRow + 2;
    }

    // Helper to normalize names for fuzzy matching
    const normalizeName = (n: string) => {
      return String(n || "")
        .toLowerCase()
        .replace(/[^a-z]/g, "") // remove all non-alphabetic characters
        .trim();
    };

    // Extract Table 1 (Daily Earnings) for each technician
    const earningsMap = new Map<string, {
      rawName: string;
      dailyEarnings: number[];
      totalEarnings: number;
      due: number;
    }>();

    // Sum column indexes
    const totalColIdx = headerRow.findIndex(h => String(h || "").trim().toUpperCase() === "TOTAL" || String(h || "").trim().toUpperCase() === "TOTAL ");
    const dueColIdx = headerRow.findIndex(h => String(h || "").trim().toUpperCase() === "DUE");

    for (let r = 1; r < table1EndRow; r++) {
      const row = jsonData[r];
      if (!row || row.length === 0) continue;
      const techName = String(row[0] || "").trim();
      if (!techName || techName.toUpperCase().includes("TOTAL") || techName.toUpperCase().includes("DUE") || techName.toUpperCase().includes("ADVANCE") || techName.toUpperCase().includes("PAYMENT")) continue;

      // Extract daily earnings
      const dailyEarns = dateCols.map(dc => parseFloat(String(row[dc.index] || "0")) || 0);
      const totalEarn = parseFloat(String(row[totalColIdx !== -1 ? totalColIdx : 31] || "0")) || dailyEarns.reduce((a, b) => a + b, 0);
      const dueVal = parseFloat(String(row[dueColIdx !== -1 ? dueColIdx : 32] || "0")) || totalEarn;

      earningsMap.set(normalizeName(techName), {
        rawName: techName,
        dailyEarnings: dailyEarns,
        totalEarnings: totalEarn,
        due: dueVal
      });
    }

    // Extract Table 2 (Daily Advances) for each technician
    const advancesMap = new Map<string, {
      rawName: string;
      dailyAdvances: number[];
      totalAdvance: number;
    }>();

    for (let r = table2StartRow; r < jsonData.length; r++) {
      const row = jsonData[r];
      if (!row || row.length === 0) continue;
      const techName = String(row[0] || "").trim();
      if (!techName || techName.toUpperCase().includes("TOTAL") || techName.toUpperCase().includes("ADVANCE") || techName.toUpperCase().includes("DUE") || techName.toUpperCase().includes("BALANCE")) continue;

      const dailyAdvs = dateCols.map(dc => parseFloat(String(row[dc.index] || "0")) || 0);
      const totalAdv = parseFloat(String(row[totalColIdx !== -1 ? totalColIdx : 31] || "0")) || dailyAdvs.reduce((a, b) => a + b, 0);

      advancesMap.set(normalizeName(techName), {
        rawName: techName,
        dailyAdvances: dailyAdvs,
        totalAdvance: totalAdv
      });
    }

    // Combine both tables
    const parsedRows: any[] = [];
    const allNormalizedNames = new Set([...earningsMap.keys(), ...advancesMap.keys()]);

    const lastDateStr = dateCols[dateCols.length - 1]?.dateStr || new Date().toISOString().split("T")[0];

    allNormalizedNames.forEach(normName => {
      const earnInfo = earningsMap.get(normName);
      let advInfo = advancesMap.get(normName);

      // Fuzzy matching fallback: if direct match fails, try finding a name that contains or is contained
      if (!advInfo) {
        for (const [key, value] of advancesMap.entries()) {
          if (key.includes(normName) || normName.includes(key)) {
            advInfo = value;
            break;
          }
        }
      }

      const displayName = earnInfo ? earnInfo.rawName : (advInfo ? advInfo.rawName : "Unknown Tech");
      const totalEarnings = earnInfo ? earnInfo.totalEarnings : 0;
      const totalAdvance = advInfo ? advInfo.totalAdvance : 0;
      const computedDue = earnInfo ? earnInfo.due : -totalAdvance;

      parsedRows.push({
        technicianName: displayName.trim(),
        date: lastDateStr,
        dailyEarnings: totalEarnings,
        advance: totalAdvance,
        due: computedDue,
        paymentStatus: "Pending"
      });
    });
    return {
      headers: ["Technician Name", "Total", "Due", "Total Advance"],
      rows: parsedRows
    };
  };

  const handleSheetSelection = (sheetName: string, wb = workbook) => {
    if (!wb) return
    setSelectedSheet(sheetName)
    
    const worksheet = wb.Sheets[sheetName]
    
    if (importTarget === "payouts" || importTarget === "technicians") {
      try {
        const parsed = parsePayoutMatrixSheet(worksheet)
        if (importTarget === "technicians") {
          setExcelHeaders(["Technician Name", "Due", "Total Advance"])
          setExcelRows(parsed.rows.map(row => [
            row.technicianName,
            row.due,
            row.advance
          ]))
          setMappings([
            { dbField: "name", label: "Technician Name", excelHeader: "Technician Name", required: true, type: "string" },
            { dbField: "dueAmount", label: "Due", excelHeader: "Due", required: true, type: "number" },
            { dbField: "advanceTaken", label: "Total Advance", excelHeader: "Total Advance", required: true, type: "number" }
          ])
        } else {
          setExcelHeaders(["Technician Name", "Total", "Due", "Total Advance"])
          setExcelRows(parsed.rows.map(row => [
            row.technicianName,
            row.dailyEarnings,
            row.due,
            row.advance
          ]))
          setMappings([
            { dbField: "technicianName", label: "Technician Name", excelHeader: "Technician Name", required: true, type: "string" },
            { dbField: "dailyEarnings", label: "Total", excelHeader: "Total", required: true, type: "number" },
            { dbField: "due", label: "Due", excelHeader: "Due", required: true, type: "number" },
            { dbField: "advance", label: "Total Advance", excelHeader: "Total Advance", required: true, type: "number" }
          ])
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to parse Technician Payout sheet.")
      }
      return
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (jsonData.length === 0) {
      setExcelHeaders([])
      setExcelRows([])
      return
    }

    // Smart Header Finder: Scan the first 15 rows to find the one with the most recognizable column headers
    let headerRowIndex = 0
    let maxHeaderScore = -1
    const scanLimit = Math.min(jsonData.length, 15)
    
    for (let r = 0; r < scanLimit; r++) {
      const row = jsonData[r]
      if (!row || !Array.isArray(row)) continue
      
      let score = 0
      row.forEach(cell => {
        const str = String(cell || "").toLowerCase().trim()
        if (
          str === "name" || str === "date" || str === "cin" || str === "amt" || str === "amount" ||
          str.includes("customer") || str.includes("client") || str.includes("consumer") ||
          str.includes("phone") || str.includes("mobile") || str.includes("address") ||
          str.includes("appliance") || str.includes("tech") || str.includes("spare") ||
          str.includes("charge") || str.includes("status") || str.includes("issue") ||
          str.includes("outstanding") || str.includes("working exp") || str.includes("beneficiary")
        ) {
          score++
        }
      })
      
      if (score > maxHeaderScore) {
        maxHeaderScore = score
        headerRowIndex = r
      }
    }

    // Keep all columns by mapping empty or undefined headers to a default label
    const rawHeaders = Array.from(jsonData[headerRowIndex] || []).map((h, idx) => {
      const val = String(h || "").trim()
      return val || `Column_${idx + 1}`
    })

    const seen = new Map<string, number>()
    const uniqueHeaders = rawHeaders.map(h => {
      if (seen.has(h)) {
        const count = seen.get(h)! + 1
        seen.set(h, count)
        return `${h} (${count})`
      } else {
        seen.set(h, 1)
        return h
      }
    })
    
    // Slice rows from after the dynamic header row index, filtering out empty rows
    const rows = jsonData.slice(headerRowIndex + 1).filter(r => {
      return Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== "")
    })

    setExcelHeaders(uniqueHeaders)
    setExcelRows(rows)
  }

  // Re-parse when importTarget changes to automatically resolve payout matrix
  React.useEffect(() => {
    if (workbook && selectedSheet) {
      handleSheetSelection(selectedSheet)
    }
  }, [importTarget])

  // Handle Mappings Changes
  const handleMapChange = (dbField: string, excelHeader: string) => {
    setMappings(prev => prev.map(m => m.dbField === dbField ? { ...m, excelHeader } : m))
  }

  // ==========================================
  // Row Mapping Preview Calculations
  // ==========================================
  React.useEffect(() => {
    if (excelRows.length === 0 || mappings.length === 0) {
      setPreviewRows([])
      return
    }

    const list = excelRows.slice(0, 3).map((row) => {
      const mappedObj: Record<string, any> = {}
      
      mappings.forEach(m => {
        if (m.excelHeader === "NONE") {
          mappedObj[m.dbField] = m.required ? "(MISSING)" : ""
          return
        }

        const colIndex = excelHeaders.indexOf(m.excelHeader)
        if (colIndex === -1) {
          mappedObj[m.dbField] = ""
          return
        }

        let val = row[colIndex]
        
        // Parsing types
        if (m.type === "number") {
          // Strip any currency symbols (₹, $), commas, or non-numeric formatting
          const cleanVal = String(val ?? "").replace(/[^\d.-]/g, "")
          mappedObj[m.dbField] = parseFloat(cleanVal) || 0
        } else if (m.type === "date") {
          if (typeof val === "number") {
            // Excel serial date conversion
            const dateObj = new Date(Date.UTC(1899, 11, 30 + val))
            mappedObj[m.dbField] = dateObj.toISOString().split("T")[0]
          } else {
            mappedObj[m.dbField] = String(val || "").trim()
          }
        } else {
          mappedObj[m.dbField] = String(val || "").trim()
        }
      })

      return mappedObj
    })

    setPreviewRows(list)
  }, [mappings, excelRows, excelHeaders])

  // ==========================================
  // Commit Import to Database Collections
  // ==========================================
  const handleRunImport = async () => {
    if (excelRows.length === 0) {
      toast.error("No spreadsheet rows to import.")
      return
    }

    // Check if required fields are unmapped
    const unmappedRequired = mappings.filter(m => m.required && m.excelHeader === "NONE")
    if (unmappedRequired.length > 0) {
      toast.error(`Please map required column schemas: ${unmappedRequired.map(u => u.label).join(", ")}`)
      return
    }

    setImporting(true)
    setImportLogs([])
    const logs: string[] = ["🚀 Starting migration audit...", `Parsed ${excelRows.length} rows from spreadsheet table.`]
    let importCount = 0

    try {
      // Local trackers to prevent stale React state updates from causing ID collisions
      const localCustomers = [...crm.customers]
      const localBookings = [...crm.bookings]
      const localTechnicians = [...crm.technicians]
      const localSpares = [...crm.spares]
      const localExpenses = [...crm.expenses]
      const localOutstanding = [...crm.outstandingDues]
      const localLeads = [...crm.leads]
      const localContacts = [...crm.contacts]
      const localPayouts = [...crm.payouts]

      let maxCustId = localCustomers.reduce((max, c) => {
        const num = parseInt(c.id.split("-")[1])
        return isNaN(num) ? max : Math.max(max, num)
      }, 1000)

      let maxBookId = localBookings.reduce((max, b) => {
        const num = parseInt(b.id.split("-")[1])
        return isNaN(num) ? max : Math.max(max, num)
      }, 1000)

      let batch = isFirebaseEnabled && db ? writeBatch(db) : null
      let opCount = 0

      const writeDoc = async (coll: string, id: string, data: any) => {
        if (isFirebaseEnabled && db && batch) {
          batch.set(doc(db, coll, id), data)
          opCount++
          if (opCount >= 400) {
            await batch.commit()
            batch = writeBatch(db)
            opCount = 0
          }
        }
      }

      // Loop rows
      let rowIndex = 0
      for (const row of excelRows) {
        rowIndex++
        const mappedObj: Record<string, any> = {}
        
        mappings.forEach(m => {
          if (m.excelHeader === "NONE") {
            mappedObj[m.dbField] = m.type === "number" ? 0 : ""
            return
          }

          const colIndex = excelHeaders.indexOf(m.excelHeader)
          let val = row[colIndex]
          
          if (m.type === "number") {
            // Strip any currency symbols (₹, $), commas, or non-numeric formatting
            const cleanVal = String(val ?? "").replace(/[^\d.-]/g, "")
            mappedObj[m.dbField] = parseFloat(cleanVal) || 0
          } else if (m.type === "date" && typeof val === "number") {
            const dateObj = new Date(Date.UTC(1899, 11, 30 + val))
            mappedObj[m.dbField] = dateObj.toISOString().split("T")[0]
          } else {
            mappedObj[m.dbField] = String(val === undefined || val === null ? "" : val).trim()
          }
        })

        // Auto ID generation splits matching module targets
        if (importTarget === "customers") {
          const custName = String(mappedObj.name || "").trim()
          if (!custName) {
            logs.push(`Row ${rowIndex + 1}: Error - Mapped Client Name is empty. Skipping row.`)
            continue
          }

          const custMobile = String(mappedObj.mobile || "9900000000").trim()
          const exists = localCustomers.some(c => c.name.toLowerCase().trim() === custName.toLowerCase() && c.mobile === custMobile)
          if (exists) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate customer "${custName}" with mobile "${custMobile}" already exists. Skipping duplicate.`)
            continue
          }

          maxCustId++
          const custId = `CUST-${maxCustId}`
          const custDoc = {
            id: custId,
            name: custName,
            mobile: custMobile,
            address: mappedObj.address || "Imported Address",
            referralSource: (mappedObj.referralSource || "Other") as any,
            notes: mappedObj.notes || "Imported via Excel migration",
            review: mappedObj.review || "",
            reviewStatus: cleanReviewStatus(mappedObj.reviewStatus || (mappedObj.review ? "Positive" : "Review not done")),
            status: "Active" as const,
            createdAt: new Date().toISOString().split("T")[0]
          }
          localCustomers.push(custDoc as any)
          if (isFirebaseEnabled && db) {
            await writeDoc("customers", custId, custDoc)
          } else {
            crm.addCustomer(custDoc)
          }
          logs.push(`Row ${rowIndex + 1}: Onboarded client "${custName}" as CIN "${custId}".`)
          importCount++
        } else if (importTarget === "bookings") {
          // Helper cleaners to align with exact enums
          const cleanReferral = (val: string): any => {
            const v = String(val || "").trim().toLowerCase()
            if (v.includes("ad") || v.includes("news") || v.includes("promo")) return "Ad"
            if (v.includes("repeat") || v.includes("consumer") || v.includes("loyal")) return "Repeat Consumer"
            if (v.includes("contact") || v.includes("referral") || v.includes("friend")) return "Contact"
            return "Other"
          }

          const cleanStatus = (val: string): any => {
            const v = String(val || "").trim().toLowerCase()
            if (v.includes("comp") || v.includes("done") || v.includes("settl") || v.includes("paid")) return "Completed"
            if (v.includes("progress") || v.includes("ongoing") || v.includes("work")) return "In Progress"
            if (v.includes("cancel")) return "Cancelled"
            return "Not Started"
          }

          const custMobile = String(mappedObj.customerMobile || "").trim()
          const custName = String(mappedObj.customerName || "").trim()

          if (!custName) {
            logs.push(`Row ${rowIndex + 1}: Error - Mapped Customer Name is empty. Skipping row.`)
            continue
          }

          const applianceText = String(mappedObj.appliance || "Other").trim()

          // Match existing customer by mobile or name, ignoring standard placeholder numbers to prevent merge collisions
          const custMatch = localCustomers.find(c => {
            const isPlaceholderMobile = !custMobile || custMobile === "9900000000" || custMobile === "9800000000" || custMobile === "0" || custMobile === "1234567890" || custMobile.length < 8
            const matchesMobile = !isPlaceholderMobile && c.mobile === custMobile
            const matchesName = custName && c.name.toLowerCase().trim() === custName.toLowerCase().trim()
            return matchesMobile || matchesName
          })
          
          let finalCustomerId = ""
          if (custMatch) {
            const updatedNotes = mappedObj.notes ? (custMatch.notes ? `${custMatch.notes} | ${mappedObj.notes}` : mappedObj.notes) : custMatch.notes
            const updatedCust = {
              ...custMatch,
              referralSource: cleanReferral(mappedObj.referralSource),
              notes: updatedNotes,
              review: mappedObj.review || custMatch.review,
              reviewStatus: cleanReviewStatus(mappedObj.reviewStatus || (mappedObj.review ? "Positive" : custMatch.reviewStatus || "Review not done"))
            }
            const idx = localCustomers.findIndex(c => c.id === custMatch.id)
            if (idx !== -1) {
              localCustomers[idx] = updatedCust as any
            }
            
            if (isFirebaseEnabled && db) {
              await writeDoc("customers", custMatch.id, updatedCust)
            } else {
              crm.updateCustomer(custMatch.id, {
                referralSource: cleanReferral(mappedObj.referralSource),
                notes: updatedNotes,
                review: mappedObj.review || custMatch.review,
                reviewStatus: cleanReviewStatus(mappedObj.reviewStatus || (mappedObj.review ? "Positive" : custMatch.reviewStatus || "Review not done"))
              })
            }
            finalCustomerId = custMatch.id
            logs.push(`Row ${rowIndex + 1}: Linked to existing customer "${custMatch.name}" (${custMatch.id}).`)
          } else {
            maxCustId++
            const custId = `CUST-${maxCustId}`
            const newCust = {
              id: custId,
              name: custName,
              mobile: custMobile || "9900000000",
              address: mappedObj.customerAddress || "Imported Address",
              referralSource: cleanReferral(mappedObj.referralSource),
              notes: mappedObj.notes || "Imported via Merged Spreadsheet Migration",
              review: mappedObj.review || "",
              reviewStatus: cleanReviewStatus(mappedObj.reviewStatus || (mappedObj.review ? "Positive" : "Review not done")),
              status: "Active" as const,
              createdAt: new Date().toISOString().split("T")[0]
            }
            localCustomers.push(newCust as any)
            finalCustomerId = custId

            if (isFirebaseEnabled && db) {
              await writeDoc("customers", custId, newCust)
              const contactId = `CONT-${maxCustId}`
              await writeDoc("contacts", contactId, {
                id: contactId,
                name: custName,
                mobile: custMobile || "9900000000",
                address: mappedObj.customerAddress || "Imported Address",
                customerType: "Regular",
                notes: "Auto-created during migration import",
                lastServiceDate: mappedObj.date || new Date().toISOString().split("T")[0]
              })
            } else {
              crm.addCustomer(newCust)
            }
            logs.push(`Row ${rowIndex + 1}: Onboarded new customer "${custName}" as CIN "${custId}".`)
          }

          // Match technician
          let finalTechId = "TECH-1001"
          const techName = String(mappedObj.assignedTechnicianId || "").trim().toLowerCase()
          const techMatch = crm.technicians.find(t => 
            t.name.toLowerCase().includes(techName) || techName.includes(t.name.toLowerCase())
          )
          
          if (techMatch) {
            finalTechId = techMatch.id
          } else if (techName) {
            const techNum = localTechnicians.length ? Math.max(...localTechnicians.map(t => parseInt(t.id.split("-")[1]))) + 1 : 1001
            const techId = `TECH-${techNum}`
            const newTech = {
              id: techId,
              name: mappedObj.assignedTechnicianId,
              mobile: "9800000000",
              address: "Gurugram Block A",
              skills: [applianceText],
              status: "Active" as const,
              joiningDate: new Date().toISOString().split("T")[0],
              advanceTaken: 0,
              dueAmount: 0
            }
            localTechnicians.push(newTech as any)
            finalTechId = techId
            if (isFirebaseEnabled && db) {
              await writeDoc("technicians", techId, newTech)
            } else {
              crm.addTechnician(newTech)
            }
            logs.push(`Row ${rowIndex + 1}: Technician "${newTech.name}" onboarded as Ref "${techId}".`)
          }

          // Check if a booking with the same date, customer, appliance, and issue details already exists
          const isDuplicateBooking = localBookings.some(b => {
            const matchesCust = b.customerId === finalCustomerId
            const matchesDate = b.date === (mappedObj.date || new Date().toISOString().split("T")[0])
            const matchesAppliance = b.appliance.toLowerCase().trim() === applianceText.toLowerCase().trim()
            const matchesIssue = b.issue.toLowerCase().trim() === (mappedObj.issue || "Appliance servicing").toLowerCase().trim()
            return matchesCust && matchesDate && matchesAppliance && matchesIssue
          })

          if (isDuplicateBooking) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate booking found for customer "${custName}" ("${finalCustomerId}") on ${mappedObj.date || "today"}. Skipping duplicate record.`)
            continue
          }

          // Prepare Booking sequential ID (CIN) to avoid duplicate key overwrites
          const bookingId = String(mappedObj.id || "").trim()
          let cleanBookingId = bookingId.startsWith("B-") ? bookingId : (bookingId ? `B-${bookingId}` : undefined)
          
          if (!cleanBookingId || localBookings.some(b => b.id === cleanBookingId)) {
            maxBookId++
            const oldId = cleanBookingId
            cleanBookingId = `B-${maxBookId}`
            if (oldId) {
              logs.push(`Row ${rowIndex + 1}: Warning - Duplicate booking ID "${oldId}". Auto-assigned unique Ref "${cleanBookingId}".`)
            }
          }

          const finance = crm.calculateBookingFinance(mappedObj.spareCost || 0, mappedObj.sparePrice || 0, mappedObj.serviceCharge || 350)
          const bookingDoc = {
            id: cleanBookingId,
            date: mappedObj.date || new Date().toISOString().split("T")[0],
            customerId: finalCustomerId,
            appliance: applianceText,
            serviceType: (mappedObj.serviceType || "Repair") as any,
            issue: mappedObj.issue || "Appliance servicing",
            assignedTechnicianId: finalTechId,
            spareName: mappedObj.spareName || "None",
            spareCost: mappedObj.spareCost || 0,
            sparePrice: mappedObj.sparePrice || 0,
            serviceCharge: mappedObj.serviceCharge || 350,
            status: cleanStatus(mappedObj.status),
            review: mappedObj.review || "",
            reviewStatus: cleanReviewStatus(mappedObj.reviewStatus || (mappedObj.review ? "Positive" : "Review not done")),
            ...finance
          }

          localBookings.push(bookingDoc as any)
          if (isFirebaseEnabled && db) {
            await writeDoc("bookings", cleanBookingId, bookingDoc)
          } else {
            crm.addBooking(bookingDoc as any)
          }
          logs.push(`Row ${rowIndex + 1}: Success - Created booking Ref "${cleanBookingId}" for "${applianceText}".`)
          importCount++
        } else if (importTarget === "technicians") {
          const techName = String(mappedObj.name || "").trim()
          if (!techName) {
            logs.push(`Row ${rowIndex + 1}: Error - Tech Name is empty. Skipping row.`)
            continue
          }

          const exists = localTechnicians.some(t => t.name.toLowerCase().trim() === techName.toLowerCase())
          if (exists) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate technician "${techName}" already exists. Skipping duplicate.`)
            continue
          }

          const techNum = localTechnicians.length ? Math.max(...localTechnicians.map(t => parseInt(t.id.split("-")[1]))) + 1 : 1001
          const techId = `TECH-${techNum}`
          const techDoc = {
            id: techId,
            name: techName,
            mobile: "9800000000",
            address: "Gurugram Block A",
            skills: ["AC"],
            status: "Active" as const,
            joiningDate: new Date().toISOString().split("T")[0],
            advanceTaken: parseFloat(mappedObj.advanceTaken) || 0,
            dueAmount: parseFloat(mappedObj.dueAmount) || 0
          }
          localTechnicians.push(techDoc as any)
          if (isFirebaseEnabled && db) {
            await writeDoc("technicians", techId, techDoc)
          } else {
            crm.addTechnician(techDoc)
          }
          logs.push(`Row ${rowIndex + 1}: Success - Technician "${techName}" onboarded as Ref "${techId}" (Dues: ₹${techDoc.dueAmount}, Advance: ₹${techDoc.advanceTaken}).`)
          importCount++
        } else if (importTarget === "spares") {
          const spareName = String(mappedObj.name || "").trim()
          if (!spareName) {
            logs.push(`Row ${rowIndex + 1}: Error - Spare Name is empty. Skipping row.`)
            continue
          }

          const exists = localSpares.some(s => s.name.toLowerCase().trim() === spareName.toLowerCase())
          if (exists) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate spare part "${spareName}" already exists. Skipping duplicate.`)
            continue
          }

          const spareNum = localSpares.length ? Math.max(...localSpares.map(s => parseInt(s.id.split("-")[1]))) + 1 : 1001
          const spareId = `SPIN-${spareNum}`
          const spareDoc = {
            id: spareId,
            name: spareName,
            category: mappedObj.category || "General",
            stockQty: mappedObj.stockQty || 10,
            unitCost: mappedObj.unitCost || 0,
            sellingCost: mappedObj.sellingCost || 0,
            availableQty: mappedObj.stockQty || 10,
            reorderLevel: mappedObj.reorderLevel || 3
          }
          localSpares.push(spareDoc)
          if (isFirebaseEnabled && db) {
            await writeDoc("spares", spareId, spareDoc)
          } else {
            crm.addSpare(spareDoc)
          }
          logs.push(`Row ${rowIndex + 1}: Success - Spare item "${spareName}" added as Ref "${spareId}".`)
          importCount++
        } else if (importTarget === "expenses") {
          const expenseItem = String(mappedObj.item || "").trim()
          if (!expenseItem) {
            logs.push(`Row ${rowIndex + 1}: Error - Expense Item is empty. Skipping row.`)
            continue
          }

          // Skip total rows at the bottom of the ledger
          if (expenseItem.toUpperCase() === "TOTAL" || expenseItem.toUpperCase() === "GRAND TOTAL") {
            logs.push(`Row ${rowIndex + 1}: Summary row skipped (Item: "${expenseItem}").`)
            continue
          }

          const amountVal = parseFloat(mappedObj.amount) || 0
          const dateVal = mappedObj.date || new Date().toISOString().split("T")[0]
          const beneficiaryVal = String(mappedObj.beneficiary || expenseItem || "Reconciled Supplier").trim()

          const exists = localExpenses.some(e => 
            e.item.toLowerCase().trim() === expenseItem.toLowerCase() && 
            e.amount === amountVal && 
            e.date === dateVal && 
            e.beneficiary.toLowerCase().trim() === beneficiaryVal.toLowerCase()
          )
          if (exists) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate expense voucher "${expenseItem}" for amount ₹${amountVal} already exists. Skipping duplicate.`)
            continue
          }

          // Smart auto-categorization based on keywords in description
          let detectedCategory = String(mappedObj.category || "").trim()
          if (!detectedCategory || detectedCategory.toLowerCase() === "other" || detectedCategory.toLowerCase() === "none" || detectedCategory.toLowerCase() === "working expenses") {
            const itemLower = expenseItem.toLowerCase()
            if (itemLower.includes("outstanding") || itemLower.includes("sangram") || itemLower.includes("akash") || itemLower.includes("ashis") || itemLower.includes("due")) {
              detectedCategory = "Outstanding"
            } else if (itemLower.includes("foam") || itemLower.includes("spray") || itemLower.includes("coil") || itemLower.includes("flex") || itemLower.includes("banner") || itemLower.includes("ad") || itemLower.includes("google") || itemLower.includes("facebook")) {
              detectedCategory = "Working expenses (beneficiary)"
            } else if (itemLower.includes("tool") || itemLower.includes("maintenance") || itemLower.includes("repair") || itemLower.includes("equip")) {
              detectedCategory = "Tools and maintenance"
            } else if (itemLower.includes("sub") || itemLower.includes("software") || itemLower.includes("crm") || itemLower.includes("recharge") || itemLower.includes("net") || itemLower.includes("phone")) {
              detectedCategory = "Tools and subscriptions"
            } else if (itemLower.includes("office") || itemLower.includes("rent") || itemLower.includes("bill") || itemLower.includes("paper") || itemLower.includes("print") || itemLower.includes("book") || itemLower.includes("dinner") || itemLower.includes("food") || itemLower.includes("lunch")) {
              detectedCategory = "Office expenses"
            } else if (itemLower.includes("refund") || itemLower.includes("return")) {
              detectedCategory = "Refunds"
            } else if (itemLower.includes("exp") || itemLower.includes("item")) {
              detectedCategory = "Exp item"
            } else {
              detectedCategory = "Non beneficiary items"
            }
          }

          const expNum = localExpenses.length ? Math.max(...localExpenses.map(e => parseInt(e.id.split("-")[1]))) + 1 : 1001
          const expId = `EXP-${expNum}`
          const expenseDoc = {
            id: expId,
            date: dateVal,
            item: expenseItem,
            category: detectedCategory as any,
            amount: amountVal,
            beneficiary: beneficiaryVal,
            remarks: mappedObj.remarks || "Imported expense"
          }
          localExpenses.push(expenseDoc)
          if (isFirebaseEnabled && db) {
            await writeDoc("expenses", expId, expenseDoc)
          } else {
            crm.addExpense(expenseDoc)
          }
          logs.push(`Row ${rowIndex + 1}: Success - Expense voucher "${expenseItem}" recorded as Ref "${expId}" (Category: ${detectedCategory}).`)
          importCount++
        } else if (importTarget === "outstanding") {
          const recipientName = String(mappedObj.recipient || "").trim()
          if (!recipientName) {
            logs.push(`Row ${rowIndex + 1}: Error - Recipient Name is empty. Skipping row.`)
            continue
          }

          const amountVal = parseFloat(mappedObj.amount) || 0
          const reasonVal = String(mappedObj.reason || "Historical due balance").trim()
          const dateVal = mappedObj.date || new Date().toISOString().split("T")[0]

          const exists = localOutstanding.some(d => 
            d.recipient.toLowerCase().trim() === recipientName.toLowerCase() && 
            d.amount === amountVal && 
            d.reason.toLowerCase().trim() === reasonVal.toLowerCase() && 
            d.date === dateVal
          )
          if (exists) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate outstanding due entry for "${recipientName}" already exists. Skipping duplicate.`)
            continue
          }

          const dueNum = localOutstanding.length ? Math.max(...localOutstanding.map(o => parseInt(o.id.split("-")[1]))) + 1 : 1001
          const dueId = `DUE-${dueNum}`
          const dueDoc = {
            id: dueId,
            recipient: recipientName,
            amount: amountVal,
            reason: reasonVal,
            date: dateVal,
            status: "Pending" as const
          }
          localOutstanding.push(dueDoc)
          if (isFirebaseEnabled && db) {
            await writeDoc("outstanding", dueId, dueDoc)
          } else {
            crm.addOutstandingDue(dueDoc)
          }
          logs.push(`Row ${rowIndex + 1}: Success - Liability dues logged for "${recipientName}" as Ref "${dueId}".`)
          importCount++
        } else if (importTarget === "leads") {
          const leadName = String(mappedObj.name || "").trim()
          if (!leadName) {
            logs.push(`Row ${rowIndex + 1}: Error - Lead Client Name is empty. Skipping row.`)
            continue
          }

          const leadMobile = String(mappedObj.mobile || "9900000000").trim()
          const leadAppliance = String(mappedObj.appliance || "AC").trim()

          const exists = localLeads.some(l => 
            l.name.toLowerCase().trim() === leadName.toLowerCase() && 
            l.mobile === leadMobile && 
            l.appliance.toLowerCase().trim() === leadAppliance.toLowerCase()
          )
          if (exists) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate lead for "${leadName}" already exists. Skipping duplicate.`)
            continue
          }

          const leadNum = localLeads.length ? Math.max(...localLeads.map(l => parseInt(l.id.split("-")[1]))) + 1 : 1001
          const leadId = `LEAD-${leadNum}`
          const leadDoc = {
            id: leadId,
            name: leadName,
            mobile: leadMobile,
            address: mappedObj.address || "Imported Address",
            source: (mappedObj.source || "Other") as any,
            appliance: leadAppliance,
            requirement: mappedObj.requirement || "AC repair",
            assignedTo: "Manager",
            status: "New" as const,
            createdAt: new Date().toISOString().split("T")[0]
          }
          localLeads.push(leadDoc)
          if (isFirebaseEnabled && db) {
            await writeDoc("leads", leadId, leadDoc)
          } else {
            crm.addLead(leadDoc)
          }
          logs.push(`Row ${rowIndex + 1}: Success - Lead generated for "${leadName}" as Ref "${leadId}".`)
          importCount++
        } else if (importTarget === "contacts") {
          const contactName = String(mappedObj.name || "").trim()
          if (!contactName) {
            logs.push(`Row ${rowIndex + 1}: Error - Contact Name is empty. Skipping row.`)
            continue
          }

          const contactMobile = String(mappedObj.mobile || "9900000000").trim()

          const exists = localContacts.some(c => 
            c.name.toLowerCase().trim() === contactName.toLowerCase() && 
            c.mobile === contactMobile
          )
          if (exists) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate contact card for "${contactName}" already exists. Skipping duplicate.`)
            continue
          }

          const contNum = localContacts.length ? Math.max(...localContacts.map(c => parseInt(c.id.split("-")[1]))) + 1 : 1001
          const contId = `CONT-${contNum}`
          const contactDoc = {
            id: contId,
            name: contactName,
            mobile: contactMobile,
            address: mappedObj.address || "Imported Address",
            customerType: (mappedObj.customerType || "Regular") as any,
            notes: mappedObj.notes || "Imported contact card",
            lastServiceDate: "No service logged"
          }
          localContacts.push(contactDoc)
          if (isFirebaseEnabled && db) {
            await writeDoc("contacts", contId, contactDoc)
          } else {
            crm.addContact(contactDoc)
          }
          logs.push(`Row ${rowIndex + 1}: Success - Contact index card created for "${contactName}" as Ref "${contId}".`)
          importCount++
        } else if (importTarget === "payouts") {
          const techName = String(mappedObj.technicianName || "").trim()
          if (!techName) {
            logs.push(`Row ${rowIndex + 1}: Error - Technician Name is empty. Skipping row.`)
            continue
          }

          // Match technician or onboard
          let finalTechId = ""
          const normalizedTechName = techName.toLowerCase()
          const techMatch = localTechnicians.find(t => 
            t.name.toLowerCase().includes(normalizedTechName) || normalizedTechName.includes(t.name.toLowerCase())
          )

          if (techMatch) {
            finalTechId = techMatch.id
            logs.push(`Row ${rowIndex + 1}: Linked to existing technician "${techMatch.name}" (${techMatch.id}).`)
          } else {
            const techNum = localTechnicians.length ? Math.max(...localTechnicians.map(t => parseInt(t.id.split("-")[1]))) + 1 : 1001
            const techId = `TECH-${techNum}`
            const newTech = {
              id: techId,
              name: techName,
              mobile: "9800000000",
              address: "Gurugram Block A",
              skills: ["AC"],
              status: "Active" as const,
              joiningDate: new Date().toISOString().split("T")[0],
              advanceTaken: 0,
              dueAmount: 0
            }
            localTechnicians.push(newTech as any)
            finalTechId = techId
            if (isFirebaseEnabled && db) {
              await writeDoc("technicians", techId, newTech)
            } else {
              crm.addTechnician(newTech)
            }
            logs.push(`Row ${rowIndex + 1}: Onboarded new technician "${techName}" as Ref "${techId}".`)
          }

          const dateVal = mappedObj.date || "2026-05-30"
          const dailyEarningsVal = parseFloat(mappedObj.dailyEarnings) || 0
          const advanceVal = parseFloat(mappedObj.advance) || 0
          const dueVal = parseFloat(mappedObj.due) || 0

          const exists = localPayouts.some(p => 
            p.technicianId === finalTechId && 
            p.date === dateVal && 
            p.dailyEarnings === dailyEarningsVal && 
            p.advance === advanceVal && 
            p.due === dueVal
          )
          if (exists) {
            logs.push(`Row ${rowIndex + 1}: Warning - Duplicate payout transaction for technician "${techName}" already exists. Skipping duplicate.`)
            continue
          }

          // Generate sequential PAY-ID
          const payNum = localPayouts.length ? Math.max(...localPayouts.map(p => parseInt(p.id.split("-")[1])), 1000) + 1 : 1001
          const payId = `PAY-${payNum}`

          const payoutDoc = {
            id: payId,
            technicianId: finalTechId,
            date: dateVal,
            dailyEarnings: dailyEarningsVal,
            totalPayout: 0, // cash paid initially 0, all stays as pending dues
            advance: advanceVal,
            extra: 0,
            due: dueVal,
            paymentStatus: "Pending" as const
          }

          localPayouts.push(payoutDoc)
          if (isFirebaseEnabled && db) {
            await writeDoc("payouts", payId, payoutDoc)
            // Update technician running balances in Firestore
            const matchedTech = localTechnicians.find(t => t.id === finalTechId)
            if (matchedTech) {
              matchedTech.dueAmount = dueVal
              matchedTech.advanceTaken = Math.max(0, matchedTech.advanceTaken - advanceVal)
              await writeDoc("technicians", finalTechId, matchedTech)
            }
          } else {
            crm.addPayout(payoutDoc)
          }

          logs.push(`Row ${rowIndex + 1}: Success - Payout settlement recorded for "${techName}" as Ref "${payId}" (Dues: ₹${dueVal}).`)
          importCount++
        }
      }

      // Commit remaining items in chunked batch
      if (isFirebaseEnabled && db && batch && opCount > 0) {
        await batch.commit()
      }

      logs.push(`🎉 Migration completed! Successfully synchronized ${importCount} out of ${excelRows.length} rows to database.`)
      setImportLogs(logs)
      toast.success(`Successfully imported ${importCount} records into the ${importTarget} database!`)
      
      // Reset wizard file state but keep logs visible for review
      setFile(null)
      setWorkbook(null)
      setSheets([])
      setExcelHeaders([])
      setExcelRows([])
    } catch (error: any) {
      console.error(error)
      logs.push(`❌ Critical Migration Failure: ${error.message || "Stoppage occurred"}`)
      setImportLogs(logs)
      toast.error(`Import migration failed: ${error.message || "Schema mapping issue"}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">Spreadsheet Migration Importer</h2>
          <p className="text-sm text-muted-foreground">Onboard your legacy spreadsheets, match schemas dynamically, and seed Firestore instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Column */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">1. Upload Spreadsheet File</CardTitle>
              <CardDescription className="text-xs">Supports Excel .xlsx, .xls and .csv text documents.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              
              {/* Drag and Drop Zone */}
              <div className="border border-dashed border-border hover:border-primary/50 transition-colors p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 bg-muted/20 relative">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 size-full opacity-0 cursor-pointer"
                />
                <div className="rounded-full bg-primary/5 p-3 text-primary border border-primary/10">
                  <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-6" />
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-bold text-foreground">
                    {file ? file.name : "Select or drag file here"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "Max file size: 10 MB"}
                  </span>
                </div>
              </div>

              {/* Sheet Selection dropdown */}
              {sheets.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sheet-sel" className="text-xs font-bold text-muted-foreground">Select Sheet Table</Label>
                  <Select value={selectedSheet} onValueChange={(val) => handleSheetSelection(val)}>
                    <SelectTrigger id="sheet-sel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sheets.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* CRM Target Selection */}
              <div className="flex flex-col gap-1.5 mt-1">
                <Label htmlFor="target-sel" className="text-xs font-bold text-muted-foreground">2. Select Target CRM Module</Label>
                <Select value={importTarget} onValueChange={(val: any) => setImportTarget(val)}>
                  <SelectTrigger id="target-sel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bookings">Bookings & Customers (Merged Sheet)</SelectItem>
                    <SelectItem value="customers">Customers Registry (Only)</SelectItem>
                    <SelectItem value="technicians">Technicians Directory</SelectItem>
                    <SelectItem value="spares">Spares Catalog (Inventory)</SelectItem>
                    <SelectItem value="expenses">Expenditures Ledger</SelectItem>
                    <SelectItem value="outstanding">Outstanding Dues Ledger</SelectItem>
                    <SelectItem value="leads">Sales Leads Funnel</SelectItem>
                    <SelectItem value="contacts">Business Contacts Directory</SelectItem>
                    <SelectItem value="payouts">Technician Payout Ledger (Matrix Sheet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Mappings and Preview Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {excelHeaders.length === 0 ? (
            <Card className="border-border/60 py-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="rounded-full bg-primary/5 p-4 text-primary border border-primary/10">
                <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} className="size-8" />
              </div>
              <span className="text-base font-bold text-foreground">Onboard spreadsheet to match schemas</span>
              <span className="text-xs text-muted-foreground max-w-sm">
                No active worksheet detected. Drag your Booking sheet or Payout sheet into the left drop-zone to configure your mappings!
              </span>
            </Card>
          ) : (
            <>
              {/* Mapping Card */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {(importTarget === "payouts" || importTarget === "technicians") ? "3. Automated Matrix Schema Resolver" : "3. Column Schema Mapping Wizard"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {(importTarget === "payouts" || importTarget === "technicians") 
                      ? "Calendar Matrix tables with calendar date columns and vertical stacked sections are automatically resolved by our system. No manual mapping required."
                      : "Match Excel spreadsheet headers on the left to CRM fields on the right. Smart Guessing handles name-similarities automatically."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(importTarget === "payouts" || importTarget === "technicians") ? (
                    <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 flex flex-col gap-2">
                      <span className="font-bold text-emerald-600 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2.5} className="size-4" />
                        Matrix Resolution Successful
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We have automatically decoded the May calendar columns (**May 1st to May 30th**), isolated the **Daily Earnings** grid from the **Daily Advances** grid, matched technician accounts fuzzy-insensitively, and mapped them directly into our schemas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mappings.map(map => (
                        <div key={map.dbField} className="flex flex-col gap-1 rounded bg-muted/20 border border-border/30 p-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              {map.label}
                              {map.required && <span className="text-rose-600 font-extrabold">*</span>}
                            </span>
                            <Badge variant="outline" className="text-[9px] uppercase font-semibold text-muted-foreground">{map.type}</Badge>
                          </div>
                          <Select 
                            value={map.excelHeader} 
                            onValueChange={(val) => handleMapChange(map.dbField, val)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-background border-border/40 mt-1.5 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NONE">(Unmapped Field / None)</SelectItem>
                              {excelHeaders.map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Preview Table */}
              <Card className="border-border/60">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">4. Real-time Import Preview</CardTitle>
                    <CardDescription className="text-xs">Showing first 3 rows of mapped values.</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-semibold text-xs tabular-nums tracking-wide">
                    {excelRows.length} total rows parsed
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto border-t">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 font-bold border-b text-muted-foreground uppercase tracking-wider">
                      <tr>
                        {mappings.map(m => (
                          <th key={m.dbField} className="px-3 py-2 border-r last:border-r-0">{m.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/10">
                          {mappings.map(m => (
                            <td key={m.dbField} className="px-3 py-2 border-r last:border-r-0 font-medium tabular-nums text-foreground">
                              {row[m.dbField] === undefined || row[m.dbField] === null ? "(empty)" : String(row[m.dbField])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
                <CardFooter className="py-4 border-t flex flex-row gap-3">
                  <Button 
                    disabled={importing}
                    onClick={handleRunImport}
                    className="flex-1 font-bold text-xs"
                  >
                    {importing ? (
                      <>
                        <HugeiconsIcon icon={Loading03Icon} strokeWidth={2.5} className="size-4 animate-spin" />
                        Migrating data into Firestore database...
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} />
                        Run Import migration & Reconcile splits
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Import Logs & Reports Panel */}
              {importLogs.length > 0 && (
                <Card className="border-border/60 shadow-xs bg-muted/10">
                  <CardHeader className="py-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">5. Migration Audit & Execution Logs</CardTitle>
                      <CardDescription className="text-xs">Detailed row-by-row execution trace and duplicate resolver report.</CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setImportLogs([])}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Clear Logs
                    </Button>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0">
                    <div className="max-h-[30vh] overflow-y-auto rounded-lg border border-border/40 bg-background/50 p-3 font-mono text-[10px] leading-relaxed flex flex-col gap-1.5 scrollbar-thin">
                      {importLogs.map((log, idx) => (
                        <div key={idx} className={
                          log.includes("Error") 
                            ? "text-rose-600 dark:text-rose-400 font-bold" 
                            : log.includes("Warning") 
                            ? "text-amber-600 dark:text-amber-400 font-medium" 
                            : log.includes("Success")
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-muted-foreground font-medium"
                        }>
                          {log}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  )
}
