import React from "react";

const BarChart = ({ data }) => {
  if (!data || data.length === 0) return <p>No activity data</p>;

  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1); // avoid divide by 0

  const formatTime = (min) => {
    const hrs = Math.floor(min / 60);
    const mins = min % 60;
    if (hrs === 0) return `${mins} min`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="w-full h-64 flex items-end space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 px-2">
      {data.map((item, index) => {
        const heightPercent = (item.minutes / maxMinutes) * 100;
        const height = Math.max(heightPercent, 5); // min height 5% for visibility

        return (
          <div
            key={index}
            className="flex flex-col items-center w-20 shrink-0 text-center"
          >
            <div
              className="w-full bg-green-500 rounded-t-md hover:bg-green-400 transition-all"
              style={{ height: `${height}%`, minHeight: "10px" }}
              title={`${item.category}: ${formatTime(item.minutes)}`}
            ></div>
            <div
              className="text-xs mt-1 text-gray-700 dark:text-gray-300 truncate"
              title={item.category}
            >
              {item.category.length > 10
                ? item.category.slice(0, 10) + "..."
                : item.category}
            </div>
            <div className="text-xs text-gray-500">{formatTime(item.minutes)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
