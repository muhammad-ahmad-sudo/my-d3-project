const width = 700;
const height = 400;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip");

function drawChart(type, data) {
  svg.selectAll("*").remove();

  const x = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Sales)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  // -------------------------
  // BAR CHART
  // -------------------------
  if (type === "bar") {
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Year))
      .attr("width", x.bandwidth())
      .attr("y", height - margin.bottom) // start from bottom
      .attr("height", 0)
      .attr("fill", "steelblue")
      .transition()
      .duration(800)
      .ease(d3.easeCubic)
      .attr("y", d => y(d.Sales))
      .attr("height", d => height - margin.bottom - y(d.Sales));

    svg.selectAll("rect")
      .on("mousemove", (event, d) => {
        tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px")
          .html(`<strong>${d.Year}</strong><br>Sales: ${d.Sales}`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  }

  // -------------------------
  // LINE CHART + ANIMATION
  // -------------------------
  if (type === "line") {
    const line = d3.line()
      .x(d => x(d.Year) + x.bandwidth() / 2)
      .y(d => y(d.Sales))
      .curve(d3.curveMonotoneX);

    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animate path drawing
    const length = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", `${length} ${length}`)
      .attr("stroke-dashoffset", length)
      .transition()
      .duration(1200)
      .ease(d3.easeCubic)
      .attr("stroke-dashoffset", 0);

    // Add points with animation
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.Year) + x.bandwidth() / 2)
      .attr("cy", d => y(d.Sales))
      .attr("r", 0) // start small
      .attr("fill", "red")
      .transition()
      .delay((d, i) => i * 150)
      .duration(500)
      .attr("r", 6);

    svg.selectAll("circle")
      .on("mousemove", (event, d) => {
        tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px")
          .html(`<strong>${d.Year}</strong><br>Sales: ${d.Sales}`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  }
}

// Load CSV
d3.csv("data.csv").then(data => {
  data.forEach(d => {
    d.Year = d.Year;
    d.Sales = +d.Sales;
  });

  const dropdown = document.getElementById("chartType");
  dropdown.addEventListener("change", () => {
    drawChart(dropdown.value, data);
  });

  drawChart("line", data);
});

