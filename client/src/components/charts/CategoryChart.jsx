import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import dashboardService from '../../services/dashboardService';

const CategoryChart = ({ timeRange = 'week' }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [productivityData, setProductivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('pie');
  const pieChartRef = useRef();
  const barChartRef = useRef();

  useEffect(() => {
    fetchCategoryData();
    fetchProductivityData();
  }, [timeRange]);

  useEffect(() => {
    if (categoryData.length > 0) {
      if (chartType === 'pie') {
        drawPieChart();
      } else {
        drawBarChart();
      }
    }
  }, [categoryData, chartType]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const response = await dashboardService.getCategoryAnalytics(
        startDate.toISOString(),
        endDate.toISOString(),
        'day'
      );

      if (response.success) {
        const formattedData = response.data.categoryBreakdown.map((item, index) => ({
          name: item._id,
          value: Math.round(item.totalDuration / 60000), // Convert to minutes
          sessions: item.sessionCount,
          productivity: Math.round(item.avgProductivityScore * 10) / 10,
          domains: item.domains?.length || 0,
          color: item.categoryInfo?.color || COLORS[index % COLORS.length],
          icon: item.categoryInfo?.icon || 'CAT'
        }));
        setCategoryData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductivityData = async () => {
    try {
      const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : 30;
      const response = await dashboardService.getProductivityInsights(days);
      
      if (response.success) {
        setProductivityData(response.data);
      }
    } catch (error) {
      console.error('Error fetching productivity data:', error);
    }
  };

  const COLORS = ['#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#059669'];

  const drawPieChart = () => {
    const svg = d3.select(pieChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 10;

    const svgElement = svg
      .attr("width", width)
      .attr("height", height);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(radius + 10);

    const color = d3.scaleOrdinal()
      .domain(categoryData.map(d => d.name))
      .range(categoryData.map(d => d.color || COLORS[categoryData.indexOf(d) % COLORS.length]));

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "fixed pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50 opacity-0 transition-opacity duration-200");

    const arcs = g.selectAll(".arc")
      .data(pie(categoryData))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arcHover);
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        
        tooltip.html(`
          <div>
            <strong>${d.data.name}</strong><br/>
            Time: ${formatDuration(d.data.value)}<br/>
            Sessions: ${d.data.sessions}<br/>
            Productivity: ${d.data.productivity}/10
          </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc);
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add labels
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)")
      .text(d => {
        const percentage = ((d.data.value / d3.sum(categoryData, d => d.value)) * 100).toFixed(1);
        return percentage > 5 ? `${d.data.name}` : '';
      });

    // Cleanup tooltip on unmount
    return () => {
      d3.select("body").selectAll(".fixed.pointer-events-none").remove();
    };
  };

  const drawBarChart = () => {
    const svg = d3.select(barChartRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 80, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svgElement = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
      .domain(categoryData.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(categoryData, d => d.value)])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(categoryData.map(d => d.name))
      .range(categoryData.map(d => d.color || COLORS[categoryData.indexOf(d) % COLORS.length]));

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "fixed pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50 opacity-0 transition-opacity duration-200");

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "11px");

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", "11px");

    // Add Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .text("Time (minutes)");

    // Add bars
    g.selectAll(".bar")
      .data(categoryData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", d => color(d.name))
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8);
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        
        tooltip.html(`
          <div>
            <strong>${d.name}</strong><br/>
            Time: ${formatDuration(d.value)}<br/>
            Sessions: ${d.sessions}<br/>
            Domains: ${d.domains}<br/>
            Productivity: ${d.productivity}/10
          </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1);
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .transition()
      .duration(800)
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value));

    // Add value labels on top of bars
    g.selectAll(".label")
      .data(categoryData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.name) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .text(d => formatDuration(d.value));

    // Cleanup tooltip on unmount
    return () => {
      d3.select("body").selectAll(".fixed.pointer-events-none").remove();
    };
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Activity by Category
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Breakdown of your activity across different categories
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                chartType === 'pie'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Bar Chart
            </button>
          </div>
        </div>

      {categoryData.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-medium">No activity data available</p>
          <p className="text-sm mt-1">Data will appear here for the selected time range</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 flex justify-center">
            {chartType === 'pie' ? (
              <svg ref={pieChartRef} className="drop-shadow-sm"></svg>
            ) : (
              <svg ref={barChartRef} className="drop-shadow-sm"></svg>
            )}
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Category Breakdown
            </h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {categoryData
                .sort((a, b) => b.value - a.value)
                .map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {category.sessions} sessions • {category.domains} domains
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {formatDuration(category.value)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Productivity: {category.productivity}/10
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Productivity Summary */}
      {productivityData?.overview && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Productivity Overview
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Summary of your productivity metrics for the selected period
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round((productivityData.overview.avgProductivity || 0) * 10) / 10}/10
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Average Productivity
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((productivityData.overview.productivityRatio || 0) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Productive Time
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatDuration(Math.round((productivityData.overview.productiveDuration || 0) / 60000))}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Productive Duration
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatDuration(Math.round((productivityData.overview.unproductiveDuration || 0) / 60000))}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Unproductive Duration
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryChart;
