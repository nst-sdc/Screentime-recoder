// ✅ Must be at the top!
import React from "react";

const BarChart = ({ data }) => {
  if (!data || data.length === 0) return <p>No activity data</p>;

  const maxMinutes = Math.max(...data.map((d) => d.minutes));

  return (
    <div className="w-full h-64 flex items-end space-x-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      {data.map((item, index) => {
        const height = (item.minutes / maxMinutes) * 100 || 1;

        return (
          <div key={index} className="flex flex-col items-center group w-20 shrink-0">
            <div
              className="w-full bg-green-500 rounded-t-md group-hover:bg-green-400 transition-all"
              style={{ height: `${height}%`, minHeight: "10px" }}
              title={`${item.category} - ${item.minutes} min`}
            />
            <div
              className="text-xs text-center truncate mt-1 max-w-full"
              title={item.category}
            >
              {item.category.length > 15
                ? item.category.slice(0, 12) + "..."
                : item.category}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
