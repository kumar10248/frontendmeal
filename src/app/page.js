"use client";

import { useState, useEffect } from "react";
import { getCurrentWeekMenu } from "./lib/api";



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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced background patterns */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'1\'%3E%3Ccircle cx=\'7\' cy=\'7\' r=\'1\'/%3E%3Ccircle cx=\'53\' cy=\'53\' r=\'1\'/%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'0.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      
      {/* Floating decoration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-full blur-xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 dark:from-amber-600 dark:via-orange-600 dark:to-red-600 p-8 md:p-12 shadow-2xl text-center mb-12 group animate-gradient">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 800 800">
              <defs>
                <pattern
                  id="enhanced-food-pattern"
                  patternUnits="userSpaceOnUse"
                  width="120"
                  height="120"
                >
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  >
                    <circle cx="60" cy="60" r="3" fill="white" opacity="0.3" />
                    <path
                      d="M30,20 Q60,0 90,20 Q120,40 90,60 Q60,80 30,60 Q0,40 30,20"
                      stroke="white"
                      fill="none"
                      strokeWidth="2"
                      opacity="0.2"
                    />
                  </motion.g>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#enhanced-food-pattern)" />
            </svg>
          </div>

          {/* Animated border gradients */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-200 via-white to-yellow-300"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-white to-yellow-200"
            initial={{ scaleX: 0, transformOrigin: "right" }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Enhanced content */}
          <div className="relative z-10 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4"
            >
              <Badge className="text-amber-800 bg-amber-100/90 backdrop-blur-sm px-4 py-2 text-sm shadow-lg shadow-amber-600/20 hover:shadow-xl hover:bg-white/95 transition-all duration-300 transform hover:scale-105">
                {greeting}
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            >
              <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text">
                Hostel Mess Menu
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Your delicious weekly meal schedule at{" "}
              <span className="font-semibold text-yellow-200">Chandigarh University</span> hostel
            </motion.p>

            <AnimatePresence mode="wait">
              {(mealInfo.currentMeal || mealInfo.nextMeal) && (
                <motion.div
                  key={mealInfo.currentMeal ? "current" : "next"}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-8 perspective-1000 group"
                >
                  <motion.div 
                    className="max-w-lg mx-auto transform-style-3d relative"
                    whileHover={{ 
                      rotateX: 8, 
                      rotateY: 12,
                      scale: 1.05,
                      transition: { duration: 0.4, ease: "easeOut" }
                    }}
                  >
                    {/* Enhanced shadow layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl transform translate-z-0 shadow-2xl dark:from-amber-500 dark:via-orange-600 dark:to-red-600 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 rounded-2xl transform translate-x-1 translate-y-1 translate-z-0 shadow-xl dark:from-yellow-400 dark:via-amber-500 dark:to-orange-600 opacity-60" />
                    
                    {/* Main enhanced card */}
                    <div className="relative glass backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/50 transform translate-z-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                      {/* Enhanced background with animated elements */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 rounded-2xl overflow-hidden">
                        {/* Animated food icons */}
                        <motion.svg 
                          className="absolute w-20 h-20 text-white/8 top-4 right-4 transform"
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <path d="M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z" />
                        </motion.svg>
                        
                        <motion.svg 
                          className="absolute w-16 h-16 text-white/6 bottom-4 left-4 transform"
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          animate={{ rotate: [0, -3, 3, 0] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        >
                          <path d="M2,19H4V15H6V19H8V15H10V19H12V15H14V19H16V15H18V19H20V15H22V13H2V15H4V19M2,5V11H6V7H10V11H14V7H18V11H22V5H2Z" />
                        </motion.svg>
                        
                        {/* Subtle shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </div>
                      
                      {/* Enhanced edge glow effects */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent" />
                      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent" />
                      
                      {/* Enhanced content */}
                      <div className="relative z-10">
                        {mealInfo.currentMeal ? (
                          <>
                            <div className="flex items-center justify-between mb-4">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                              >
                                <Badge className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 text-white px-4 py-2 font-semibold shadow-lg shadow-green-900/40 text-sm">
                                  <Star className="w-4 h-4 mr-2" />
                                  Happening Now
                                </Badge>
                              </motion.div>
                              <motion.div 
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/40"
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Clock className="w-6 h-6" />
                              </motion.div>
                            </div>
                            
                            <motion.h3 
                              className="text-white font-bold text-3xl mb-3 drop-shadow-lg tracking-tight"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                            >
                              {mealInfo.currentMeal.label}
                            </motion.h3>
                            
                            <motion.div 
                              className="glass-dark backdrop-blur-xl rounded-xl p-4 mb-4 border border-white/30 transform translate-z-4 shadow-lg"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                            >
                              <p className="text-white/95 font-medium text-lg leading-relaxed">
                                {todayMenu && todayMenu[mealInfo.currentMeal.key]}
                              </p>
                            </motion.div>
                            
                            <motion.div 
                              className="flex items-center justify-between text-sm"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5, duration: 0.5 }}
                            >
                              <p className="text-white/90 font-medium text-base">
                                {mealInfo.currentMeal.timeLabel}
                              </p>
                              <div className="flex items-center text-white/90 font-semibold glass px-4 py-2 rounded-full shadow-md">
                                <Clock className="w-4 h-4 mr-2" />
                                {mealInfo.currentMeal.timeUntilEnd}
                              </div>
                            </motion.div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-4">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                              >
                                <Badge className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 text-amber-900 px-4 py-2 font-semibold shadow-lg shadow-amber-900/30 text-sm">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Coming Up Next
                                </Badge>
                              </motion.div>
                              <motion.div 
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-amber-900 shadow-lg shadow-amber-600/40"
                                whileHover={{ scale: 1.1, rotate: -15 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <UtensilsCrossed className="w-6 h-6" />
                              </motion.div>
                            </div>
                            
                            <motion.h3 
                              className="text-white font-bold text-3xl mb-3 drop-shadow-lg tracking-tight"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                            >
                              {mealInfo.nextMeal.label}
                            </motion.h3>
                            
                            <motion.div 
                              className="glass-dark backdrop-blur-xl rounded-xl p-4 mb-4 border border-white/30 transform translate-z-4 shadow-lg"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                            >
                              <p className="text-white/95 font-medium text-lg leading-relaxed">
                                {mealInfo.nextMeal.status === "tomorrow" && tomorrowMenu
                                  ? tomorrowMenu[mealInfo.nextMeal.key]
                                  : todayMenu && todayMenu[mealInfo.nextMeal.key]}
                              </p>
                            </motion.div>
                            
                            <motion.div 
                              className="flex items-center justify-between text-sm"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5, duration: 0.5 }}
                            >
                              <p className="text-white/90 font-medium text-base">
                                {mealInfo.nextMeal.timeLabel}
                              </p>
                              <div className="flex items-center text-white/90 font-semibold glass px-4 py-2 rounded-full shadow-md">
                                <Clock className="w-4 h-4 mr-2" />
                                {mealInfo.timeUntilNext}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced floating elements for 3D effect */}
                    <motion.div 
                      className="absolute w-8 h-8 rounded-full bg-white/30 left-6 bottom-6 transform translate-z-12 backdrop-blur-sm"
                      animate={{ 
                        y: [0, -15, 0],
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    />
                    <motion.div 
                      className="absolute w-6 h-6 rounded-full bg-white/40 right-12 top-12 transform translate-z-16 backdrop-blur-sm"
                      animate={{ 
                        y: [0, -10, 0],
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 0.8, 1] 
                      }}
                      transition={{ 
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.7
                      }}
                    />
                    <motion.div 
                      className="absolute w-4 h-4 rounded-full bg-white/20 right-8 bottom-24 transform translate-z-20 backdrop-blur-sm"
                      animate={{ 
                        y: [0, -8, 0],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.4, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.4
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
          <div className="sticky top-0 z-30 py-4 glass backdrop-blur-xl border-b border-white/10">
            <TabsList className="flex flex-wrap justify-center h-auto gap-3 p-2 glass-dark backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 px-4 py-2 font-medium text-sm"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Full Week
              </TabsTrigger>
              {weeklyMenu.map((menu, index) => (
                <motion.div
                  key={menu._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <TabsTrigger
                    value={menu._id}
                    className={cn(
                      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 px-4 py-2 font-medium text-sm relative overflow-hidden",
                      menu.dateLabel === "Today" && "ring-2 ring-amber-400/50 font-bold",
                      menu.dateLabel === "Tomorrow" && "ring-1 ring-amber-300/30"
                    )}
                  >
                    {/* Special indicator for today */}
                    {menu.dateLabel === "Today" && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-xl"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    
                    <span className="relative z-10 flex items-center">
                      {menu.dateLabel === "Today" && <Star className="w-3 h-3 mr-1" />}
                      {menu.dateLabel === "Today"
                        ? "Today"
                        : menu.dateLabel === "Tomorrow"
                        ? "Tomorrow"
                        : menu.dateLabel.slice(0, 3)}
                    </span>
                  </TabsTrigger>
                </motion.div>
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
      initial={{ scale: 0.96, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("group relative", expanded ? "w-full" : "")}
      whileHover={{ y: -8 }}
    >
      {/* Enhanced shadow layers with multiple depths */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 via-orange-300/20 to-red-300/10 rounded-3xl transform translate-x-2 translate-y-2 transition-all duration-300 group-hover:translate-x-3 group-hover:translate-y-3 dark:from-amber-700/20 dark:via-orange-600/15 dark:to-red-600/10 blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 via-orange-400/15 to-red-400/10 rounded-3xl transform translate-x-1 translate-y-1 transition-all duration-300 group-hover:translate-x-2 group-hover:translate-y-2 dark:from-amber-600/15 dark:via-orange-500/10 dark:to-red-500/10"></div>
      
      <Card
        className={cn(
          "relative overflow-hidden glass backdrop-blur-xl h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500",
          expanded ? "w-full shadow-2xl" : "",
          isToday ? "ring-2 ring-amber-400/60 shadow-amber-300/40 dark:ring-amber-500/50" : "",
          isTomorrow ? "ring-1 ring-amber-300/40" : "",
          "group-hover:shadow-orange-500/20 dark:group-hover:shadow-orange-700/30"
        )}
      >
        {/* Enhanced background effects */}
        {isToday && (
          <>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/15 via-orange-500/10 to-transparent rounded-full transform translate-x-16 -translate-y-16" />
            <motion.div 
              className="absolute top-4 right-4 w-6 h-6 bg-amber-400 rounded-full shadow-lg"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}
        
        {/* Animated top border gradient */}
        <motion.div 
          className="absolute inset-x-0 h-1 top-0 bg-gradient-to-r from-amber-400/80 via-orange-500/80 to-red-500/80 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: isToday ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        />

        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold text-amber-700 dark:text-amber-400">
                {menu.dateLabel}
                {isToday && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.3 }}
                  >
                    <Badge className="ml-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Today
                    </Badge>
                  </motion.div>
                )}
                {isTomorrow && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.3 }}
                  >
                    <Badge
                      variant="outline"
                      className="ml-2 border-amber-400 text-amber-600 dark:text-amber-400 shadow-sm bg-amber-50/50 dark:bg-amber-900/20 px-3 py-1"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Tomorrow
                    </Badge>
                  </motion.div>
                )}
              </CardTitle>
            </motion.div>
            {!expanded && (
              <motion.div 
                className="flex items-center text-sm text-amber-600 dark:text-amber-400 glass px-3 py-1 rounded-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {formattedDate}
              </motion.div>
            )}
          </div>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardDescription className="text-base text-amber-600 dark:text-amber-400 flex items-center glass px-3 py-2 rounded-lg mt-2">
                <CalendarDays className="inline mr-2 h-4 w-4" />
                {formattedDate}
              </CardDescription>
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <MealSection 
            id={`${menu._id}-breakfast`}
            title="Breakfast"
            timeLabel="7:30 AM - 9:00 AM"
            content={menu.breakfast} 
            icon={<Coffee className="w-5 h-5" />} 
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
            title="Lunch"
            timeLabel="12:00 PM - 2:00 PM"
            content={menu.lunch}
            icon={<UtensilsCrossed className="w-5 h-5" />}
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
            title="Snacks"
            timeLabel="4:30 PM - 5:15 PM"
            content={menu.snacks}
            icon={<Sandwich className="w-5 h-5" />}
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
            title="Dinner"
            timeLabel="7:30 PM - 9:00 PM"
            content={menu.dinner}
            icon={<Soup className="w-5 h-5" />}
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
  timeLabel, 
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
    <motion.div
      id={id}
      className={cn(
        "relative rounded-2xl transition-all duration-500 overflow-hidden cursor-pointer group border",
        isActive
          ? "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/50 dark:via-emerald-950/30 dark:to-green-900/50 border-green-200 dark:border-green-800 shadow-lg shadow-green-500/20"
          : isUpcoming
          ? "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-amber-950/50 dark:via-orange-950/30 dark:to-yellow-900/50 border-amber-200 dark:border-amber-800 shadow-lg shadow-amber-500/20"
          : "bg-gradient-to-br from-white via-slate-50 to-gray-100 dark:from-slate-900/80 dark:via-slate-800/60 dark:to-slate-700/40 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg hover:shadow-amber-500/10",
        isHovered && "shadow-xl transform scale-[1.02] border-amber-400/60 shadow-amber-500/30"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Status indicator ribbon */}
      <AnimatePresence>
        {(isActive || isUpcoming) && (
          <motion.div 
            className="absolute top-0 right-0 z-20"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: "spring", bounce: 0.6 }}
          >
            {isActive ? (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-lg">
                <div className="flex items-center text-xs font-bold">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full mr-2"
                  />
                  LIVE
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-lg">
                <div className="flex items-center text-xs font-bold">
                  <Clock className="w-3 h-3 mr-1" />
                  NEXT
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        {/* Header Section */}
        <motion.div 
          className="flex items-start justify-between mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className={cn(
                "p-3 rounded-xl shadow-md transition-all duration-300",
                isActive ? "bg-green-500 text-white shadow-green-500/30" :
                isUpcoming ? "bg-amber-500 text-white shadow-amber-500/30" :
                "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400 group-hover:from-amber-200 group-hover:to-orange-200 dark:group-hover:from-amber-800/50 dark:group-hover:to-orange-800/50"
              )}
              whileHover={{ scale: 1.1, rotate: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
            <div>
              <h3 className={cn(
                "text-xl font-bold mb-1 transition-colors duration-300",
                isActive ? "text-green-700 dark:text-green-300" :
                isUpcoming ? "text-amber-700 dark:text-amber-300" :
                "text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-300"
              )}>
                {title}
              </h3>
              <p className={cn(
                "text-sm font-medium transition-colors duration-300",
                isActive ? "text-green-600 dark:text-green-400" :
                isUpcoming ? "text-amber-600 dark:text-amber-400" :
                "text-slate-500 dark:text-slate-400"
              )}>
                {timeLabel}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={cn(
            "p-4 rounded-xl border transition-all duration-300",
            isActive ? "bg-white/70 dark:bg-green-950/30 border-green-200/50 dark:border-green-700/30" :
            isUpcoming ? "bg-white/70 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-700/30" :
            "bg-white/90 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/30 group-hover:bg-amber-50/80 dark:group-hover:bg-amber-950/20 group-hover:border-amber-300/50 dark:group-hover:border-amber-600/30"
          )}>
            {content ? (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {content}
              </p>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <UtensilsCrossed className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 italic text-sm">
                    Menu not available yet
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Timing Information */}
        <AnimatePresence>
          {(timeUntil || timeUntilEnd) && (
            <motion.div 
              className="flex items-center justify-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                "flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-300",
                isActive ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30" :
                "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30"
              )}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Clock className="w-4 h-4" />
                </motion.div>
                {timeUntil || timeUntilEnd}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hover Effect Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-orange-500/5 to-yellow-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
      
      {/* Subtle animated border on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(245, 158, 11, 0.1) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-400/5 to-orange-500/5 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 rounded-full blur-xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Enhanced hero skeleton */}
        <motion.div 
          className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 dark:from-amber-600 dark:via-orange-600 dark:to-red-600 p-8 md:p-12 shadow-2xl text-center mb-12 animate-gradient"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Skeleton className="h-8 w-36 mx-auto mb-4 rounded-full bg-white/30 animate-pulse-slow" />
            <Skeleton className="h-16 w-96 max-w-full mx-auto mb-4 rounded-2xl bg-white/30 animate-pulse-slow" />
            <Skeleton className="h-6 w-80 max-w-full mx-auto rounded-xl bg-white/30 animate-pulse-slow" />
            
            {/* Skeleton meal info card */}
            <motion.div
              className="mt-8 max-w-lg mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="glass backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-8 w-32 rounded-full bg-white/40 animate-shimmer" />
                  <Skeleton className="h-12 w-12 rounded-full bg-white/40 animate-shimmer" />
                </div>
                <Skeleton className="h-8 w-40 mb-3 rounded-lg bg-white/40 animate-shimmer" />
                <Skeleton className="h-20 w-full mb-4 rounded-xl bg-white/40 animate-shimmer" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32 rounded-lg bg-white/40 animate-shimmer" />
                  <Skeleton className="h-8 w-24 rounded-full bg-white/40 animate-shimmer" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced tabs skeleton */}
        <motion.div 
          className="glass backdrop-blur-xl border-b border-white/10 p-4 rounded-2xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex justify-center space-x-3 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
              >
                <Skeleton className="h-12 w-20 rounded-xl animate-shimmer" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced cards skeleton */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {[1, 2, 3].map((card) => (
            <motion.div 
              key={card} 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + card * 0.1, duration: 0.5 }}
            >
              <Card className="overflow-hidden glass backdrop-blur-xl border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-28 rounded-xl animate-shimmer" />
                    <Skeleton className="h-6 w-36 rounded-full animate-shimmer" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3, 4].map((section) => (
                    <motion.div 
                      key={section} 
                      className="glass-dark p-5 rounded-2xl border border-white/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 + section * 0.1, duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Skeleton className="h-10 w-10 rounded-xl animate-shimmer" />
                        <Skeleton className="h-6 w-24 rounded-lg animate-shimmer" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full rounded animate-shimmer" />
                        <Skeleton className="h-4 w-5/6 rounded animate-shimmer" />
                        <Skeleton className="h-4 w-4/6 rounded animate-shimmer" />
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}