/**
 * Mobile Viewport Height Fix
 * Fixes the iOS Safari viewport height issue where 100vh includes the address bar
 */

export const initMobileViewportFix = (): void => {
  // Only run on client side
  if (typeof window === 'undefined') return;

  const setVH = () => {
    // Get the actual viewport height
    const vh = window.innerHeight * 0.01;
    // Set CSS custom property
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Set on load
  setVH();

  // Update on resize
  window.addEventListener('resize', setVH);

  // Update on orientation change (important for mobile)
  window.addEventListener('orientationchange', () => {
    // Small delay to ensure viewport is resized
    setTimeout(setVH, 100);
  });
};

/**
 * Detect if the browser is iOS Safari
 */
export const isIOSSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const isIOSSafari = iOS && webkit && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
  
  return isIOSSafari;
};

/**
 * Detect if device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
};

/**
 * Get device info for debugging
 */
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'N/A',
      isMobile: false,
      isIOS: false,
      isIOSSafari: false,
      viewportWidth: 0,
      viewportHeight: 0,
      devicePixelRatio: 1,
    };
  }

  return {
    userAgent: window.navigator.userAgent,
    isMobile: isMobileDevice(),
    isIOS: /iPad|iPhone|iPod/.test(window.navigator.userAgent),
    isIOSSafari: isIOSSafari(),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
};

/**
 * Fix iOS input zoom issue by ensuring all inputs have font-size >= 16px
 */
export const fixIOSInputZoom = (): void => {
  if (typeof document === 'undefined') return;
  
  if (!isIOSSafari()) return;

  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const element = input as HTMLElement;
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    
    if (fontSize < 16) {
      element.style.fontSize = '16px';
    }
  });
};

/**
 * Disable double-tap zoom on specific elements
 */
export const disableDoubleTapZoom = (selector: string): void => {
  if (typeof document === 'undefined') return;

  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    let lastTouchEnd = 0;
    element.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  });
};

/**
 * Prevent iOS rubber band effect (overscroll)
 */
export const preventRubberBand = (): void => {
  if (typeof document === 'undefined') return;
  
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Prevent overscroll at top
    if (scrollTop <= 0 && y > startY) {
      e.preventDefault();
    }

    // Prevent overscroll at bottom
    if (scrollTop + clientHeight >= scrollHeight && y < startY) {
      e.preventDefault();
    }
  }, { passive: false });
};

/**
 * Initialize all mobile fixes
 */
export const initAllMobileFixes = (): void => {
  initMobileViewportFix();
  fixIOSInputZoom();
  
  // Log device info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📱 Mobile Device Info:', getDeviceInfo());
  }
};

export default {
  initMobileViewportFix,
  initAllMobileFixes,
  isIOSSafari,
  isMobileDevice,
  getDeviceInfo,
  fixIOSInputZoom,
  disableDoubleTapZoom,
  preventRubberBand,
};

