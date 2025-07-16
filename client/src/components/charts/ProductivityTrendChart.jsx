import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import dashboardService from "../../services/dashboardService";

const ProductivityTrendChart = ({ timeRange = "week" }) => {
  const svgRef = useRef();
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [error, setError] = useState(null);

  useEffect(
    () => {
      fetchTrendData();
    },
    [timeRange]
  );

  useEffect(() => {
       const observer = new MutationObserver(() => {
         const darkMode = document.documentElement.classList.contains('dark');
         setIsDark(darkMode);
       });
       observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
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

  // Cleanup tooltips on unmount
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
        productivity: 3 + Math.random() * 4, // Random between 3-7
        duration: 60 + Math.random() * 180, // Random between 60-240 minutes
        sessions: Math.floor(5 + Math.random() * 10) // Random between 5-15 sessions
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

      console.log("Productivity insights response:", response);

      if (response.success && response.data.dailyTrends) {
        const formattedData = response.data.dailyTrends
          .map(d => {
            // Ensure productivity is a valid number
            const rawProductivity = d.avgProductivity || 0;
            const productivity =
              typeof rawProductivity === "number"
                ? Math.min(10, Math.max(0, rawProductivity))
                : Math.min(10, Math.max(0, parseFloat(rawProductivity) || 0));

            // Better date parsing
            let date;
            if (d._id) {
              date = new Date(d._id + "T00:00:00.000Z"); // Ensure proper date parsing
            } else {
              date = new Date(); // Fallback to current date
            }

            return {
              date,
              productivity,
              duration: Math.max(0, (d.totalDuration || 0) / 60000), // Convert to minutes
              sessions: Math.max(0, d.sessionCount || 0)
            };
          })
          .filter(d => !isNaN(d.date.getTime())); // Filter out invalid dates

        console.log("Formatted trend data:", formattedData);
        setTrendData(formattedData);
      } else {
        console.warn("No daily trends data received:", response);

        // For testing purposes, add some sample data when no real data exists
        if (process.env.NODE_ENV === "development") {
          const sampleData = generateSampleData(days);
          console.log("Using sample data for development:", sampleData);
          setTrendData(sampleData);
        } else {
          setError("No productivity data available");
          setTrendData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching trend data:", error);
      setError(error.message || "Failed to fetch productivity data");
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  };

  const drawTrendChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Remove any existing tooltips
    d3.selectAll(".productivity-tooltip").remove();

    const margin = { top: 20, right: 80, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

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

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "productivity-tooltip")
      .style("position", "fixed")
      .style("pointer-events", "none")
      .style("background", "#1f2937")
      .style("color", "white")
      .style("font-size", "12px")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
      .style("z-index", "9999")
      .style("opacity", "0")
      .style("transition", "opacity 0.2s");

    // Add axes
    g
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")))
      .style("font-size", "11px");

    g.append("g").call(d3.axisLeft(yProductivity)).style("font-size", "11px");

    g
      .append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yDuration))
      .style("font-size", "11px");

    // Add axis labels
    g
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", isDark ? "#D1D5DB" : "#6B7280")
      .text("Productivity Score");

    g
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right - 10)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", isDark ? "#D1D5DB" : "#6B7280")
      .text("Duration (min)");

    // Line generators
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

    // Add gradient for area under productivity curve
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
      .attr("stop-opacity", 0.1);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.3);

    // Area under productivity line
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

    // Add productivity line
    g
      .append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 3)
      .attr("d", productivityLine);

    // Add duration line
    g
      .append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", durationLine);

    // Add dots for productivity
    g
      .selectAll(".productivity-dot")
      .data(trendData)
      .enter()
      .append("circle")
      .attr("class", "productivity-dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => yProductivity(d.productivity))
      .attr("r", 4)
      .attr("fill", "#3B82F6")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer transition-all duration-200")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 6);

        tooltip
          .style("opacity", "1")
          .html(
            `
            <div>
              <strong>${d.date.toLocaleDateString()}</strong><br/>
              Productivity: ${typeof d.productivity === "number"
                ? d.productivity.toFixed(1)
                : "5.0"}/10<br/>
              Duration: ${Math.round(d.duration)}min<br/>
              Sessions: ${d.sessions}
            </div>
          `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this).attr("r", 4);
        tooltip.style("opacity", "0");
      });

    // Add legend
    const legend = g
      .append("g")
      .attr("transform", `translate(${width - 120}, 20)`);

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 3);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("fill", isDark ? "#F9FAFB" : "#374151")
      .text("Productivity");

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 15)
      .attr("y2", 15)
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 15)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("fill", isDark ? "#F9FAFB" : "#374151")
      .text("Duration");
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
