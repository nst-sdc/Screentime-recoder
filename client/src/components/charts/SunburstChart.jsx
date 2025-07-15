import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import dashboardService from '../../services/dashboardService';

const SunburstChart = ({ timeRange = 'week' }) => {
  const svgRef = useRef();
  const [hierarchyData, setHierarchyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHierarchyData();
  }, [timeRange]);

  useEffect(() => {
    if (hierarchyData) {
      drawSunburst();
    }
  }, [hierarchyData]);

  const fetchHierarchyData = async () => {
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
        // Transform data into hierarchy format
        const categories = response.data.categoryBreakdown;
        const root = {
          name: "Activities",
          children: categories.map(cat => ({
            name: cat._id,
            value: cat.totalDuration,
            productivity: cat.avgProductivityScore,
            sessions: cat.sessionCount,
            domains: cat.domains,
            color: cat.categoryInfo?.color || '#6B7280',
            icon: cat.categoryInfo?.icon || 'CAT',
            children: cat.domains?.slice(0, 5).map(domain => ({
              name: domain,
              value: Math.round(cat.totalDuration / cat.domains.length), // Approximate
              productivity: cat.avgProductivityScore,
              isLeaf: true
            })) || []
          }))
        };
        setHierarchyData(root);
      }
    } catch (error) {
      console.error('Error fetching hierarchy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawSunburst = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svgElement = svg
      .attr("width", width)
      .attr("height", height);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create partition layout
    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    partition(root);

    // Create color scale
    const color = d3.scaleSequential()
      .domain([0, 10])
      .interpolator(d3.interpolateRdYlGn);

    // Create arc generator
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(0.01)
      .padRadius(radius / 3)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "fixed pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50 opacity-0 transition-opacity duration-200")
      .style("left", "0px")
      .style("top", "0px");

    // Draw arcs
    const paths = g.selectAll("path")
      .data(root.descendants().filter(d => d.depth > 0))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => {
        if (d.depth === 1) {
          // Use category color for first level
          return d.data.color || color(d.data.productivity || 5);
        } else {
          // Use productivity-based color for domains
          return color(d.data.productivity || 5);
        }
      })
      .attr("opacity", d => d.depth === 1 ? 0.8 : 0.6)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("class", "cursor-pointer transition-all duration-200 hover:opacity-100")
      .on("mouseover", function(event, d) {
        // Highlight path
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", 2);

        // Show tooltip
        tooltip.classed("opacity-0", false)
          .classed("opacity-100", true);

        const formatDuration = (ms) => {
          const minutes = Math.round(ms / 60000);
          if (minutes < 60) return `${minutes}m`;
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        };

        let tooltipContent = `<div><strong>${d.data.name}</strong><br/>`;
        tooltipContent += `Time: ${formatDuration(d.value)}<br/>`;
        
        if (d.data.productivity && typeof d.data.productivity === 'number') {
          tooltipContent += `Productivity: ${d.data.productivity.toFixed(1)}/10<br/>`;
        }
        
        if (d.data.sessions) {
          tooltipContent += `Sessions: ${d.data.sessions}<br/>`;
        }
        
        if (d.data.domains && d.data.domains.length) {
          tooltipContent += `Domains: ${d.data.domains.length}`;
        }
        
        tooltipContent += `</div>`;

        tooltip.html(tooltipContent)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", d => d.depth === 1 ? 0.8 : 0.6)
          .attr("stroke-width", 1);

        tooltip.classed("opacity-100", false)
          .classed("opacity-0", true);
      })
      .on("click", function(event, d) {
        // Zoom functionality
        focus(d);
      });

    // Add center text
    const centerText = g.append("g")
      .attr("class", "center-text")
      .style("text-anchor", "middle")
      .style("pointer-events", "none");

    centerText.append("text")
      .attr("dy", "-0.5em")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .text("Activities");

    centerText.append("text")
      .attr("dy", "1em")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .text(`${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} View`);

    // Zoom functionality
    function focus(d) {
      const transition = g.transition()
        .duration(750)
        .tween("scale", () => {
          const xd = d3.interpolate(root.x0, d.x0);
          const yd = d3.interpolate(root.y0, d.y0);
          const yr = d3.interpolate(root.y1, d.y1);
          return t => {
            root.x0 = xd(t);
            root.y0 = yd(t);
            root.y1 = yr(t);
          };
        });

      transition.selectAll("path")
        .attrTween("d", d => () => arc(d));

      // Update center text
      centerText.select("text")
        .text(d.data.name);
    }

    // Cleanup tooltip on unmount
    return () => {
      d3.select("body").selectAll(".fixed.pointer-events-none").remove();
    };
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3"></div>
          <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Activity Hierarchy
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Explore the relationship between categories and domains with interactive zoom
        </p>
      </div>
      
      {!hierarchyData ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-medium">No hierarchy data available</p>
          <p className="text-sm mt-1">Data will appear here for the selected time range</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <svg ref={svgRef} className="drop-shadow-sm"></svg>
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4 w-full px-4 text-sm text-gray-600 dark:text-gray-400">
            {/* Productivity Score Legend */}
            <div className="flex flex-col">
              <span className="text-sm mb-1 text-gray-400 dark:text-gray-300">Productivity Score</span>
              <div className="flex flex-col">
                <div className="h-4 w-48 bg-gradient-to-r from-red-500 via-yellow-300 to-green-500 rounded-sm mb-1"></div>
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 w-48">
                  <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
                </div>
              </div>
            </div>

            {/* Interactive Features */}
            <div className="text-right">
              <p className="font-medium">Interactive Features:</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-end text-xs">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Click to zoom in
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Hover for details
                </span>
              </div>
              <p className="text-xs">Inner ring: Categories • Outer ring: Top domains</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunburstChart;
