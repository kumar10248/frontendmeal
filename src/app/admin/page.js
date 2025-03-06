"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, Plus, X, Save } from 'lucide-react';
import { 
  getCurrentWeekMenu, 
  getAllMenus, 
  createMenu as apiCreateMenu, 
  updateMenu as apiUpdateMenu, 
  deleteMenu as apiDeleteMenu 
} from '../lib/api';

const MenuAdminPanel = () => {
  // State declarations
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('week'); // 'week', 'all', 'create', 'edit'
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });

  // Fetch current week menus on component mount
  useEffect(() => {
    fetchWeekMenus();
  }, []);

  // **Fetch Functions**
  const fetchWeekMenus = async () => {
    setLoading(true);
    try {
      const data = await getCurrentWeekMenu();
      
      // Transform data for display if needed
      const processedData = data.map(menu => ({
        ...menu,
        breakfast: Array.isArray(menu.breakfast) ? menu.breakfast : menu.breakfast?.split(',') || [],
        lunch: Array.isArray(menu.lunch) ? menu.lunch : menu.lunch?.split(',') || [],
        snacks: Array.isArray(menu.snacks) ? menu.snacks : menu.snacks?.split(',') || [],
        dinner: Array.isArray(menu.dinner) ? menu.dinner : menu.dinner?.split(',') || []
      }));
      
      setMenus(processedData);
      setCurrentView('week');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMenus = async () => {
    setLoading(true);
    try {
      const data = await getAllMenus();
      
      // Transform data for display if needed
      const processedData = data.map(menu => ({
        ...menu,
        breakfast: Array.isArray(menu.breakfast) ? menu.breakfast : menu.breakfast?.split(',') || [],
        lunch: Array.isArray(menu.lunch) ? menu.lunch : menu.lunch?.split(',') || [],
        snacks: Array.isArray(menu.snacks) ? menu.snacks : menu.snacks?.split(',') || [],
        dinner: Array.isArray(menu.dinner) ? menu.dinner : menu.dinner?.split(',') || []
      }));
      
      setMenus(processedData);
      setCurrentView('all');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // **CRUD Functions**
  const createMenu = async () => {
    try {
      // Filter out empty items and join arrays into comma-separated strings
      const cleanFormData = {
        date: formData.date,
        breakfast: formData.breakfast.filter(item => item.trim() !== '').join(', '),
        lunch: formData.lunch.filter(item => item.trim() !== '').join(', '),
        snacks: formData.snacks.filter(item => item.trim() !== '').join(', '),
        dinner: formData.dinner.filter(item => item.trim() !== '').join(', ')
      };
      
      await apiCreateMenu(cleanFormData);

      // Refresh based on current view
      if (currentView === 'create' || currentView === 'week') {
        await fetchWeekMenus();
      } else if (currentView === 'all') {
        await fetchAllMenus();
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateMenu = async () => {
    try {
      // Filter out empty items and join arrays into comma-separated strings
      const cleanFormData = {
        breakfast: formData.breakfast.filter(item => item.trim() !== '').join(', '),
        lunch: formData.lunch.filter(item => item.trim() !== '').join(', '),
        snacks: formData.snacks.filter(item => item.trim() !== '').join(', '),
        dinner: formData.dinner.filter(item => item.trim() !== '').join(', ')
      };
      
      await apiUpdateMenu(selectedMenu._id, cleanFormData);

      // Refresh based on current view
      if (currentView === 'edit' || currentView === 'week') {
        await fetchWeekMenus();
      } else if (currentView === 'all') {
        await fetchAllMenus();
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMenu = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu?')) return;

    try {
      await apiDeleteMenu(id);

      if (currentView === 'week') {
        await fetchWeekMenus();
      } else {
        await fetchAllMenus();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // **Helper Functions**
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    });
    setSelectedMenu(null);
    // View is maintained by fetch functions, not reset here
  };

  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    const menuDate = new Date(menu.date);
    const dateString = menuDate.toISOString().split('T')[0];
    
    // Ensure we have arrays for all meal types
    setFormData({
      date: dateString,
      breakfast: Array.isArray(menu.breakfast) ? [...menu.breakfast] : menu.breakfast?.split(',').map(item => item.trim()) || [],
      lunch: Array.isArray(menu.lunch) ? [...menu.lunch] : menu.lunch?.split(',').map(item => item.trim()) || [],
      snacks: Array.isArray(menu.snacks) ? [...menu.snacks] : menu.snacks?.split(',').map(item => item.trim()) || [],
      dinner: Array.isArray(menu.dinner) ? [...menu.dinner] : menu.dinner?.split(',').map(item => item.trim()) || []
    });
    
    setCurrentView('edit');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMealItemChange = (mealType, index, value) => {
    const updatedItems = [...formData[mealType]];
    updatedItems[index] = value;
    setFormData(prev => ({ ...prev, [mealType]: updatedItems }));
  };

  const addMealItem = (mealType) => {
    setFormData(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], '']
    }));
  };

  const removeMealItem = (mealType, index) => {
    setFormData(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // **Render**
  if (loading) return <div className="flex justify-center p-8">Loading menu data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu Administration</h1>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={fetchWeekMenus}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                currentView === 'week' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Calendar size={16} />
              Current Week
            </button>
            <button
              onClick={fetchAllMenus}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                currentView === 'all' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Calendar size={16} />
              All Menus
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                currentView === 'create' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Plus size={16} />
              New Menu
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </header>

        {/* Create/Edit Form */}
        {(currentView === 'create' || currentView === 'edit') && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentView === 'create' ? 'Create New Menu' : 'Edit Menu'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={currentView === 'edit'}
              />
            </div>

            {/* Meal Sections */}
            {['breakfast', 'lunch', 'snacks', 'dinner'].map(mealType => (
              <div key={mealType} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-gray-700 capitalize">
                    {mealType}
                  </h3>
                  <button
                    onClick={() => addMealItem(mealType)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {formData[mealType].map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleMealItemChange(mealType, index, e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter ${mealType} item...`}
                      />
                      <button
                        onClick={() => removeMealItem(mealType, index)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-2 justify-end pt-6 border-t border-gray-200">
              <button
                onClick={currentView === 'create' ? createMenu : updateMenu}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Save size={16} />
                {currentView === 'create' ? 'Create Menu' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Menu List Display */}
        {(currentView === 'week' || currentView === 'all') && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentView === 'week' ? 'Current Week Menus' : 'All Menus'}
            </h2>

            {menus.length === 0 ? (
              <div className="bg-white p-6 text-center rounded-lg border border-dashed border-gray-300 text-gray-500">
                No menus found. Click "New Menu" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {menus.map(menu => (
                  <div key={menu._id} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-blue-600" />
                        <h3 className="font-medium text-gray-900">
                          {menu.dateLabel ? `${menu.dateLabel} - ` : ''}{formatDate(menu.date)}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMenu(menu)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteMenu(menu._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {['breakfast', 'lunch', 'snacks', 'dinner'].map(mealType => (
                        <div key={mealType} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                          <h4 className="font-medium text-gray-900 text-sm uppercase mb-2 tracking-wide">
                            {mealType}
                          </h4>
                          {menu[mealType] && Array.isArray(menu[mealType]) && menu[mealType].length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {menu[mealType].map((item, index) => (
                                <li key={index} className="text-gray-700 text-sm">{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 text-sm italic">No items</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuAdminPanel;