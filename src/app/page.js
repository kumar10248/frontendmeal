"use client"

import { useState, useEffect } from 'react'
import { getCurrentWeekMenu } from './lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, AlertCircle, Utensils, Sunrise, Soup, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Helper function to get date labels (Today, Tomorrow, or weekday)
const getDateLabel = (date) => {
  if (!date) return 'Invalid Date';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const menuDate = new Date(date);
  if (isNaN(menuDate.getTime())) return 'Invalid Date';

  menuDate.setHours(0, 0, 0, 0);

  if (menuDate.getTime() === today.getTime()) return 'Today';
  if (menuDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return menuDate.toLocaleDateString('en-US', { weekday: 'long' });
};

export default function HomePage() {
  const [weeklyMenu, setWeeklyMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())

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
        }
      } catch (err) {
        console.error('Error loading menu:', err)
        setError('Failed to load menu data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    loadWeeklyMenu()
  }, [currentDate]) // Re-fetch when currentDate changes

  // Update date at midnight
  useEffect(() => {
    // Function to check if date has changed
    const checkDateChange = () => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // If current date is different from the stored date
      if (today.getTime() !== currentDate.setHours(0, 0, 0, 0)) {
        setCurrentDate(today)
      }
    }
    
    // Check immediately
    checkDateChange()
    
    // Set up interval to check every minute
    const intervalId = setInterval(checkDateChange, 60000)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [currentDate])

  // Update date labels periodically
  useEffect(() => {
    // Function to update the date labels
    const updateDateLabels = () => {
      setWeeklyMenu(prevMenu => 
        prevMenu.map(menu => ({
          ...menu,
          dateLabel: getDateLabel(menu.date)
        }))
      )
    }
    
    // Set up interval to update labels every hour
    const intervalId = setInterval(updateDateLabels, 3600000) // Every hour
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (weeklyMenu.length === 0) {
    return (
      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No menu available</AlertTitle>
        <AlertDescription>There is no menu available for this week.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Weekly Dining Experience
          </h1>
          <p className="text-lg text-muted-foreground">
            Savor the flavors of the week
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              All Week
            </TabsTrigger>
            {weeklyMenu.map((menu) => (
              <TabsTrigger
                key={menu._id}
                value={menu._id}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                {menu.dateLabel}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {weeklyMenu.map((menu) => (
                <MenuCard key={menu._id} menu={menu} />
              ))}
            </div>
          </TabsContent>

          {weeklyMenu.map((menu) => (
            <TabsContent key={menu._id} value={menu._id}>
              <MenuCard menu={menu} expanded />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  )
}
// Update the MenuCard component to support dark mode

function MenuCard({ menu, expanded = false }) {
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
      className={cn("group relative", expanded ? "w-full" : "hover:shadow-lg transition-shadow")}
    >
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-sm",
        // Remove the fixed bg-white/90 and use system color scheme
        "bg-card dark:bg-card",
        expanded ? "w-full" : "",
        isToday ? "border-2 border-blue-500/20 dark:border-blue-400/20" : ""
      )}>
        {isToday && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-400/10 transform rotate-45 translate-x-20 -translate-y-8" />
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              {menu.dateLabel}
              {isToday && (
                <Badge className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500">
                  Today
                </Badge>
              )}
              {isTomorrow && (
                <Badge variant="outline" className="ml-2">Tomorrow</Badge>
              )}
            </CardTitle>
            {!expanded && (
              <div className="flex items-center text-muted-foreground text-sm">
                <CalendarDays className="mr-1 h-4 w-4 text-purple-500 dark:text-purple-400" />
                {formattedDate}
              </div>
            )}
          </div>
          {expanded && (
            <CardDescription className="text-base">
              <CalendarDays className="inline mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
              {formattedDate}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <MealSection title="Breakfast" content={menu.breakfast} icon={<Sunrise className="w-5 h-5 text-amber-500" />} />
          <MealSection title="Lunch" content={menu.lunch} icon={<Utensils className="w-5 h-5 text-emerald-500" />} />
          <MealSection title="Snacks" content={menu.snacks} icon={<Soup className="w-5 h-5 text-orange-500" />} />
          <MealSection title="Dinner" content={menu.dinner} icon={<Moon className="w-5 h-5 text-indigo-500" />} />
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Update the MealSection component for dark mode compatibility
function MealSection({ title, content, icon }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 pl-12 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-blue-200 before:to-purple-200 dark:before:from-blue-700 dark:before:to-purple-700">
        {content}
      </p>
    </div>
  )
}

// Update LoadingSkeleton for dark mode
function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2 text-center">
        <Skeleton className="h-10 w-64 mx-auto bg-blue-100/50 dark:bg-blue-800/20" />
        <Skeleton className="h-6 w-72 mx-auto bg-purple-100/50 dark:bg-purple-800/20" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden backdrop-blur-sm relative bg-card dark:bg-card">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20 animate-pulse" />
            <CardHeader>
              <Skeleton className="h-7 w-32 bg-blue-100/50 dark:bg-blue-800/20" />
              <Skeleton className="h-4 w-48 bg-purple-100/50 dark:bg-purple-800/20" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-blue-100/50 dark:bg-blue-800/20" />
                  <Skeleton className="h-4 w-full bg-purple-100/50 dark:bg-purple-800/20" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}