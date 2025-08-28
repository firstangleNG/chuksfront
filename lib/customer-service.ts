import type { Customer } from "@/types"

import { migrateLocalStorageKey } from "./storage-migration"

export class CustomerService {
  private static STORAGE_KEY = "computerhub_customers"

  // migrate legacy key on load
  static _migrateOnce = (() => {
    if (typeof window !== "undefined") {
      migrateLocalStorageKey("repairhub_customers", CustomerService.STORAGE_KEY)
    }
    return true
  })()

  static getCustomers(): Customer[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveCustomers(customers: Customer[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customers))
  }

  static searchCustomers(query: string): Customer[] {
    const customers = this.getCustomers()
    const searchTerm = query.toLowerCase().trim()

    if (!searchTerm) return customers

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.toLowerCase().includes(searchTerm),
    )
  }

  static createCustomer(customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">): Customer {
    const customers = this.getCustomers()
    const newCustomer: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...customerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    customers.push(newCustomer)
    this.saveCustomers(customers)
    return newCustomer
  }

  static getCustomerById(id: string): Customer | null {
    const customers = this.getCustomers()
    return customers.find((customer) => customer.id === id) || null
  }

  static updateCustomer(id: string, updates: Partial<Omit<Customer, "id" | "createdAt">>): Customer | null {
    const customers = this.getCustomers()
    const index = customers.findIndex((customer) => customer.id === id)

    if (index === -1) return null

    customers[index] = {
      ...customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.saveCustomers(customers)
    return customers[index]
  }
}
