"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./auth-context"

type Theme = "light" | "dark" | "system"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: async () => {},
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("system")
  const { user } = useAuth()

  useEffect(() => {
    // Load theme from localStorage first for immediate display
    const storedTheme = localStorage.getItem("theme") as Theme | null
    if (storedTheme) {
      setThemeState(storedTheme)
    }

    // Then, if user is logged in, load from database
    const loadUserTheme = async () => {
      if (user) {
        const { data, error } = await supabase.from("user_settings").select("theme").eq("user_id", user.id).single()

        if (!error && data) {
          setThemeState(data.theme)
          localStorage.setItem("theme", data.theme)
        }
      }
    }

    loadUserTheme()
  }, [user])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)

    if (user) {
      await supabase
        .from("user_settings")
        .update({ theme: newTheme, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
