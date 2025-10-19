/**
 * Anti-Bot Middleware for Express.js
 * Blocks requests from known bots, crawlers, scrapers, and automated tools
 */

// Comprehensive list of bot patterns to block
const BOT_PATTERNS = [
  // Generic bot indicators
  /bot/i,
  /spider/i,
  /crawler/i,
  /scraper/i,
  /scan/i,
  
  // Command-line tools
  /curl/i,
  /wget/i,
  /python/i,
  /java(?!script)/i, // Match "Java" but not "JavaScript"
  /perl/i,
  /ruby/i,
  /php/i,
  /node-fetch/i,
  /axios/i,
  /httpclient/i,
  /okhttp/i,
  /go-http-client/i,
  
  // API testing tools
  /postman/i,
  /insomnia/i,
  /paw/i,
  /httpie/i,
  
  // Search engine bots
  /google(?!play|maps)/i,
  /googlebot/i,
  /bingbot/i,
  /bingpreview/i,
  /yahoo/i,
  /slurp/i,
  /duckduckbot/i,
  /baidu/i,
  /yandex/i,
  /sogou/i,
  /exabot/i,
  /msn/i,
  /ask jeeves/i,
  /teoma/i,
  
  // Social media bots
  /facebookexternalhit/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegram/i,
  /skype/i,
  /slackbot/i,
  /discordbot/i,
  /pinterest/i,
  /tumblr/i,
  /reddit/i,
  
  // SEO and monitoring tools
  /semrush/i,
  /ahrefs/i,
  /majestic/i,
  /moz/i,
  /screaming frog/i,
  /sitebulb/i,
  /serpstat/i,
  /gtmetrix/i,
  /pingdom/i,
  /uptimerobot/i,
  /newrelic/i,
  /datadog/i,
  
  // Archive and cache bots
  /archive/i,
  /wayback/i,
  /archive\.org/i,
  /memorybot/i,
  /ia_archiver/i,
  
  // Feed readers
  /feedfetcher/i,
  /feedly/i,
  /rss/i,
  /atom/i,
  
  // Headless browsers and automation
  /headlesschrome/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /webdriver/i,
  /phantomjs/i,
  /nightmare/i,
  /zombie/i,
  /jsdom/i,
  
  // Security scanners
  /nikto/i,
  /nessus/i,
  /openvas/i,
  /nmap/i,
  /masscan/i,
  /metasploit/i,
  /sqlmap/i,
  /w3af/i,
  /burp/i,
  /zap/i,
  /acunetix/i,
  /netsparker/i,
  /appscan/i,
  /qualys/i,
  
  // Link checkers
  /linkchecker/i,
  /validator/i,
  /w3c/i,
  
  // Miscellaneous bots
  /apache-httpclient/i,
  /mechanize/i,
  /requests/i,
  /urllib/i,
  /libwww/i,
  /lwp/i,
  /winhttp/i,
  /http_request/i,
  /scrapy/i,
  /beautifulsoup/i,
  /htmlparser/i,
  /jsoup/i,
  /grabber/i,
  /harvester/i,
  /extractor/i,
  /parser/i,
  /fetcher/i,
  /collector/i,
  /reaper/i,
  /siphon/i,
  /sucker/i,
  /stripper/i,
  /snagger/i,
  /copier/i,
  
  // Other suspicious patterns
  /^$/,  // Empty user agent
  /unknown/i,
  /undefined/i,
  /test/i,
  /scanner/i,
  /exploit/i,
  /attack/i,
];

// Additional suspicious indicators
const SUSPICIOUS_INDICATORS = {
  // Missing common headers that real browsers send
  missingHeaders: ['accept', 'accept-language'],
  
  // Suspicious HTTP methods for certain endpoints
  suspiciousMethods: ['HEAD', 'OPTIONS', 'TRACE'],
  
  // Rate limiting threshold (requests per minute)
  rateLimitThreshold: 60,
};

// Store for rate limiting (in production, use Redis or similar)
const requestCounts = new Map();

/**
 * Clean up old entries from rate limiter every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.firstRequest > 60000) {
      requestCounts.delete(key);
    }
  }
}, 300000);

/**
 * Check if user agent is a legitimate browser (desktop or mobile)
 */
function isLegitimateBrowser(userAgent) {
  // Legitimate browser patterns (desktop and mobile)
  const browserPatterns = [
    // Desktop browsers
    /Mozilla.*Firefox/i,
    /Chrome.*Safari.*Mozilla/i,  // Chrome includes Mozilla and Safari
    /Safari.*Version/i,           // Safari browser
    /Edg\//i,                     // Edge
    /OPR\//i,                     // Opera
    /Brave/i,
    
    // Mobile browsers
    /Mobile.*Safari/i,
    /iPhone.*Safari/i,
    /iPad.*Safari/i,
    /Android.*Chrome/i,
    /Android.*Safari/i,
    /Mobile.*Chrome/i,
    /CriOS/i,  // Chrome on iOS
    /FxiOS/i,  // Firefox on iOS
    /EdgiOS/i, // Edge on iOS
  ];
  
  // Must have Mozilla in user agent (all major browsers have this)
  const hasMozilla = /Mozilla/i.test(userAgent);
  
  // Check if matches any browser pattern
  const matchesBrowser = browserPatterns.some(pattern => pattern.test(userAgent));
  
  return hasMozilla && matchesBrowser;
}

/**
 * Check if user agent is a legitimate mobile browser (backward compatibility)
 */
function isLegitimeMobileBrowser(userAgent) {
  return isLegitimateBrowser(userAgent);
}

/**
 * Check if user agent matches any bot patterns
 */
function isBotUserAgent(userAgent) {
  if (!userAgent || userAgent.trim() === '') {
    return true; // Empty user agent is suspicious
  }
  
  // IMPORTANT: Check for legitimate browsers FIRST before checking bot patterns
  // This prevents false positives from browser user agents
  if (isLegitimateBrowser(userAgent)) {
    return false; // It's a real browser, allow it
  }
  
  // Now check if it matches bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check for missing headers that real browsers typically send
 */
function hasMissingBrowserHeaders(req) {
  const userAgent = req.get('User-Agent') || '';
  
  // Be more lenient with mobile browsers
  if (isLegitimeMobileBrowser(userAgent)) {
    return false;
  }
  
  const missingCount = SUSPICIOUS_INDICATORS.missingHeaders.filter(
    header => !req.get(header)
  ).length;
  
  // If more than 50% of expected headers are missing, flag as suspicious
  return missingCount > SUSPICIOUS_INDICATORS.missingHeaders.length / 2;
}

/**
 * Simple rate limiting check
 */
function isRateLimited(identifier) {
  const now = Date.now();
  const data = requestCounts.get(identifier);
  
  if (!data) {
    requestCounts.set(identifier, {
      count: 1,
      firstRequest: now,
    });
    return false;
  }
  
  // Reset if more than a minute has passed
  if (now - data.firstRequest > 60000) {
    requestCounts.set(identifier, {
      count: 1,
      firstRequest: now,
    });
    return false;
  }
  
  data.count++;
  
  return data.count > SUSPICIOUS_INDICATORS.rateLimitThreshold;
}

/**
 * Log blocked bot attempts
 */
function logBlockedBot(req, reason) {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'N/A';
  const path = req.path;
  const method = req.method;
  
  console.log('🚫 BOT BLOCKED:', {
    timestamp,
    ip,
    userAgent,
    path,
    method,
    reason,
  });
}

/**
 * Anti-Bot Middleware
 */
function antiBotMiddleware(options = {}) {
  const {
    whitelist = [],  // IP addresses or patterns to whitelist
    enableRateLimiting = true,
    enableHeaderCheck = true,
    logBlocked = true,
    customPatterns = [],  // Additional custom patterns to block
  } = options;
  
  // Merge custom patterns with default ones
  const allPatterns = [...BOT_PATTERNS, ...customPatterns];
  
  return (req, res, next) => {
    // Check if IP is whitelisted
    const ip = req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress;
    if (whitelist.some(pattern => 
      typeof pattern === 'string' ? ip === pattern : pattern.test(ip)
    )) {
      return next();
    }
    
    const userAgent = req.get('User-Agent') || '';
    
    // Check 1: Bot User Agent
    if (isBotUserAgent(userAgent)) {
      if (logBlocked) {
        logBlockedBot(req, 'Bot user agent detected');
      }
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Automated requests are not allowed',
      });
    }
    
    // Check 2: Missing browser headers
    if (enableHeaderCheck && hasMissingBrowserHeaders(req)) {
      if (logBlocked) {
        logBlockedBot(req, 'Missing expected browser headers');
      }
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Invalid request headers',
      });
    }
    
    // Check 3: Rate limiting
    if (enableRateLimiting && isRateLimited(ip)) {
      if (logBlocked) {
        logBlockedBot(req, 'Rate limit exceeded');
      }
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Please slow down and try again later',
      });
    }
    
    // All checks passed
    next();
  };
}

// Export middleware and utilities
module.exports = {
  antiBotMiddleware,
  isBotUserAgent,
  isLegitimeMobileBrowser,
  BOT_PATTERNS,
};

