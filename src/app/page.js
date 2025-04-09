"use client";

import { useState, useEffect } from "react";
import { getCurrentWeekMenu } from "./lib/api";

import FeedbackPopupSystem from './components/FeedbackForm';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  CalendarDays,
  AlertCircle,
  Coffee,
  Soup,
  UtensilsCrossed,
  Sandwich,
  Clock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to get date labels (Today, Tomorrow, or weekday)
const getDateLabel = (date) => {
  if (!date) return "Invalid Date";

  // Create dates in IST timezone
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const offset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(
    now.getTime() + now.getTimezoneOffset() * 60 * 1000 + offset
  );

  // Create today's date in IST, with time set to midnight
  const today = new Date(istTime);
  today.setHours(0, 0, 0, 0);

  // Create tomorrow's date in IST
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Parse the menu date and convert to IST if needed
  let menuDate = new Date(date);
  if (isNaN(menuDate.getTime())) return "Invalid Date";

  // Set to midnight for comparison
  menuDate.setHours(0, 0, 0, 0);

  // For accurate comparison, work with just the date portion
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const menuDateStr = menuDate.toISOString().split("T")[0];

  if (menuDateStr === todayStr) return "Today";
  if (menuDateStr === tomorrowStr) return "Tomorrow";

  // Format using IST
  return menuDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  });
};

// Get current IST time
const getCurrentISTTime = () => {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const offset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  return new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + offset);
};

// Get appropriate greeting based on current IST time
const getGreeting = () => {
  const istTime = getCurrentISTTime();
  const hour = istTime.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

// Get current and next meal info
const getMealInfo = () => {
  const istTime = getCurrentISTTime();
  const hour = istTime.getHours();
  const minute = istTime.getMinutes();
  const currentTimeInMinutes = hour * 60 + minute;

  // Define meal times in minutes since midnight
  const mealTimes = {
    breakfast: {
      start: 7 * 60 + 30,
      end: 9 * 60,
      label: "Breakfast",
      timeLabel: "7:30 AM - 9:00 AM",
    },
    lunch: {
      start: 12 * 60,
      end: 14 * 60,
      label: "Lunch",
      timeLabel: "12:00 PM - 2:00 PM",
    },
    snacks: {
      start: 16 * 60 + 30,
      end: 17 * 60 + 15,
      label: "Snacks",
      timeLabel: "4:30 PM - 5:15 PM",
    },
    dinner: {
      start: 19 * 60 + 30,
      end: 21 * 60,
      label: "Dinner",
      timeLabel: "7:30 PM - 9:00 PM",
    },
  };

  // Check if current time is within any meal timeframe
  let currentMeal = null;
  let nextMeal = null;
  let timeUntilNext = null;

  // Sort meal keys by start time
  const sortedMealKeys = Object.keys(mealTimes).sort(
    (a, b) => mealTimes[a].start - mealTimes[b].start
  );

  // Find current meal first
  for (let i = 0; i < sortedMealKeys.length; i++) {
    const mealKey = sortedMealKeys[i];
    const meal = mealTimes[mealKey];

    if (currentTimeInMinutes >= meal.start && currentTimeInMinutes < meal.end) {
      currentMeal = {
        key: mealKey,
        ...meal,
        status: "now",
      };

      // Calculate time until current meal ends
      let timeToMealEnd = meal.end - currentTimeInMinutes;
      currentMeal.timeUntilEnd = `Ends in ${Math.floor(timeToMealEnd / 60)}h ${
        timeToMealEnd % 60
      }m`;
      break;
    }
  }

  // If we're in a meal, find the next one
  if (currentMeal) {
    // Find the index of the current meal
    const currentIndex = sortedMealKeys.indexOf(currentMeal.key);
    // Get the next meal key, wrapping around to breakfast if needed
    const nextIndex = (currentIndex + 1) % sortedMealKeys.length;
    const nextMealKey = sortedMealKeys[nextIndex];

    // If we're going from dinner to breakfast, it's tomorrow
    if (currentMeal.key === "dinner" && nextMealKey === "breakfast") {
      nextMeal = {
        key: nextMealKey,
        ...mealTimes[nextMealKey],
        status: "tomorrow",
      };
    } else {
      nextMeal = {
        key: nextMealKey,
        ...mealTimes[nextMealKey],
        status: "upcoming",
      };
    }

    // Calculate time until next meal starts
    let timeToNextMeal;
    if (nextMeal.status === "tomorrow") {
      // It's tomorrow's breakfast
      timeToNextMeal =
        24 * 60 - currentTimeInMinutes + mealTimes[nextMealKey].start;
    } else {
      // It's later today
      timeToNextMeal = mealTimes[nextMealKey].start - currentTimeInMinutes;
    }
    timeUntilNext = `Starts in ${Math.floor(timeToNextMeal / 60)}h ${
      timeToNextMeal % 60
    }m`;
  }
  // If we're not in any meal, find the next upcoming one
  else {
    // Try to find the next meal today
    let foundNext = false;

    for (let j = 0; j < sortedMealKeys.length; j++) {
      const checkMealKey = sortedMealKeys[j];
      const checkMeal = mealTimes[checkMealKey];

      if (currentTimeInMinutes < checkMeal.start) {
        nextMeal = {
          key: checkMealKey,
          ...checkMeal,
          status: "upcoming",
        };

        // Calculate time until next meal
        let timeToMealStart = checkMeal.start - currentTimeInMinutes;
        timeUntilNext = `Starts in ${Math.floor(timeToMealStart / 60)}h ${
          timeToMealStart % 60
        }m`;

        foundNext = true;
        break;
      }
    }

    // If we've checked all meals and haven't found the next one,
    // it means we're after dinner and before midnight - next meal is tomorrow's breakfast
    if (!foundNext) {
      nextMeal = {
        key: "breakfast",
        ...mealTimes["breakfast"],
        status: "tomorrow",
      };

      // Calculate time until breakfast tomorrow
      let timeToBreakfast =
        24 * 60 - currentTimeInMinutes + mealTimes["breakfast"].start;
      timeUntilNext = `Starts in ${Math.floor(timeToBreakfast / 60)}h ${
        timeToBreakfast % 60
      }m`;
    }
  }

  return { currentMeal, nextMeal, timeUntilNext };
};

export default function HomePage() {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealInfo, setMealInfo] = useState({
    currentMeal: null,
    nextMeal: null,
    timeUntilNext: null,
  });
  const [greeting, setGreeting] = useState(getGreeting());
  const [hoveredMeal, setHoveredMeal] = useState(null);

  // Update meal information and greeting
  useEffect(() => {
    const updateTimeInfo = () => {
      setMealInfo(getMealInfo());
      setGreeting(getGreeting());
    };

    // Update immediately
    updateTimeInfo();

    // Update every minute
    const intervalId = setInterval(updateTimeInfo, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch menu data
  useEffect(() => {
    const loadWeeklyMenu = async () => {
      try {
        setLoading(true);
        const data = await getCurrentWeekMenu();

        // Update date labels locally
        const updatedData = data.map((menu) => ({
          ...menu,
          dateLabel: getDateLabel(menu.date),
        }));

        setWeeklyMenu(updatedData);

        // Set default tab to today if exists
        const todayMenu = updatedData.find(
          (menu) => menu.dateLabel === "Today"
        );
        if (todayMenu) {
          setActiveTab(todayMenu._id);
        } else {
          // If no today menu, default to "all"
          setActiveTab("all");
        }
      } catch (err) {
        console.error("Error loading menu:", err);
        setError("Failed to load menu data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyMenu();
  }, [currentDate]);

  // Update date at midnight
  useEffect(() => {
    // Function to check if date has changed
    const checkDateChange = () => {
      const now = getCurrentISTTime();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // If current date is different from the stored date
      if (today.getTime() !== currentDate.setHours(0, 0, 0, 0)) {
        setCurrentDate(today);
      }
    };

    // Check date change immediately
    checkDateChange();

    // Set up interval to check for date change
    const intervalId = setInterval(checkDateChange, 60000); // Check every minute

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [currentDate]);

  // Update date labels periodically
  useEffect(() => {
    const updateDateLabels = () => {
      setWeeklyMenu((prevMenu) =>
        prevMenu.map((menu) => ({
          ...menu,
          dateLabel: getDateLabel(menu.date),
        }))
      );
    };

    const intervalId = setInterval(updateDateLabels, 3600000); // Every hour

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6 max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (weeklyMenu.length === 0) {
    return (
      <Alert className="mt-6 max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No menu available</AlertTitle>
        <AlertDescription>
          There is no menu available for this week.
        </AlertDescription>
      </Alert>
    );
  }

  // Find today's menu
  const todayMenu = weeklyMenu.find((menu) => menu.dateLabel === "Today");
  const tomorrowMenu = weeklyMenu.find((menu) => menu.dateLabel === "Tomorrow");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDE2NywgMzgsIDAuMDcpIi8+PC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDE2NywgMzgsIDAuMDMpIi8+PC9zdmc+')]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 p-8 shadow-xl text-center mb-12 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-200/20 dark:hover:shadow-amber-700/20">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 800 800">
              <defs>
                <pattern
                  id="food-pattern"
                  patternUnits="userSpaceOnUse"
                  width="100"
                  height="100"
                >
                  <path
                    d="M30,10 Q50,-10 70,10 T110,10"
                    stroke="white"
                    fill="none"
                    strokeWidth="8"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#food-pattern)" />
            </svg>
          </div>

          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-200 to-amber-300"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 to-yellow-200"
            initial={{ scaleX: 0, transformOrigin: "right" }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          <div className="relative z-10 space-y-4">
            <div className="mb-2">
              <Badge className="text-amber-800 bg-amber-100 px-3 py-1 text-sm shadow-md shadow-amber-600/20 hover:shadow-lg hover:bg-white transition-all duration-300">{greeting}</Badge>
            </div>
            <motion.h1 
              className="text-3xl md:text-5xl font-extrabold tracking-tight text-white"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              Hostel Mess Menu
            </motion.h1>
            <p className="text-lg text-amber-100 max-w-2xl mx-auto">
              Your weekly meal schedule at Chandigarh University hostel
            </p>

            <AnimatePresence mode="wait">
  {(mealInfo.currentMeal || mealInfo.nextMeal) && (
    <motion.div
      key={mealInfo.currentMeal ? "current" : "next"}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.4 }}
      className="mt-6 perspective-1000 group"
    >
      <motion.div 
        className="max-w-md mx-auto transform-style-3d relative"
        whileHover={{ 
          rotateX: 5, 
          rotateY: 10,
          scale: 1.05,
          transition: { duration: 0.4 }
        }}
      >
        {/* Background card with shadow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-xl transform translate-z-0 shadow-xl dark:from-amber-500 dark:via-amber-600 dark:to-orange-700" />
        
        {/* Main card with content */}
        <div className="relative bg-white/20 backdrop-blur-md p-5 rounded-xl border border-white/40 transform translate-z-8 shadow-lg group-hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl opacity-70 overflow-hidden">
            <svg className="absolute w-32 h-32 text-white/10 top-0 right-0 transform translate-x-1/3 -translate-y-1/3 opacity-50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z" />
            </svg>
            
            <svg className="absolute w-24 h-24 text-white/10 bottom-0 left-0 transform -translate-x-1/3 translate-y-1/3 opacity-30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,19H4V15H6V19H8V15H10V19H12V15H14V19H16V15H18V19H20V15H22V13H2V15H4V19M2,5V11H6V7H10V11H14V7H18V11H22V5H2Z" />
            </svg>
          </div>
          
          {/* Shiny edge effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-50" />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-50" />
          
          {/* Content */}
          <div className="relative z-10">
            {mealInfo.currentMeal ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 font-medium shadow-md shadow-green-900/30">
                    <Star className="w-3 h-3 mr-1" />
                    Happening Now
                  </Badge>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-inner">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                
                <h3 className="text-white font-bold text-2xl mb-1 drop-shadow-sm tracking-tight">
                  {mealInfo.currentMeal.label}
                </h3>
                
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 mb-3 border border-white/20 transform translate-z-4 shadow-sm">
                  <p className="text-white/90 font-medium text-lg">
                    {todayMenu && todayMenu[mealInfo.currentMeal.key]}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <p className="text-white/90 font-medium">
                    {mealInfo.currentMeal.timeLabel}
                  </p>
                  <div className="flex items-center text-white/80 font-medium bg-white/10 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 mr-1" />
                    {mealInfo.currentMeal.timeUntilEnd}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900 px-3 py-1 font-medium shadow-md shadow-amber-900/20">
                    <Clock className="w-3 h-3 mr-1" />
                    Coming Up
                  </Badge>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-amber-900 shadow-inner">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                </div>
                
                <h3 className="text-white font-bold text-2xl mb-1 drop-shadow-sm tracking-tight">
                  {mealInfo.nextMeal.label}
                </h3>
                
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 mb-3 border border-white/20 transform translate-z-4 shadow-sm">
                  <p className="text-white/90 font-medium text-lg">
                    {mealInfo.nextMeal.status === "tomorrow" && tomorrowMenu
                      ? tomorrowMenu[mealInfo.nextMeal.key]
                      : todayMenu && todayMenu[mealInfo.nextMeal.key]}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <p className="text-white/90 font-medium">
                    {mealInfo.nextMeal.timeLabel}
                  </p>
                  <div className="flex items-center text-white/80 font-medium bg-white/10 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 mr-1" />
                    {mealInfo.timeUntilNext}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Floating dots/elements for 3D effect */}
        <motion.div 
          className="absolute w-6 h-6 rounded-full bg-white opacity-20 left-4 bottom-4 transform translate-z-12"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.2, 0.5, 0.2] 
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute w-4 h-4 rounded-full bg-white opacity-30 right-10 top-10 transform translate-z-16"
          animate={{ 
            y: [0, -7, 0],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <motion.div 
          className="absolute w-3 h-3 rounded-full bg-white opacity-20 right-6 bottom-20 transform translate-z-20"
          animate={{ 
            y: [0, -5, 0],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
          </div>
        </div>

        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="sticky top-0 z-30 py-2 bg-orange-50/80 dark:bg-slate-900/80 backdrop-blur-md">
            <TabsList className="flex flex-wrap justify-center h-auto gap-2 p-1 bg-orange-100/50 dark:bg-slate-800/50 rounded-full shadow-md">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-full transition-all duration-300 hover:bg-amber-100 dark:hover:bg-slate-700 data-[state=active]:shadow-md"
              >
                Full Week
              </TabsTrigger>
              {weeklyMenu.map((menu) => (
                <TabsTrigger
                  key={menu._id}
                  value={menu._id}
                  className={cn(
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-full transition-all duration-300 hover:bg-amber-100 dark:hover:bg-slate-700 data-[state=active]:shadow-md",
                    menu.dateLabel === "Today" && "font-medium"
                  )}
                >
                  {menu.dateLabel === "Today"
                    ? "Today"
                    : menu.dateLabel === "Tomorrow"
                    ? "Tomorrow"
                    : menu.dateLabel.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="all" className="space-y-4 mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {weeklyMenu.map((menu) => (
                  <MenuCard 
                    key={menu._id} 
                    menu={menu} 
                    mealInfo={mealInfo} 
                    onMealHover={setHoveredMeal} 
                    hoveredMeal={hoveredMeal}
                  />
                ))}
              </div>
            </TabsContent>

            {weeklyMenu.map((menu) => (
              <TabsContent key={menu._id} value={menu._id}>
                <MenuCard 
                  menu={menu} 
                  expanded 
                  mealInfo={mealInfo} 
                  onMealHover={setHoveredMeal} 
                  hoveredMeal={hoveredMeal}
                />
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}

function MenuCard({ menu, expanded = false, mealInfo, onMealHover, hoveredMeal }) {
  const date = new Date(menu.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isToday = menu.dateLabel === "Today";
  const isTomorrow = menu.dateLabel === "Tomorrow";

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("group relative", expanded ? "w-full" : "")}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-2xl transform translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2 dark:from-amber-700/10 dark:to-orange-600/10"></div>
      <Card
        className={cn(
          "relative overflow-hidden backdrop-blur-sm h-full",
          "bg-white/80 dark:bg-slate-800/80 shadow-md hover:shadow-xl transition-all duration-300",
          expanded ? "w-full border-0 shadow-xl" : "",
          isToday ? "border-2 border-amber-500 dark:border-amber-400" : "",
          isToday ? "shadow-md shadow-amber-300/30 dark:shadow-amber-700/20" : "",
          "hover:translate-y-[-3px]"
        )}
      >
        {isToday && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/10 transform rotate-45 translate-x-20 -translate-y-8" />
        )}
        
        <div className="absolute inset-x-0 h-1 top-0 bg-gradient-to-r from-amber-300/70 to-orange-400/70 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>

        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-amber-700 dark:text-amber-400">
              {menu.dateLabel}
              {isToday && (
                <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm">
                  Today
                </Badge>
              )}
              {isTomorrow && (
                <Badge
                  variant="outline"
                  className="ml-2 border-amber-400 text-amber-600 dark:text-amber-400 shadow-sm"
                >
                  Tomorrow
                </Badge>
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
            id={`${menu._id}-breakfast`}
            title={
              <div className="flex items-center flex-wrap">
                <span className="mr-1">Breakfast</span>
                <span className="text-green-600 dark:text-green-400 text-xs whitespace-nowrap">(7:30 AM - 9:00 AM)</span>
              </div>
            } 
            content={menu.breakfast} 
            icon={<Coffee className="w-5 h-5 text-amber-500" />} 
            isActive={isToday && mealInfo.currentMeal?.key === "breakfast"}
            isUpcoming={
              isToday &&
              mealInfo.nextMeal?.key === "breakfast" &&
              mealInfo.nextMeal?.status === "upcoming"
            }
            timeUntil={
              isToday &&
              mealInfo.nextMeal?.key === "breakfast" &&
              mealInfo.nextMeal?.status === "upcoming"
                ? mealInfo.timeUntilNext
                : null
            }
            timeUntilEnd={
              isToday && mealInfo.currentMeal?.key === "breakfast"
                ? mealInfo.currentMeal.timeUntilEnd
                : null
            }
            onMouseEnter={() => onMealHover(`${menu._id}-breakfast`)}
            onMouseLeave={() => onMealHover(null)}
            isHovered={hoveredMeal === `${menu._id}-breakfast`}
          />
          <MealSection
            id={`${menu._id}-lunch`}
            title={
              <>
                Lunch{" "}
                <span className="text-green-600 dark:text-green-400 text-sm font-normal">
                  (12:00 PM - 2:00 PM)
                </span>
              </>
            }
            content={menu.lunch}
            icon={<UtensilsCrossed className="w-5 h-5 text-amber-500" />}
            isActive={isToday && mealInfo.currentMeal?.key === "lunch"}
            isUpcoming={
              isToday &&
              mealInfo.nextMeal?.key === "lunch" &&
              mealInfo.nextMeal?.status === "upcoming"
            }
            timeUntil={
              isToday &&
              mealInfo.nextMeal?.key === "lunch" &&
              mealInfo.nextMeal?.status === "upcoming"
                ? mealInfo.timeUntilNext
                : null
            }
            timeUntilEnd={
              isToday && mealInfo.currentMeal?.key === "lunch"
                ? mealInfo.currentMeal.timeUntilEnd
                : null
            }
            onMouseEnter={() => onMealHover(`${menu._id}-lunch`)}
            onMouseLeave={() => onMealHover(null)}
            isHovered={hoveredMeal === `${menu._id}-lunch`}
          />
          <MealSection
            id={`${menu._id}-snacks`}
            title={
              <>
                Snacks{" "}
                <span className="text-green-600 dark:text-green-400 text-sm font-normal">
                  (4:30 PM - 5:15 PM)
                </span>
              </>
            }
            content={menu.snacks}
            icon={<Sandwich className="w-5 h-5 text-amber-500" />}
            isActive={isToday && mealInfo.currentMeal?.key === "snacks"}
            isUpcoming={
              isToday &&
              mealInfo.nextMeal?.key === "snacks" &&
              mealInfo.nextMeal?.status === "upcoming"
            }
            timeUntil={
              isToday &&
              mealInfo.nextMeal?.key === "snacks" &&
              mealInfo.nextMeal?.status === "upcoming"
                ? mealInfo.timeUntilNext
                : null
            }
            timeUntilEnd={
              isToday && mealInfo.currentMeal?.key === "snacks"
                ? mealInfo.currentMeal.timeUntilEnd
                : null
            }
            onMouseEnter={() => onMealHover(`${menu._id}-snacks`)}
            onMouseLeave={() => onMealHover(null)}
            isHovered={hoveredMeal === `${menu._id}-snacks`}
          />
          <MealSection
            id={`${menu._id}-dinner`}
            title={
              <>
                Dinner{" "}
                <span className="text-green-600 dark:text-green-400 text-sm font-normal">
                  (7:30 PM - 9:00 PM)
                </span>
              </>
            }
            content={menu.dinner}
            icon={<Soup className="w-5 h-5 text-amber-500" />}
            isActive={isToday && mealInfo.currentMeal?.key === "dinner"}
            isUpcoming={
              isToday &&
              mealInfo.nextMeal?.key === "dinner" &&
              mealInfo.nextMeal?.status === "upcoming"
            }
            timeUntil={
              isToday &&
              mealInfo.nextMeal?.key === "dinner" &&
              mealInfo.nextMeal?.status === "upcoming"
                ? mealInfo.timeUntilNext
                : null
            }
            timeUntilEnd={
              isToday && mealInfo.currentMeal?.key === "dinner"
                ? mealInfo.currentMeal.timeUntilEnd
                : null
            }
            onMouseEnter={() => onMealHover(`${menu._id}-dinner`)}
            onMouseLeave={() => onMealHover(null)}
            isHovered={hoveredMeal === `${menu._id}-dinner`}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MealSection({ 
  id, 
  title, 
  content, 
  icon, 
  isActive, 
  isUpcoming, 
  timeUntil, 
  timeUntilEnd, 
  onMouseEnter, 
  onMouseLeave, 
  isHovered 
}) {
  return (
    <div
      id={id}
      className={cn(
        "relative p-4 rounded-xl transition-all duration-300 overflow-hidden",
        isActive
          ? "bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/10 dark:to-green-600/10 border border-green-500/20"
          : isUpcoming
          ? "bg-gradient-to-br from-amber-500/10 to-amber-600/10 dark:from-amber-500/10 dark:to-amber-600/10 border border-amber-500/20"
          : "bg-white dark:bg-slate-800/40 group-hover:bg-orange-50 dark:group-hover:bg-slate-700/40",
        isHovered && "shadow-lg transform scale-[1.02]"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {(isActive || isUpcoming) && (
        <div className="absolute top-2 right-2">
          {isActive ? (
            <Badge className="bg-green-500 text-white shadow-sm">Now</Badge>
          ) : (
            <Badge className="bg-amber-400 text-amber-900 shadow-sm">Next</Badge>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 font-medium mb-2">
        {icon}
        {typeof title === "string" ? title : title}
      </div>

      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
        {content || "Not available"}
      </p>

      {(timeUntil || timeUntilEnd) && (
        <div className="mt-2 flex items-center text-sm font-medium">
          <Clock className="w-4 h-4 mr-1 text-amber-500" />
          <span className="text-amber-700 dark:text-amber-400">
            {timeUntil || timeUntilEnd}
          </span>
        </div>
      )}

    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 p-8 shadow-xl text-center mb-12">
          <Skeleton className="h-8 w-36 mx-auto mb-4 rounded bg-white/30" />
          <Skeleton className="h-12 w-72 mx-auto mb-4 rounded bg-white/30" />
          <Skeleton className="h-6 w-96 mx-auto rounded bg-white/30" />
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-lg">
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((card) => (
              <div key={card} className="space-y-6">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24 rounded" />
                      <Skeleton className="h-6 w-32 rounded" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[1, 2, 3, 4].map((section) => (
                      <div key={section} className="p-4 rounded-xl bg-white dark:bg-slate-800/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-5 w-32 rounded" />
                        </div>
                        <Skeleton className="h-4 w-full rounded mb-2" />
                        <Skeleton className="h-4 w-5/6 rounded mb-2" />
                        <Skeleton className="h-4 w-4/6 rounded" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}