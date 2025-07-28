// Register service worker
export const registerSW = async () => {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              showUpdateNotification();
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  }
};

// Show update notification
const showUpdateNotification = () => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Gulu Inventory Update', {
      body: 'New version available! Refresh to update.',
      icon: '/icons/icon-192x192.png',
      tag: 'app-update'
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
  return false;
};

// Add to home screen detection
export const isStandalone = () => {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
};

// Check if PWA is installable
export const isPWAInstallable = () => {
  return typeof navigator !== 'undefined' && typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Offline detection
export const isOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true;

// Add offline/online event listeners
export const addConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }
  
  return () => {}; // Return empty cleanup function if window is not available
};