import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

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
      .attr("fill", (d) => d.color);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default BarChart;