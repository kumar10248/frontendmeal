"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModeToggle } from './mode-toggle'
import { Button } from '@/components/ui/button'
import { Menu, Utensils, User, Terminal, Home } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Header() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])
  
  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Menu', href: '/Menu', icon: Utensils },
    { name: 'Admin', href: 'https://meal-admin-5bcf.vercel.app/', icon: User },
    { name: 'Developer', href: 'https://devashish.top', icon: Terminal }
  ]
  
  const NavItems = () => (
    <>
      {navLinks.map((link) => {
        const isActive = pathname === link.href
        const Icon = link.icon
        
        return (
          <Link 
            key={link.name}
            href={link.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isActive 
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-primary'
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="h-4 w-4" />
            <span>{link.name}</span>
          </Link>
        )
      })}
    </>
  )
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
          >
            <Utensils className="h-6 w-6 text-primary" />
            MealFlow
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
                  <SheetTitle className="flex items-center gap-2 text-primary">
                    <Utensils className="h-6 w-6" />
                    MealFlow
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  <NavItems />
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}