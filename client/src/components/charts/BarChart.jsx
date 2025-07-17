import React, { useState } from "react";
import { FaChartBar, FaFilter, FaSort } from "react-icons/fa";

const BarChart = ({
  data,
  showValues = true,
  sortable = true,
  colorScheme = "default"
}) => {
  const [sortBy, setSortBy] = useState("value");
  const [sortOrder, setSortOrder] = useState("desc");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-200">
        <FaChartBar className="mx-auto text-4xl mb-3 opacity-50" />
        <p className="text-lg font-medium">No activity data available</p>
        <p className="text-sm mt-1">
          Data will appear here once you start tracking
        </p>
      </div>
    );
  }

  // Enhanced data processing with proper type validation
  const processedData = data.map((item, index) => {
    // Ensure productivity is a valid number
    const rawProductivity = item.productivity || item.avgProductivityScore || 5;
    const productivity =
      typeof rawProductivity === "number"
        ? Math.min(10, Math.max(0, rawProductivity))
        : Math.min(10, Math.max(0, parseFloat(rawProductivity) || 5));

    return {
      id: index,
      category: item.category || item._id || item.name || "Unknown",
      minutes:
        item.minutes ||
        Math.floor((item.totalDuration || item.duration || 0) / 60000),
      sessions: Math.max(1, item.sessions || item.sessionCount || 0),
      productivity,
      originalIndex: index
    };
  });

  // Sort data if sortable
  const sortedData = sortable
    ? [...processedData].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "value":
            comparison = b.minutes - a.minutes;
            break;
          case "category":
            comparison = a.category.localeCompare(b.category);
            break;
          case "productivity":
            comparison = b.productivity - a.productivity;
            break;
          case "sessions":
            comparison = b.sessions - a.sessions;
            break;
          default:
            comparison = b.minutes - a.minutes;
        }
        return sortOrder === "desc" ? comparison : -comparison;
      })
    : processedData;

  const maxMinutes = Math.max(...sortedData.map(d => d.minutes), 1);

  // Color schemes
  const getBarColor = (item, index, isHovered) => {
    const baseOpacity = isHovered ? "90" : "80";
    const hoverOpacity = isHovered ? "100" : "80";

    switch (colorScheme) {
      case "productivity":
        if (item.productivity >= 8) return `bg-green-500 hover:bg-green-400`;
        if (item.productivity >= 5) return `bg-yellow-500 hover:bg-yellow-400`;
        return `bg-red-500 hover:bg-red-400`;
      case "gradient":
        const colors = [
          "bg-blue-500",
          "bg-purple-500",
          "bg-pink-500",
          "bg-red-500",
          "bg-orange-500",
          "bg-yellow-500",
          "bg-green-500",
          "bg-teal-500"
        ];
        return `${colors[index % colors.length]} hover:${colors[
          index % colors.length
        ].replace("500", "400")}`;
      case "monochrome":
        return `bg-gray-600 hover:bg-gray-500`;
      default:
        return `bg-blue-500 hover:bg-blue-400`;
    }
  };

  const formatTime = min => {
    if (min === 0) return "0m";
    if (min < 60) return `${min}m`;
    const hrs = Math.floor(min / 60);
    const mins = min % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const formatCategory = category => {
    const maxLength = 12;
    return category.length > maxLength
      ? category.slice(0, maxLength) + "..."
      : category;
  };

  const toggleSort = () => {
    setSortOrder(prev => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="w-full">
      {/* Header with controls */}
      {sortable &&
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FaChartBar className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Activity Overview
            </span>
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="value">Duration</option>
              <option value="category">Category</option>
              <option value="productivity">Productivity</option>
              <option value="sessions">Sessions</option>
            </select>

            <button
              onClick={toggleSort}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500"
              title={`Sort ${sortOrder === "desc"
                ? "Ascending"
                : "Descending"}`}
            >
              <FaSort
                className={`transform transition-transform ${sortOrder === "asc"
                  ? "rotate-180"
                  : ""}`}
              />
            </button>
          </div>
        </div>}

      {/* Chart container */}
      <div className="w-full h-64 flex items-end space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 px-2 py-2">
        {sortedData.map((item, index) => {
          const heightPercent = item.minutes / maxMinutes * 100;
          const height = Math.max(heightPercent, 5); // Minimum height for visibility
          const isHovered = hoveredIndex === index;
          const barColor = getBarColor(item, index, isHovered);

          return (
            <div
              key={`${item.category}-${item.id}`}
              className="flex flex-col items-center min-w-16 text-center group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Value label on top */}
              {showValues &&
                <div
                  className={`text-xs font-medium mb-1 transition-opacity ${isHovered
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"} text-gray-500 dark:text-gray-300`}
                >
                  {formatTime(item.minutes)}
                </div>}

              {/* Bar */}
              <div
                className={`w-full ${barColor} rounded-t-md transition-all duration-300 relative overflow-hidden`}
                style={{
                  height: `${height}%`,
                  minHeight: "10px",
                  transform: isHovered ? "scale(1.05)" : "scale(1)"
                }}
                title={`${item.category}: ${formatTime(
                  item.minutes
                )}${item.productivity && typeof item.productivity === "number"
                  ? ` (Productivity: ${item.productivity.toFixed(1)}/10)`
                  : ""}${item.sessions ? ` - ${item.sessions} sessions` : ""}`}
              >
                {/* Shine effect on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -skew-x-12`}
                />
              </div>

              {/* Category label */}
              <div className="text-xs mt-2 text-gray-700 dark:text-gray-300 font-medium max-w-full">
                <div className="truncate" title={item.category}>
                  {formatCategory(item.category)}
                </div>

                {/* Additional info on hover */}
                {isHovered &&
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                    <div>
                      {formatTime(item.minutes)}
                    </div>
                    {item.sessions > 0 &&
                      <div>
                        {item.sessions} session{item.sessions !== 1 ? "s" : ""}
                      </div>}
                    {item.productivity &&
                      typeof item.productivity === "number" &&
                      colorScheme === "productivity" &&
                      <div
                        className={`font-medium ${item.productivity >= 8
                          ? "text-green-600"
                          : item.productivity >= 5
                            ? "text-yellow-600"
                            : "text-red-600"}`}
                      >
                        {item.productivity.toFixed(1)}/10
                      </div>}
                  </div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            {sortedData.length} categor{sortedData.length !== 1 ? "ies" : "y"}
          </span>
          <span>
            Total:{" "}
            {formatTime(
              sortedData.reduce((sum, item) => sum + item.minutes, 0)
            )}
          </span>
        </div>

        {colorScheme === "productivity" &&
          <div className="flex justify-center mt-2 space-x-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>High (8-10)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Medium (5-7)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>Low (1-4)</span>
            </div>
          </div>}
      </div>
    </div>
  );
};

export default BarChart;
