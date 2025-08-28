"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthContextType } from "@/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for development
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    firstname: "Super",
    surname: "Admin",
    email: "superadmin@computerhub.com",
    phone: "+1234567890",
    role: "superadmin",
    password: "admin123",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    firstname: "Shop",
    surname: "Admin",
    email: "admin@computerhub.com",
    phone: "+1234567891",
    role: "admin",
    password: "admin123",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    firstname: "John",
    surname: "Customer",
    email: "customer@example.com",
    phone: "+1234567892",
    role: "customer",
    password: "customer123",
    createdAt: new Date().toISOString(),
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // migrate stored user key if present
    try {
      const newKey = "computerhub_user"
      const oldKey = "repairhub_user"
      const newVal = localStorage.getItem(newKey)
      if (newVal) {
        setUser(JSON.parse(newVal))
      } else {
        const oldVal = localStorage.getItem(oldKey)
        if (oldVal) {
          localStorage.setItem(newKey, oldVal)
          localStorage.setItem(`${oldKey}_backup`, oldVal)
          setUser(JSON.parse(oldVal))
        }
      }
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
  setUser(userWithoutPassword)
  localStorage.setItem("computerhub_user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("repairhub_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
