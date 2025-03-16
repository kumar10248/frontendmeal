"use client"

import { useState, useEffect } from 'react'
import { getCurrentWeekMenu } from './lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, AlertCircle, Coffee, Soup, UtensilsCrossed, Sandwich } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Helper function to get date labels (Today, Tomorrow, or weekday)
const getDateLabel = (date) => {
  if (!date) return 'Invalid Date';

  // Create dates in IST timezone
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const offset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + offset);
  
  // Create today's date in IST, with time set to midnight
  const today = new Date(istTime);
  today.setHours(0, 0, 0, 0);
  
  // Create tomorrow's date in IST
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Parse the menu date and convert to IST if needed
  let menuDate = new Date(date);
  if (isNaN(menuDate.getTime())) return 'Invalid Date';
  
  // Set to midnight for comparison
  menuDate.setHours(0, 0, 0, 0);
  
  // For accurate comparison, work with just the date portion
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const menuDateStr = menuDate.toISOString().split('T')[0];
  
  if (menuDateStr === todayStr) return 'Today';
  if (menuDateStr === tomorrowStr) return 'Tomorrow';
  
  // Format using IST
  return menuDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });
};

export default function HomePage() {
  const [weeklyMenu, setWeeklyMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentMeal, setCurrentMeal] = useState(null)

  // Determine current meal time
  useEffect(() => {
    const determineCurrentMeal = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 7 && hour < 10) {
        setCurrentMeal('breakfast');
      } else if (hour >= 12 && hour < 14) {
        setCurrentMeal('lunch');
      } else if (hour >= 16 && hour < 18) {
        setCurrentMeal('snacks');
      } else if (hour >= 19 && hour < 22) {
        setCurrentMeal('dinner');
      } else {
        setCurrentMeal(null);
      }
    };
    
    determineCurrentMeal();
    const intervalId = setInterval(determineCurrentMeal, 300000); // Check every 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  // Fetch menu data
  useEffect(() => {
    const loadWeeklyMenu = async () => {
      try {
        setLoading(true)
        const data = await getCurrentWeekMenu()
        
        // Update date labels locally
        const updatedData = data.map(menu => ({
          ...menu,
          dateLabel: getDateLabel(menu.date)
        }))
        
        setWeeklyMenu(updatedData)
        
        // Set default tab to today if exists
        const todayMenu = updatedData.find(menu => menu.dateLabel === 'Today')
        if (todayMenu) {
          setActiveTab(todayMenu._id)
        } else {
          // If no today menu, default to "all"
          setActiveTab('all')
        }
      } catch (err) {
        console.error('Error loading menu:', err)
        setError('Failed to load menu data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    loadWeeklyMenu()
  }, [currentDate]) 

  // Update date at midnight
  useEffect(() => {
    // Function to check if date has changed
    const checkDateChange = () => {
      const now = new Date();
      // Convert to IST
      const offset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + offset);
      
      const today = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
      
      // If current date is different from the stored date
      if (today.getTime() !== currentDate.setHours(0, 0, 0, 0)) {
        setCurrentDate(today);
      }
    }
    
    // Check date change immediately
    checkDateChange();
    
    // Set up interval to check for date change
    const intervalId = setInterval(checkDateChange, 60000); // Check every minute
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [currentDate])

  // Update date labels periodically
  useEffect(() => {
    const updateDateLabels = () => {
      setWeeklyMenu(prevMenu => 
        prevMenu.map(menu => ({
          ...menu,
          dateLabel: getDateLabel(menu.date)
        }))
      )
    }
    
    const intervalId = setInterval(updateDateLabels, 3600000) // Every hour
    
    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6 max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (weeklyMenu.length === 0) {
    return (
      <Alert className="mt-6 max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No menu available</AlertTitle>
        <AlertDescription>There is no menu available for this week.</AlertDescription>
      </Alert>
    )
  }

  // Find today's menu
  const todayMenu = weeklyMenu.find(menu => menu.dateLabel === 'Today');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 p-8 shadow-xl text-center mb-12">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 800 800">
              <defs>
                <pattern id="food-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
                  <path d="M30,10 Q50,-10 70,10 T110,10" stroke="white" fill="none" strokeWidth="8"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#food-pattern)"/>
            </svg>
          </div>
          
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Hostel Mess Menu
            </h1>
            <p className="text-lg text-amber-100 max-w-2xl mx-auto">
              Your weekly meal schedule at Chandigarh University hostel
            </p>
            
            {currentMeal && todayMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-white/20 backdrop-blur-sm p-4 rounded-xl max-w-md mx-auto"
              >
                <Badge className="bg-white text-amber-600 mb-2">Happening Now</Badge>
                <p className="text-white font-medium text-lg">
                  {currentMeal === 'breakfast' && 'Breakfast (7:30 AM - 9:00 AM)'}
                  {currentMeal === 'lunch' && 'Lunch (12:00 PM - 2:00 PM)'}
                  {currentMeal === 'snacks' && 'Snacks (4:30 PM - 5:15 PM)'}
                  {currentMeal === 'dinner' && 'Dinner (7:30 PM - 9:00 PM)'}
                </p>
                <p className="text-white/90 mt-1">{todayMenu[currentMeal]}</p>
              </motion.div>
            )}
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-0 z-30 py-2 bg-orange-50/80 dark:bg-slate-900/80 backdrop-blur-md">
            <TabsList className="flex flex-wrap justify-center h-auto gap-2 p-1 bg-orange-100/50 dark:bg-slate-800/50 rounded-full">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-full"
              >
                Full Week
              </TabsTrigger>
              {weeklyMenu.map((menu) => (
                <TabsTrigger
                  key={menu._id}
                  value={menu._id}
                  className={cn(
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-full",
                    menu.dateLabel === "Today" && "font-medium"
                  )}
                >
                  {menu.dateLabel === "Today" ? "Today" : menu.dateLabel === "Tomorrow" ? "Tomorrow" : menu.dateLabel.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="all" className="space-y-4 mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {weeklyMenu.map((menu) => (
                  <MenuCard key={menu._id} menu={menu} currentMeal={currentMeal} />
                ))}
              </div>
            </TabsContent>

            {weeklyMenu.map((menu) => (
              <TabsContent key={menu._id} value={menu._id}>
                <MenuCard menu={menu} expanded currentMeal={currentMeal} />
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  )
}

function MenuCard({ menu, expanded = false, currentMeal }) {
  const date = new Date(menu.date)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const isToday = menu.dateLabel === 'Today'
  const isTomorrow = menu.dateLabel === 'Tomorrow'

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("group relative", expanded ? "w-full" : "")}
    >
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-sm h-full",
        "bg-white/80 dark:bg-slate-800/80 shadow-md hover:shadow-xl transition-shadow",
        expanded ? "w-full border-0 shadow-xl" : "",
        isToday ? "border-2 border-amber-500 dark:border-amber-400" : ""
      )}>
        {isToday && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/10 transform rotate-45 translate-x-20 -translate-y-8" />
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-amber-700 dark:text-amber-400">
              {menu.dateLabel}
              {isToday && (
                <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  Today
                </Badge>
              )}
              {isTomorrow && (
                <Badge variant="outline" className="ml-2 border-amber-400 text-amber-600 dark:text-amber-400">Tomorrow</Badge>
              )}
            </CardTitle>
            {!expanded && (
              <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                <CalendarDays className="mr-1 h-4 w-4" />
                {formattedDate}
              </div>
            )}
          </div>
          {expanded && (
            <CardDescription className="text-base text-amber-600 dark:text-amber-400">
              <CalendarDays className="inline mr-2 h-4 w-4" />
              {formattedDate}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <MealSection 
            title={<>Breakfast <span className="text-green-600 dark:text-green-400 text-sm font-normal">(7:30 AM - 9:00 AM)</span></>} 
            content={menu.breakfast} 
            icon={<Coffee className="w-5 h-5 text-amber-500" />} 
            isActive={isToday && currentMeal === 'breakfast'}
          />
          <MealSection 
            title={<>Lunch <span className="text-green-600 dark:text-green-400 text-sm font-normal">(12:00 PM - 2:00 PM)</span></>} 
            content={menu.lunch} 
            icon={<UtensilsCrossed className="w-5 h-5 text-amber-500" />} 
            isActive={isToday && currentMeal === 'lunch'}
          />
          <MealSection 
            title={<>Snacks <span className="text-green-600 dark:text-green-400 text-sm font-normal">(4:30 PM - 5:15 PM)</span></>} 
            content={menu.snacks} 
            icon={<Sandwich className="w-5 h-5 text-amber-500" />} 
            isActive={isToday && currentMeal === 'snacks'}
          />
          <MealSection 
            title={<>Dinner <span className="text-green-600 dark:text-green-400 text-sm font-normal">(7:30 PM - 9:00 PM)</span></>} 
            content={menu.dinner} 
            icon={<Soup className="w-5 h-5 text-amber-500" />} 
            isActive={isToday && currentMeal === 'dinner'}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MealSection({ title, content, icon, isActive }) {
  return (
    <div className={cn(
      "space-y-3 p-4 rounded-xl transition-colors",
      isActive ? "bg-amber-100/60 dark:bg-amber-900/30" : "hover:bg-amber-50 dark:hover:bg-slate-700/30"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isActive 
            ? "bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-700 dark:to-orange-700" 
            : "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700"
        )}>
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-amber-800 dark:text-amber-300">
          {title}
          {isActive && (
            <Badge className="ml-2 bg-green-500 text-white text-xs">Now Serving</Badge>
          )}
        </h3>
      </div>
      <p className={cn(
        "text-gray-700 dark:text-gray-300 pl-12 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px",
        isActive 
          ? "before:bg-gradient-to-b before:from-amber-300 before:to-orange-300 dark:before:from-amber-600 dark:before:to-orange-600 font-medium" 
          : "before:bg-gradient-to-b before:from-amber-200 before:to-orange-200 dark:before:from-amber-800 dark:before:to-orange-800"
      )}>
        {content}
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 dark:from-amber-600/10 dark:to-orange-700/10 p-8 rounded-2xl animate-pulse">
          <Skeleton className="h-12 w-64 mx-auto bg-white/30 dark:bg-white/10" />
          <Skeleton className="h-6 w-72 mx-auto mt-4 bg-white/20 dark:bg-white/5" />
        </div>
      </div>

      <div className="py-4">
        <Skeleton className="h-12 w-full max-w-md mx-auto rounded-full bg-orange-100/50 dark:bg-slate-800/50" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden backdrop-blur-sm relative bg-white/80 dark:bg-slate-800/80">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/30 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/20 animate-pulse" />
            <CardHeader>
              <Skeleton className="h-7 w-32 bg-amber-100/50 dark:bg-amber-800/20" />
              <Skeleton className="h-4 w-48 bg-orange-100/50 dark:bg-orange-800/20" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-amber-100/50 dark:bg-amber-800/20" />
                  <Skeleton className="h-4 w-full bg-orange-100/50 dark:bg-orange-800/20" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}