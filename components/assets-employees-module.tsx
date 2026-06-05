"use client"

import * as React from "react"
import { useCRM, Asset, Employee } from "@/context/crm-context"
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
  SearchIcon
} from "@hugeicons/core-free-icons"


export function AssetsEmployeesModule({ initialSubTab = "assets" }: { initialSubTab?: "assets" | "employees" }) {
  const { 
    assets, 
    employees, 
    addAsset, 
    updateAsset, 
    deleteAsset, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    currentRole 
  } = useCRM()

  const [search, setSearch] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table")
  
  // Creation state
  const [isAssetOpen, setIsAssetOpen] = React.useState(false)
  const [isEmployeeOpen, setIsEmployeeOpen] = React.useState(false)

  // Edit states
  const [isEditAssetOpen, setIsEditAssetOpen] = React.useState(false)
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null)
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = React.useState(false)
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null)

  // Asset Form State
  const [astName, setAstName] = React.useState("")
  const [astType, setAstType] = React.useState<any>("Tools")
  const [astDate, setAstDate] = React.useState(new Date().toISOString().split("T")[0])
  const [astCost, setAstCost] = React.useState(0)
  const [astAssigned, setAstAssigned] = React.useState("")
  const [astStatus, setAstStatus] = React.useState<any>("Active")
  const [astQty, setAstQty] = React.useState(1)

  // Asset Edit Form State
  const [editAstName, setEditAstName] = React.useState("")
  const [editAstType, setEditAstType] = React.useState<any>("Tools")
  const [editAstDate, setEditAstDate] = React.useState("")
  const [editAstCost, setEditAstCost] = React.useState(0)
  const [editAstAssigned, setEditAstAssigned] = React.useState("")
  const [editAstStatus, setEditAstStatus] = React.useState<any>("Active")
  const [editAstQty, setEditAstQty] = React.useState(1)

  // Employee Form State
  const [empName, setEmpName] = React.useState("")
  const [empRole, setEmpRole] = React.useState<any>("Technician")
  const [empMobile, setEmpMobile] = React.useState("")
  const [empSalary, setEmpSalary] = React.useState(0)
  const [empDate, setEmpDate] = React.useState(new Date().toISOString().split("T")[0])
  const [empStatus, setEmpStatus] = React.useState<any>("Active")

  // Employee Edit Form State
  const [editEmpName, setEditEmpName] = React.useState("")
  const [editEmpRole, setEditEmpRole] = React.useState<any>("Admin")
  const [editEmpMobile, setEditEmpMobile] = React.useState("")
  const [editEmpSalary, setEditEmpSalary] = React.useState(0)
  const [editEmpDate, setEditEmpDate] = React.useState("")
  const [editEmpStatus, setEditEmpStatus] = React.useState<any>("Active")

  // Open Edit Asset Drawer
  const handleOpenEditAsset = (a: Asset) => {
    setSelectedAsset(a)
    setEditAstName(a.name)
    setEditAstType(a.type)
    setEditAstDate(a.purchaseDate)
    setEditAstCost(a.cost)
    setEditAstAssigned(a.assignedTo)
    setEditAstStatus(a.status)
    setEditAstQty(a.qty || 1)
    setIsEditAssetOpen(true)
  }

  // Submit Edit Asset
  const handleEditAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsset) return

    updateAsset(selectedAsset.id, {
      name: editAstName,
      type: editAstType,
      purchaseDate: editAstDate,
      cost: editAstCost,
      assignedTo: editAstAssigned,
      status: editAstStatus,
      qty: editAstQty
    })

    setIsEditAssetOpen(false)
  }

  // Open Edit Employee Drawer
  const handleOpenEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp)
    setEditEmpName(emp.name)
    setEditEmpRole(emp.role)
    setEditEmpMobile(emp.mobile)
    setEditEmpSalary(emp.salary)
    setEditEmpDate(emp.joiningDate)
    setEditEmpStatus(emp.status)
    setIsEditEmployeeOpen(true)
  }

  // Submit Edit Employee
  const handleEditEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return

    updateEmployee(selectedEmployee.id, {
      name: editEmpName,
      role: editEmpRole,
      mobile: editEmpMobile,
      salary: editEmpSalary,
      joiningDate: editEmpDate,
      status: editEmpStatus
    })

    setIsEditEmployeeOpen(false)
  }

  // Handle Asset submit
  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addAsset({
      name: astName,
      type: astType,
      purchaseDate: astDate,
      cost: astCost,
      assignedTo: astAssigned || "Unassigned",
      status: astStatus,
      qty: astQty
    })

    // Reset Form
    setAstName("")
    setAstCost(0)
    setAstAssigned("")
    setAstQty(1)
    setIsAssetOpen(false)
  }

  // Handle Employee submit
  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addEmployee({
      name: empName,
      role: empRole,
      mobile: empMobile,
      salary: empSalary,
      joiningDate: empDate,
      status: empStatus
    })

    // Reset Form
    setEmpName("")
    setEmpMobile("")
    setEmpSalary(0)
    setIsEmployeeOpen(false)
  }

  // Filters
  const filteredAssets = assets.filter(a => {
    const str = `${a.id} ${a.name} ${a.assignedTo}`.toLowerCase()
    return str.includes(search.toLowerCase())
  })

  const filteredEmployees = employees.filter(e => {
    const str = `${e.id} ${e.name} ${e.role}`.toLowerCase()
    return str.includes(search.toLowerCase())
  })

  // Asset stats
  const totalAssets = assets.length
  const activeAssets = assets.filter(a => a.status === "Active").length
  const inRepairAssets = assets.filter(a => a.status === "In Repair").length
  const retiredAssets = assets.filter(a => a.status === "Retired").length
  const totalInvestment = assets.reduce((sum, a) => sum + (a.cost * (a.qty || 1)), 0)

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Header line */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {initialSubTab === "assets" ? "Assets & Company Tools" : "Employee Administration"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {initialSubTab === "assets" 
              ? "Register diagnostic instrumentation, tools, and pressure machines issued to dispatch staff." 
              : "Manage administrative employee payroll, roles, salary parameters, and statuses."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {currentRole === "Admin" && (
            initialSubTab === "assets" ? (
              <Button onClick={() => setIsAssetOpen(true)} className="h-9 text-xs">
                <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
                Register Asset
              </Button>
            ) : (
              <Button onClick={() => setIsEmployeeOpen(true)} className="h-9 text-xs">
                <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
                Onboard Staff
              </Button>
            )
          )}
        </div>
      </div>

      {/* Asset Stats Cards */}
      {initialSubTab === "assets" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex flex-col gap-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-extrabold tracking-tight text-foreground">{totalAssets}</p>
              <p className="text-xs text-muted-foreground">{retiredAssets} retired</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex flex-col gap-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Active</p>
              <p className="text-2xl font-extrabold tracking-tight text-emerald-600">{activeAssets}</p>
              <p className="text-xs text-muted-foreground">Currently operational</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex flex-col gap-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">In Repair</p>
              <p className="text-2xl font-extrabold tracking-tight text-amber-600">{inRepairAssets}</p>
              <p className="text-xs text-muted-foreground">Under maintenance</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex flex-col gap-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Investment</p>
              <p className="text-2xl font-extrabold tracking-tight text-foreground">₹{totalInvestment.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">All assets combined</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Control filter */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder={initialSubTab === "assets" ? "Search asset catalog by ID or title..." : "Search staff by ID, name or role..."} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
            />
          </div>
          {initialSubTab === "assets" && (
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/40 w-fit shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("table")}
                className={`text-xs font-bold px-3 py-1 h-7 rounded-lg transition-all ${
                  viewMode === "table" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Table View
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("cards")}
                className={`text-xs font-bold px-3 py-1 h-7 rounded-lg transition-all ${
                  viewMode === "cards" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cards View
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ASSETS TAB CONTENT */}
      {initialSubTab === "assets" && (
        viewMode === "table" ? (
          <Card className="border-border/60 overflow-hidden shadow-xs">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3">Asset ID</th>
                      <th className="px-4 py-3">Asset Description</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3">Purchase Date</th>
                      <th className="px-4 py-3 text-right">Cost</th>
                      <th className="px-4 py-3">Issued To</th>
                      <th className="px-4 py-3">Operational Status</th>
                      {currentRole === "Admin" && <th className="px-4 py-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={currentRole === "Admin" ? 9 : 8} className="text-center py-12 text-muted-foreground font-medium">
                          No company assets cataloged.
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{a.id}</td>
                          <td className="px-4 py-4 font-semibold text-xs text-foreground">{a.name}</td>
                          <td className="px-4 py-4">
                            <Badge variant="outline" className="text-[10px] font-semibold">{a.type}</Badge>
                          </td>
                          <td className="px-4 py-4 text-center font-bold text-xs tabular-nums text-foreground">{a.qty || 1}</td>
                          <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{a.purchaseDate}</td>
                          <td className="px-4 py-4 text-right font-bold text-foreground tabular-nums">₹{a.cost}</td>
                          <td className="px-4 py-4 text-xs font-semibold text-foreground">{a.assignedTo}</td>
                          <td className="px-4 py-4">
                            <Badge 
                              variant="outline"
                              onClick={() => currentRole === "Admin" && updateAsset(a.id, { status: a.status === "Active" ? "In Repair" : a.status === "In Repair" ? "Retired" : "Active" })}
                              className={`text-[9px] font-bold py-0.5 px-1.5 cursor-pointer ${
                                a.status === "Active" 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                  : a.status === "In Repair"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-emerald-950/20 dark:text-emerald-400 animate-pulse"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                              }`}
                            >
                              {a.status}
                            </Badge>
                          </td>
                          {currentRole === "Admin" && (
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleOpenEditAsset(a)}
                                  className="h-6 text-[10px] font-semibold px-2 bg-background hover:bg-muted"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete asset ${a.name}?`)) {
                                      deleteAsset(a.id)
                                    }
                                  }}
                                  className="h-6 size-6 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold"
                                >
                                  ×
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {filteredAssets.length === 0 ? (
              <Card className="col-span-full border-border/60 py-12 text-center text-muted-foreground font-medium">
                No company assets cataloged.
              </Card>
            ) : (
              filteredAssets.map((a) => (
                <Card key={a.id} className="border-border/60 hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between shadow-xs bg-card/40 backdrop-blur-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-bold tabular-nums">
                        {a.id}
                      </Badge>
                      <Badge 
                        variant="outline"
                        onClick={() => currentRole === "Admin" && updateAsset(a.id, { status: a.status === "Active" ? "In Repair" : a.status === "In Repair" ? "Retired" : "Active" })}
                        className={`text-[9px] font-bold py-0.5 px-1.5 cursor-pointer ${
                          a.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                            : a.status === "In Repair"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-emerald-950/20 dark:text-emerald-400 animate-pulse"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                        }`}
                      >
                        {a.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground mt-2 truncate">
                      {a.name}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-semibold text-muted-foreground flex gap-1 items-center mt-0.5">
                      <Badge className="text-[9px] font-bold py-0">{a.type}</Badge>
                      <span>• Purchased: {a.purchaseDate}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 text-xs flex flex-col gap-2">
                    <div className="flex flex-col gap-1 text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-bold text-foreground">Quantity:</span> {a.qty || 1}
                      </div>
                      <div>
                        <span className="font-bold text-foreground">Issued To:</span> {a.assignedTo}
                      </div>
                      <div className="mt-1 font-bold text-foreground">
                        Cost: <span className="text-primary font-black tabular-nums">₹{a.cost}</span>
                      </div>
                    </div>
                  </CardContent>
                  {currentRole === "Admin" && (
                    <div className="pt-0 border-t border-border/40 py-2 px-4 flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenEditAsset(a)}
                        className="h-7 text-[10px] font-bold px-2 flex-1 hover:bg-muted"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete asset ${a.name}?`)) {
                            deleteAsset(a.id)
                          }
                        }}
                        className="h-7 text-[10px] font-bold text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )
      )}

      {/* EMPLOYEES TAB CONTENT */}
      {initialSubTab === "employees" && (
        <Card className="border-border/60 overflow-hidden shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Phone Line</th>
                    <th className="px-4 py-3 text-right">Monthly Salary</th>
                    <th className="px-4 py-3">Joining Date</th>
                    <th className="px-4 py-3">Roster Status</th>
                    {currentRole === "Admin" && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={currentRole === "Admin" ? 8 : 7} className="text-center py-12 text-muted-foreground font-medium">
                        No employees onboarding files found.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{emp.id}</td>
                        <td className="px-4 py-4 font-semibold text-xs text-foreground">{emp.name}</td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="text-[10px] font-semibold">{emp.role}</Badge>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{emp.mobile}</td>
                        <td className="px-4 py-4 text-right font-bold text-foreground tabular-nums">₹{emp.salary}</td>
                        <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{emp.joiningDate}</td>
                        <td className="px-4 py-4">
                          <Badge 
                            variant="outline"
                            onClick={() => currentRole === "Admin" && updateEmployee(emp.id, { status: emp.status === "Active" ? "Inactive" : "Active" })}
                            className={`text-[9px] font-bold py-0.5 px-1.5 cursor-pointer ${
                              emp.status === "Active" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                            }`}
                          >
                            {emp.status}
                          </Badge>
                        </td>
                        {currentRole === "Admin" && (
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleOpenEditEmployee(emp)}
                                className="h-6 text-[10px] font-semibold px-2 bg-background hover:bg-muted"
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete employee staff profile for ${emp.name}?`)) {
                                    deleteEmployee(emp.id)
                                  }
                                }}
                                className="h-6 size-6 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold"
                              >
                                ×
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Create Drawer */}
      <Drawer open={isAssetOpen} onOpenChange={setIsAssetOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleAssetSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Register Company Asset / Equipment</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log diagnostic pump instrumentation and tools issued to dispatch technicians.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-xl mx-auto w-full">
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ast-name" className="text-xs font-bold text-muted-foreground">Asset Name</Label>
                  <Input id="ast-name" placeholder="E.g., AC Pressure Pump, Multimeter" value={astName} onChange={(e) => setAstName(e.target.value)} required />
                </div>
                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ast-type" className="text-xs font-bold text-muted-foreground">Asset Classification</Label>
                  <Select value={astType} onValueChange={setAstType}>
                    <SelectTrigger id="ast-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tools">Diagnostic Tools</SelectItem>
                      <SelectItem value="Machines">Pressure Machines</SelectItem>
                      <SelectItem value="Company Equipment">Company Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Cost */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ast-cost" className="text-xs font-bold text-muted-foreground">Purchase Cost (₹)</Label>
                  <Input type="number" id="ast-cost" value={astCost} onChange={(e) => setAstCost(parseFloat(e.target.value) || 0)} required />
                </div>
                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ast-qty" className="text-xs font-bold text-muted-foreground">Quantity</Label>
                  <Input type="number" id="ast-qty" min="1" value={astQty} onChange={(e) => setAstQty(parseInt(e.target.value) || 1)} required />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Purchase Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ast-date" className="text-xs font-bold text-muted-foreground">Purchase Date</Label>
                  <Input type="date" id="ast-date" value={astDate} onChange={(e) => setAstDate(e.target.value)} required />
                </div>
                {/* Issued to */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ast-assigned" className="text-xs font-bold text-muted-foreground">Issued/Assigned To (Staff Name)</Label>
                  <Input id="ast-assigned" placeholder="E.g., Suresh Kumar" value={astAssigned} onChange={(e) => setAstAssigned(e.target.value)} />
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ast-status" className="text-xs font-bold text-muted-foreground">Status</Label>
                  <Select value={astStatus} onValueChange={setAstStatus}>
                    <SelectTrigger id="ast-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="In Repair">In Repair</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3 max-w-xl mx-auto w-full">
              <Button type="submit" className="flex-1">Register Asset</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Entry</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Employee Create Drawer */}
      <Drawer open={isEmployeeOpen} onOpenChange={setIsEmployeeOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEmployeeSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Onboard Staff Member / Employee</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log staff role parameters, define administrative settings, and monthly payroll parameters.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-xl mx-auto w-full">
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="emp-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
                  <Input id="emp-name" placeholder="E.g., Rajesh Gupta" value={empName} onChange={(e) => setEmpName(e.target.value)} required />
                </div>
                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="emp-role" className="text-xs font-bold text-muted-foreground">Company Role</Label>
                  <Select value={empRole} onValueChange={setEmpRole}>
                    <SelectTrigger id="emp-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="emp-phone" className="text-xs font-bold text-muted-foreground">Phone Number</Label>
                  <Input id="emp-phone" placeholder="E.g., 9899001122" value={empMobile} onChange={(e) => setEmpMobile(e.target.value)} required />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Salary */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="emp-salary" className="text-xs font-bold text-muted-foreground">Monthly Salary (₹)</Label>
                  <Input type="number" id="emp-salary" value={empSalary} onChange={(e) => setEmpSalary(parseFloat(e.target.value) || 0)} required />
                </div>
                {/* Joining Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="emp-date" className="text-xs font-bold text-muted-foreground">Joining Date</Label>
                  <Input type="date" id="emp-date" value={empDate} onChange={(e) => setEmpDate(e.target.value)} required />
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="emp-status" className="text-xs font-bold text-muted-foreground">Roster Status</Label>
                  <Select value={empStatus} onValueChange={setEmpStatus}>
                    <SelectTrigger id="emp-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3 max-w-xl mx-auto w-full">
              <Button type="submit" className="flex-1">Onboard Staff</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Entry</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Asset Edit Drawer */}
      <Drawer open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditAssetSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Company Asset / Equipment</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify recorded diagnostic pump instrumentation and tools parameters.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-xl mx-auto w-full">
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-ast-name" className="text-xs font-bold text-muted-foreground">Asset Name</Label>
                  <Input id="edit-ast-name" placeholder="E.g., AC Pressure Pump, Multimeter" value={editAstName} onChange={(e) => setEditAstName(e.target.value)} required />
                </div>
                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-ast-type" className="text-xs font-bold text-muted-foreground">Asset Classification</Label>
                  <Select value={editAstType} onValueChange={setEditAstType}>
                    <SelectTrigger id="edit-ast-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tools">Diagnostic Tools</SelectItem>
                      <SelectItem value="Machines">Pressure Machines</SelectItem>
                      <SelectItem value="Company Equipment">Company Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Cost */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-ast-cost" className="text-xs font-bold text-muted-foreground">Purchase Cost (₹)</Label>
                  <Input type="number" id="edit-ast-cost" value={editAstCost} onChange={(e) => setEditAstCost(parseFloat(e.target.value) || 0)} required />
                </div>
                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-ast-qty" className="text-xs font-bold text-muted-foreground">Quantity</Label>
                  <Input type="number" id="edit-ast-qty" min="1" value={editAstQty} onChange={(e) => setEditAstQty(parseInt(e.target.value) || 1)} required />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Purchase Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-ast-date" className="text-xs font-bold text-muted-foreground">Purchase Date</Label>
                  <Input type="date" id="edit-ast-date" value={editAstDate} onChange={(e) => setEditAstDate(e.target.value)} required />
                </div>
                {/* Issued to */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-ast-assigned" className="text-xs font-bold text-muted-foreground">Issued/Assigned To (Staff Name)</Label>
                  <Input id="edit-ast-assigned" placeholder="E.g., Suresh Kumar" value={editAstAssigned} onChange={(e) => setEditAstAssigned(e.target.value)} />
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-ast-status" className="text-xs font-bold text-muted-foreground">Status</Label>
                  <Select value={editAstStatus} onValueChange={setEditAstStatus}>
                    <SelectTrigger id="edit-ast-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="In Repair">In Repair</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3 max-w-xl mx-auto w-full">
              <Button type="submit" className="flex-1">Save Changes</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Employee Edit Drawer */}
      <Drawer open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditEmployeeSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Staff Member / Employee</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify staff role parameters, define administrative settings, and monthly payroll parameters.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-xl mx-auto w-full">
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-emp-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
                  <Input id="edit-emp-name" placeholder="E.g., Rajesh Gupta" value={editEmpName} onChange={(e) => setEditEmpName(e.target.value)} required />
                </div>
                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-emp-role" className="text-xs font-bold text-muted-foreground">Company Role</Label>
                  <Select value={editEmpRole} onValueChange={setEditEmpRole}>
                    <SelectTrigger id="edit-emp-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-emp-phone" className="text-xs font-bold text-muted-foreground">Phone Number</Label>
                  <Input id="edit-emp-phone" placeholder="E.g., 9899001122" value={editEmpMobile} onChange={(e) => setEditEmpMobile(e.target.value)} required />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Salary */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-emp-salary" className="text-xs font-bold text-muted-foreground">Monthly Salary (₹)</Label>
                  <Input type="number" id="edit-emp-salary" value={editEmpSalary} onChange={(e) => setEditEmpSalary(parseFloat(e.target.value) || 0)} required />
                </div>
                {/* Joining Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-emp-date" className="text-xs font-bold text-muted-foreground">Joining Date</Label>
                  <Input type="date" id="edit-emp-date" value={editEmpDate} onChange={(e) => setEditEmpDate(e.target.value)} required />
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-emp-status" className="text-xs font-bold text-muted-foreground">Roster Status</Label>
                  <Select value={editEmpStatus} onValueChange={setEditEmpStatus}>
                    <SelectTrigger id="edit-emp-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3 max-w-xl mx-auto w-full">
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
