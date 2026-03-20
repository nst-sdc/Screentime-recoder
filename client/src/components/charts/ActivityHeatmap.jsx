import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import dashboardService from "../../services/dashboardService";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TIME_RANGE_OPTIONS = [
  { label: "1 Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "1 Month", days: 30 },
];

const CATEGORY_OPTIONS = [
  "All",
  "Productivity",
  "Communication",
  "Entertainment",
  "Social Media",
  "News",
  "Shopping",
  "Education",
  "Others",
];

const PRODUCTIVITY_FILTER_OPTIONS = [
  { label: "All", min: 0 },
  { label: "Productive (≥7)", min: 7 },
  { label: "Neutral (4–6)", min: 4, max: 7 },
  { label: "Distracting (<4)", min: 0, max: 4 },
];

const NUM_HOURS = 24;
const NUM_DAYS = 7;
const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];
const HOUR_TICK_POSITIONS = [0, 4, 8, 12, 16, 20];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Format an hour (0–23) as "12 AM", "1 PM", etc. */
function fmtHour(h) {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
/**
 * ActivityHeatmap
 *
 * Displays a 7-day × 24-hour activity heatmap with:
 * - Dynamic time-range selector (1 week / 2 weeks / 1 month)
 * - Category and productivity filters
 * - Enhanced insights (total hours, avg daily, focus block, productive %)
 * - Interactive tooltip and click-to-select cell
 * - Accessible SVG (role, aria-label, keyboard navigation)
 * - Responsive layout via ResizeObserver
 * - Dark mode support
 *
 * @param {object} props
 * @param {string} [props.timeRange] - Legacy prop (kept for backwards compat)
 */
const ActivityHeatmap = ({ timeRange = "week" }) => {
  // eslint-disable-line no-unused-vars — kept for API compatibility
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProductivityFilter, setSelectedProductivityFilter] = useState("All");
  const [selectedCell, setSelectedCell] = useState(null);
  const [insights, setInsights] = useState({
    peakHours: "–",
    mostActiveDay: "–",
    consistency: 0,
    workPattern: false,
    totalHours: 0,
    avgDailyMinutes: 0,
    focusScore: 0,
    productivePct: 0,
  });

  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // -------------------------------------------------------------------------
  // Data processing
  // -------------------------------------------------------------------------
  const processHeatmapData = useCallback((timeData, category, productivityFilterLabel) => {
    // Resolve the selected productivity filter object
    const prodFilter = PRODUCTIVITY_FILTER_OPTIONS.find((f) => f.label === productivityFilterLabel)
      || PRODUCTIVITY_FILTER_OPTIONS[0];

    // Build an empty 7×24 grid
    const grid = [];
    DAY_NAMES_SHORT.forEach((dayName, dayIndex) => {
      for (let hour = 0; hour < NUM_HOURS; hour++) {
        grid.push({ day: dayIndex, dayName, hour, value: 0, duration: 0, category: "", productivity: 0 });
      }
    });

    // Aggregate data from API into the grid
    timeData.forEach((item) => {
      // Category filter
      if (category !== "All" && item.category !== category) return;
      // Productivity filter (min and optional max)
      const prod = item.avgProductivityScore ?? item.productivity ?? 0;
      if (prod < prodFilter.min) return;
      if (prodFilter.max !== undefined && prod >= prodFilter.max) return;

      const date = new Date(item._id);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      const idx = dayOfWeek * NUM_HOURS + hour;
      if (grid[idx]) {
        grid[idx].value += item.totalDuration / 1000 / 60;
        grid[idx].duration += item.totalDuration;
        grid[idx].category = item.category || "";
        grid[idx].productivity = Math.max(grid[idx].productivity, prod);
      }
    });

    // Round values for display
    return grid.map((d) => ({ ...d, value: Math.round(d.value) }));
  }, []);

  // -------------------------------------------------------------------------
  // Insights calculation (defined before generateSampleData so it can be
  // safely referenced in that callback's dependency array)
  // -------------------------------------------------------------------------
  const calculateInsights = useCallback((data) => {
    if (!data.length) return;

    // Hourly totals → peak hours
    const hourlyTotals = Array(NUM_HOURS).fill(0);
    data.forEach((d) => { hourlyTotals[d.hour] += d.value; });
    const peakHourIdx = hourlyTotals.indexOf(Math.max(...hourlyTotals));
    const peakEndIdx = Math.min(peakHourIdx + 2, 23);
    const peakHours = `${fmtHour(peakHourIdx)}–${fmtHour(peakEndIdx)}`;

    // Daily totals → most active day & consistency
    const dailyTotals = Array(NUM_DAYS).fill(0);
    data.forEach((d) => { dailyTotals[d.day] += d.value; });
    const maxDayIdx = dailyTotals.indexOf(Math.max(...dailyTotals));
    const mostActiveDay = DAY_NAMES_FULL[maxDayIdx];
    const activeDays = dailyTotals.filter((t) => t > 0).length;
    const consistency = Math.round((activeDays / NUM_DAYS) * 100);

    // Total & average
    const totalMinutes = data.reduce((sum, d) => sum + d.value, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const avgDailyMinutes = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;

    // Work pattern: >40 % of activity during Mon–Fri 9–17
    const workHourActivity = data
      .filter((d) => d.day >= 1 && d.day <= 5 && d.hour >= 9 && d.hour <= 17)
      .reduce((sum, d) => sum + d.value, 0);
    const workPattern = totalMinutes > 0 && workHourActivity / totalMinutes > 0.4;

    // Longest consecutive-hour focus block (value > 10 min) in a single day
    let focusScore = 0;
    for (let day = 0; day < NUM_DAYS; day++) {
      let streak = 0;
      for (let hour = 0; hour < NUM_HOURS; hour++) {
        const cell = data.find((d) => d.day === day && d.hour === hour);
        if (cell && cell.value > 10) {
          streak++;
          if (streak > focusScore) focusScore = streak;
        } else {
          streak = 0;
        }
      }
    }

    // Productive % (cells with productivity >= 7)
    const productiveMinutes = data
      .filter((d) => d.productivity >= 7)
      .reduce((sum, d) => sum + d.value, 0);
    const productivePct = totalMinutes > 0
      ? Math.round((productiveMinutes / totalMinutes) * 100)
      : 0;

    setInsights({ peakHours, mostActiveDay, consistency, workPattern, totalHours, avgDailyMinutes, focusScore, productivePct });
  }, []);

  const generateSampleData = useCallback(() => {
    const sampleCategories = ["Productivity", "Communication", "Entertainment", "Social Media"];
    const grid = [];

    DAY_NAMES_SHORT.forEach((dayName, dayIndex) => {
      for (let hour = 0; hour < NUM_HOURS; hour++) {
        let value = 0;
        const isWeekday = dayIndex >= 1 && dayIndex <= 5;

        if (isWeekday) {
          if (hour >= 9 && hour <= 17) value = Math.random() * 80 + 40;
          else if (hour >= 7 && hour <= 8) value = Math.random() * 30 + 15;
          else if (hour >= 18 && hour <= 22) value = Math.random() * 50 + 20;
          else value = Math.random() * 10;
        } else {
          if (hour >= 10 && hour <= 14) value = Math.random() * 70 + 30;
          else if (hour >= 15 && hour <= 20) value = Math.random() * 60 + 20;
          else if (hour >= 8 && hour <= 9) value = Math.random() * 20 + 10;
          else value = Math.random() * 15;
        }

        grid.push({
          day: dayIndex,
          dayName,
          hour,
          value: Math.round(value),
          duration: value * 60 * 1000,
          category: sampleCategories[Math.floor(Math.random() * sampleCategories.length)],
          productivity: Math.round(Math.random() * 10),
        });
      }
    });

    setHeatmapData(grid);
    calculateInsights(grid);
  }, [calculateInsights]);

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------
  const fetchHeatmapData = useCallback(async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedDays);

      const response = await dashboardService.getCategoryAnalytics(
        startDate.toISOString(),
        endDate.toISOString(),
        "hour"
      );

      if (response.success && response.data?.timeBreakdown?.length) {
        const processed = processHeatmapData(
          response.data.timeBreakdown,
          selectedCategory,
          selectedProductivityFilter
        );
        setHeatmapData(processed);
        calculateInsights(processed);
      } else {
        generateSampleData();
      }
    } catch {
      generateSampleData();
    } finally {
      setLoading(false);
    }
  }, [selectedDays, selectedCategory, selectedProductivityFilter, processHeatmapData, calculateInsights, generateSampleData]);

  // -------------------------------------------------------------------------
  // D3 rendering
  // -------------------------------------------------------------------------
  const drawHeatmap = useCallback(() => {
    const svgNode = svgRef.current;
    const containerNode = containerRef.current;
    if (!svgNode || !containerNode || !heatmapData.length) return;

    // Remove any stale tooltip left from a previous render
    d3.select(containerNode).selectAll(".hm-tooltip").remove();

    const svg = d3.select(svgNode);
    svg.selectAll("*").remove();

    const containerWidth = containerNode.clientWidth || 600;
    const margin = { top: 24, right: 16, bottom: 36, left: 44 };
    const width = Math.max(280, containerWidth - margin.left - margin.right);
    const height = Math.max(100, Math.round(width * 0.26));

    const cellW = width / NUM_HOURS;
    const cellH = height / NUM_DAYS;

    const isDark = document.documentElement.classList.contains("dark");

    // Accessible SVG attributes
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("role", "img")
      .attr("aria-label", "Activity heatmap showing screen-time intensity by day and hour");

    svg.append("title").text("Activity Heatmap — screen-time intensity by day and hour of the week");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale
    const maxValue = d3.max(heatmapData, (d) => d.value) || 100;
    const colorRange = isDark
      ? ["#374151", "#1e40af", "#059669", "#d97706", "#dc2626", "#991b1b"]
      : ["#f3f4f6", "#dbeafe", "#86efac", "#fde047", "#fb923c", "#ef4444"];
    const colorScale = d3.scaleQuantize().domain([0, maxValue]).range(colorRange);

    // Tooltip (scoped to container, not body)
    const tooltip = d3.select(containerNode)
      .append("div")
      .attr("class", "hm-tooltip")
      .style("position", "absolute")
      .style("display", "none")
      .style("background", isDark ? "#1f2937" : "#ffffff")
      .style("color", isDark ? "#f9fafb" : "#111827")
      .style("border", `1px solid ${isDark ? "#4b5563" : "#e5e7eb"}`)
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("line-height", "1.6")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("z-index", "50")
      .style("min-width", "140px")
      .style("max-width", "200px");

    // Helper to apply selection highlight
    const isSelected = (d) =>
      selectedCell && selectedCell.day === d.day && selectedCell.hour === d.hour;

    const selectedStroke = isDark ? "#facc15" : "#2563eb";
    const defaultStroke = isDark ? "#374151" : "#ffffff";

    // Draw cells
    g.selectAll(".hm-cell")
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("class", "hm-cell")
      .attr("x", (d) => d.hour * cellW)
      .attr("y", (d) => d.day * cellH)
      .attr("width", Math.max(cellW - 1, 1))
      .attr("height", Math.max(cellH - 1, 1))
      .attr("fill", (d) => colorScale(d.value))
      .attr("stroke", (d) => isSelected(d) ? selectedStroke : defaultStroke)
      .attr("stroke-width", (d) => isSelected(d) ? 2 : 1)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("tabindex", 0)
      .attr("role", "gridcell")
      .attr("aria-label", (d) =>
        `${d.dayName} at ${d.hour}:00 — ${d.value} minutes${d.category ? `, ${d.category}` : ""}`)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        const lines = [
          `<strong>${d.dayName}, ${fmtHour(d.hour)}</strong>`,
          `${d.value} min activity`,
          d.category ? `Category: ${d.category}` : "",
          d.productivity > 0 ? `Productivity: ${d.productivity}/10` : "",
        ].filter(Boolean).join("<br/>");
        tooltip.style("display", "block").html(lines);

        d3.select(this).attr("stroke", selectedStroke).attr("stroke-width", 2);
      })
      .on("mousemove", function (event) {
        const [x, y] = d3.pointer(event, containerNode);
        tooltip.style("left", `${x + 14}px`).style("top", `${y - 44}px`);
      })
      .on("mouseout", function (event, d) {
        tooltip.style("display", "none");
        d3.select(this)
          .attr("stroke", isSelected(d) ? selectedStroke : defaultStroke)
          .attr("stroke-width", isSelected(d) ? 2 : 1);
      })
      .on("click", function (event, d) {
        setSelectedCell((prev) =>
          prev && prev.day === d.day && prev.hour === d.hour ? null : { ...d }
        );
      })
      .on("keydown", function (event, d) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelectedCell((prev) =>
            prev && prev.day === d.day && prev.hour === d.hour ? null : { ...d }
          );
        }
      });

    // Day labels (Y axis)
    g.selectAll(".hm-day-label")
      .data(DAY_NAMES_SHORT)
      .enter()
      .append("text")
      .attr("class", "hm-day-label")
      .attr("x", -6)
      .attr("y", (d, i) => i * cellH + cellH / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", isDark ? "#9CA3AF" : "#6B7280")
      .style("font-size", "11px")
      .text((d) => d);

    // Hour labels (X axis, every 4 hours)
    g.selectAll(".hm-hour-label")
      .data(HOUR_TICK_POSITIONS)
      .enter()
      .append("text")
      .attr("class", "hm-hour-label")
      .attr("x", (h) => h * cellW + cellW / 2)
      .attr("y", height + 14)
      .attr("text-anchor", "middle")
      .attr("fill", isDark ? "#9CA3AF" : "#6B7280")
      .style("font-size", "10px")
      .text((h) => `${h}:00`);
  }, [heatmapData, selectedCell]);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => { fetchHeatmapData(); }, [fetchHeatmapData]);

  useEffect(() => {
    if (heatmapData.length > 0) drawHeatmap();
    return () => {
      if (containerRef.current) {
        d3.select(containerRef.current).selectAll(".hm-tooltip").remove();
      }
    };
  }, [heatmapData, selectedCell, drawHeatmap]);

  // Redraw on theme change
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (heatmapData.length > 0) drawHeatmap();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [heatmapData, drawHeatmap]);

  // Redraw on container resize (responsive)
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => {
      if (heatmapData.length > 0) drawHeatmap();
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [heatmapData, drawHeatmap]);

  // -------------------------------------------------------------------------
  // Loading skeleton
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6" aria-busy="true" aria-label="Loading activity heatmap">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Heatmap
        </h3>

        {/* Legend */}
        <div
          className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
          aria-label="Heatmap color legend from low to high activity"
        >
          <span>Low</span>
          <div className="flex space-x-1" role="presentation">
            {[
              "bg-gray-100 dark:bg-gray-700",
              "bg-blue-200 dark:bg-blue-900",
              "bg-green-300 dark:bg-green-700",
              "bg-yellow-300 dark:bg-yellow-600",
              "bg-orange-400 dark:bg-orange-600",
              "bg-red-500 dark:bg-red-600",
            ].map((cls, i) => (
              <div key={i} className={`w-3 h-3 rounded ${cls}`} />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-4" role="group" aria-label="Heatmap filters">
        {/* Time range */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="hm-range"
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Range:
          </label>
          <select
            id="hm-range"
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIME_RANGE_OPTIONS.map((r) => (
              <option key={r.days} value={r.days}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="hm-category"
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Category:
          </label>
          <select
            id="hm-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Productivity filter */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="hm-productivity"
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Productivity:
          </label>
          <select
            id="hm-productivity"
            value={selectedProductivityFilter}
            onChange={(e) => setSelectedProductivityFilter(e.target.value)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRODUCTIVITY_FILTER_OPTIONS.map((f) => (
              <option key={f.label} value={f.label}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Clear selection */}
        {selectedCell && (
          <button
            onClick={() => setSelectedCell(null)}
            className="text-xs px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Clear selected cell"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* ── Selected-cell detail banner ── */}
      {selectedCell && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2"
        >
          <span aria-hidden="true">📌</span>
          <span>
            <strong>{selectedCell.dayName}</strong> at{" "}
            <strong>{selectedCell.hour}:00</strong> ({fmtHour(selectedCell.hour)})
            {" — "}{selectedCell.value} min activity
            {selectedCell.category ? ` · ${selectedCell.category}` : ""}
            {selectedCell.productivity > 0 ? ` · Productivity ${selectedCell.productivity}/10` : ""}
          </span>
        </div>
      )}

      {/* ── SVG heatmap ── */}
      <div
        ref={containerRef}
        className="relative mb-6 w-full overflow-x-auto"
        aria-label="Heatmap chart area"
      >
        <svg ref={svgRef} />
      </div>

      {/* ── Insights grid (8 cards) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Peak Hours</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{insights.peakHours}</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Most Active Day</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{insights.mostActiveDay}</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Weekly Consistency</div>
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">{insights.consistency}%</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Work Pattern</div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            {insights.workPattern ? "Work-focused" : "Flexible"}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Screen Time</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{insights.totalHours}h</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Daily Usage</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{insights.avgDailyMinutes} min</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Longest Focus Block</div>
          <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">{insights.focusScore}h</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Productive Time</div>
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{insights.productivePct}%</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
