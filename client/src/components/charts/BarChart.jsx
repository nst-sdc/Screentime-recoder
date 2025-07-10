import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Here's the Tooltip div
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("padding", "6px 12px")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("border-radius", "6px")
      .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("font-size", "14px")
      .style("display", "none");

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.minutes)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.category))
      .attr("y", (d) => y(d.minutes))
      .attr("height", (d) => y(0) - y(d.minutes))
      .attr("width", x.bandwidth())
      .attr("fill", (d) => d.color)
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.category}</strong><br>${Math.floor(d.minutes / 60)}h ${d.minutes % 60}m`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Here's the Horizontal grid lines fr Dashboard
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3 3");
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default BarChart;