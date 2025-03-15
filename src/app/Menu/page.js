"use client"

import { useState, useEffect } from 'react'
import { getCurrentWeekMenu } from '../lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { 
  CalendarDays, 
  AlertCircle, 
  Utensils, 
  Sunrise, 
  Soup, 
  Moon, 
  BarChart3, 
  Info,
  PieChart,
  HelpCircle
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Improved calorie database organization
const calorieDatabase = {
  // Breakfast items
  "Stuffed Aloo Paratha": 240,
  "Aloo Pyaaz Parantha": 230,
  "Aloo Bhaji": 120,
  "Besan Chilla": 145,
  "Bhature": 300,
  "Bombay Sandwich": 200,
  "Banana": 89,
  "Bread": 265,
  "Boiled Egg": 155,
  "Butter": 717,//done
  "Butter & Jam": 350,
  "Chapati": 300,
  "Chhole": 165,
  "Cornflakes": 380,
  "Curd": 60,
  "Green Chutney": 120,
  "Idli": 150,
  "Jam": 250,
  "Kanda Poha": 170,
  "Lachha onion": 30,
  "Masala Omelette": 170,
  "Masala Poori": 310,
  "Milk": 42,
  "Mix Pickle": 65,
  "Namkeen Dalia": 160,
  "Plain Curd": 70,
  "Poha": 170,
  "Sweet dalia": 175,
  "Tea": 100,
  "Thepla": 240,
  "Tomato Ketchup": 110,
  "Upma": 165,
  "Veg Upma": 165,

  // Lunch/Dinner items
  "Aachari Ghiya": 100,
  "Aloo Gobhi": 111,
  "fruit raitha": 60,
  "Aloo Matar": 115,
  "Amritsari Chhole": 145,
  "Boondi Raita": 75,
  "Chana Dal Palak": 120,
  "Chapati Coriander Rice": 150,
  "Chicken Curry": 180,
  "Chicken Curry Homestyle": 185,
  "Cucumber Raita": 45,
  "Coriander Rice": 220,
  "Beet cucumber salad": 40,
  "Dal": 120,
  "Dal Fry": 125,
  "Dal Makhani": 130,
  "Dhaba Dal Fry": 130,
  "Egg Masala": 170,
  "Fryem": 150,
  "Garlic Fried Rice": 170,
  "Ghiya Raita": 50,
  "Green Mong Dal": 115,
  "Green Salad": 17,
  "Jeera Aloo": 130,
  "Jeera Rice": 140,
  "Kadai Paneer": 190,
  "Kadhai Mushroom": 130,
  "Kadhai Veg": 115,
  "Kadhi Pakora": 140,
  "Kala Chana Tari Wala": 130,
  "Kung pao soya": 150,
  "Malka Masoor Dal": 125,
  "Mint Cucumber Raita": 55,
  "Mint-Onion Pulao": 165,
  "Mixed Raita": 60,
  "Mix Veg Curry": 100,
  "Mix-veg Raita": 60,
  "Mix Pickle": 80,
  "Mushroom Do Payaza": 120,
  "Panchmel Dal": 125,
  "Paneer Butter Masala": 200,
  "Paneer Karachi": 195,
  "Rajma": 115,
  "Rajma Masala": 203,
  "Rajma Rasila": 120,
  "Rice": 130,
  "Sabut matar Dal": 120,
  "Sabut masoor Dal": 168,
  "Tawa veg": 81,
  "Veg Biryani": 170,
  "Salad": 25,
  "Sev Tamatar": 110,
  "Sirca Onion": 40,
  "Sirka Onion": 40,
  "Sprouted Bean Salad": 80,
  "Steamed Rice": 130,
  "Streamed Rice": 130,
  "Tamatar ka Salan": 105,
  "Thai Pickle": 85,
  "Veg Dum Biryani": 170,
  "Veg Jalfrezi": 120,
  "Veg Kofta Curry": 145,
  "Veg Nutri Keema": 130,
  "Yellow Dal Tadka": 125,
  "Sewaiya": 157,
  
  // Snacks
  "Biscuit": 480,
  "Biscuits": 480,
  "Cake": 350,
  "Chips": 520,
  "Coffee": 35,
  "Dhokla": 160,
  "Maggi": 440,
  "Matthi": 470,
  "Mix Pakora": 280,
  "Mix-Pakora": 280,
  "Namkeen": 500,
  "Pakora": 280,
  "Pav Bhaji": 165,
  "Samosa": 310,
  "Sweet Roll": 320,
  "Tamrind Chutney": 110,
  "Tamrind chutney": 110,
  "Vada": 270
}

// Define nutrition categories and calorie limits
const NUTRITION_CATEGORIES = {
  daily: {
    low: 1800,
    medium: 2400,
    high: Infinity
  },
  meal: {
    low: 500,
    medium: 800,
    high: Infinity
  },
  item: {
    low: 150,
    medium: 250,
    high: Infinity
  }
}

// Improved function to extract individual food items from menu strings
const extractFoodItems = (menuString) => {
  if (!menuString) return [];
  
  // Replace common separators with a standard one
  const standardized = menuString
    .replace(/\s*[,&+\/]\s*/g, ', ')
    .replace(/\s*and\s*/gi, ', ')
    .replace(/\s*with\s*/gi, ', ');
  
  // Replace parenthetical content with empty string (e.g., "Samosa(girls)" -> "Samosa")
  const withoutParentheses = standardized.replace(/\([^)]*\)/g, '');
  
  // Split into individual items
  return withoutParentheses.split(', ')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// Enhanced function to get calorie information for a food item
const getCalories = (foodItem) => {
  // First try an exact match
  if (calorieDatabase[foodItem]) {
    return calorieDatabase[foodItem];
  }
  
  // Try with normalized item (lowercase and without trailing punctuation)
  const normalizedItem = foodItem.toLowerCase().replace(/[.,]$/, '');
  
  // Look for exact match with normalized item
  for (const [dbItem, calories] of Object.entries(calorieDatabase)) {
    if (dbItem.toLowerCase() === normalizedItem) {
      return calories;
    }
  }
  
  // Try with item name as substring of database entries or vice versa
  for (const [dbItem, calories] of Object.entries(calorieDatabase)) {
    if (dbItem.toLowerCase().includes(normalizedItem) || 
        normalizedItem.includes(dbItem.toLowerCase())) {
      return calories;
    }
  }
  
  // Return null if no match found
  return null;
}

// Function to calculate total calories for a meal
const calculateMealCalories = (menuString) => {
  const items = extractFoodItems(menuString);
  let totalCalories = 0;
  let itemsWithCalories = [];
  let unknownItems = [];
  
  items.forEach(item => {
    const calories = getCalories(item);
    if (calories !== null) {
      totalCalories += calories;
      itemsWithCalories.push({ name: item, calories });
    } else {
      unknownItems.push(item);
    }
  });
  
  return {
    totalCalories,
    itemsWithCalories,
    unknownItems
  };
}

// Helper function to get color class based on calorie value and category
const getCalorieColorClass = (calories, category = 'meal') => {
  const limits = NUTRITION_CATEGORIES[category];
  
  if (calories <= limits.low) return "text-green-600";
  if (calories <= limits.medium) return "text-yellow-600";
  return "text-red-600";
}

// Helper function to get badge color class for food items
const getItemBadgeClass = (calories) => {
  const limits = NUTRITION_CATEGORIES.item;
  
  if (calories <= limits.low) return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
  if (calories <= limits.medium) return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
  return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
}

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

// Main component
export default function CaloriesPage() {
  const [weeklyMenu, setWeeklyMenu] = useState([])
  const [processedMenu, setProcessedMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNutritionGuide, setShowNutritionGuide] = useState(false)

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
        
        // Calculate calories for each menu
        const processedData = updatedData.map(menu => {
          const breakfastCalories = calculateMealCalories(menu.breakfast);
          const lunchCalories = calculateMealCalories(menu.lunch);
          const snacksCalories = calculateMealCalories(menu.snacks);
          const dinnerCalories = calculateMealCalories(menu.dinner);
          
          const totalDailyCalories = 
            breakfastCalories.totalCalories + 
            lunchCalories.totalCalories + 
            snacksCalories.totalCalories + 
            dinnerCalories.totalCalories;
          
          // Calculate macro distributions (simplified estimation)
          const totalItems = [
            ...breakfastCalories.itemsWithCalories,
            ...lunchCalories.itemsWithCalories,
            ...snacksCalories.itemsWithCalories,
            ...dinnerCalories.itemsWithCalories
          ];
          
          // Estimate macros based on food categories
          const estimatedMacros = estimateMacros(totalItems);
            
          return {
            ...menu,
            calorieInfo: {
              breakfast: breakfastCalories,
              lunch: lunchCalories,
              snacks: snacksCalories,
              dinner: dinnerCalories,
              totalDaily: totalDailyCalories,
              macros: estimatedMacros
            }
          };
        });
        
        setProcessedMenu(processedData);
        
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
  }, [currentDate]) // Re-fetch when currentDate changes

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

  // Simple function to estimate macros based on food types
  // This is a simplified approach - for accurate data, you'd need a more comprehensive database
  const estimateMacros = (foodItems) => {
    // Default distribution for Indian mess food (approximation)
    let carbs = 0.55; // 55% carbs
    let protein = 0.15; // 15% protein
    let fat = 0.30; // 30% fat
    
    // Adjust slightly based on food types
    const itemNames = foodItems.map(item => item.name.toLowerCase());
    
    // Check for high protein foods
    const highProteinFoods = itemNames.filter(name => 
      name.includes('egg') || 
      name.includes('chicken') || 
      name.includes('paneer') ||
      name.includes('dal') ||
      name.includes('curd')
    ).length;
    
    // Check for high fat foods
    const highFatFoods = itemNames.filter(name => 
      name.includes('butter') || 
      name.includes('fry') || 
      name.includes('fried') ||
      name.includes('pakora') ||
      name.includes('cream')
    ).length;
    
    // Adjust ratios slightly based on food counts
    if (highProteinFoods > 2) {
      protein += 0.05;
      carbs -= 0.05;
    }
    
    if (highFatFoods > 2) {
      fat += 0.05;
      carbs -= 0.05;
    }
    
    return { carbs, protein, fat };
  };

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (processedMenu.length === 0) {
    return (
      <Alert className="max-w-2xl mx-auto mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No menu available</AlertTitle>
        <AlertDescription>There is no menu available for this week.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent">
            Mess Menu Nutrition Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor your daily calorie intake and make healthier choices with our mess menu nutrition tracker
          </p>
          
          {/* Nutrition information panel */}
          <div className="mt-4 mb-2">
            <button 
              onClick={() => setShowNutritionGuide(!showNutritionGuide)}
              className="text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 
                         py-1 px-3 rounded-md inline-flex items-center gap-1 transition-colors
                         hover:bg-blue-100 dark:hover:bg-blue-800/30"
            >
              <HelpCircle size={16} />
              {showNutritionGuide ? "Hide Nutrition Guide" : "Show Nutrition Guide"}
            </button>
          </div>
          
          {showNutritionGuide && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4"
            >
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                Nutrition Information
              </h3>
              <p className="text-sm mb-3">All calorie values shown are estimates per 100g of serving size. Your actual calorie intake will depend on portion sizes.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">Low Calorie</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Meals: ≤500 kcal</li>
                    <li>Items: ≤150 kcal</li>
                    <li>Daily: ≤1800 kcal</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">Medium Calorie</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Meals: 501-800 kcal</li>
                    <li>Items: 151-250 kcal</li>
                    <li>Daily: 1801-2400 kcal</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  <h4 className="font-medium text-red-700 dark:text-red-300 mb-1">High Calorie</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Meals: {'>'}800 kcal</li>
                    <li>Items: {'>'}250 kcal</li>
                    <li>Daily: {'>'}2400 kcal</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Note: Daily calorie needs vary based on age, gender, weight, height, and activity level. These classifications are general guidelines.
              </p>
            </motion.div>
          )}
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative overflow-x-auto pb-2">
            <TabsList className="mb-6 flex h-auto bg-transparent px-2 py-2 gap-2 overflow-x-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white
                           dark:data-[state=active]:from-green-500 dark:data-[state=active]:to-teal-500 whitespace-nowrap"
              >
                Full Week
              </TabsTrigger>
              {processedMenu.map((menu) => (
                <TabsTrigger
                  key={menu._id}
                  value={menu._id}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white
                             dark:data-[state=active]:from-green-500 dark:data-[state=active]:to-teal-500 whitespace-nowrap"
                >
                  {menu.dateLabel}
                  {menu.dateLabel === 'Today' && (
                    <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-green-300 inline-block"></span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedMenu.map((menu) => (
                <CalorieCardSummary 
                  key={menu._id} 
                  menu={menu} 
                  onViewDetails={() => setActiveTab(menu._id)} 
                />
              ))}
            </div>
          </TabsContent>

          {processedMenu.map((menu) => (
            <TabsContent key={menu._id} value={menu._id}>
              <CalorieCardDetailed menu={menu} />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  )
}

// Summary card component for the week view
function CalorieCardSummary({ menu, onViewDetails }) {
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
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full cursor-pointer"
      onClick={onViewDetails}
    >
      <Card className={cn(
        "h-full flex flex-col relative backdrop-blur-sm hover:shadow-md transition-shadow",
        isToday ? "border-2 border-green-500/20 dark:border-green-400/20" : ""
      )}>
        {isToday && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 transform rotate-45 translate-x-12 -translate-y-6" />
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              {menu.dateLabel}
              {isToday && (
                <Badge className="ml-2 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-500 dark:to-teal-500">
                  Today
                </Badge>
              )}
              {isTomorrow && (
                <Badge variant="outline" className="ml-2">Tomorrow</Badge>
              )}
            </CardTitle>
          </div>
          <CardDescription className="text-sm flex items-center">
            <CalendarDays className="mr-1 h-4 w-4 text-teal-500 dark:text-teal-400" />
            {formattedDate}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-3 rounded-lg flex justify-between items-center">
              <span className="font-semibold">Daily Total:</span>
              <span className={cn("font-bold", getCalorieColorClass(menu.calorieInfo.totalDaily, 'daily'))}>
                {menu.calorieInfo.totalDaily} kcal
              </span>
            </div>
            
            {/* Macronutrient distribution - visualization */}
            <div className="flex items-center justify-center py-2 px-1 bg-white dark:bg-gray-800 rounded-md">
              <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-yellow-400 dark:bg-yellow-600" 
                  style={{ width: `${menu.calorieInfo.macros.carbs * 100}%` }}
                  title={`Carbs: ${Math.round(menu.calorieInfo.macros.carbs * 100)}%`}
                ></div>
                <div 
                  className="h-full bg-green-400 dark:bg-green-600" 
                  style={{ width: `${menu.calorieInfo.macros.protein * 100}%` }}
                  title={`Protein: ${Math.round(menu.calorieInfo.macros.protein * 100)}%`}
                ></div>
                <div 
                  className="h-full bg-blue-400 dark:bg-blue-600" 
                  style={{ width: `${menu.calorieInfo.macros.fat * 100}%` }}
                  title={`Fat: ${Math.round(menu.calorieInfo.macros.fat * 100)}%`}
                ></div>
              </div>
            </div>
            <div className="flex text-xs justify-between px-1">
              <span className="text-yellow-600 dark:text-yellow-400">Carbs {Math.round(menu.calorieInfo.macros.carbs * 100)}%</span>
              <span className="text-green-600 dark:text-green-400">Protein {Math.round(menu.calorieInfo.macros.protein * 100)}%</span>
              <span className="text-blue-600 dark:text-blue-400">Fat {Math.round(menu.calorieInfo.macros.fat * 100)}%</span>
            </div>
            
          
            <div className="space-y-2">
<MealSummaryRow 
                icon={<Sunrise className="w-4 h-4 text-orange-500" />}
                label="Breakfast"
                calories={menu.calorieInfo.breakfast.totalCalories}
                category="meal"
              />
              <MealSummaryRow 
                icon={<Utensils className="w-4 h-4 text-green-500" />}
                label="Lunch"
                calories={menu.calorieInfo.lunch.totalCalories}
                category="meal"
              />
              <MealSummaryRow 
                icon={<Soup className="w-4 h-4 text-amber-500" />}
                label="Snacks"
                calories={menu.calorieInfo.snacks.totalCalories}
                category="meal"
              />
              <MealSummaryRow 
                icon={<Moon className="w-4 h-4 text-blue-500" />}
                label="Dinner"
                calories={menu.calorieInfo.dinner.totalCalories}
                category="meal"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Meal summary row component for summary cards
function MealSummaryRow({ icon, label, calories, category = 'meal' }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <span className={getCalorieColorClass(calories, category)}>
        {calories} kcal
      </span>
    </div>
  )
}

// Detailed card component for single day view
function CalorieCardDetailed({ menu }) {
  const date = new Date(menu.date)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  
  const isToday = menu.dateLabel === 'Today'
  const isTomorrow = menu.dateLabel === 'Tomorrow'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header section with date and total calories */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-10 w-10 text-teal-500 dark:text-teal-400 p-2 bg-teal-50 dark:bg-teal-900/20 rounded-full" />
          <div>
            <h2 className="font-bold text-xl">
              {menu.dateLabel}
              {isToday && (
                <Badge className="ml-2 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-500 dark:to-teal-500">
                  Today
                </Badge>
              )}
              {isTomorrow && (
                <Badge variant="outline" className="ml-2">Tomorrow</Badge>
              )}
            </h2>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-sm text-muted-foreground">Total Daily Calories</div>
          <div className={cn(
            "text-2xl font-bold",
            getCalorieColorClass(menu.calorieInfo.totalDaily, 'daily')
          )}>
            {menu.calorieInfo.totalDaily} kcal
          </div>
        </div>
      </div>
      
      {/* Macronutrient distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            Estimated Macronutrient Distribution
          </CardTitle>
          <CardDescription>
            Based on typical macronutrient content of menu items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-3">
            <div className="w-full h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-yellow-400 dark:bg-yellow-600 transition-all duration-500" 
                style={{ width: `${menu.calorieInfo.macros.carbs * 100}%` }}
              ></div>
              <div 
                className="h-full bg-green-400 dark:bg-green-600 transition-all duration-500" 
                style={{ width: `${menu.calorieInfo.macros.protein * 100}%` }}
              ></div>
              <div 
                className="h-full bg-blue-400 dark:bg-blue-600 transition-all duration-500" 
                style={{ width: `${menu.calorieInfo.macros.fat * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="text-yellow-600 dark:text-yellow-400 font-medium">Carbs</div>
              <div className="text-2xl font-bold">{Math.round(menu.calorieInfo.macros.carbs * 100)}%</div>
              <div className="text-xs text-muted-foreground">
                ~{Math.round(menu.calorieInfo.totalDaily * menu.calorieInfo.macros.carbs / 4)} kcal
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-medium">Protein</div>
              <div className="text-2xl font-bold">{Math.round(menu.calorieInfo.macros.protein * 100)}%</div>
              <div className="text-xs text-muted-foreground">
                ~{Math.round(menu.calorieInfo.totalDaily * menu.calorieInfo.macros.protein / 4)} kcal
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 font-medium">Fat</div>
              <div className="text-2xl font-bold">{Math.round(menu.calorieInfo.macros.fat * 100)}%</div>
              <div className="text-xs text-muted-foreground">
                ~{Math.round(menu.calorieInfo.totalDaily * menu.calorieInfo.macros.fat / 9)} kcal
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Meal breakdown section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MealDetailCard 
          title="Breakfast" 
          icon={<Sunrise className="h-5 w-5 text-orange-500" />}
          menu={menu.breakfast}
          calorieInfo={menu.calorieInfo.breakfast}
        />
        
        <MealDetailCard 
          title="Lunch" 
          icon={<Utensils className="h-5 w-5 text-green-500" />}
          menu={menu.lunch}
          calorieInfo={menu.calorieInfo.lunch}
        />
        
        <MealDetailCard 
          title="Snacks" 
          icon={<Soup className="h-5 w-5 text-amber-500" />}
          menu={menu.snacks}
          calorieInfo={menu.calorieInfo.snacks}
        />
        
        <MealDetailCard 
          title="Dinner" 
          icon={<Moon className="h-5 w-5 text-blue-500" />}
          menu={menu.dinner}
          calorieInfo={menu.calorieInfo.dinner}
        />
      </div>
    </motion.div>
  )
}

// Detailed card for each meal
function MealDetailCard({ title, icon, menu, calorieInfo }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
          <span className={cn(
            "ml-auto text-base font-medium",
            getCalorieColorClass(calorieInfo.totalCalories, 'meal')
          )}>
            {calorieInfo.totalCalories} kcal
          </span>
        </CardTitle>
        <CardDescription>
          {menu || "No menu information available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {calorieInfo.itemsWithCalories.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm font-medium">Calorie breakdown:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {calorieInfo.itemsWithCalories.map((item, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "justify-between gap-1.5 py-1.5 px-3 bg-white dark:bg-gray-800 border",
                          getItemBadgeClass(item.calories)
                        )}
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="shrink-0">{item.calories}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.name}: {item.calories} kcal per serving</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            {calorieInfo.unknownItems.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium">Items without calorie data: </span>
                {calorieInfo.unknownItems.join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground italic">
            No detailed calorie information available for this meal.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="space-y-6">
          <div className="flex h-auto gap-2 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-28" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}