const API_URL = process.env.API_URL || 'https://cumeal.vercel.app/api';

// Get all menus
export async function getAllMenus() {
  const response = await fetch(`${API_URL}/menu`, { 
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch menus');
  }
  
  return response.json();
}

// Get menu for specific date
export async function getMenuByDate(date) {
  const response = await fetch(`${API_URL}/menu/date/${date}`, { 
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu');
  }
  
  return response.json();
}

// Get menu for current week
export async function getCurrentWeekMenu() {
  const response = await fetch(`${API_URL}/menu/week`, { 
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch weekly menu');
  }
  
  return response.json();
}

// Create a new menu
export async function createMenu(menuData) {
  const response = await fetch(`${API_URL}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(menuData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create menu');
  }
  
  return response.json();
}

// Update an existing menu
export async function updateMenu(id, menuData) {
  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(menuData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update menu');
  }
  
  return response.json();
}

// Delete a menu
export async function deleteMenu(id) {
  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete menu');
  }
  
  return response.json();
}