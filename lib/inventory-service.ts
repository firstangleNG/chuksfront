import type { InventoryItem } from "@/types"

const STORAGE_KEY = "repairhub_inventory"

export class InventoryService {
  static getItems(): InventoryItem[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : this.getDefaultItems()
  }

  static getDefaultItems(): InventoryItem[] {
    const defaultItems: InventoryItem[] = [
      {
        id: "1",
        partName: "iPhone 14 Screen",
        quantityAvailable: 15,
        lowStockThreshold: 5,
        supplierInfo: "TechParts Inc.",
        unitCost: 74.99,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        partName: "Samsung Galaxy S23 Battery",
        quantityAvailable: 8,
        lowStockThreshold: 10,
        supplierInfo: "Mobile Parts Co.",
        unitCost: 37.99,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        partName: "MacBook Pro Keyboard",
        quantityAvailable: 3,
        lowStockThreshold: 5,
        supplierInfo: "Apple Parts Direct",
        unitCost: 108.99,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    this.saveItems(defaultItems)
    return defaultItems
  }

  static saveItems(items: InventoryItem[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }

  static createItem(itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): InventoryItem {
    const items = this.getItems()
    const newItem: InventoryItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    items.push(newItem)
    this.saveItems(items)
    return newItem
  }

  static updateItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const items = this.getItems()
    const index = items.findIndex((item) => item.id === id)

    if (index === -1) return null

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.saveItems(items)
    return items[index]
  }

  static deleteItem(id: string): boolean {
    const items = this.getItems()
    const filteredItems = items.filter((item) => item.id !== id)

    if (filteredItems.length === items.length) return false

    this.saveItems(filteredItems)
    return true
  }

  static getLowStockItems(): InventoryItem[] {
    const items = this.getItems()
    return items.filter((item) => item.quantityAvailable <= item.lowStockThreshold)
  }
}
