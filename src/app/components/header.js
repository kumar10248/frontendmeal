"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModeToggle } from './mode-toggle'
import { Button } from '@/components/ui/button'
import { Menu, Utensils, User, Terminal, Home, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function Header() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Calories', href: '/calorie', icon: Utensils },
    { name: 'Admin', href: 'https://meal-admin-5bcf.vercel.app/', icon: User, external: true },
    { name: 'Developer', href: 'https://devashish.top', icon: Terminal, external: true }
  ]
  
  const NavItems = ({ mobile = false }) => (
    <>
      {navLinks.map((link, index) => {
        const isActive = pathname === link.href
        const Icon = link.icon
        
        return (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, y: mobile ? 10 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: mobile ? index * 0.1 : 0
            }}
          >
            <Link 
              href={link.href}
              target={link.external ? "_blank" : "_self"}
              rel={link.external ? "noopener noreferrer" : ""}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                mobile && "w-full",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
              )}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-4 w-4" />
              <span>{link.name}</span>
              {link.external && (
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
          </motion.div>
        )
      })}
    </>
  )
  
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-300",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isScrolled && "shadow-sm"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-bold text-xl"
          >
            <div className="relative overflow-hidden p-1">
              <Utensils className="h-6 w-6  relative z-10 text-amber-500  dark:to-orange-600" />
              <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 hover:scale-100 transition-transform duration-300" />
            </div>
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-500 dark:to-orange-600 bg-clip-text text-transparent">
              MealFlow
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <NavItems />
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-accent/50"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background/95 backdrop-blur">
                <SheetHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-2 text-primary">
                      <Utensils className="h-6 w-6" />
                      <span className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-500 dark:to-orange-600 bg-clip-text text-transparent">
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
                <nav className="flex flex-col gap-3 mt-6">
                  <NavItems mobile={true} />
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}