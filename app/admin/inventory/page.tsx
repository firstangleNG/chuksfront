"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InventoryService } from "@/lib/inventory-service"
import type { InventoryItem } from "@/types"
import { Package, Plus, Edit, Trash2, AlertTriangle, Search } from "lucide-react"

function InventoryPageContent() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState({
    partName: "",
    quantityAvailable: "",
    lowStockThreshold: "",
    supplierInfo: "",
    unitCost: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchTerm])

  const loadItems = () => {
    const allItems = InventoryService.getItems()
    setItems(allItems)
  }

  const filterItems = () => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplierInfo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredItems(filtered)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.partName.trim()) newErrors.partName = "Part name is required"
    if (!formData.quantityAvailable || isNaN(Number(formData.quantityAvailable))) {
      newErrors.quantityAvailable = "Valid quantity is required"
    }
    if (!formData.lowStockThreshold || isNaN(Number(formData.lowStockThreshold))) {
      newErrors.lowStockThreshold = "Valid threshold is required"
    }
    if (!formData.supplierInfo.trim()) newErrors.supplierInfo = "Supplier info is required"
    if (!formData.unitCost || isNaN(Number(formData.unitCost))) {
      newErrors.unitCost = "Valid unit cost is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const itemData = {
      partName: formData.partName,
      quantityAvailable: Number(formData.quantityAvailable),
      lowStockThreshold: Number(formData.lowStockThreshold),
      supplierInfo: formData.supplierInfo,
      unitCost: Number(formData.unitCost),
    }

    if (editingItem) {
      InventoryService.updateItem(editingItem.id, itemData)
    } else {
      InventoryService.createItem(itemData)
    }

    loadItems()
    resetForm()
    setIsCreateDialogOpen(false)
    setEditingItem(null)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      partName: item.partName,
      quantityAvailable: item.quantityAvailable.toString(),
      lowStockThreshold: item.lowStockThreshold.toString(),
      supplierInfo: item.supplierInfo,
      unitCost: item.unitCost.toString(),
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to delete ${item.partName}?`)) {
      InventoryService.deleteItem(item.id)
      loadItems()
    }
  }

  const resetForm = () => {
    setFormData({
      partName: "",
      quantityAvailable: "",
      lowStockThreshold: "",
      supplierInfo: "",
      unitCost: "",
    })
    setErrors({})
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantityAvailable <= item.lowStockThreshold) {
      return { status: "Low Stock", color: "bg-red-100 text-red-800" }
    } else if (item.quantityAvailable <= item.lowStockThreshold * 1.5) {
      return { status: "Running Low", color: "bg-yellow-100 text-yellow-800" }
    }
    return { status: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const lowStockCount = items.filter((item) => item.quantityAvailable <= item.lowStockThreshold).length

  return (
    <div className="flex min-h-screen bg-muted/50">
      <AdminSidebar />

      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
              <p className="text-muted-foreground">Track and manage repair parts and supplies</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the inventory item details" : "Add a new item to your inventory"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="partName">Part Name *</Label>
                    <Input
                      id="partName"
                      value={formData.partName}
                      onChange={(e) => handleInputChange("partName", e.target.value)}
                      placeholder="Enter part name"
                    />
                    {errors.partName && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.partName}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantityAvailable">Quantity *</Label>
                      <Input
                        id="quantityAvailable"
                        type="number"
                        value={formData.quantityAvailable}
                        onChange={(e) => handleInputChange("quantityAvailable", e.target.value)}
                        placeholder="0"
                      />
                      {errors.quantityAvailable && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.quantityAvailable}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStockThreshold">Low Stock Alert *</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={(e) => handleInputChange("lowStockThreshold", e.target.value)}
                        placeholder="5"
                      />
                      {errors.lowStockThreshold && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.lowStockThreshold}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierInfo">Supplier *</Label>
                    <Input
                      id="supplierInfo"
                      value={formData.supplierInfo}
                      onChange={(e) => handleInputChange("supplierInfo", e.target.value)}
                      placeholder="Supplier name or info"
                    />
                    {errors.supplierInfo && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.supplierInfo}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitCost">Unit Cost (£) *</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => handleInputChange("unitCost", e.target.value)}
                      placeholder="0.00"
                    />
                    {errors.unitCost && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.unitCost}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingItem ? "Update Item" : "Add Item"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        setEditingItem(null)
                        resetForm()
                      }}
                      className="flex-1 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{items.length}</div>
                <p className="text-xs text-muted-foreground">Inventory items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">Items need restocking</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  £{items.reduce((sum, item) => sum + item.quantityAvailable * item.unitCost, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Inventory value</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Inventory List */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inventory items found.</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => {
                const stockStatus = getStockStatus(item)
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.partName}</CardTitle>
                          <CardDescription>{item.supplierInfo}</CardDescription>
                        </div>
                        <Badge className={stockStatus.color} variant="secondary">
                          {stockStatus.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Quantity Available</p>
                          <p className="text-lg font-semibold">{item.quantityAvailable}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Low Stock Alert</p>
                          <p className="text-sm text-muted-foreground">{item.lowStockThreshold}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Unit Cost</p>
                          <p className="text-sm text-muted-foreground">£{item.unitCost}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Value</p>
                          <p className="text-sm text-muted-foreground">
                            £{(item.quantityAvailable * item.unitCost).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(item)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <InventoryPageContent />
    </ProtectedRoute>
  )
}
