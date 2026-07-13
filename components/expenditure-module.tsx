"use client"

import * as React from "react"
import { useCRM, Expense } from "@/context/crm-context"
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
  CreditCardIcon,
  MoreHorizontalCircle01Icon,
  Delete02Icon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

export const STANDARD_EXPENSE_CATEGORIES = [
  "Working expenses (beneficiary)",
  "Outstanding",
  "Tools and maintenance",
  "Exp item",
  "Non beneficiary items",
  "Office expenses",
  "Tools and subscriptions",
  "Refunds",
  "Salary"
]

export function ExpenditureModule() {
  const { expenses, addExpense, updateExpense, deleteExpense, currentRole } = useCRM()
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [dateFilterType, setDateFilterType] = React.useState<"ALL" | "today" | "yesterday" | "this-week" | "this-month" | "previous-month" | "custom">("this-month")
  const [startDateFilter, setStartDateFilter] = React.useState("")
  const [endDateFilter, setEndDateFilter] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null)

  // Form State
  const [item, setItem] = React.useState("")
  const [category, setCategory] = React.useState<any>("Working expenses (beneficiary)")
  const [customCategory, setCustomCategory] = React.useState("")
  const [amount, setAmount] = React.useState(0)
  const [beneficiary, setBeneficiary] = React.useState("")
  const [remarks, setRemarks] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])

  // Edit Form State
  const [editItem, setEditItem] = React.useState("")
  const [editCategory, setEditCategory] = React.useState<any>("Working expenses (beneficiary)")
  const [editCustomCategory, setEditCustomCategory] = React.useState("")
  const [editAmount, setEditAmount] = React.useState(0)
  const [editBeneficiary, setEditBeneficiary] = React.useState("")
  const [editRemarks, setEditRemarks] = React.useState("")
  const [editDate, setEditDate] = React.useState("")

  // Open Edit Drawer
  const handleOpenEdit = (e: Expense) => {
    setSelectedExpense(e)
    setEditItem(e.item)
    if (STANDARD_EXPENSE_CATEGORIES.includes(e.category)) {
      setEditCategory(e.category)
      setEditCustomCategory("")
    } else {
      setEditCategory("CUSTOM")
      setEditCustomCategory(e.category)
    }
    setEditAmount(e.amount)
    setEditBeneficiary(e.beneficiary || "")
    setEditRemarks(e.remarks || "")
    setEditDate(e.date)
    setIsEditOpen(true)
  }

  // Submit Edit Expense
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExpense) return

    const finalCategory = editCategory === "CUSTOM" ? (editCustomCategory.trim() || "Other") : editCategory

    updateExpense(selectedExpense.id, {
      date: editDate,
      item: editItem,
      category: finalCategory,
      amount: editAmount,
      beneficiary: editBeneficiary,
      remarks: editRemarks
    })

    setIsEditOpen(false)
  }

  // Filtered List
  const filteredExpenses = expenses.filter(e => {
    const searchString = `${e.id} ${e.item} ${e.beneficiary}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter

    // Date filtering logic
    let matchesDate = true
    const targetDate = e.date || ""
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

    return matchesSearch && matchesCategory && matchesDate
  })

  // Bulk Delete
  const handleBulkDelete = () => {
    if (window.confirm(`⚠️ WARNING: This action is irreversible. Are you sure you want to delete the ${selectedIds.length} selected expense vouchers?`)) {
      selectedIds.forEach(id => deleteExpense(id))
      setSelectedIds([])
      toast.success(`Deleted ${selectedIds.length} expense vouchers.`)
    }
  }

  // Submit Expense
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalCategory = category === "CUSTOM" ? (customCategory.trim() || "Other") : category

    addExpense({
      date,
      item,
      category: finalCategory,
      amount,
      beneficiary,
      remarks
    })

    // Reset Form
    setItem("")
    setCategory("Working expenses (beneficiary)")
    setCustomCategory("")
    setAmount(0)
    setBeneficiary("")
    setRemarks("")
    setIsAddOpen(false)
  }

  // ==========================================
  // Pie Chart category-wise spending
  // ==========================================
  const categoryTotals = React.useMemo(() => {
    const map: Record<string, number> = {}
    filteredExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount
    })
    
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [filteredExpenses])

  const uniqueCategories = React.useMemo(() => {
    const set = new Set(STANDARD_EXPENSE_CATEGORIES)
    expenses.forEach(e => {
      if (e.category) {
        set.add(e.category)
      }
    })
    return Array.from(set).sort()
  }, [expenses])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#38bdf8"]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Operational Expenditures</h2>
          <p className="text-sm text-muted-foreground">Reconcile team expenses, track coil cleaning sprays, FLEX banners, recharged lines, and advertisements.</p>
        </div>
        {currentRole === "Admin" && (
          <Button onClick={() => setIsAddOpen(true)} className="w-fit">
            <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
            Record Expense Voucher
          </Button>
        )}
      </div>

      {/* Expense Stats with Pie Chart Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category spends chart */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Expenditure Category Allocation</CardTitle>
            <CardDescription className="text-xs">Visual breakdown of overhead distributions.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            {categoryTotals.length === 0 ? (
              <span className="text-xs text-muted-foreground font-semibold">No expense transactions recorded.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Totals Summary Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
          <Card className="border-border/60">
            <CardHeader className="py-3">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Ledger Expenditures</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              <CardTitle className="text-2xl font-bold tracking-tight tabular-nums">
                ₹{filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </CardTitle>
              <span className="text-[10px] text-muted-foreground mt-1 block">Accumulated company administrative costs</span>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="py-3">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Working Expenses (Beneficiary)</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              <CardTitle className="text-2xl font-bold tracking-tight tabular-nums">
                ₹{filteredExpenses.filter(e => e.category === "Working expenses (beneficiary)").reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </CardTitle>
              <span className="text-[10px] text-muted-foreground mt-1 block">Spends targeting organic and beneficiary operations</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Control Panel: Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search expenses by item or beneficiary..." 
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

            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 h-8 text-xs bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {uniqueCategories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
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
                      checked={selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                      onChange={(evt) => {
                        if (evt.target.checked) {
                          setSelectedIds(filteredExpenses.map(x => x.id))
                        } else {
                          setSelectedIds([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3">Voucher ID</th>
                  <th className="px-4 py-3">Voucher Date</th>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Beneficiary</th>
                  <th className="px-4 py-3">Staff Remarks</th>
                  {currentRole === "Admin" && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole === "Admin" ? 9 : 8} className="text-center py-12 text-muted-foreground font-medium">
                      No expense vouchers found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 w-10 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded-sm border-primary text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-primary"
                          checked={selectedIds.includes(e.id)}
                          onChange={(evt) => {
                            if (evt.target.checked) {
                              setSelectedIds(prev => [...prev, e.id])
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== e.id))
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{e.id}</td>
                      <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{e.date}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-foreground">{e.item}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="text-[10px] font-semibold">{e.category}</Badge>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-foreground tabular-nums">₹{e.amount}</td>
                      <td className="px-4 py-4 text-xs font-medium text-foreground">{e.beneficiary}</td>
                      <td className="px-4 py-4 text-xs text-muted-foreground max-w-xs truncate">{e.remarks}</td>
                      {currentRole === "Admin" && (
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
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem onClick={() => handleOpenEdit(e)} className="cursor-pointer">
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this expense log?")) {
                                    deleteExpense(e.id)
                                  }
                                }}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-semibold"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Expense Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Record Expense Voucher Receipt</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log internal operational expenditures. Automatically aggregates reports and monthly net profit charts.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Item */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="exp-item" className="text-xs font-bold text-muted-foreground">Item Description</Label>
                  <Input 
                    id="exp-item"
                    placeholder="E.g., Coil cleaning sprays, Flex printing"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    required
                  />
                </div>

                 {/* Category Selection */}
                 <div className="flex flex-col gap-1.5">
                   <Label htmlFor="exp-cat" className="text-xs font-bold text-muted-foreground">Expense Category</Label>
                   <Select value={category} onValueChange={setCategory}>
                     <SelectTrigger id="exp-cat" className="bg-background border-border/60 text-xs">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {STANDARD_EXPENSE_CATEGORIES.map(c => (
                         <SelectItem key={c} value={c}>{c}</SelectItem>
                       ))}
                       <SelectItem value="CUSTOM">Other (Write Custom)...</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {category === "CUSTOM" && (
                   <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                     <Label htmlFor="custom-exp-cat" className="text-xs font-bold text-primary">Custom Category Name</Label>
                     <Input 
                       id="custom-exp-cat"
                       placeholder="E.g. Marketing, Staff Welfare, Petrol..."
                       value={customCategory}
                       onChange={(e) => setCustomCategory(e.target.value)}
                       required
                     />
                   </div>
                 )}

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="exp-date" className="text-xs font-bold text-muted-foreground">Expense Date</Label>
                  <Input 
                    type="date"
                    id="exp-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="exp-amt" className="text-xs font-bold text-muted-foreground">Voucher Cost Amount (₹)</Label>
                  <Input 
                    type="number"
                    id="exp-amt"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                {/* Beneficiary */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="exp-beneficiary" className="text-xs font-bold text-muted-foreground">Beneficiary / Merchant Name (Optional)</Label>
                  <Input 
                    id="exp-beneficiary"
                    placeholder="Merchant, Supplier or technician name"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                  />
                </div>

                {/* Remarks */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="exp-remarks" className="text-xs font-bold text-muted-foreground">Administrative Staff Remarks</Label>
                  <Input 
                    id="exp-remarks"
                    placeholder="Additional context about this expenditure..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Log Expenditure</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Voucher</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Expense Edit Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Expense Voucher Receipt</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify recorded internal operational expenditures.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Item */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-exp-item" className="text-xs font-bold text-muted-foreground">Item Description</Label>
                  <Input 
                    id="edit-exp-item"
                    placeholder="E.g., Coil cleaning sprays, Flex printing"
                    value={editItem}
                    onChange={(e) => setEditItem(e.target.value)}
                    required
                  />
                </div>

                {/* Category Selection */}
                 <div className="flex flex-col gap-1.5">
                   <Label htmlFor="edit-exp-cat" className="text-xs font-bold text-muted-foreground">Expense Category</Label>
                   <Select value={editCategory} onValueChange={setEditCategory}>
                     <SelectTrigger id="edit-exp-cat" className="bg-background border-border/60 text-xs">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {STANDARD_EXPENSE_CATEGORIES.map(c => (
                         <SelectItem key={c} value={c}>{c}</SelectItem>
                       ))}
                       <SelectItem value="CUSTOM">Other (Write Custom)...</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {editCategory === "CUSTOM" && (
                   <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                     <Label htmlFor="edit-custom-exp-cat" className="text-xs font-bold text-primary">Custom Category Name</Label>
                     <Input 
                       id="edit-custom-exp-cat"
                       placeholder="E.g. Marketing, Staff Welfare, Petrol..."
                       value={editCustomCategory}
                       onChange={(e) => setEditCustomCategory(e.target.value)}
                       required
                     />
                   </div>
                 )}

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-exp-date" className="text-xs font-bold text-muted-foreground">Expense Date</Label>
                  <Input 
                    type="date"
                    id="edit-exp-date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-exp-amt" className="text-xs font-bold text-muted-foreground">Voucher Cost Amount (₹)</Label>
                  <Input 
                    type="number"
                    id="edit-exp-amt"
                    min="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                {/* Beneficiary */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-exp-beneficiary" className="text-xs font-bold text-muted-foreground">Beneficiary / Merchant Name (Optional)</Label>
                  <Input 
                    id="edit-exp-beneficiary"
                    placeholder="Merchant, Supplier or technician name"
                    value={editBeneficiary}
                    onChange={(e) => setEditBeneficiary(e.target.value)}
                  />
                </div>

                {/* Remarks */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-exp-remarks" className="text-xs font-bold text-muted-foreground">Administrative Staff Remarks</Label>
                  <Input 
                    id="edit-exp-remarks"
                    placeholder="Additional context about this expenditure..."
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                  />
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
