"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sun, Moon, Monitor, BookOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth"
import UserMenu from "@/components/auth/user-menu"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const menuItems = [
    { href: "/projects", label: "Projects" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/collaborate", label: "Collaborate" },
  ]

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-background/75 backdrop-blur-sm border-b border-border/40">
        <nav className="container flex max-w-6xl mx-auto items-center justify-between py-4">
          <div>
            <Link href="/" className="text-xl font-bold">
              Sketch-MQ
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1 border border-border/50">
              {user && menuItems.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-background hover:shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Theme Toggle */}
          <div className="flex justify-center items-center">
          <div className="hidden md:block mr-2">
            {mounted && (
              <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1 border border-border/50">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTheme(option.value)}
                      className="rounded-full w-9 h-9 p-0"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  )
                })}
              </div>
            )}
            </div>

            <div className="hidden md:block">
              {user ? ( 
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2">
                
                  <Button asChild>
                    <Link href="/register">Get started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="link"
            size="sm"
            onClick={toggleMenu}
            className="md:hidden rounded-full w-10 h-10 p-0 text-black dark:text-white"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-80 bg-background/95 backdrop-blur-md border-r border-border/40 md:hidden"
            >
              <div className="flex flex-col h-full relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/40">
                  <div className="flex items-center gap-3">
                   <div className="font-bold">Sketch-MQ</div>
                  </div>
                </div>

                {user ? (
                  <div className="p-6 border-t border-border/40">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Welcome back</h4>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border-t border-border/40">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Get Started</h4>
                      <div className="space-y-2">
                        <Button size="lg" className="w-full" asChild>
                          <Link href="/register">Create Account</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="w-full bg-transparent" asChild>
                          <Link href="/login">Sign In</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex-1 p-6">
                  <nav className="space-y-2">
                    {user && menuItems.map((item) => {
                      return (
                        <Button size="lg" variant="outline" className="w-full py-8 bg-transparent" asChild>
                          <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-2 py-2 rounded-2xl transition-all hover:bg-gray-200/90 dark:hover:bg-muted/50 group"
                        >
                          <span className="font-medium">{item.label}</span>
                        </Link>
                        </Button>
                      )
                    })}
                  </nav>
                </div>

                {/* Theme Selection */}
                <div className="p-6 border-t border-border/40 absolute left-0 right-0 bottom-0">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Theme</h4>
                    <div className="space-y-2">
                      {themeOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-full transition-all ${theme === option.value
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted/50"
                              }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{option.label}</span>
                            {theme === option.value && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-current" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

