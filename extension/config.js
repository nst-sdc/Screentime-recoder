const EXTENSION_CONFIG = {
  // Environment detection
  ENVIRONMENTS: {
    DEVELOPMENT: "development",
    PRODUCTION: "production"
  },

  // Backend configuration by environment
  BACKEND_CONFIG: {
    development: {
      url: "http://localhost:3000",
      apiPath: "/api/activity/log"
    },
    production: {
      url: "https://screentime-recoder.onrender.com",
      apiPath: "/api/activity/log"
    }
  },

  // Frontend URLs for token sync
  FRONTEND_URLS: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://screentime-recoder.vercel.app"
  ],

  // Allowed hostnames for extension communication
  ALLOWED_HOSTNAMES: [
    "localhost",
    "screentime-recoder.vercel.app",
    "screentime-recoder.onrender.com"
  ]
};

// Environment detection function
function detectEnvironment() {
  // Check if we're in development (localhost backend available)
  return fetch("http://localhost:3000/api/health", {
    method: "GET",
    signal: AbortSignal.timeout(2000)
  })
    .then(response => (response.ok ? "development" : "production"))
    .catch(() => "production"); // Default to production if localhost unavailable
}

// Get backend URL based on environment
async function getBackendUrl() {
  try {
    const environment = await detectEnvironment();
    const config = EXTENSION_CONFIG.BACKEND_CONFIG[environment];
    return `${config.url}${config.apiPath}`;
  } catch (error) {
    console.warn(
      "Environment detection failed, using production backend:",
      error
    );
    const config = EXTENSION_CONFIG.BACKEND_CONFIG.production;
    return `${config.url}${config.apiPath}`;
  }
}

// Validate backend URL security
function isValidBackendUrl(url) {
  try {
    const urlObj = new URL(url);

    // Only allow HTTPS in production or HTTP for localhost
    if (urlObj.protocol !== "https:" && urlObj.hostname !== "localhost") {
      console.error("Invalid protocol for production backend:", url);
      return false;
    }

    // Check if hostname is in allowed list
    if (!EXTENSION_CONFIG.ALLOWED_HOSTNAMES.includes(urlObj.hostname)) {
      console.error("Backend hostname not in allowed list:", urlObj.hostname);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid backend URL format:", url);
    return false;
  }
}

// Helper function to get all allowed origins
function getAllowedOrigins() {
  return [
    ...EXTENSION_CONFIG.FRONTEND_URLS,
    ...Object.values(EXTENSION_CONFIG.BACKEND_CONFIG).map(config => config.url)
  ];
}

// Export for use in other extension files
if (typeof module !== "undefined" && module.exports) {
  module.exports = EXTENSION_CONFIG;
}
