// Extension Configuration
// Update these URLs to match your deployed applications

const EXTENSION_CONFIG = {
  // Frontend URLs (Vercel)
  FRONTEND_URLS: [
    "http://localhost:5173",
    "https://screentime-recoder.vercel.app"
  ],

  // Backend URLs (Render)
  BACKEND_URLS: [
    "http://localhost:3000",
    "https://screentime-recoder.onrender.com"
  ],

  // API Endpoint
  API_ENDPOINT: "https://screentime-recoder.onrender.com/api/activity/log",

  // Allowed hostnames for extension communication
  ALLOWED_HOSTNAMES: ["localhost", "screentime-recoder.vercel.app"]
};

// Helper function to get all allowed origins
function getAllowedOrigins() {
  return [...EXTENSION_CONFIG.FRONTEND_URLS, ...EXTENSION_CONFIG.BACKEND_URLS];
}

// Export for use in other extension files
if (typeof module !== "undefined" && module.exports) {
  module.exports = EXTENSION_CONFIG;
}
