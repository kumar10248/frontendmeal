"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModeToggle } from './mode-toggle'
import { Button } from '@/components/ui/button'
import { Menu, Utensils, User, Terminal, Home, X, Gamepad } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'

// External link icon as a memoized component for better performance
const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="ml-1"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

// Chevron down icon as a memoized component
const ChevronDownIcon = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Throttled scroll handler for better performance
  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Memoized navigation items to prevent unnecessary re-renders
  const navItems = useMemo(() => [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Calories', href: '/calorie', icon: Utensils },
    { 
      name: 'Games',
      icon: Gamepad,
      dropdownItems: [
        { name: 'Memory Game', href: '/memorygame', icon: Gamepad },
        { name: 'Snake Game', href: '/snakegame', icon: Gamepad }
      ]
    },
    { 
      name: 'More',
      icon: Menu,
      dropdownItems: [
        { name: 'Admin', href: 'https://cuisineadmin.devashish.top', icon: User, external: true },
        { name: 'Developer', href: 'https://devashish.top', icon: Terminal, external: true }
      ]
    }
  ], [])

  // Render a regular nav link with enhanced styling
  const NavLink = ({ item }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link
        href={item.href || '#'}
        target={item.external ? "_blank" : "_self"}
        rel={item.external ? "noopener noreferrer" : ""}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
          isActive 
            ? "bg-primary/10 text-primary font-medium shadow-sm" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
        )}
      >
        {Icon && <Icon className={cn("h-4 w-4", isActive && "text-primary")} />}
        <span>{item.name}</span>
        {item.external && <ExternalLinkIcon />}
      </Link>
    )
  }

  // Render a dropdown menu with improved styling
  const DropdownMenu = ({ item }) => {
    const Icon = item.icon
    const [isOpen, setIsOpen] = useState(false)
    
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
            isOpen 
              ? "bg-accent/50 text-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
          )}>
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.name}</span>
            <ChevronDownIcon isOpen={isOpen} />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-56 p-0 bg-background/95 backdrop-blur-lg border border-border rounded-md shadow-lg animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-2"
          align="center"
        >
          <div className="py-1">
            {item.dropdownItems.map((subItem) => {
              const SubIcon = subItem.icon
              const isActive = pathname === subItem.href
              
              return (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  target={subItem.external ? "_blank" : "_self"}
                  rel={subItem.external ? "noopener noreferrer" : ""}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {SubIcon && <SubIcon className={cn("h-4 w-4", isActive && "text-primary")} />}
                  <span>{subItem.name}</span>
                  {subItem.external && <ExternalLinkIcon />}
                </Link>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Render mobile menu items with enhanced styling and state handling
  const MobileMenuItem = ({ item }) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)
    const Icon = item.icon
    const isActive = pathname === item.href

    if (item.dropdownItems) {
      return (
        <div className="border-b border-border/50 last:border-0">
          <button
            onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3 text-left transition-colors",
              isSubmenuOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              <span className="font-medium">{item.name}</span>
            </div>
            <ChevronDownIcon isOpen={isSubmenuOpen} />
          </button>
          
          {isSubmenuOpen && (
            <div className="ml-4 mb-2 mt-1 border-l-2 pl-4 border-primary/20 space-y-1">
              {item.dropdownItems.map((subItem) => {
                const SubIcon = subItem.icon
                const isSubActive = pathname === subItem.href
                
                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    target={subItem.external ? "_blank" : "_self"}
                    rel={subItem.external ? "noopener noreferrer" : ""}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                      isSubActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {SubIcon && <SubIcon className={cn("h-4 w-4", isSubActive && "text-primary")} />}
                    <span>{subItem.name}</span>
                    {subItem.external && <ExternalLinkIcon />}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        href={item.href}
        target={item.external ? "_blank" : "_self"}
        rel={item.external ? "noopener noreferrer" : ""}
        className={cn(
          "flex items-center gap-2 px-4 py-3 border-b border-border/50 last:border-0 transition-colors",
          isActive 
            ? "text-primary font-medium" 
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        {Icon && <Icon className={cn("h-5 w-5", isActive && "text-primary")} />}
        <span>{item.name}</span>
        {item.external && <ExternalLinkIcon />}
      </Link>
    )
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        "bg-background backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        isScrolled 
          ? "shadow-md border-b border-border/40" 
          : "border-b border-border/20"
      )}
    >
      <div className="container flex h-16 items-center">
        {/* Logo with enhanced styling */}
        <Link href="/" className="flex items-center gap-2 mr-6 group">
          <div className="relative p-1.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm group-hover:shadow transition-all duration-300">
            <Utensils className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent group-hover:from-amber-600 group-hover:to-orange-700 transition-all duration-300">
            MealFlow
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-1">
          {navItems.map((item) => (
            item.dropdownItems 
              ? <DropdownMenu key={item.name} item={item} /> 
              : <NavLink key={item.name} item={item} />
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 ml-auto">
          <ModeToggle />
          
          {/* Mobile menu with improved styling */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden hover:bg-accent/30 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
              <SheetHeader className="border-b pb-4 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
                      <Utensils className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      MealFlow
                    </span>
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-accent/30 transition-colors">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              <div className="divide-y divide-border/20">
                {navItems.map((item) => (
                  <MobileMenuItem key={item.name} item={item} />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}