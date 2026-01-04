// Analytics & Visitor Tracking System
// Theo dõi lượt truy cập khách hàng cho admin dashboard

interface VisitorData {
  id: string;
  timestamp: number;
  page: string;
  userAgent: string;
  referrer: string;
  sessionId: string;
  cookieId: string;
  isReturning: boolean;
}

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  weeklyVisits: number;
  monthlyVisits: number;
  topPages: { page: string; visits: number }[];
  hourlyData: { hour: number; visits: number }[];
  dailyData: { date: string; visits: number; uniqueVisitors: number }[];
  recentVisitors: VisitorData[];
}

// Get cookie ID (local implementation to avoid circular imports)
const getCookieId = (): string => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'temp_' + Date.now();
  }
  
  try {
    let cookieId = localStorage.getItem('customerCookieId');
    if (!cookieId) {
      cookieId = 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('customerCookieId', cookieId);
    }
    return cookieId;
  } catch (error) {
    console.warn('[Analytics] localStorage not available:', error);
    return 'temp_' + Date.now();
  }
};

// Generate unique session ID
const generateSessionId = (): string => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get or create session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return generateSessionId();
  }
  
  try {
    let sessionId = sessionStorage.getItem('ngochuong_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('ngochuong_session_id', sessionId);
    }
    return sessionId;
  } catch (error) {
    console.warn('[Analytics] sessionStorage not available:', error);
    return generateSessionId();
  }
};

// Check if visitor is returning
const isReturningVisitor = (): boolean => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }
  
  try {
    const hasVisited = localStorage.getItem('ngochuong_has_visited');
    if (!hasVisited) {
      localStorage.setItem('ngochuong_has_visited', 'true');
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[Analytics] localStorage not available for returning visitor check:', error);
    return false;
  }
};

// Track page visit
export const trackPageVisit = (page: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const cookieId = getCookieId();
    const sessionId = getSessionId();
    const isReturning = isReturningVisitor();
    
    const visitorData: VisitorData = {
      id: 'visit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp: Date.now(),
      page: page,
      userAgent: navigator?.userAgent || 'unknown',
      referrer: document?.referrer || 'direct',
      sessionId: sessionId,
      cookieId: cookieId,
      isReturning: isReturning
    };

    // Save to localStorage
    const existingData = getVisitorData();
    existingData.push(visitorData);
    
    // Keep only last 1000 visits to prevent storage overflow
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000);
    }
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ngochuong_analytics', JSON.stringify(existingData));
    }
    
    console.log(`[Analytics] Tracked visit: ${page} by ${cookieId}`);
  } catch (error) {
    console.error('[Analytics] Error tracking visit:', error);
  }
};

// Get raw visitor data
const getVisitorData = (): VisitorData[] => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  
  try {
    const data = localStorage.getItem('ngochuong_analytics');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Analytics] Error loading visitor data:', error);
    return [];
  }
};

// Get analytics summary
export const getAnalytics = (): AnalyticsData => {
  const visitors = getVisitorData();
  const now = Date.now();
  const today = new Date().toDateString();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

  // Calculate unique visitors (by cookieId)
  const uniqueVisitorIds = new Set(visitors.map(v => v.cookieId));
  
  // Today's visits
  const todayVisits = visitors.filter(v => 
    new Date(v.timestamp).toDateString() === today
  ).length;

  // Weekly visits
  const weeklyVisits = visitors.filter(v => v.timestamp >= oneWeekAgo).length;

  // Monthly visits
  const monthlyVisits = visitors.filter(v => v.timestamp >= oneMonthAgo).length;

  // Top pages
  const pageVisits: { [key: string]: number } = {};
  visitors.forEach(v => {
    pageVisits[v.page] = (pageVisits[v.page] || 0) + 1;
  });
  
  const topPages = Object.entries(pageVisits)
    .map(([page, visits]) => ({ page, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  // Hourly data for today
  const hourlyData: { hour: number; visits: number }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourVisits = visitors.filter(v => {
      const visitDate = new Date(v.timestamp);
      return visitDate.toDateString() === today && visitDate.getHours() === hour;
    }).length;
    hourlyData.push({ hour, visits: hourVisits });
  }

  // Daily data for last 30 days
  const dailyData: { date: string; visits: number; uniqueVisitors: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - (i * 24 * 60 * 60 * 1000));
    const dateString = date.toDateString();
    const dayVisits = visitors.filter(v => 
      new Date(v.timestamp).toDateString() === dateString
    );
    const uniqueVisitorsForDay = new Set(dayVisits.map(v => v.cookieId)).size;
    
    dailyData.push({
      date: date.toLocaleDateString('vi-VN'),
      visits: dayVisits.length,
      uniqueVisitors: uniqueVisitorsForDay
    });
  }

  // Recent visitors (last 50)
  const recentVisitors = visitors
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);

  return {
    totalVisits: visitors.length,
    uniqueVisitors: uniqueVisitorIds.size,
    todayVisits,
    weeklyVisits,
    monthlyVisits,
    topPages,
    hourlyData,
    dailyData,
    recentVisitors
  };
};

// Clear analytics data (for admin)
export const clearAnalyticsData = (): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.warn('[Analytics] localStorage not available for clearing');
    return;
  }
  
  try {
    localStorage.removeItem('ngochuong_analytics');
    console.log('[Analytics] Analytics data cleared');
  } catch (error) {
    console.error('[Analytics] Error clearing analytics data:', error);
  }
};

// Export analytics data (for backup)
export const exportAnalyticsData = (): string => {
  const data = getVisitorData();
  return JSON.stringify(data, null, 2);
};

// Get real-time stats (for live dashboard)
export const getRealTimeStats = () => {
  const visitors = getVisitorData();
  const now = Date.now();
  const last5Minutes = now - (5 * 60 * 1000);
  const last1Hour = now - (60 * 60 * 1000);
  
  return {
    activeNow: visitors.filter(v => v.timestamp >= last5Minutes).length,
    lastHour: visitors.filter(v => v.timestamp >= last1Hour).length,
    currentSessions: new Set(
      visitors
        .filter(v => v.timestamp >= last5Minutes)
        .map(v => v.sessionId)
    ).size
  };
};