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
  SearchIcon,
  Folder01Icon,
  UserGroupIcon
} from "@hugeicons/core-free-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  const [activeTab, setActiveTab] = React.useState<string>(initialSubTab)
  const [search, setSearch] = React.useState("")
  
  // Creation state
  const [isAssetOpen, setIsAssetOpen] = React.useState(false)
  const [isEmployeeOpen, setIsEmployeeOpen] = React.useState(false)

  // Asset Form State
  const [astName, setAstName] = React.useState("")
  const [astType, setAstType] = React.useState<any>("Tools")
  const [astDate, setAstDate] = React.useState(new Date().toISOString().split("T")[0])
  const [astCost, setAstCost] = React.useState(0)
  const [astAssigned, setAstAssigned] = React.useState("")
  const [astStatus, setAstStatus] = React.useState<any>("Active")

  // Employee Form State
  const [empName, setEmpName] = React.useState("")
  const [empRole, setEmpRole] = React.useState<any>("Technician")
  const [empMobile, setEmpMobile] = React.useState("")
  const [empSalary, setEmpSalary] = React.useState(0)
  const [empDate, setEmpDate] = React.useState(new Date().toISOString().split("T")[0])
  const [empStatus, setEmpStatus] = React.useState<any>("Active")

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
      
      {/* Tabs list switch */}
      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val)
        setSearch("")
      }} className="w-full">
        
        {/* Header line switch */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {activeTab === "assets" ? "Assets & Company Tools" : "Employee Administration"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeTab === "assets" 
                ? "Register diagnostic instrumentation, tools, and pressure machines issued to dispatch staff." 
                : "Manage administrative employee payroll, roles, salary parameters, and statuses."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TabsList className="h-9">
              <TabsTrigger value="assets" className="text-xs font-semibold">
                <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} data-icon="inline-start" />
                Asset Registry
              </TabsTrigger>
              <TabsTrigger value="employees" className="text-xs font-semibold">
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} data-icon="inline-start" />
                Staff Roster
              </TabsTrigger>
            </TabsList>

            {currentRole === "Admin" && (
              activeTab === "assets" ? (
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
        <Card className="border-border/60 mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder={activeTab === "assets" ? "Search asset catalog by ID or title..." : "Search staff by ID, name or role..."} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* ASSETS TAB */}
        <TabsContent value="assets" className="m-0 border-0 p-0">
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
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                              }`}
                            >
                              {a.status}
                            </Badge>
                          </td>
                          {currentRole === "Admin" && (
                            <td className="px-4 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                onClick={() => deleteAsset(a.id)}
                                className="h-7 size-7 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center ml-auto"
                              >
                                ×
                              </Button>
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
        </TabsContent>

        {/* EMPLOYEES TAB */}
        <TabsContent value="employees" className="m-0 border-0 p-0">
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
                              <Button 
                                variant="ghost" 
                                onClick={() => deleteEmployee(emp.id)}
                                className="h-7 size-7 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center ml-auto"
                              >
                                ×
                              </Button>
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
        </TabsContent>

      </Tabs>

      {/* Asset Create Drawer */}
      <Drawer open={isAssetOpen} onOpenChange={setIsAssetOpen} direction="bottom">
        <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-2xl border-t bg-card">
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
        <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-2xl border-t bg-card">
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

    </div>
  )
}
