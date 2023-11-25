const margin = {top: 10, right: 30, bottom: 30, left: 60}, width = 460 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

const svg = d3.select("#viz3-svg")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("data/americas.csv").then(function (data) {
    data.forEach(function (d) {
        d.Funny = +d.Funny;
        d.views = +d.views;
    });

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.Funny;
        })])
        .range([0, width]);
    svg.append("g")
        .attr("class", "axes")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.views;
        })])
        .range([height, 0]);
    svg.append("g")
        .attr("class", "axes")
        .call(d3.axisLeft(y));

    const circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.Funny); })
        .attr("cy", function (d) { return y(d.views); })
        .attr("r", 2)
        .style("fill", "white")
        .style("stroke", "white")
        .on('mouseover', function (event, d) {
            d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
        })
        .on('mouseout', function () {
            d3.select(this).attr('stroke', 'white').attr('stroke-width', 1);
        })
        .append('title')
        .text(function (d) { return d.city; });
});
