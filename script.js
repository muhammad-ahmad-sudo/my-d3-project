const width = 600;
const height = 350;
const margin = { top: 30, right: 30, bottom: 40, left: 50 };

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
  svg.selectAll("*").remove(); // clear previous chart

  const x = d3
    .scaleBand()
    .domain(data.map(d => d.Year))
    .range([margin.left, width - margin.right])
    .padding(0.4);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.Sales)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  if (type === "bar") {
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Year))
      .attr("y", d => y(d.Sales))
      .attr("width", x.bandwidth())
      .attr("height", d => height - margin.bottom - y(d.Sales))
      .attr("fill", "steelblue")
      .on("mousemove", function (event, d) {
        tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px")
          .html(`<strong>${d.Year}</strong><br>Sales: ${d.Sales}`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

  } else if (type === "line") {
    const line = d3.line()
      .x(d => x(d.Year) + x.bandwidth() / 2)
      .y(d => y(d.Sales));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.Year) + x.bandwidth() / 2)
      .attr("cy", d => y(d.Sales))
      .attr("r", 5)
      .attr("fill", "red")
      .on("mousemove", function (event, d) {
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
