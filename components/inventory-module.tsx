"use client"

import * as React from "react"
import { useCRM, Spare } from "@/context/crm-context"
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
  Database01Icon,
  CheckmarkCircle01Icon,
  Notification03Icon,
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

export function InventoryModule() {
  const { spares, addSpare, updateSpare, deleteSpare, currentRole } = useCRM()
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedSpare, setSelectedSpare] = React.useState<Spare | null>(null)

  // Form State
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState("AC")
  const [stockQty, setStockQty] = React.useState(10)
  const [unitCost, setUnitCost] = React.useState(0)
  const [sellingCost, setSellingCost] = React.useState(0)
  const [reorderLevel, setReorderLevel] = React.useState(3)

  // Edit Form State
  const [editName, setEditName] = React.useState("")
  const [editCategory, setEditCategory] = React.useState("AC")
  const [editStockQty, setEditStockQty] = React.useState(0)
  const [editUnitCost, setEditUnitCost] = React.useState(0)
  const [editSellingCost, setEditSellingCost] = React.useState(0)
  const [editReorderLevel, setEditReorderLevel] = React.useState(0)

  // Open Edit Drawer
  const handleOpenEdit = (s: Spare) => {
    setSelectedSpare(s)
    setEditName(s.name)
    setEditCategory(s.category)
    setEditStockQty(s.stockQty)
    setEditUnitCost(s.unitCost)
    setEditSellingCost(s.sellingCost)
    setEditReorderLevel(s.reorderLevel)
    setIsEditOpen(true)
  }

  // Submit Edit Spare
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSpare) return

    updateSpare(selectedSpare.id, {
      name: editName,
      category: editCategory,
      stockQty: editStockQty,
      unitCost: editUnitCost,
      sellingCost: editSellingCost,
      reorderLevel: editReorderLevel
    })

    setIsEditOpen(false)
  }

  // Filtered catalog spares list
  const filteredSpares = spares.filter(s => {
    const searchString = `${s.id} ${s.name} ${s.category}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Bulk Delete
  const handleBulkDelete = () => {
    if (window.confirm(`⚠️ WARNING: This action is irreversible. Are you sure you want to delete the ${selectedIds.length} selected spares?`)) {
      selectedIds.forEach(id => deleteSpare(id))
      setSelectedIds([])
      toast.success(`Deleted ${selectedIds.length} spares.`)
    }
  }

  // Submit Spare
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addSpare({
      name,
      category,
      stockQty,
      unitCost,
      sellingCost,
      reorderLevel
    })

    // Reset Form
    setName("")
    setCategory("AC")
    setStockQty(10)
    setUnitCost(0)
    setSellingCost(0)
    setReorderLevel(3)
    setIsAddOpen(false)
  }

  // Quick action: quick restock increment by 5
  const handleQuickRestock = (id: string, currentStock: number) => {
    updateSpare(id, { stockQty: currentStock + 5 })
    toast.success("Replenished stock quantity by +5 units.")
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Spare Parts Inventory</h2>
          <p className="text-sm text-muted-foreground">Monitor stock balances, configure supplier vs selling costs, and manage reorder thresholds.</p>
        </div>
        {(currentRole === "Admin" || currentRole === "Manager") && (
          <Button onClick={() => setIsAddOpen(true)} className="w-fit">
            <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
            Onboard Spare Item
          </Button>
        )}
      </div>

      {/* Control Panel: Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search catalog spares by ID or title..." 
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
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="Washing Machine">Washing Machine</SelectItem>
                <SelectItem value="TV">TV</SelectItem>
                <SelectItem value="Geyser">Geyser</SelectItem>
                <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                <SelectItem value="General">General</SelectItem>
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
                      checked={selectedIds.length === filteredSpares.length && filteredSpares.length > 0}
                      onChange={(evt) => {
                        if (evt.target.checked) {
                          setSelectedIds(filteredSpares.map(x => x.id))
                        } else {
                          setSelectedIds([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3">Spare ID</th>
                  <th className="px-4 py-3">Part Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Supplier Cost (R)</th>
                  <th className="px-4 py-3 text-right">Selling Cost (S)</th>
                  <th className="px-4 py-3 text-right">Profit Markup</th>
                  <th className="px-4 py-3 text-center">Stock Count</th>
                  <th className="px-4 py-3 text-center">Shortage Level</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredSpares.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-muted-foreground font-medium">
                      No inventory parts match request.
                    </td>
                  </tr>
                ) : (
                  filteredSpares.map((s) => {
                    const margin = Math.round((s.sellingCost - s.unitCost) * 100) / 100
                    const marginPercent = s.unitCost ? Math.round((margin / s.unitCost) * 100) : 0
                    const isLow = s.stockQty <= s.reorderLevel

                    return (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4 w-10 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded-sm border-primary text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-primary"
                            checked={selectedIds.includes(s.id)}
                            onChange={(evt) => {
                              if (evt.target.checked) {
                                setSelectedIds(prev => [...prev, s.id])
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== s.id))
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{s.id}</td>
                        <td className="px-4 py-4 font-semibold text-xs text-foreground">{s.name}</td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="text-[10px] font-semibold">{s.category}</Badge>
                        </td>
                        <td className="px-4 py-4 text-right font-medium tabular-nums text-foreground">₹{s.unitCost}</td>
                        <td className="px-4 py-4 text-right font-medium tabular-nums text-foreground">₹{s.sellingCost}</td>
                        <td className="px-4 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          +₹{margin} ({marginPercent}%)
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-black tabular-nums ${isLow ? 'text-rose-600 dark:text-rose-400 font-extrabold animate-pulse' : 'text-foreground'}`}>
                            {s.stockQty} / {s.availableQty}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isLow ? (
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 font-bold text-[9px] py-0 px-1 mx-auto flex w-fit items-center gap-1.5 animate-pulse">
                              <HugeiconsIcon icon={Notification03Icon} strokeWidth={2.5} className="size-3" />
                              REORDER STOCK
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold text-[9px] py-0 px-1 mx-auto flex w-fit items-center gap-1.5">
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2.5} className="size-3" />
                              ADEQUATE
                            </Badge>
                          )}
                        </td>
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
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem onClick={() => handleQuickRestock(s.id, s.stockQty)} className="cursor-pointer">
                                +5 Quick Restock
                              </DropdownMenuItem>
                              {(currentRole === "Admin" || currentRole === "Manager") && (
                                <DropdownMenuItem onClick={() => handleOpenEdit(s)} className="cursor-pointer">
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {currentRole === "Admin" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to delete spare item: ${s.name}?`)) {
                                        deleteSpare(s.id)
                                      }
                                    }}
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-semibold"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Spare Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Onboard Spare parts item into catalog</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log detailed inventory items. Configure cost constraints and reorder limits for automated alerts.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="spare-name" className="text-xs font-bold text-muted-foreground">Part Item Name</Label>
                  <Input 
                    id="spare-name"
                    placeholder="E.g., Fan Capacitor, Copper Pipe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Category Selector */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="spare-cat" className="text-xs font-bold text-muted-foreground">Part Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="spare-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="Washing Machine">Washing Machine</SelectItem>
                      <SelectItem value="TV">TV</SelectItem>
                      <SelectItem value="Geyser">Geyser</SelectItem>
                      <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Initial Stock Count */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="spare-stock" className="text-xs font-bold text-muted-foreground">Initial Stock Count</Label>
                  <Input 
                    type="number"
                    id="spare-stock"
                    min="0"
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Supplier Cost R */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="spare-unit" className="text-xs font-bold text-muted-foreground">Supplier Cost (R)</Label>
                    <Input 
                      type="number"
                      id="spare-unit"
                      min="0"
                      value={unitCost}
                      onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  {/* Selling Cost S */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="spare-selling" className="text-xs font-bold text-muted-foreground">Consumer Cost (S)</Label>
                    <Input 
                      type="number"
                      id="spare-selling"
                      min="0"
                      value={sellingCost}
                      onChange={(e) => setSellingCost(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                {/* Reorder limit count */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="spare-limit" className="text-xs font-bold text-muted-foreground">Low Stock Alert Reorder Limit</Label>
                  <Input 
                    type="number"
                    id="spare-limit"
                    min="0"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                {/* Profit Margin Preview */}
                <div className="mt-2 rounded-lg bg-emerald-500/5 p-3.5 border border-emerald-500/10 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="font-bold text-emerald-600 uppercase text-[10px] tracking-wider">Acquisition Profit Split Preview</span>
                  <div className="flex justify-between">
                    <span>Retail Profit Gain (S - R):</span>
                    <span className="font-semibold text-foreground">₹{Math.max(0, sellingCost - unitCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Gross Markup Margin:</span>
                    <span className="text-emerald-600 font-extrabold">{unitCost ? Math.round(((sellingCost - unitCost) / unitCost) * 100) : 0}%</span>
                  </div>
                </div>

              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Add Spare Item</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Entry</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Spare Edit Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Spare parts item details</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify detailed inventory item parameters and thresholds.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-spare-name" className="text-xs font-bold text-muted-foreground">Part Item Name</Label>
                  <Input 
                    id="edit-spare-name"
                    placeholder="E.g., Fan Capacitor, Copper Pipe"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                {/* Category Selector */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-spare-cat" className="text-xs font-bold text-muted-foreground">Part Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger id="edit-spare-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="Washing Machine">Washing Machine</SelectItem>
                      <SelectItem value="TV">TV</SelectItem>
                      <SelectItem value="Geyser">Geyser</SelectItem>
                      <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Initial Stock Count */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-spare-stock" className="text-xs font-bold text-muted-foreground">Stock Count</Label>
                  <Input 
                    type="number"
                    id="edit-spare-stock"
                    min="0"
                    value={editStockQty}
                    onChange={(e) => setEditStockQty(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Supplier Cost R */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-spare-unit" className="text-xs font-bold text-muted-foreground">Supplier Cost (R)</Label>
                    <Input 
                      type="number"
                      id="edit-spare-unit"
                      min="0"
                      value={editUnitCost}
                      onChange={(e) => setEditUnitCost(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  {/* Selling Cost S */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-spare-selling" className="text-xs font-bold text-muted-foreground">Consumer Cost (S)</Label>
                    <Input 
                      type="number"
                      id="edit-spare-selling"
                      min="0"
                      value={editSellingCost}
                      onChange={(e) => setEditSellingCost(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                {/* Reorder limit count */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-spare-limit" className="text-xs font-bold text-muted-foreground">Low Stock Alert Reorder Limit</Label>
                  <Input 
                    type="number"
                    id="edit-spare-limit"
                    min="0"
                    value={editReorderLevel}
                    onChange={(e) => setEditReorderLevel(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                {/* Profit Margin Preview */}
                <div className="mt-2 rounded-lg bg-emerald-500/5 p-3.5 border border-emerald-500/10 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="font-bold text-emerald-600 uppercase text-[10px] tracking-wider">Acquisition Profit Split Preview</span>
                  <div className="flex justify-between">
                    <span>Retail Profit Gain (S - R):</span>
                    <span className="font-semibold text-foreground">₹{Math.max(0, editSellingCost - editUnitCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Gross Markup Margin:</span>
                    <span className="text-emerald-600 font-extrabold">{editUnitCost ? Math.round(((editSellingCost - editUnitCost) / editUnitCost) * 100) : 0}%</span>
                  </div>
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
