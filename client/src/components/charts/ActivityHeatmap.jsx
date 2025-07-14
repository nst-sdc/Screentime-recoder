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
      console.error("Error fetching heatmap data:", error);
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

    // Process actual data
    timeData.forEach(item => {
      const date = new Date(item._id);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      if (hour <= 20) {
        const index = dayOfWeek * 21 + hour;
        if (heatmapArray[index]) {
          heatmapArray[index].value = item.totalDuration / 1000 / 60; // Convert to minutes
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

        // Create realistic activity patterns
        if (dayIndex >= 1 && dayIndex <= 5) {
          // Weekdays
          if (hour >= 9 && hour <= 17) {
            // Work hours - higher activity
            value = Math.random() * 80 + 40; // 40-120 minutes
          } else if (hour >= 7 && hour <= 8) {
            // Morning routine
            value = Math.random() * 30 + 15; // 15-45 minutes
          } else if (hour >= 18 && hour <= 22) {
            // Evening
            value = Math.random() * 50 + 20; // 20-70 minutes
          } else if (hour >= 23 || hour <= 6) {
            // Night/early morning
            value = Math.random() * 10; // 0-10 minutes
          } else {
            value = Math.random() * 25; // 0-25 minutes
          }
        } else {
          // Weekends
          if (hour >= 10 && hour <= 14) {
            // Weekend afternoon peak
            value = Math.random() * 70 + 30; // 30-100 minutes
          } else if (hour >= 15 && hour <= 20) {
            // Weekend evening
            value = Math.random() * 60 + 20; // 20-80 minutes
          } else if (hour >= 8 && hour <= 9) {
            // Weekend morning
            value = Math.random() * 20 + 10; // 10-30 minutes
          } else {
            value = Math.random() * 15; // 0-15 minutes
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
    // Calculate peak hours
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

    // Calculate most active day
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

    // Calculate consistency (simplified)
    const nonZeroDays = dailyTotals.filter(total => total > 0).length;
    const consistency = Math.round(nonZeroDays / 7 * 100);

    // Detect work pattern (high activity during weekdays 9-5)
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

    const cellWidth = width / 21; // 21 hours (0-20)
    const cellHeight = height / 7; // 7 days

    const svgElement = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxValue = d3.max(heatmapData, d => d.value) || 60;

    // Color scheme that matches the image: gray → light blue → green → yellow → orange → red
    const colorSteps = [
      "#f5f5f5", // Very low (gray)
      "#dbeafe", // Low (light blue)
      "#86efac", // Medium-low (green)
      "#fde047", // Medium (yellow)
      "#fb923c", // Medium-high (orange)
      "#ef4444" // High (red)
    ];

    const stepColorScale = d3
      .scaleQuantize()
      .domain([0, maxValue])
      .range(colorSteps);

    // Draw cells
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
      .attr("fill", d => (d.value === 0 ? "#f5f5f5" : stepColorScale(d.value)))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr(
        "class",
        "cursor-pointer transition-all duration-200 hover:brightness-110"
      )
      .on("mouseover", function(event, d) {
        // Tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr(
            "class",
            "fixed pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50 opacity-0 transition-opacity duration-200"
          );

        tooltip
          .html(
            `
          <div><strong>${d.dayName}</strong></div>
          <div>${d.hour.toString().padStart(2, "0")}:00</div>
          <div>${Math.round(d.value)} minutes</div>
        `
          )
          .classed("opacity-0", false)
          .classed("opacity-100", true)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");

        d3.select(this).attr("stroke", "#333333").attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        d3.selectAll(".fixed.pointer-events-none").remove();
        d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 1);
      });

    // Add day labels
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
      .attr("class", "text-sm fill-gray-600 dark:fill-gray-400")
      .text(d => d);

    // Add hour labels
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
      .attr("class", "text-sm fill-gray-600 dark:fill-gray-400")
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Activity Heatmap
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Low</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded" />
            <div className="w-3 h-3 bg-blue-100 rounded" />
            <div className="w-3 h-3 bg-green-300 rounded" />
            <div className="w-3 h-3 bg-yellow-300 rounded" />
            <div className="w-3 h-3 bg-orange-400 rounded" />
            <div className="w-3 h-3 bg-red-500 rounded" />
          </div>
          <span>High</span>
        </div>
      </div>

      <div className="mb-6">
        <svg ref={svgRef} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Peak Hours</div>
          <div className="text-lg font-semibold text-gray-900">
            {insights.peakHours}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Most Active Day</div>
          <div className="text-lg font-semibold text-gray-900">
            {insights.mostActiveDay}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Consistency</div>
          <div className="text-lg font-semibold text-blue-600">
            {insights.consistency}% consistency
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Pattern</div>
          <div className="text-lg font-semibold text-green-600">
            {insights.workPattern
              ? "Work pattern detected"
              : "Flexible schedule"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
