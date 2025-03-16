"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HeartIcon, GithubIcon, InstagramIcon, TwitterIcon, LinkedinIcon} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  
  // Set correct year if JS is enabled
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])
  
  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/kumar10248', icon: GithubIcon },
    { name: 'Twitter', href: 'https://twitter.com/kumarDe10248', icon: TwitterIcon },
    { name: 'Instagram', href: 'https://instagram.com/mathmaverick_man', icon: InstagramIcon },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/kumar-devashishh', icon: LinkedinIcon}
  ]
  
  return (
    <footer className="w-full border-t py-8 bg-background">
      <div className="container">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} MealFlow. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center">
              Made with <HeartIcon className="h-4 w-4 mx-1 text-red-500" /> for foodies
            </p>
            
            <TooltipProvider>
              <div className="flex items-center space-x-3">
                {socialLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Tooltip key={link.name}>
                      <TooltipTrigger asChild>
                        <Link 
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="sr-only">{link.name}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Follow us on {link.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </footer>
  )
}