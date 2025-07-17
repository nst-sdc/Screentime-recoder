import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import dashboardService from "../../services/dashboardService";

const ProductivityTrendChart = ({ timeRange = "week" }) => {
  const svgRef = useRef();
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [error, setError] = useState(null);

  useEffect(
    () => {
      fetchTrendData();
    },
    [timeRange]
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkMode = document.documentElement.classList.contains("dark");
      setIsDark(darkMode);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => {
      if (trendData.length > 0) {
        drawTrendChart();
      }
    },
    [trendData, isDark]
  );

  useEffect(() => {
    return () => {
      d3.selectAll(".productivity-tooltip").remove();
    };
  }, []);

  const generateSampleData = days => {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date,
        productivity: 3 + Math.random() * 4,
        duration: 60 + Math.random() * 180,
        sessions: Math.floor(5 + Math.random() * 10)
      });
    }

    return data;
  };

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      setError(null);
      const days = timeRange === "today" ? 1 : timeRange === "week" ? 7 : 30;
      const response = await dashboardService.getProductivityInsights(days);

      if (response.success && response.data.dailyTrends) {
        const formattedData = response.data.dailyTrends
          .map(d => {
            const rawProductivity = d.avgProductivity || 0;
            const productivity =
              typeof rawProductivity === "number"
                ? Math.min(10, Math.max(0, rawProductivity))
                : Math.min(10, Math.max(0, parseFloat(rawProductivity) || 0));

            let date;
            if (d._id) {
              date = new Date(d._id + "T00:00:00.000Z");
            } else {
              date = new Date();
            }

            return {
              date,
              productivity,
              duration: Math.max(0, (d.totalDuration || 0) / 60000),
              sessions: Math.max(0, d.sessionCount || 0)
            };
          })
          .filter(d => !isNaN(d.date.getTime()));

        setTrendData(formattedData);
      } else {
        if (process.env.NODE_ENV === "development") {
          const sampleData = generateSampleData(days);
          setTrendData(sampleData);
        } else {
          setError("No productivity data available");
          setTrendData([]);
        }
      }
    } catch (error) {
      setError(error.message || "Failed to fetch productivity data");
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  };

  const drawTrendChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    d3.selectAll(".productivity-tooltip").remove();

    const margin = { top: 30, right: 100, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svgElement = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(trendData, d => d.date))
      .range([0, width]);

    const yProductivity = d3.scaleLinear().domain([0, 10]).range([height, 0]);

    const maxDuration = d3.max(trendData, d => d.duration) || 100;
    const yDuration = d3
      .scaleLinear()
      .domain([0, maxDuration])
      .range([height, 0]);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "productivity-tooltip")
      .style("position", "fixed")
      .style("pointer-events", "none")
      .style("background", "rgba(31, 41, 55, 0.95)")
      .style("backdrop-filter", "blur(8px)")
      .style("color", "white")
      .style("font-size", "13px")
      .style("border-radius", "12px")
      .style("padding", "12px 16px")
      .style(
        "box-shadow",
        "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"
      )
      .style("border", "1px solid rgba(255, 255, 255, 0.1)")
      .style("z-index", "9999")
      .style("opacity", "0")
      .style("transition", "all 0.3s ease");

    g
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", isDark ? "#F9FAFB" : "#1F2937")
      .text("Productivity & Duration Trends");

    const xAxis = g
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")).ticks(6))
      .style("font-size", "12px");

    xAxis.selectAll("line").style("stroke", isDark ? "#4B5563" : "#E5E7EB");

    xAxis.select(".domain").style("stroke", isDark ? "#4B5563" : "#E5E7EB");

    const yAxisLeft = g
      .append("g")
      .call(d3.axisLeft(yProductivity).ticks(5))
      .style("font-size", "12px");

    yAxisLeft.selectAll("line").style("stroke", isDark ? "#4B5563" : "#E5E7EB");

    yAxisLeft.select(".domain").style("stroke", isDark ? "#4B5563" : "#E5E7EB");

    const yAxisRight = g
      .append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yDuration).ticks(5))
      .style("font-size", "12px");

    yAxisRight
      .selectAll("line")
      .style("stroke", isDark ? "#4B5563" : "#E5E7EB");

    yAxisRight
      .select(".domain")
      .style("stroke", isDark ? "#4B5563" : "#E5E7EB");

    g
      .selectAll(".grid-line-x")
      .data(x.ticks(6))
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", isDark ? "#374151" : "#F3F4F6")
      .style("stroke-width", 1)
      .style("opacity", 0.5);

    g
      .selectAll(".grid-line-y")
      .data(yProductivity.ticks(5))
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yProductivity(d))
      .attr("y2", d => yProductivity(d))
      .style("stroke", isDark ? "#374151" : "#F3F4F6")
      .style("stroke-width", 1)
      .style("opacity", 0.5);

    g
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("fill", isDark ? "#D1D5DB" : "#6B7280")
      .text("Productivity Score");

    g
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right - 15)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("fill", isDark ? "#D1D5DB" : "#6B7280")
      .text("Duration (min)");

    g
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("fill", isDark ? "#D1D5DB" : "#6B7280")
      .text("Date");

    const productivityLine = d3
      .line()
      .x(d => x(d.date))
      .y(d => yProductivity(d.productivity))
      .curve(d3.curveMonotoneX);

    const durationLine = d3
      .line()
      .x(d => x(d.date))
      .y(d => yDuration(d.duration))
      .curve(d3.curveMonotoneX);

    const gradient = g
      .append("defs")
      .append("linearGradient")
      .attr("id", "productivity-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", height)
      .attr("x2", 0)
      .attr("y2", 0);

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.05);

    gradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.15);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.3);

    const durationGradient = g
      .select("defs")
      .append("linearGradient")
      .attr("id", "duration-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", height)
      .attr("x2", 0)
      .attr("y2", 0);

    durationGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F59E0B")
      .attr("stop-opacity", 0.05);

    durationGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#F59E0B")
      .attr("stop-opacity", 0.2);

    const area = d3
      .area()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => yProductivity(d.productivity))
      .curve(d3.curveMonotoneX);

    g
      .append("path")
      .datum(trendData)
      .attr("fill", "url(#productivity-gradient)")
      .attr("d", area);

    const durationArea = d3
      .area()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => yDuration(d.duration))
      .curve(d3.curveMonotoneX);

    g
      .append("path")
      .datum(trendData)
      .attr("fill", "url(#duration-gradient)")
      .attr("d", durationArea);

    g
      .append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("filter", "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))")
      .attr("d", productivityLine);

    g
      .append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "8,4")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", durationLine);

    g
      .selectAll(".productivity-dot")
      .data(trendData)
      .enter()
      .append("circle")
      .attr("class", "productivity-dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => yProductivity(d.productivity))
      .attr("r", 5)
      .attr("fill", "#3B82F6")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
      .on("mouseover", function(event, d) {
        d3
          .select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("stroke-width", 4);

        tooltip
          .style("opacity", "1")
          .html(
            `
            <div style="line-height: 1.5;">
              <div style="font-weight: 600; margin-bottom: 6px; color: #60A5FA;">
                ${d.date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric"
                })}
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #3B82F6;">●</span> Productivity: <strong>${typeof d.productivity ===
                "number"
                  ? d.productivity.toFixed(1)
                  : "5.0"}/10</strong>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #F59E0B;">●</span> Duration: <strong>${Math.round(
                  d.duration
                )} min</strong>
              </div>
              <div>
                <span style="color: #6B7280;">●</span> Sessions: <strong>${d.sessions}</strong>
              </div>
            </div>
          `
          )
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 40 + "px");
      })
      .on("mouseout", function(d) {
        d3
          .select(this)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("stroke-width", 3);
        tooltip.style("opacity", "0");
      });

    g
      .selectAll(".duration-dot")
      .data(trendData)
      .enter()
      .append("circle")
      .attr("class", "duration-dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => yDuration(d.duration))
      .attr("r", 3)
      .attr("fill", "#F59E0B")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("opacity", 0.8);

    const legend = g
      .append("g")
      .attr("transform", `translate(${width - 420}, 20)`);
    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 25)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round");

    legend
      .append("circle")
      .attr("cx", 12.5)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#3B82F6")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    legend
      .append("text")
      .attr("x", 32)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("fill", isDark ? "#F9FAFB" : "#374151")
      .text("Productivity Score");

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 25)
      .attr("y1", 22)
      .attr("y2", 22)
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "8,4")
      .attr("stroke-linecap", "round");

    legend
      .append("circle")
      .attr("cx", 12.5)
      .attr("cy", 22)
      .attr("r", 3)
      .attr("fill", "#F59E0B")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    legend
      .append("text")
      .attr("x", 32)
      .attr("y", 22)
      .attr("dy", "0.35em")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("fill", isDark ? "#F9FAFB" : "#374151")
      .text("Duration (min)");
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3" />
          <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Productivity Trends
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your productivity patterns and time usage over time
          </p>
        </div>
        <div className="text-center py-12 text-red-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">Error loading data</p>
          <p className="text-sm mt-1">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Productivity Trends
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track your productivity patterns and time usage over time
        </p>
      </div>

      {trendData.length === 0
        ? <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">No trend data available</p>
            <p className="text-sm mt-1">
              Data will appear here for the selected time range
            </p>
          </div>
        : <div className="flex justify-center">
            <svg ref={svgRef} className="drop-shadow-sm" />
          </div>}
    </div>
  );
};

export default ProductivityTrendChart;
