import React, { useState, useMemo } from "react";
import {
  FaChrome,
  FaSafari,
  FaEdge,
  FaFigma,
  FaMicrosoft,
  FaDesktop,
  FaSearch,
  FaFilter,
  FaSort,
  FaClock,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaSlack,
  FaDiscord,
  FaTelegram,
  FaWhatsapp,
  FaSpotify,
  FaAmazon,
  FaApple,
  FaGoogle,
  FaTwitch,
  FaPinterest,
  FaReddit,
  FaTiktok,
  FaShopify
} from "react-icons/fa";

const iconMap = {
  // Search Engines & Browsers
  "google.com": <FaGoogle className="text-blue-500" />,
  "bing.com": <FaMicrosoft className="text-blue-600" />,
  "duckduckgo.com": <FaSearch className="text-orange-600" />,
  "yahoo.com": <FaSearch className="text-purple-600" />,

  // Social Media
  "youtube.com": <FaYoutube className="text-red-600" />,
  "twitter.com": <FaTwitter className="text-blue-400" />,
  "x.com": <FaTwitter className="text-black" />,
  "facebook.com": <FaFacebook className="text-blue-600" />,
  "instagram.com": <FaInstagram className="text-pink-500" />,
  "linkedin.com": <FaLinkedin className="text-blue-700" />,
  "tiktok.com": <FaTiktok className="text-black" />,
  "pinterest.com": <FaPinterest className="text-red-600" />,
  "reddit.com": <FaReddit className="text-orange-600" />,
  "snapchat.com": <FaDesktop className="text-yellow-400" />,

  // Development & Code
  "github.com": <FaGithub className="text-gray-800" />,
  "gitlab.com": <FaDesktop className="text-orange-600" />,
  "bitbucket.org": <FaDesktop className="text-blue-600" />,
  "stackoverflow.com": <FaDesktop className="text-orange-500" />,
  "codepen.io": <FaDesktop className="text-black" />,
  "codesandbox.io": <FaDesktop className="text-blue-500" />,
  "replit.com": <FaDesktop className="text-orange-500" />,
  "vercel.com": <FaDesktop className="text-black" />,
  "netlify.com": <FaDesktop className="text-teal-500" />,
  "heroku.com": <FaDesktop className="text-purple-600" />,

  // Cloud Services
  "aws.amazon.com": <FaAmazon className="text-orange-500" />,
  "console.aws.amazon.com": <FaAmazon className="text-orange-500" />,
  "cloud.google.com": <FaGoogle className="text-blue-500" />,
  "azure.microsoft.com": <FaMicrosoft className="text-blue-600" />,
  "digitalocean.com": <FaDesktop className="text-blue-500" />,

  // Databases
  "cloud.mongodb.com": <FaDesktop className="text-green-600" />,
  "mongodb.com": <FaDesktop className="text-green-600" />,
  "postgresql.org": <FaDesktop className="text-blue-600" />,
  "mysql.com": <FaDesktop className="text-blue-700" />,
  "redis.io": <FaDesktop className="text-red-600" />,
  "elastic.co": <FaDesktop className="text-yellow-500" />,

  // Communication
  "zoom.us": <FaDesktop className="text-blue-500" />,
  "teams.microsoft.com": <FaMicrosoft className="text-blue-600" />,
  "slack.com": <FaSlack className="text-purple-600" />,
  "discord.com": <FaDiscord className="text-indigo-600" />,
  "telegram.org": <FaTelegram className="text-blue-500" />,
  "web.whatsapp.com": <FaWhatsapp className="text-green-500" />,
  "messenger.com": <FaDesktop className="text-blue-600" />,
  "skype.com": <FaDesktop className="text-blue-500" />,

  // Email
  "gmail.com": <FaGoogle className="text-red-600" />,
  "mail.google.com": <FaGoogle className="text-red-600" />,
  "outlook.com": <FaMicrosoft className="text-blue-600" />,
  "outlook.office.com": <FaMicrosoft className="text-blue-600" />,

  // Productivity Tools
  "notion.so": <FaDesktop className="text-black" />,
  "trello.com": <FaDesktop className="text-blue-600" />,
  "asana.com": <FaDesktop className="text-red-500" />,
  "atlassian.net": <FaDesktop className="text-blue-600" />,
  "confluence.atlassian.com": <FaDesktop className="text-blue-600" />,
  "monday.com": <FaDesktop className="text-purple-600" />,
  "airtable.com": <FaDesktop className="text-yellow-500" />,

  // Design Tools
  "figma.com": <FaFigma className="text-purple-600" />,
  "canva.com": <FaDesktop className="text-blue-500" />,
  "adobe.com": <FaDesktop className="text-red-600" />,
  "photoshop.adobe.com": <FaDesktop className="text-blue-600" />,
  "illustrator.adobe.com": <FaDesktop className="text-orange-600" />,
  "indesign.adobe.com": <FaDesktop className="text-pink-600" />,
  "lightroom.adobe.com": <FaDesktop className="text-blue-700" />,
  "premierepro.adobe.com": <FaDesktop className="text-purple-700" />,
  "aftereffects.adobe.com": <FaDesktop className="text-purple-800" />,

  // Entertainment
  "spotify.com": <FaSpotify className="text-green-500" />,
  "twitch.tv": <FaTwitch className="text-purple-600" />,
  "amazon.com": <FaAmazon className="text-orange-500" />,
  "primevideo.com": <FaAmazon className="text-blue-600" />,
  "hulu.com": <FaDesktop className="text-green-500" />,
  "disneyplus.com": <FaDesktop className="text-blue-600" />,

  // News & Information
  "wikipedia.org": <FaDesktop className="text-gray-700" />,
  "bbc.com": <FaDesktop className="text-red-600" />,
  "cnn.com": <FaDesktop className="text-red-700" />,
  "nytimes.com": <FaDesktop className="text-gray-800" />,
  "medium.com": <FaDesktop className="text-black" />,

  // E-commerce
  "ebay.com": <FaDesktop className="text-blue-600" />,
  "shopify.com": <FaShopify className="text-green-600" />,
  "etsy.com": <FaDesktop className="text-orange-600" />,
  "walmart.com": <FaDesktop className="text-blue-600" />,

  // Development Tools
  "vscode.dev": <FaDesktop className="text-blue-600" />,
  "github.dev": <FaGithub className="text-gray-800" />,
  "codespaces.new": <FaGithub className="text-gray-800" />,
  "jetbrains.com": <FaDesktop className="text-orange-600" />,
  "sublimetext.com": <FaDesktop className="text-orange-600" />,

  // Education & Learning
  "coursera.org": <FaDesktop className="text-blue-600" />,
  "udemy.com": <FaDesktop className="text-purple-600" />,
  "edx.org": <FaDesktop className="text-blue-700" />,
  "khanacademy.org": <FaDesktop className="text-green-600" />,
  "codecademy.com": <FaDesktop className="text-blue-500" />,

  // Local Development
  localhost: <FaDesktop className="text-green-600" />,
  "127.0.0.1": <FaDesktop className="text-green-600" />,
  "0.0.0.0": <FaDesktop className="text-green-600" />,

  // AI Tools
  "openai.com": <FaDesktop className="text-green-600" />,
  "chatgpt.com": <FaDesktop className="text-green-600" />,
  "claude.ai": <FaDesktop className="text-orange-600" />,
  "bard.google.com": <FaGoogle className="text-blue-500" />,

  // Default browsers
  chrome: <FaChrome className="text-blue-500" />,
  safari: <FaSafari className="text-blue-600" />,
  firefox: <FaEdge className="text-orange-600" />,
  edge: <FaEdge className="text-blue-600" />
};

// Get appropriate icon for domain
const getIconForDomain = domain => {
  if (!domain) return <FaDesktop className="text-gray-500" />;

  const cleanDomain = domain.toLowerCase().replace(/^www\./, "");

  // Direct match
  if (iconMap[cleanDomain]) return iconMap[cleanDomain];

  // Partial matches for subdomains
  const domainKey = Object.keys(iconMap).find(
    key => cleanDomain.includes(key) || key.includes(cleanDomain)
  );

  if (domainKey) return iconMap[domainKey];

  // Default icon based on domain type
  if (cleanDomain.includes("github"))
    return <FaGithub className="text-gray-800" />;
  if (cleanDomain.includes("google"))
    return <FaGoogle className="text-blue-500" />;
  if (cleanDomain.includes("microsoft"))
    return <FaMicrosoft className="text-blue-600" />;
  if (cleanDomain.includes("amazon"))
    return <FaAmazon className="text-orange-500" />;
  if (cleanDomain.includes("apple"))
    return <FaApple className="text-gray-800" />;

  return <FaDesktop className="text-gray-500" />;
};

// Enhanced duration formatting
const formatDuration = ms => {
  if (!ms || ms === 0) return "0m";

  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days}d`;
    return `${days}d ${remainingHours}h`;
  }

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

// Productivity level calculation
const getProductivityLevel = score => {
  if (score >= 8) return "high";
  if (score >= 5) return "medium";
  return "low";
};

// Productivity colors
const getProductivityColors = level => {
  switch (level) {
    case "high":
      return "text-green-700 bg-green-100 border-green-300 dark:text-green-400 dark:bg-green-900/20 dark:border-green-700";
    case "medium":
      return "text-yellow-700 bg-yellow-100 border-yellow-300 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-700";
    case "low":
      return "text-red-700 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700";
    default:
      return "text-gray-700 bg-gray-100 border-gray-300 dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-700";
  }
};

const AppList = ({
  data = [],
  showProductivity = true,
  maxItems = 10,
  sortBy: initialSortBy = "duration",
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterBy, setFilterBy] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");


  const categories = useMemo(() => {
    if (!data) return [];
    const cats = new Set(data.map(item => item.categoryName || "Uncategorized"));
    return Array.from(cats).sort();
  }, [data]);


  const processedData = useMemo(
    () => {
      try {
        if (!Array.isArray(data) || data.length === 0) return [];

        let filtered = data.map((item, index) => {

          const rawProductivity =
            item.productivity || item.avgProductivityScore || 5;
          const productivity =
            typeof rawProductivity === "number"
              ? Math.min(10, Math.max(0, rawProductivity))
              : Math.min(10, Math.max(0, parseFloat(rawProductivity) || 5));

          return {
            id: item._id || item.domain || `item-${index}`,
            domain: item._id || item.domain || "Unknown",
            duration: Math.max(0, item.totalDuration || item.duration || 0),
            sessions: Math.max(1, item.sessionCount || item.sessions || 1),
            productivity,
            lastVisit: item.lastVisit || item.updatedAt || new Date(),
            categoryName: item.categoryName || "Uncategorized"
          };
        });


        if (searchTerm) {
          filtered = filtered.filter(
            item =>
              item.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }


        if (filterBy !== "all") {
          filtered = filtered.filter(item => {
            const level = getProductivityLevel(item.productivity);
            return level === filterBy;
          });
        }


        if (categoryFilter !== "all") {
          filtered = filtered.filter(item => item.categoryName === categoryFilter);
        }


        filtered.sort((a, b) => {
          let comparison = 0;

          switch (sortBy) {
            case "duration":
              comparison = b.duration - a.duration;
              break;
            case "sessions":
              comparison = b.sessions - a.sessions;
              break;
            case "productivity":
              comparison = b.productivity - a.productivity;
              break;
            case "domain":
              comparison = a.domain.localeCompare(b.domain);
              break;
            case "lastVisit":
              comparison = new Date(b.lastVisit) - new Date(a.lastVisit);
              break;
            case "category":
              comparison = (a.categoryName || "").localeCompare(b.categoryName || "");
              break;
            default:
              comparison = b.duration - a.duration;
          }

          return sortOrder === "desc" ? comparison : -comparison;
        });

        return filtered.slice(0, maxItems);
      } catch (error) {
        console.error("Error processing AppList data:", error);
        return [];
      }
    },
    [data, searchTerm, sortBy, sortOrder, filterBy, categoryFilter, maxItems]
  );

  const toggleSort = () => {
    setSortOrder(prev => (prev === "desc" ? "asc" : "desc"));
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FaDesktop className="mx-auto text-4xl mb-3 opacity-50" />
        <p className="text-lg font-medium">No activity data available</p>
        <p className="text-sm mt-1">
          Start browsing to see your activity tracking
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        {!compact && (
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search domains or categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        {compact && <div className="flex-1 font-medium text-sm text-gray-500 dark:text-gray-400">Latest Updates</div>}


        <div className="flex gap-2 flex-wrap">
          {/* Category Filter - Always visible if compact or not */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Productivity Filter */}
          {showProductivity && (
            <select
              value={filterBy}
              onChange={e => setFilterBy(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="high">High Prod.</option>
              <option value="medium">Medium Prod.</option>
              <option value="low">Low Prod.</option>
            </select>
          )}

          {!compact && (
            <>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="duration">Duration</option>
                <option value="sessions">Sessions</option>
                <option value="productivity">Prod. Score</option>
                <option value="domain">Domain</option>
                <option value="category">Category</option>
                <option value="lastVisit">Last Visit</option>
              </select>

              <button
                onClick={toggleSort}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                title={`Sort ${sortOrder === "desc" ? "Ascending" : "Descending"}`}
              >
                <FaSort
                  className={`transform transition-transform ${sortOrder === "asc"
                    ? "rotate-180"
                    : ""}`}
                />
              </button>
            </>
          )}
        </div>
      </div>


      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>
          Showing {processedData.length} of {data.length} activities
          {searchTerm && ` for "${searchTerm}"`}
        </span>
        {processedData.length > 0 &&
          <span className="flex items-center gap-1">
            <FaClock className="text-xs" />
            Total:{" "}
            {formatDuration(
              processedData.reduce((sum, item) => sum + item.duration, 0)
            )}
          </span>}
      </div>


      {processedData.length === 0
        ? <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <FaFilter className="mx-auto text-2xl mb-2 opacity-50" />
          <p>No activities match your search criteria</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterBy("all");
            }}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
        : <div className="space-y-2">
          {processedData.map((item, idx) => {
            const icon = getIconForDomain(item.domain);
            const productivityLevel = getProductivityLevel(item.productivity);
            const productivityColors = getProductivityColors(
              productivityLevel
            );

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 text-xl">
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {item.domain}
                      </p>
                      {showProductivity &&
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${productivityColors}`}
                        >
                          {typeof item.productivity === "number"
                            ? item.productivity.toFixed(1)
                            : "5.0"}
                        </span>}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaClock className="text-xs" />
                        {formatDuration(item.duration)}
                      </span>
                      <span>
                        {item.sessions} session{item.sessions !== 1 ? "s" : ""}
                      </span>
                      {item.categoryName &&
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {item.categoryName}
                        </span>}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDuration(item.duration)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.lastVisit).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>}


      {data.length > maxItems &&
        processedData.length === maxItems &&
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing top {maxItems} results. {data.length - maxItems} more
            activities available.
          </p>
        </div>}
    </div>
  );
};

export default AppList;
