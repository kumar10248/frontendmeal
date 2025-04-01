"use client"

import { useState, useEffect } from 'react'
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
import { motion } from 'framer-motion'

export default function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Navigation items configuration to match the screenshot
  const navItems = [
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
        { name: 'Admin', href: 'https://meal-admin-5bcf.vercel.app/', icon: User, external: true },
        { name: 'Developer', href: 'https://devashish.top', icon: Terminal, external: true }
      ]
    }
  ]

  // Render a regular nav link
  const NavLink = ({ item }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link
        href={item.href || '#'}
        target={item.external ? "_blank" : "_self"}
        rel={item.external ? "noopener noreferrer" : ""}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{item.name}</span>
        {item.external && (
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
        )}
      </Link>
    )
  }

  // Render a dropdown menu
  const DropdownMenu = ({ item }) => {
    const Icon = item.icon
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.name}</span>
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
              className="h-4 w-4"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0 bg-background/95 backdrop-blur border border-border rounded-md">
          <div className="py-1">
            {item.dropdownItems.map((subItem) => {
              const SubIcon = subItem.icon
              return (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  target={subItem.external ? "_blank" : "_self"}
                  rel={subItem.external ? "noopener noreferrer" : ""}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                >
                  {SubIcon && <SubIcon className="h-4 w-4" />}
                  <span>{subItem.name}</span>
                  {subItem.external && (
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
                  )}
                </Link>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Render mobile menu items
  const MobileMenuItem = ({ item }) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)
    const Icon = item.icon
    const isActive = pathname === item.href

    if (item.dropdownItems) {
      return (
        <div>
          <button
            onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-left"
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.name}</span>
            </div>
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
              className={`transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          
          {isSubmenuOpen && (
            <div className="ml-4 mt-1 border-l pl-4 border-border">
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
                      "flex items-center gap-2 px-4 py-2 rounded-md",
                      isSubActive ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {SubIcon && <SubIcon className="h-5 w-5" />}
                    <span>{subItem.name}</span>
                    {subItem.external && (
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
                    )}
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
          "flex items-center gap-2 px-4 py-2 rounded-md",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        {Icon && <Icon className="h-5 w-5" />}
        <span>{item.name}</span>
        {item.external && (
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
        )}
      </Link>
    )
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-300",
      "bg-background backdrop-blur supports-[backdrop-filter]:bg-background/80",
      isScrolled && "shadow-sm"
    )}>
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Utensils className="h-5 w-5 text-amber-500" />
          <span className="font-bold text-xl bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
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
          
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-amber-500" />
                    <span className="font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      MealFlow
                    </span>
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-1">
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