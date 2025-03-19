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

          <div className="relative z-10 space-y-4">
            <div className="mb-2">
              <Badge className="text-amber-800 bg-amber-100">{greeting}</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Hostel Mess Menu
            </h1>
            <p className="text-lg text-amber-100 max-w-2xl mx-auto">
              Your weekly meal schedule at Chandigarh University hostel
            </p>

            <AnimatePresence mode="wait">
              {(mealInfo.currentMeal || mealInfo.nextMeal) && (
                <motion.div
                  key={mealInfo.currentMeal ? "current" : "next"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-6 bg-white/20 backdrop-blur-sm p-4 rounded-xl max-w-md mx-auto"
                >
                  {mealInfo.currentMeal ? (
                    <>
                      <Badge className="bg-green-500 text-white mb-2">
                        Happening Now
                      </Badge>
                      <p className="text-white font-medium text-lg">
                        {mealInfo.currentMeal.label} (
                        {mealInfo.currentMeal.timeLabel})
                      </p>
                      <p className="text-white/90 mt-1">
                        {todayMenu && todayMenu[mealInfo.currentMeal.key]}
                      </p>
                      <div className="mt-2 flex items-center justify-center text-white/80 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {mealInfo.currentMeal.timeUntilEnd}
                      </div>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-amber-200 text-amber-800 mb-2">
                        Coming Up
                      </Badge>
                      <p className="text-white font-medium text-lg">
                        {mealInfo.nextMeal.label} ({mealInfo.nextMeal.timeLabel}
                        )
                      </p>
                      <p className="text-white/90 mt-1">
                        {mealInfo.nextMeal.status === "tomorrow" && tomorrowMenu
                          ? tomorrowMenu[mealInfo.nextMeal.key]
                          : todayMenu && todayMenu[mealInfo.nextMeal.key]}
                      </p>
                      <div className="mt-2 flex items-center justify-center text-white/80 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {mealInfo.timeUntilNext}
                      </div>
                    </>
                  )}
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
                  <MenuCard key={menu._id} menu={menu} mealInfo={mealInfo} />
                ))}
              </div>
            </TabsContent>

            {weeklyMenu.map((menu) => (
              <TabsContent key={menu._id} value={menu._id}>
                <MenuCard menu={menu} expanded mealInfo={mealInfo} />
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}

function MenuCard({ menu, expanded = false, mealInfo }) {
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
      <Card
        className={cn(
          "relative overflow-hidden backdrop-blur-sm h-full",
          "bg-white/80 dark:bg-slate-800/80 shadow-md hover:shadow-xl transition-shadow",
          expanded ? "w-full border-0 shadow-xl" : "",
          isToday ? "border-2 border-amber-500 dark:border-amber-400" : ""
        )}
      >
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
                <Badge
                  variant="outline"
                  className="ml-2 border-amber-400 text-amber-600 dark:text-amber-400"
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
            title={
              <div className="flex items-center flex-wrap">
                <span className="mr-1">Breakfast</span>
                <span className="text-green-600 dark:text-green-400 font-normal text-sm whitespace-nowrap">
                  (7:30 AM - 9:00 AM)
                </span>
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
          />
          <MealSection
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
          />
          <MealSection
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
          />
          <MealSection
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
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MealSection({
  title,
  content,
  icon,
  isActive,
  isUpcoming,
  timeUntil,
  timeUntilEnd,
}) {
  return (
    <div
      className={cn(
        "space-y-3 p-4 rounded-xl transition-colors",
        isActive
          ? "bg-amber-100/60 dark:bg-amber-900/30"
          : "hover:bg-amber-50 dark:hover:bg-slate-700/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            isActive
              ? "bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-700 dark:to-orange-700"
              : "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700"
          )}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-amber-800 dark:text-amber-300 flex items-center flex-wrap">
          {title}
          {isActive && (
            <Badge className="ml-2 bg-green-500 text-white text-xs">
              Now Serving
            </Badge>
          )}
          {isUpcoming && (
            <Badge className="ml-2 bg-amber-300 text-amber-800 text-xs">
              Coming Up
            </Badge>
          )}
        </h3>
      </div>
      <p
        className={cn(
          "text-gray-700 dark:text-gray-300 pl-12 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px",
          isActive
            ? "before:bg-gradient-to-b before:from-amber-300 before:to-orange-300 dark:before:from-amber-600 dark:before:to-orange-600 font-medium"
            : "before:bg-gradient-to-b before:from-amber-200 before:to-orange-200 dark:before:from-amber-800 dark:before:to-orange-800"
        )}
      >
        {content}

        {timeUntil && (
          <div className="mt-2 text-green-600 dark:text-green-400 text-xs font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeUntil}
          </div>
        )}

        {isActive && timeUntilEnd && (
          <div className="mt-2 text-orange-600 dark:text-orange-400 text-xs font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeUntilEnd}
          </div>
        )}
      </p>
    </div>
  );
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
          <Card
            key={i}
            className="overflow-hidden backdrop-blur-sm relative bg-white/80 dark:bg-slate-800/80"
          >
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
  );
}
