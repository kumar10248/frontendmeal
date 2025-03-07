"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModeToggle } from './mode-toggle'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
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
    { name: 'Menu', href: '/' },
    { name: 'Admin', href: 'https://meal-admin-5bcf.vercel.app/' }
  ]
  
  const NavItems = () => (
    <>
      {navLinks.map((link) => {
        const isActive = pathname === link.href
        
        return (
          <Link 
            key={link.name}
            href={link.href}
            className={`font-medium text-sm transition-colors ${
              isActive 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-primary'
            }`}
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        )
      })}
    </>
  )
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Meal Menu
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <NavItems />
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
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