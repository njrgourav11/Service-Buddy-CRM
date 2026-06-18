"use client"

import * as React from "react"
import { useCRM, Contact } from "@/context/crm-context"
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
  UserCircle02Icon,
  InvoiceIcon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function ContactsModule() {
  const { contacts, addContact, updateContact, deleteContact, currentRole } = useCRM()
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("ALL")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null)

  // Form State
  const [name, setName] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [customerType, setCustomerType] = React.useState<any>("Regular")
  const [notes, setNotes] = React.useState("")

  // Edit Form State
  const [editName, setEditName] = React.useState("")
  const [editMobile, setEditMobile] = React.useState("")
  const [editAddress, setEditAddress] = React.useState("")
  const [editCustomerType, setEditCustomerType] = React.useState<any>("Regular")
  const [editNotes, setEditNotes] = React.useState("")
  const [editLastServiceDate, setEditLastServiceDate] = React.useState("")

  // Contact database CSV Exporter
  const handleExportCSV = () => {
    const headers = ["Contact ID", "Contact Name", "Phone Line", "Address", "Client Type", "Timeline Check"]
    const rows = filteredContacts.map(c => [
      c.id || "",
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.mobile || "").replace(/"/g, '""')}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      c.customerType || "Regular",
      `"${(c.lastServiceDate || "").replace(/"/g, '""')}"`
    ])
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `ServiceBuddy_CRM_Contacts_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Contact list exported to CSV!")
  }

  // Open Edit Drawer
  const handleOpenEdit = (c: Contact) => {
    setSelectedContact(c)
    setEditName(c.name)
    setEditMobile(c.mobile)
    setEditAddress(c.address)
    setEditCustomerType(c.customerType)
    setEditNotes(c.notes || "")
    setEditLastServiceDate(c.lastServiceDate)
    setIsEditOpen(true)
  }

  // Submit Edit Contact
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContact) return

    updateContact(selectedContact.id, {
      name: editName,
      mobile: editMobile,
      address: editAddress,
      customerType: editCustomerType,
      notes: editNotes,
      lastServiceDate: editLastServiceDate
    })

    setIsEditOpen(false)
  }

  // Filtered List
  const filteredContacts = contacts.filter(c => {
    const searchString = `${c.id} ${c.name} ${c.mobile} ${c.address}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    const matchesType = typeFilter === "ALL" || c.customerType === typeFilter

    return matchesSearch && matchesType
  })

  // Submit Contact
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addContact({
      name,
      mobile,
      address,
      customerType,
      notes,
      lastServiceDate: "Never serviced"
    })

    // Reset Form
    setName("")
    setMobile("")
    setAddress("")
    setCustomerType("Regular")
    setNotes("")
    setIsAddOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Contact Directory</h2>
          <p className="text-sm text-muted-foreground">Reconcile business directories, catalog supplier contacts, and inspect historical service timelines.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={handleExportCSV} variant="outline" className="w-fit cursor-pointer gap-1.5 h-10 text-xs font-bold">
            <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} className="size-4" />
            Export CSV
          </Button>
          {(currentRole === "Admin" || currentRole === "Manager") && (
            <Button onClick={() => setIsAddOpen(true)} className="w-fit cursor-pointer gap-1.5 h-10 text-xs font-bold">
              <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} className="size-4" />
              Create Contact Card
            </Button>
          )}
        </div>
      </div>

      {/* Control Panel: Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search contact cards by name, mobile or location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20 border-border/60 focus:bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:inline">Type:</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Contact Profiles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Contact Profiles</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="VIP">VIP Profile</SelectItem>
                <SelectItem value="Corporate">Corporate Profile</SelectItem>
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
                  <th className="px-4 py-3">Contact ID</th>
                  <th className="px-4 py-3">Contact Name</th>
                  <th className="px-4 py-3">Phone Line</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Client Type</th>
                  <th className="px-4 py-3">Timeline Check</th>
                  {(currentRole === "Admin" || currentRole === "Manager") && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole === "Admin" ? 7 : 6} className="text-center py-12 text-muted-foreground font-medium">
                      No business contacts recorded.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 font-semibold text-xs tabular-nums text-foreground">{c.id}</td>
                      <td className="px-4 py-4 font-semibold text-xs text-foreground">{c.name}</td>
                      <td className="px-4 py-4 text-xs font-medium text-muted-foreground tabular-nums">{c.mobile}</td>
                      <td className="px-4 py-4 text-xs font-medium text-foreground max-w-xs truncate">{c.address}</td>
                      <td className="px-4 py-4">
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] font-bold py-0.5 px-1.5 ${
                            c.customerType === "VIP" 
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400" 
                              : c.customerType === "Corporate" 
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400"
                          }`}
                        >
                          {c.customerType}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-foreground tabular-nums">{c.lastServiceDate}</td>
                      {(currentRole === "Admin" || currentRole === "Manager") && (
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenEdit(c)}
                              className="h-6 text-[10px] font-semibold px-2 bg-background hover:bg-muted"
                            >
                              Edit
                            </Button>
                            {currentRole === "Admin" && (
                              <Button 
                                variant="ghost" 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete contact card for ${c.name}?`)) {
                                    deleteContact(c.id)
                                  }
                                }}
                                className="h-6 size-6 text-destructive hover:bg-destructive/10 rounded-md p-0 flex items-center justify-center font-bold"
                              >
                                ×
                              </Button>
                            )}
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

      {/* Contact Add Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Onboard Business Contact Card</DrawerTitle>
              <DrawerDescription className="text-xs">
                Log external stakeholder directories, specify corporate parameters, and add custom memo notes.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cont-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
                  <Input 
                    id="cont-name"
                    placeholder="E.g., Vikram Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cont-phone" className="text-xs font-bold text-muted-foreground">Primary Mobile Phone</Label>
                  <Input 
                    id="contact-phone" 
                    type="tel" 
                    inputMode="numeric"
                    placeholder="E.g., 9911223344" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} 
                    required 
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cont-address" className="text-xs font-bold text-muted-foreground">Primary Service/Office Address</Label>
                  <Input 
                    id="cont-address"
                    placeholder="Street, Tower, Location details"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Type selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cont-type" className="text-xs font-bold text-muted-foreground">Contact Profile Type</Label>
                  <Select value={customerType} onValueChange={setCustomerType}>
                    <SelectTrigger id="cont-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular Stakeholder</SelectItem>
                      <SelectItem value="VIP">VIP Client</SelectItem>
                      <SelectItem value="Corporate">Corporate Entity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes Removed */}
              </div>
            </div>

            <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
              <Button type="submit" className="flex-1">Create Contact Card</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Discard Card</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Contact Edit Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction="bottom">
        <DrawerContent className="h-[96vh] max-h-[96vh] flex flex-col rounded-t-2xl border-t bg-card">
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-border/40 p-4">
              <DrawerTitle className="text-base font-bold">Edit Business Contact Card</DrawerTitle>
              <DrawerDescription className="text-xs">
                Modify recorded external stakeholder details.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cont-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
                  <Input 
                    id="edit-cont-name"
                    placeholder="E.g., Vikram Sharma"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cont-phone" className="text-xs font-bold text-muted-foreground">Primary Mobile Phone</Label>
                  <Input 
                    id="edit-contact-phone" 
                    type="tel" 
                    inputMode="numeric"
                    placeholder="E.g., 9911223344" 
                    value={editMobile} 
                    onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, ''))} 
                    required 
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cont-address" className="text-xs font-bold text-muted-foreground">Primary Service/Office Address</Label>
                  <Input 
                    id="edit-cont-address"
                    placeholder="Street, Tower, Location details"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="flex flex-col gap-4">
                
                {/* Type selection */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cont-type" className="text-xs font-bold text-muted-foreground">Contact Profile Type</Label>
                  <Select value={editCustomerType} onValueChange={setEditCustomerType}>
                    <SelectTrigger id="edit-cont-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular Stakeholder</SelectItem>
                      <SelectItem value="VIP">VIP Client</SelectItem>
                      <SelectItem value="Corporate">Corporate Entity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Last Service Date */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-cont-date" className="text-xs font-bold text-muted-foreground">Last Service Date</Label>
                  <Input 
                    id="edit-cont-date"
                    placeholder="E.g., 2026-05-15 or No service logged yet"
                    value={editLastServiceDate}
                    onChange={(e) => setEditLastServiceDate(e.target.value)}
                    required
                  />
                </div>

                {/* Notes Removed */}
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
