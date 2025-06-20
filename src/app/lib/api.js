const API_URL = 'https://cumeal.vercel.app/api';

// Cache for storing API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Performance monitoring
const performanceMetrics = {
  apiCalls: 0,
  cacheHits: 0,
  cacheMisses: 0,
  errors: 0,
};

// Cache utilities
function getCacheKey(url, params = {}) {
  return `${url}_${JSON.stringify(params)}`;
}

function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION;
}

// Performance monitoring utility
function measurePerformance(name, fn) {
  const start = performance.now();
  performanceMetrics.apiCalls++;
  
  return fn().then(
    (result) => {
      const end = performance.now();
      console.log(`🚀 ${name} completed in ${(end - start).toFixed(2)}ms`);
      return result;
    },
    (error) => {
      const end = performance.now();
      performanceMetrics.errors++;
      console.error(`❌ ${name} failed in ${(end - start).toFixed(2)}ms:`, error);
      throw error;
    }
  );
}

// Optimized fetch with caching, timeout, and performance monitoring
async function fetchWithCache(url, options = {}) {
  const cacheKey = getCacheKey(url, options);
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (isCacheValid(timestamp)) {
      performanceMetrics.cacheHits++;
      console.log(`💾 Cache hit for ${url}`);
      return data;
    }
    cache.delete(cacheKey);
  }
  
  performanceMetrics.cacheMisses++;
  console.log(`🌐 Cache miss for ${url} - fetching from network`);

  // Add timeout and optimized headers
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=300',
        ...options.headers,
      },
      // Use cache for static data but revalidate
      cache: options.cache || 'force-cache',
      next: { revalidate: 300 }, // 5 minutes for Next.js
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Store in cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Get performance metrics
export function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    cacheSize: cache.size,
    cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100,
  };
}

// Clear cache (useful for testing)
export function clearCache() {
  cache.clear();
  console.log('🧹 Cache cleared');
}

// Get all menus with caching and performance monitoring
export async function getAllMenus() {
  return measurePerformance('getAllMenus', async () => {
    try {
      return await fetchWithCache(`${API_URL}/menu`);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      throw new Error('Failed to fetch menus. Please check your connection.');
    }
  });
}

// Get menu for specific date with caching and performance monitoring
export async function getMenuByDate(date) {
  return measurePerformance(`getMenuByDate(${date})`, async () => {
    try {
      return await fetchWithCache(`${API_URL}/menu/date/${date}`);
    } catch (error) {
      console.error('Failed to fetch menu by date:', error);
      throw new Error('Failed to fetch menu for the specified date.');
    }
  });
}

// Get menu for current week with caching and performance monitoring
export async function getCurrentWeekMenu() {
  return measurePerformance('getCurrentWeekMenu', async () => {
    try {
      return await fetchWithCache(`${API_URL}/menu/week`);
    } catch (error) {
      console.error('Failed to fetch weekly menu:', error);
      throw new Error('Failed to fetch weekly menu. Please try again.');
    }
  });
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