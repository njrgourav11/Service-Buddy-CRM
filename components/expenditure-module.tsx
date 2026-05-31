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
  CreditCardIcon
} from "@hugeicons/core-free-icons"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function ExpenditureModule() {
  const { expenses, addExpense, deleteExpense, currentRole } = useCRM()
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  // Form State
  const [item, setItem] = React.useState("")
  const [category, setCategory] = React.useState<any>("Working expenses (beneficiary)")
  const [amount, setAmount] = React.useState(0)
  const [beneficiary, setBeneficiary] = React.useState("")
  const [remarks, setRemarks] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])

  // Filtered List
  const filteredExpenses = expenses.filter(e => {
    const searchString = `${e.id} ${e.item} ${e.beneficiary}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Submit Expense
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addExpense({
      date,
      item,
      category,
      amount,
      beneficiary,
      remarks
    })

    // Reset Form
    setItem("")
    setCategory("Working expenses (beneficiary)")
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
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount
    })
    
    return Object.entries(map).map(([name, value]) => ({ name, value }))
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
        {(currentRole === "Super Admin" || currentRole === "Accountant") && (
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
                ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                ₹{expenses.filter(e => e.category === "Working expenses (beneficiary)").reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
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

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Working expenses (beneficiary)">Working expenses (beneficiary)</SelectItem>
                <SelectItem value="Outstanding">Outstanding</SelectItem>
                <SelectItem value="Tools and maintenance">Tools and maintenance</SelectItem>
                <SelectItem value="Exp item">Exp item</SelectItem>
                <SelectItem value="Non beneficiary items">Non beneficiary items</SelectItem>
                <SelectItem value="Office expenses">Office expenses</SelectItem>
                <SelectItem value="Tools and subscriptions">Tools and subscriptions</SelectItem>
                <SelectItem value="Refunds">Refunds</SelectItem>
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
                  <th className="px-4 py-3">Voucher ID</th>
                  <th className="px-4 py-3">Voucher Date</th>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Beneficiary</th>
                  <th className="px-4 py-3">Staff Remarks</th>
                  {currentRole === "Super Admin" && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole === "Super Admin" ? 8 : 7} className="text-center py-12 text-muted-foreground font-medium">
                      No expense vouchers found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{e.id}</td>
                      <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{e.date}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-foreground">{e.item}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="text-[10px] font-semibold">{e.category}</Badge>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-foreground tabular-nums">₹{e.amount}</td>
                      <td className="px-4 py-4 text-xs font-medium text-foreground">{e.beneficiary}</td>
                      <td className="px-4 py-4 text-xs text-muted-foreground max-w-xs truncate">{e.remarks}</td>
                      {currentRole === "Super Admin" && (
                        <td className="px-4 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            onClick={() => deleteExpense(e.id)}
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

      {/* Expense Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-2xl border-t bg-card">
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
                    <SelectTrigger id="exp-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Working expenses (beneficiary)">Working expenses (beneficiary)</SelectItem>
                      <SelectItem value="Outstanding">Outstanding</SelectItem>
                      <SelectItem value="Tools and maintenance">Tools and maintenance</SelectItem>
                      <SelectItem value="Exp item">Exp item</SelectItem>
                      <SelectItem value="Non beneficiary items">Non beneficiary items</SelectItem>
                      <SelectItem value="Office expenses">Office expenses</SelectItem>
                      <SelectItem value="Tools and subscriptions">Tools and subscriptions</SelectItem>
                      <SelectItem value="Refunds">Refunds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                  <Label htmlFor="exp-beneficiary" className="text-xs font-bold text-muted-foreground">Beneficiary / Merchant Name</Label>
                  <Input 
                    id="exp-beneficiary"
                    placeholder="Merchant, Supplier or technician name"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    required
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

    </div>
  )
}
