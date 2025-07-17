import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import dashboardService from "../../services/dashboardService";

const ActivityHeatmap = ({ timeRange = "week" }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    peakHours: "2 PM - 4 PM",
    mostActiveDay: "Wednesday",
    consistency: 87,
    workPattern: true
  });
  const svgRef = useRef();

  useEffect(
    () => {
      fetchHeatmapData();
    },
    [timeRange]
  );

  useEffect(
    () => {
      if (heatmapData.length > 0) {
        drawHeatmap();
      }
    },
    [heatmapData]
  );

  useEffect(
    () => {
      const handleThemeChange = () => {
        if (heatmapData.length > 0) {
          drawHeatmap();
        }
      };

      const observer = new MutationObserver(handleThemeChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"]
      });

      return () => observer.disconnect();
    },
    [heatmapData]
  );

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();

      startDate.setDate(endDate.getDate() - 7);

      const response = await dashboardService.getCategoryAnalytics(
        startDate.toISOString(),
        endDate.toISOString(),
        "hour"
      );

      if (response.success) {
        const processedData = processHeatmapData(response.data.timeBreakdown);
        setHeatmapData(processedData);
        calculateInsights(processedData);
      }
    } catch (error) {
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const processHeatmapData = timeData => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 21 }, (_, i) => i); // 0-20 hours
    const heatmapArray = [];

    days.forEach((day, dayIndex) => {
      hours.forEach(hour => {
        heatmapArray.push({
          day: dayIndex,
          dayName: day,
          hour,
          value: 0,
          duration: 0
        });
      });
    });

    timeData.forEach(item => {
      const date = new Date(item._id);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      if (hour <= 20) {
        const index = dayOfWeek * 21 + hour;
        if (heatmapArray[index]) {
          heatmapArray[index].value = item.totalDuration / 1000 / 60;
          heatmapArray[index].duration = item.totalDuration;
        }
      }
    });

    return heatmapArray;
  };

  const generateSampleData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 21 }, (_, i) => i);
    const sampleData = [];

    days.forEach((day, dayIndex) => {
      hours.forEach(hour => {
        let value = 0;

        if (dayIndex >= 1 && dayIndex <= 5) {
          if (hour >= 9 && hour <= 17) {
            value = Math.random() * 80 + 40;
          } else if (hour >= 7 && hour <= 8) {
            value = Math.random() * 30 + 15;
          } else if (hour >= 18 && hour <= 22) {
            value = Math.random() * 50 + 20;
          } else if (hour >= 23 || hour <= 6) {
            value = Math.random() * 10;
          } else {
            value = Math.random() * 25;
          }
        } else {
          if (hour >= 10 && hour <= 14) {
            value = Math.random() * 70 + 30;
          } else if (hour >= 15 && hour <= 20) {
            value = Math.random() * 60 + 20;
          } else if (hour >= 8 && hour <= 9) {
            value = Math.random() * 20 + 10;
          } else {
            value = Math.random() * 15;
          }
        }

        sampleData.push({
          day: dayIndex,
          dayName: day,
          hour,
          value: Math.round(value),
          duration: value * 60 * 1000
        });
      });
    });

    setHeatmapData(sampleData);
    calculateInsights(sampleData);
  };

  const calculateInsights = data => {
    const hourlyTotals = Array(24).fill(0);
    data.forEach(d => {
      hourlyTotals[d.hour] += d.value;
    });

    const maxHourIndex = hourlyTotals.indexOf(Math.max(...hourlyTotals));
    const peakStart = maxHourIndex === 0 ? 12 : maxHourIndex;
    const peakEnd = peakStart + 2;
    const peakHours = `${peakStart === 0
      ? 12
      : peakStart > 12 ? peakStart - 12 : peakStart} ${peakStart >= 12
      ? "PM"
      : "AM"} - ${peakEnd > 12 ? peakEnd - 12 : peakEnd} ${peakEnd >= 12
      ? "PM"
      : "AM"}`;

    const dailyTotals = Array(7).fill(0);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    data.forEach(d => {
      dailyTotals[d.day] += d.value;
    });

    const maxDayIndex = dailyTotals.indexOf(Math.max(...dailyTotals));
    const mostActiveDay = dayNames[maxDayIndex];

    const nonZeroDays = dailyTotals.filter(total => total > 0).length;
    const consistency = Math.round(nonZeroDays / 7 * 100);

    const workHourActivity = data
      .filter(d => d.day >= 1 && d.day <= 5 && d.hour >= 9 && d.hour <= 17)
      .reduce((sum, d) => sum + d.value, 0);

    const totalActivity = data.reduce((sum, d) => sum + d.value, 0);
    const workPattern = workHourActivity / totalActivity > 0.4;

    setInsights({
      peakHours,
      mostActiveDay,
      consistency,
      workPattern
    });
  };

  const drawHeatmap = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 40, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    const cellWidth = width / 21;
    const cellHeight = height / 7;

    const svgElement = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxValue = d3.max(heatmapData, d => +d.value || 0) || 100;

    const isDark = document.documentElement.classList.contains("dark");

    const colorSteps = isDark
      ? ["#374151", "#1e40af", "#059669", "#d97706", "#dc2626", "#991b1b"]
      : ["#f5f5f5", "#dbeafe", "#86efac", "#fde047", "#fb923c", "#ef4444"];

    const stepColorScale = d3
      .scaleQuantize()
      .domain([0, maxValue])
      .range(colorSteps);

    g
      .selectAll(".cell")
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => d.hour * cellWidth)
      .attr("y", d => d.day * cellHeight)
      .attr("width", cellWidth - 1)
      .attr("height", cellHeight - 1)
      .attr("fill", d => stepColorScale(Number(d.value)))
      .attr("stroke", isDark ? "#374151" : "#ffffff")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("ry", 4)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "heatmap-tooltip")
          .style("position", "absolute")
          .style("background", isDark ? "#1f2937" : "#ffffff")
          .style("color", isDark ? "#f9fafb" : "#111827")
          .style("border", `1px solid ${isDark ? "#374151" : "#e5e7eb"}`)
          .style("border-radius", "6px")
          .style("padding", "8px 12px")
          .style("font-size", "12px")
          .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
          .style("pointer-events", "none")
          .style("z-index", "1000").html(`
            <div><strong>${d.dayName}</strong> at ${d.hour}:00</div>
            <div>Activity: ${Math.round(d.value)} minutes</div>
          `);

        const [mouseX, mouseY] = d3.pointer(event, document.body);
        tooltip
          .style("left", mouseX + 10 + "px")
          .style("top", mouseY - 10 + "px");
      })
      .on("mouseout", function() {
        d3.selectAll(".heatmap-tooltip").remove();
      });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    g
      .selectAll(".day-label")
      .data(days)
      .enter()
      .append("text")
      .attr("class", "day-label")
      .attr("x", -10)
      .attr("y", (d, i) => i * cellHeight + cellHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", isDark ? "#9CA3AF" : "#6B7280")
      .style("font-size", "12px")
      .text(d => d);

    const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
    const hourPositions = [0, 4, 8, 12, 16, 20];

    g
      .selectAll(".hour-label")
      .data(hours)
      .enter()
      .append("text")
      .attr("class", "hour-label")
      .attr("x", (d, i) => hourPositions[i] * cellWidth + cellWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", isDark ? "#9CA3AF" : "#6B7280")
      .style("font-size", "12px")
      .text(d => d);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[360px] sm:min-w-[500px] md:min-w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Activity Heatmap
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Low</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-3 h-3 bg-blue-200 dark:bg-blue-900 rounded" />
                <div className="w-3 h-3 bg-green-300 dark:bg-green-700 rounded" />
                <div className="w-3 h-3 bg-yellow-300 dark:bg-yellow-600 rounded" />
                <div className="w-3 h-3 bg-orange-400 dark:bg-orange-600 rounded" />
                <div className="w-3 h-3 bg-red-500 dark:bg-red-600 rounded" />
              </div>
              <span>High</span>
            </div>
          </div>

          <div className="mb-6">
            <svg ref={svgRef} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Peak Hours
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {insights.peakHours}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Most Active Day
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {insights.mostActiveDay}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Consistency
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {insights.consistency}% consistency
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Pattern
              </div>
              <div className="text-lg font-semibold text-green-600">
                {insights.workPattern
                  ? "Work pattern detected"
                  : "Flexible schedule"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
