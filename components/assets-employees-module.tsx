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

  // Asset Edit Form State
  const [editAstName, setEditAstName] = React.useState("")
  const [editAstType, setEditAstType] = React.useState<any>("Tools")
  const [editAstDate, setEditAstDate] = React.useState("")
  const [editAstCost, setEditAstCost] = React.useState(0)
  const [editAstAssigned, setEditAstAssigned] = React.useState("")
  const [editAstStatus, setEditAstStatus] = React.useState<any>("Active")

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
      status: editAstStatus
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
      status: astStatus
    })

    // Reset Form
    setAstName("")
    setAstCost(0)
    setAstAssigned("")
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

      {/* Control filter */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder={initialSubTab === "assets" ? "Search asset catalog by ID or title..." : "Search staff by ID, name or role..."} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* ASSETS TAB CONTENT */}
      {initialSubTab === "assets" && (
        <Card className="border-border/60 overflow-hidden shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3">Asset ID</th>
                    <th className="px-4 py-3">Asset Description</th>
                    <th className="px-4 py-3">Type</th>
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
                      <td colSpan={currentRole === "Admin" ? 8 : 7} className="text-center py-12 text-muted-foreground font-medium">
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
                                onClick={() => deleteAsset(a.id)}
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
                                onClick={() => deleteEmployee(emp.id)}
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
