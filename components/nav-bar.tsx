"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Car, History, LogIn, LogOut, User, Menu, X, Home, CreditCard, PenTool, Image } from "lucide-react"
import { cn } from "@/lib/utils"

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Prevent scrolling when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Velaro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/" active={pathname === "/"}>
              <Home className="h-4 w-4 mr-2" />
              Acasă
            </NavLink>

            <NavLink href="/generator" active={pathname === "/generator"}>
              <PenTool className="h-4 w-4 mr-2" />
              Generator
            </NavLink>

            <NavLink href="/image-editor" active={pathname === "/image-editor"}>
              <Image className="h-4 w-4 mr-2" />
              Editor Imagini
            </NavLink>

            {user ? (
              <>
                <NavLink href="/profile" active={pathname === "/profile"}>
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </NavLink>
                <NavLink href="/history" active={pathname === "/history"}>
                  <History className="h-4 w-4 mr-2" />
                  Istoric
                </NavLink>
                <Button variant="ghost" size="sm" onClick={logOut} className="text-slate-600 hover:text-slate-900">
                  <LogOut className="h-4 w-4 mr-2" />
                  Deconectare
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Autentificare
                </Button>
              </Link>
            )}

            <Link href="/pricing">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Abonează-te
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-slate-200 fixed inset-x-0 top-[72px] bottom-0 z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <MobileNavLink href="/" active={pathname === "/"} onClick={() => setIsMobileMenuOpen(false)}>
                <Home className="h-5 w-5 mr-3" />
                Acasă
              </MobileNavLink>

              <MobileNavLink
                href="/generator"
                active={pathname === "/generator"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PenTool className="h-5 w-5 mr-3" />
                Generator
              </MobileNavLink>

              <MobileNavLink
                href="/image-editor"
                active={pathname === "/image-editor"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Image className="h-5 w-5 mr-3" />
                Editor Imagini
              </MobileNavLink>

              {user ? (
                <>
                  <MobileNavLink
                    href="/profile"
                    active={pathname === "/profile"}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profil
                  </MobileNavLink>
                  <MobileNavLink
                    href="/history"
                    active={pathname === "/history"}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <History className="h-5 w-5 mr-3" />
                    Istoric
                  </MobileNavLink>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-600 py-3"
                    onClick={() => {
                      logOut()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Deconectare
                  </Button>
                </>
              ) : (
                <MobileNavLink href="/login" active={pathname === "/login"} onClick={() => setIsMobileMenuOpen(false)}>
                  <LogIn className="h-5 w-5 mr-3" />
                  Autentificare
                </MobileNavLink>
              )}

              <MobileNavLink
                href="/pricing"
                active={pathname === "/pricing"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Abonează-te
              </MobileNavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative text-sm font-medium transition-colors flex items-center",
        active ? "text-primary font-semibold" : "text-slate-600 hover:text-slate-900",
      )}
    >
      {children}
      {active && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  )
}

function MobileNavLink({ href, active, onClick, children }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center p-3 rounded-md",
        active ? "bg-primary/10 text-primary font-medium" : "text-slate-600 hover:bg-slate-100",
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

