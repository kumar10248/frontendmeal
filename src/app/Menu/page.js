"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ThumbsUp, Share2, Clock, Utensils, Calendar, Info, PieChart, Award } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function MenuPage() {
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [userPreferences, setUserPreferences] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nutritionalStats, setNutritionalStats] = useState(null);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [activeTab, setActiveTab] = useState("menu"); // "menu", "stats", "favorites"
  const [error, setError] = useState(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    meal: "",
    rating: 0,
    comment: ""
  });
  useEffect(() => {
    console.log("Active tab:", activeTab);
    console.log("Favorite items:", favoriteItems);
  }, [activeTab, favoriteItems]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };
  
  // Generate mock data function
  const generateMockData = () => {
    const today = new Date();
    const mockMenuData = [];
    
    // Generate 7 days of mock menu data starting from today
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      mockMenuData.push({
        date: date.toISOString(),
        breakfast: "Standard Breakfast",
        lunch: "Standard Lunch",
        snacks: "Standard Snacks",
        dinner: "Standard Dinner",
        breakfastItems: [
          { name: "Aloo Paratha", calories: 350 },
          { name: "Curd", calories: 120 },
          { name: "Tea/Coffee", calories: 90 }
        ],
        lunchItems: [
          { name: "Rice", calories: 200 },
          { name: "Dal Makhani", calories: 250 },
          { name: "Mix Veg", calories: 150 },
          { name: "Roti", calories: 120 }
        ],
        snacksItems: [
          { name: "Samosa", calories: 180 },
          { name: "Chai", calories: 90 }
        ],
        dinnerItems: [
          { name: "Rice", calories: 200 },
          { name: "Dal Tadka", calories: 220 },
          { name: "Paneer Curry", calories: 280 },
          { name: "Roti", calories: 120 }
        ],
        breakfastTotalCalories: 560,
        lunchTotalCalories: 720,
        snacksTotalCalories: 270,
        dinnerTotalCalories: 820,
      });
    }
    
    return mockMenuData;
  };
  
  // Generate mock nutritional stats
  const generateMockNutritionalStats = () => {
    const today = new Date();
    const dailyBreakdown = [];
    
    // Generate 7 days of mock nutritional stats starting from today (not past days)
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      dailyBreakdown.push({
        date: date.toISOString(),
        breakfastCalories: Math.floor(Math.random() * 200) + 450,
        lunchCalories: Math.floor(Math.random() * 200) + 650,
        snacksCalories: Math.floor(Math.random() * 100) + 200,
        dinnerCalories: Math.floor(Math.random() * 200) + 700,
        get totalCalories() {
          return this.breakfastCalories + this.lunchCalories + this.snacksCalories + this.dinnerCalories;
        }
      });
    }
    
    // Calculate averages
    const avgBreakfastCalories = Math.round(
      dailyBreakdown.reduce((sum, day) => sum + day.breakfastCalories, 0) / dailyBreakdown.length
    );
    const avgLunchCalories = Math.round(
      dailyBreakdown.reduce((sum, day) => sum + day.lunchCalories, 0) / dailyBreakdown.length
    );
    const avgSnacksCalories = Math.round(
      dailyBreakdown.reduce((sum, day) => sum + day.snacksCalories, 0) / dailyBreakdown.length
    );
    const avgDinnerCalories = Math.round(
      dailyBreakdown.reduce((sum, day) => sum + day.dinnerCalories, 0) / dailyBreakdown.length
    );
    
    return {
      stats: {
        avgBreakfastCalories,
        avgLunchCalories,
        avgSnacksCalories,
        avgDinnerCalories,
        avgDailyCalories: avgBreakfastCalories + avgLunchCalories + avgSnacksCalories + avgDinnerCalories,
        totalDays: dailyBreakdown.length
      },
      dailyBreakdown
    };
  };
  
  // Generate mock favorite items
  const generateMockFavoriteItems = () => {
    return [
      { name: "Paneer Butter Masala", rating: 4.8, votes: 342 },
      { name: "Aloo Paratha", rating: 4.6, votes: 287 },
      { name: "Chole Bhature", rating: 4.5, votes: 265 },
      { name: "Veg Biryani", rating: 4.3, votes: 231 },
      { name: "Masala Dosa", rating: 4.3, votes: 219 },
      { name: "Samosa", rating: 4.2, votes: 198 },
      { name: "Manchurian", rating: 4.0, votes: 187 },
      { name: "Dal Makhani", rating: 3.9, votes: 176 }
    ];
  };

  // Load data on mount
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API, if it fails, use mock data
        try {
          const response = await fetch("http://localhost:8000/api/menu/week");
          if (!response.ok) throw new Error("Failed to fetch menu data");
          const data = await response.json();
          setMenuData(data);
        } catch (err) {
          console.warn("Using mock menu data:", err);
          const mockData = generateMockData();
          console.log("Mock data generated:", mockData);
          setMenuData(mockData);
        }
  
        const todayDate = new Date().toISOString().split("T")[0];
        console.log("Today's date format:", todayDate);
        setSelectedDate(todayDate);
  
        // Fetch nutritional stats and favorites
        await fetchNutritionalStats();
        await fetchFavoriteItems();
      } catch (err) {
        console.error("Error fetching menu data:", err);
        setError("Failed to load menu data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchMenuData();
  
    // Load preferences
    const savedPrefs = localStorage.getItem("mealPreferences");
    if (savedPrefs) setUserPreferences(JSON.parse(savedPrefs));
  
    setActiveMeal(getCurrentMeal());
  }, []);
  // Fetch nutritional stats - Updated to ensure stats are for upcoming days
  const fetchNutritionalStats = async () => {
    try {
      const today = new Date();
      
      try {
        const response = await fetch(
          `http://localhost:8000/api/menu/stats?startDate=${today.toISOString().split("T")[0]}`
        );
        if (!response.ok) throw new Error("Failed to fetch nutritional stats");
        const data = await response.json();
        setNutritionalStats(data);
      } catch (error) {
        console.warn("Using mock nutritional stats:", error);
        setNutritionalStats(generateMockNutritionalStats());
      }
    } catch (error) {
      console.error("Error fetching nutritional stats:", error);
      setError("Failed to load nutritional stats.");
    }
  };

  // Fetch favorite items
  const fetchFavoriteItems = async () => {
  try {
    try {
      const response = await fetch("http://localhost:8000/api/menu/favorites");
      if (!response.ok) throw new Error("Failed to fetch favorite items");
      const data = await response.json();
      console.log("API favorite items:", data);
      setFavoriteItems(data);
    } catch (error) {
      console.warn("Using mock favorite items:", error);
      const mockData = generateMockFavoriteItems();
      console.log("Mock favorite items:", mockData);
      setFavoriteItems(mockData);
    }
  } catch (error) {
    console.error("Error fetching favorite items:", error);
    setError("Failed to load favorite items.");
  }
};

  // Function to switch to favorites tab
const showFavoritesTab = () => {
  console.log("Switching to favorites tab");
  setActiveTab("favorites");
};

// Call this from a button if needed

  const savePreference = (mealId) => {
    const updatedPrefs = userPreferences.includes(mealId)
      ? userPreferences.filter((id) => id !== mealId)
      : [...userPreferences, mealId];
    setUserPreferences(updatedPrefs);
    localStorage.setItem("mealPreferences", JSON.stringify(updatedPrefs));
  };

  const getCurrentMeal = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 16) return "lunch";
    if (hour >= 16 && hour < 18) return "snacks";
    return "dinner";
  };

  const getNextMealTime = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6) return { meal: "breakfast", timeLeft: `in ${6 - hour} hours` };
    if (hour < 11) return { meal: "lunch", timeLeft: `in ${11 - hour} hours` };
    if (hour < 16) return { meal: "snacks", timeLeft: `in ${16 - hour} hours` };
    if (hour < 18) return { meal: "dinner", timeLeft: `in ${18 - hour} hours` };
    return { meal: "breakfast", timeLeft: "tomorrow" };
  };
  
  // Handle feedback form
  const handleFeedbackSubmit = () => {
    // Make sure rating is set
    if (!feedbackData.rating) {
      alert("Please provide a rating before submitting.");
      return;
    }
    
    // Make sure meal is selected
    if (!feedbackData.meal) {
      alert("Please select a meal before submitting.");
      return;
    }
    
    alert(`Feedback submitted for ${feedbackData.meal}! Rating: ${feedbackData.rating}/5`);
    setFeedbackVisible(false);
    setFeedbackData({ meal: "", rating: 0, comment: "" });
  };
  
  const handleFeedbackChange = (field, value) => {
    setFeedbackData({
      ...feedbackData,
      [field]: value
    });
  };

  const getProgressWidth = (rating) => (rating / 5) * 100;

  // Use the real menu data if available, otherwise default to empty object with default arrays
  // Use the real menu data if available, otherwise default to empty object with default arrays
  const selectedDayMenu = menuData.find(day => {
    const dayDate = new Date(day.date).toISOString().split('T')[0];
    return dayDate === selectedDate;
  }) || {
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
    breakfastItems: [],
    lunchItems: [],
    snacksItems: [],
    dinnerItems: [],
    breakfastTotalCalories: 0,
    lunchTotalCalories: 0,
    snacksTotalCalories: 0,
    dinnerTotalCalories: 0,
  };

  const nextMeal = getNextMealTime();
  const menuDates = menuData.map((item) => ({
    date: new Date(item.date).toISOString().split("T")[0],
    formatted: formatDate(item.date),
  }));

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent mb-8">
        Chandigarh University Hostel Mess Menu
      </h1>

      {/* Main Navigation Tabs */}
      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="menu">
              <Utensils className="h-4 w-4 mr-2" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="stats">
              <PieChart className="h-4 w-4 mr-2" />
              Nutritional Stats
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Award className="h-4 w-4 mr-2" />
              Top Favorites
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          {/* Menu Tab */}
          {activeTab === "menu" && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col">
                  <Badge variant="outline" className="mb-2 w-fit">Menu for</Badge>
                  <h2 className="text-2xl font-bold">{formatDate(selectedDayMenu.date || selectedDate)}</h2>
                </div>
                <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Next: <span className="font-semibold capitalize">{nextMeal.meal}</span> {nextMeal.timeLeft}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto mb-6">
                <div className="flex gap-2 min-w-max pb-2">
                  {menuDates.map((day) => (
                    <Button
                      key={day.date}
                      variant={day.date === selectedDate ? "default" : "outline"}
                      className="px-4 whitespace-nowrap"
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {day.formatted.split(", ")[0]}
                    </Button>
                  ))}
                </div>
              </div>

              <Tabs defaultValue={activeMeal} onValueChange={setActiveMeal} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                  <TabsTrigger value="lunch">Lunch</TabsTrigger>
                  <TabsTrigger value="snacks">Snacks</TabsTrigger>
                  <TabsTrigger value="dinner">Dinner</TabsTrigger>
                </TabsList>

                <TabsContent value="breakfast">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-primary" />
                        Breakfast Menu
                      </CardTitle>
                      <CardDescription>Served daily from 7:00 AM to 9:30 AM</CardDescription>
                      {selectedDayMenu.breakfastTotalCalories && (
                        <Badge variant="outline" className="mt-2">
                          Total: ~{selectedDayMenu.breakfastTotalCalories} calories
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedDayMenu.breakfastItems && selectedDayMenu.breakfastItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedDayMenu.breakfastItems.map((item, index) => (
                            <Card key={`${item.name}-${index}`} className="border shadow-sm hover:shadow-md transition-all">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                {item.calories && item.calories !== "N/A" && (
                                  <CardDescription className="text-sm">~{item.calories} calories</CardDescription>
                                )}
                              </CardHeader>
                              <CardFooter className="pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => savePreference(item.name)}
                                  className="ml-auto"
                                >
                                  <Heart
                                    className={`h-4 w-4 mr-2 ${
                                      userPreferences.includes(item.name) ? "fill-red-500 text-red-500" : ""
                                    }`}
                                  />
                                  {userPreferences.includes(item.name) ? "Favorite" : "Add to Favorites"}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">No items available for this meal.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lunch">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-primary" />
                        Lunch Menu
                      </CardTitle>
                      <CardDescription>Served daily from 12:00 PM to 2:30 PM</CardDescription>
                      {selectedDayMenu.lunchTotalCalories && (
                        <Badge variant="outline" className="mt-2">
                          Total: ~{selectedDayMenu.lunchTotalCalories} calories
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedDayMenu.lunchItems && selectedDayMenu.lunchItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedDayMenu.lunchItems.map((item, index) => (
                            <Card key={`${item.name}-${index}`} className="border shadow-sm hover:shadow-md transition-all">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                {item.calories && item.calories !== "N/A" && (
                                  <CardDescription className="text-sm">~{item.calories} calories</CardDescription>
                                )}
                              </CardHeader>
                              <CardFooter className="pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => savePreference(item.name)}
                                  className="ml-auto"
                                >
                                  <Heart
                                    className={`h-4 w-4 mr-2 ${
                                      userPreferences.includes(item.name) ? "fill-red-500 text-red-500" : ""
                                    }`}
                                  />
                                  {userPreferences.includes(item.name) ? "Favorite" : "Add to Favorites"}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">No items available for this meal.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="snacks">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-primary" />
                        Snacks Menu
                      </CardTitle>
                      <CardDescription>Served daily from 4:30 PM to 5:30 PM</CardDescription>
                      {selectedDayMenu.snacksTotalCalories && (
                        <Badge variant="outline" className="mt-2">
                          Total: ~{selectedDayMenu.snacksTotalCalories} calories
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedDayMenu.snacksItems && selectedDayMenu.snacksItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedDayMenu.snacksItems.map((item, index) => (
                            <Card key={`${item.name}-${index}`} className="border shadow-sm hover:shadow-md transition-all">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                {item.calories && item.calories !== "N/A" && (
                                  <CardDescription className="text-sm">~{item.calories} calories</CardDescription>
                                )}
                              </CardHeader>
                              <CardFooter className="pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => savePreference(item.name)}
                                  className="ml-auto"
                                >
                                  <Heart
                                    className={`h-4 w-4 mr-2 ${
                                      userPreferences.includes(item.name) ? "fill-red-500 text-red-500" : ""
                                    }`}
                                  />
                                  {userPreferences.includes(item.name) ? "Favorite" : "Add to Favorites"}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">No items available for this meal.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="dinner">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-primary" />
                        Dinner Menu
                      </CardTitle>
                      <CardDescription>Served daily from 7:00 PM to 9:00 PM</CardDescription>
                      {selectedDayMenu.dinnerTotalCalories && (
                        <Badge variant="outline" className="mt-2">
                          Total: ~{selectedDayMenu.dinnerTotalCalories} calories
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedDayMenu.dinnerItems && selectedDayMenu.dinnerItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedDayMenu.dinnerItems.map((item, index) => (
                            <Card key={`${item.name}-${index}`} className="border shadow-sm hover:shadow-md transition-all">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                {item.calories && item.calories !== "N/A" && (
                                  <CardDescription className="text-sm">~{item.calories} calories</CardDescription>
                                )}
                              </CardHeader>
                              <CardFooter className="pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => savePreference(item.name)}
                                  className="ml-auto"
                                >
                                  <Heart
                                    className={`h-4 w-4 mr-2 ${
                                      userPreferences.includes(item.name) ? "fill-red-500 text-red-500" : ""
                                    }`}
                                  />
                                  {userPreferences.includes(item.name) ? "Favorite" : "Add to Favorites"}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">No items available for this meal.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="mt-10 p-6 border rounded-lg bg-muted/50">
                <h3 className="text-xl font-semibold mb-4">Hostel-Specific Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Distribution Locations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Zakir Bhawan (A/B):</strong> Ground floor mess hall</li>
                        <li><strong>Shivalik:</strong> Block C entrance</li>
                        <li><strong>NC Hostel:</strong> Common area beside reception</li>
                        <li><strong>LC & City Hostel:</strong> Main mess area</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Timings & Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Breakfast:</strong> 7:00 AM - 9:30 AM</li>
                        <li><strong>Lunch:</strong> 12:00 PM - 2:30 PM</li>
                        <li><strong>Snacks:</strong> 4:30 PM - 5:30 PM</li>
                        <li><strong>Dinner:</strong> 7:00 PM - 9:00 PM</li>
                        <li className="text-primary font-medium">Please carry your mess card at all times</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg mt-2">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Have feedback on today's meals?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    We value your input! Scan the QR code at your hostel mess or click the button below to share your thoughts.
                  </p>
                  <Button className="mt-2" size="sm" onClick={() => setFeedbackVisible(true)}>
                    Submit Feedback
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Nutritional Stats Tab */}
          {activeTab === "stats" && nutritionalStats && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    Weekly Nutrition Overview
                  </CardTitle>
                  <CardDescription>
                    Calorie breakdown for the current week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Breakfast</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {nutritionalStats.stats.avgBreakfastCalories} cal
                          </div>
                          <div className="text-sm text-muted-foreground">avg. per day</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Lunch</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {nutritionalStats.stats.avgLunchCalories} cal
                          </div>
                          <div className="text-sm text-muted-foreground">avg. per day</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Snacks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {nutritionalStats.stats.avgSnacksCalories} cal
                          </div>
                          <div className="text-sm text-muted-foreground">avg. per day</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Dinner</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {nutritionalStats.stats.avgDinnerCalories} cal
                          </div>
                          <div className="text-sm text-muted-foreground">avg. per day</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Daily Average</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">
                          {nutritionalStats.stats.avgDailyCalories} cal
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Breakfast</div>
                            <div className="h-16 bg-muted relative rounded-md overflow-hidden">
                              <div
                                className="absolute bottom-0 w-full bg-primary/70"
                                style={{
                                  height: `${(nutritionalStats.stats.avgBreakfastCalories / nutritionalStats.stats.avgDailyCalories) * 100}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-sm mt-1">{Math.round((nutritionalStats.stats.avgBreakfastCalories / nutritionalStats.stats.avgDailyCalories) * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Lunch</div>
                            <div className="h-16 bg-muted relative rounded-md overflow-hidden">
                              <div
                                className="absolute bottom-0 w-full bg-primary/70"
                                style={{
                                  height: `${(nutritionalStats.stats.avgLunchCalories / nutritionalStats.stats.avgDailyCalories) * 100}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-sm mt-1">{Math.round((nutritionalStats.stats.avgLunchCalories / nutritionalStats.stats.avgDailyCalories) * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Snacks</div>
                            <div className="h-16 bg-muted relative rounded-md overflow-hidden">
                              <div
                                className="absolute bottom-0 w-full bg-primary/70"
                                style={{
                                  height: `${(nutritionalStats.stats.avgSnacksCalories / nutritionalStats.stats.avgDailyCalories) * 100}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-sm mt-1">{Math.round((nutritionalStats.stats.avgSnacksCalories / nutritionalStats.stats.avgDailyCalories) * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Dinner</div>
                            <div className="h-16 bg-muted relative rounded-md overflow-hidden">
                              <div
                                className="absolute bottom-0 w-full bg-primary/70"
                                style={{
                                  height: `${(nutritionalStats.stats.avgDinnerCalories / nutritionalStats.stats.avgDailyCalories) * 100}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-sm mt-1">{Math.round((nutritionalStats.stats.avgDinnerCalories / nutritionalStats.stats.avgDailyCalories) * 100)}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Daily Breakdown</h3>
                      {nutritionalStats.dailyBreakdown.map((day, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{formatDate(day.date)}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="h-8 w-full flex">
                              <div
                                className="bg-blue-200 h-full"
                                style={{ width: `${(day.breakfastCalories / day.totalCalories) * 100}%` }}
                                title={`Breakfast: ${day.breakfastCalories} cal`}
                              ></div>
                              <div
                                className="bg-blue-300 h-full"
                                style={{ width: `${(day.lunchCalories / day.totalCalories) * 100}%` }}
                                title={`Lunch: ${day.lunchCalories} cal`}
                              ></div>
                              <div
                                className="bg-blue-400 h-full"
                                style={{ width: `${(day.snacksCalories / day.totalCalories) * 100}%` }}
                                title={`Snacks: ${day.snacksCalories} cal`}
                              ></div>
                              <div
                                className="bg-blue-500 h-full"
                                style={{ width: `${(day.dinnerCalories / day.totalCalories) * 100}%` }}
                                title={`Dinner: ${day.dinnerCalories} cal`}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>B: {day.breakfastCalories} cal</span>
                              <span>L: {day.lunchCalories} cal</span>
                              <span>S: {day.snacksCalories} cal</span>
                              <span>D: {day.dinnerCalories} cal</span>
                              <span className="font-medium">Total: {day.totalCalories} cal</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Calorie Distribution</CardTitle>
                  <CardDescription>
                    This week's meal energy distribution by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-end w-full">
                    <div className="flex-1 flex flex-col items-center justify-end">
                      <div className="w-14 bg-primary-foreground relative rounded-t-md overflow-hidden" style={{ height: `${(nutritionalStats.stats.avgBreakfastCalories / 1000) * 100}%` }}>
                        <div className="absolute bottom-0 w-full bg-primary/60 h-full"></div>
                      </div>
                      <div className="mt-2 text-xs">Breakfast</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end">
                      <div className="w-14 bg-primary-foreground relative rounded-t-md overflow-hidden" style={{ height: `${(nutritionalStats.stats.avgLunchCalories / 1000) * 100}%` }}>
                        <div className="absolute bottom-0 w-full bg-primary/70 h-full"></div>
                      </div>
                      <div className="mt-2 text-xs">Lunch</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end">
                      <div className="w-14 bg-primary-foreground relative rounded-t-md overflow-hidden" style={{ height: `${(nutritionalStats.stats.avgSnacksCalories / 1000) * 100}%` }}>
                        <div className="absolute bottom-0 w-full bg-primary/80 h-full"></div>
                      </div>
                      <div className="mt-2 text-xs">Snacks</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end">
                      <div className="w-14 bg-primary-foreground relative rounded-t-md overflow-hidden" style={{ height: `${(nutritionalStats.stats.avgDinnerCalories / 1000) * 100}%` }}>
                        <div className="absolute bottom-0 w-full bg-primary/90 h-full"></div>
                      </div>
                      <div className="mt-2 text-xs">Dinner</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <h4 className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Nutrition Notes
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>The recommended daily calorie intake for adults is generally between 1,800-2,500 calories depending on activity level, gender, and age.</li>
                  <li>These calorie estimates are approximations and actual values may vary based on serving sizes and preparation methods.</li>
                  <li>For specific dietary concerns or restrictions, please contact the mess committee or nutrition counselor.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && favoriteItems && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Most Popular Mess Items
                  </CardTitle>
                  <CardDescription>
                    Based on student ratings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {favoriteItems.map((item, index) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{item.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.rating.toFixed(1)}
                              <ThumbsUp className="h-3 w-3 ml-1" />
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.votes} votes</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-600"
                            style={{ width: `${getProgressWidth(item.rating)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Favorites</CardTitle>
                  <CardDescription>
                    Items you've marked as favorites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userPreferences && userPreferences.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userPreferences.map((item, index) => (
                        <Card key={index} className="border shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{item}</CardTitle>
                          </CardHeader>
                          <CardFooter className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => savePreference(item)}
                              className="ml-auto"
                            >
                              <Heart className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
                              Remove
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You haven't added any favorites yet.</p>
                      <p className="text-sm mt-2">
                        Browse the menu and click the heart icon to add items to your favorites.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  About Favorites
                </h4>
                <p className="text-sm text-muted-foreground">
                  Item rankings are updated weekly based on student feedback and preferences. The mess committee uses this data to plan future menus and special meals.
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFeedbackVisible(true)}
                >
                  Rate Today's Food
                </Button>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {feedbackVisible && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Rate Today's Food</CardTitle>
                  <CardDescription>
                    Your feedback helps us improve the mess service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Meal</Label>
                      <RadioGroup
                        value={feedbackData.meal}
                        onValueChange={(value) => handleFeedbackChange("meal", value)}
                        className="flex flex-col space-y-1 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="breakfast" id="breakfast" />
                          <Label htmlFor="breakfast">Breakfast</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lunch" id="lunch" />
                          <Label htmlFor="lunch">Lunch</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="snacks" id="snacks" />
                          <Label htmlFor="snacks">Snacks</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dinner" id="dinner" />
                          <Label htmlFor="dinner">Dinner</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label>Rate (1-5)</Label>
                      <div className="flex space-x-2 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            type="button"
                            variant={feedbackData.rating === rating ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFeedbackChange("rating", rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="comment">Comments (Optional)</Label>
                      <Textarea
                        id="comment"
                        placeholder="Share your thoughts about the food quality, taste, etc."
                        value={feedbackData.comment}
                        onChange={(e) => handleFeedbackChange("comment", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setFeedbackVisible(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleFeedbackSubmit}>
                    Submit Feedback
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}