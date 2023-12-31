var margin = { top: 0.05, right: 0.1, bottom: 0.05, left: 0.1 };
var width = window.innerWidth * (1 - 3*margin.left - 3*margin.right);
var height = window.innerHeight * (1 - 5*margin.top - 4*margin.bottom);

console.log(window.innerWidth, window.innerHeight);
const svg = d3
    .select("#viz1-svg")
    .append("svg")
    .attr("id", "viz1-svg-main")
    .attr("width", '43vw')
    .attr("height", '50%')
    .style("margin-left", window.innerWidth * margin.left*2.3 + "px")
    .style("padding", "10px")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

const svg2 = d3
    .select("#viz2-svg")
    .append("svg")
    .attr("id", "viz2-svg-main")
    .attr("width", '55vw')
    .attr("height", '50%')
    // .style("margin-right", "20px")
    // .style("padding", "10px")
    .append("g")
    .attr("transform",
        "translate(" + margin.right + "," + margin.top + ")");

const instructionText = svg.append("text")
    .attr("class", "instruction-text")
    .attr("x", width / 6)
    .attr("y", height / 6)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "14px")
    .style("font-family", "Karla; sans-serif")

instructionText.append("tspan")
    .attr("x", width / 2)
    .attr("dy", "-0.6em")
    .text("mousover bars to see details");

const svgTitle1 = d3.select("#viz1-svg-main")
  .append("text")
  .attr("x", width/1.5)
  .attr("y", 20)
  .attr("text-anchor", "end")
  .attr("fill", "white")
  .text("Professional Categories");

d3.csv("data/occupation_views_averaged.csv").then(function (data) {

    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.Occupation_cluster; }))
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + (height - 10) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "x-axis-label")
        .attr("transform", "translate(-10,15)rotate(-45)")
        .style("text-anchor", "end")
        .style("fill", "#fcdcbf")
        .style("font-size", "14px");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 5613145])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(function(d){
            return d / 1000000 + 'M';
        }))
        .selectAll("text")
        .style("fill", "#fcdcbf")
        .style("font-size", "14px");

    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.Occupation_cluster); })
        .attr("y", function(d) { return y(d.Views); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.Views); })
        .attr("fill", "red")
        .on("mouseover", function(event, d) {
            svg.select(".instruction-text").remove();
            d3.select(this).attr("fill", "#69b3a2")
            var clusterName = "data/" + d.Occupation_cluster + ".csv"
            showClusterDetails(clusterName);
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "red")
            svg2.selectAll("*").remove();
        });
})

function showClusterDetails(clusterName) {
    svg2.selectAll("*").remove();
    d3.csv(clusterName).then(function (data2) {
        var sortedAndLimitedData = data2.sort(function(a, b) {
            return b.Views - a.Views;
        }).slice(0, 10);
        var x2 = d3.scaleBand()
            .range([ 0, width ])
            .domain(sortedAndLimitedData.map(function(d) { return d.Occupation; }))
            .padding(0.2);

        svg2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x2))
            .selectAll("text")
            .attr("class", "x-axis-label")
            .attr("transform", "translate(-10,10)rotate(-45)")
            .style("text-anchor", "end")
            .style("fill", "#fcdcbf")
            .style("font-size", "14px");

        svg2
          .append("text")
          .attr("x", width/1.5)
          .attr("y", 20)
          .attr("text-anchor", "end")
          .attr("fill", "white")
          .text("Most Viewed Speaker Professions");
        // Add Y axis
        var y2 = d3.scaleLinear()
            .domain([0, d3.max(sortedAndLimitedData, function(d) { return +d.Views; })])
            .range([ height, 0]);
        svg2.append("g")
            .call(d3.axisLeft(y2).tickFormat(function(d){
                return d / 1000000 + 'M';
            }))
            .selectAll("text")
            .style("fill", "#fcdcbf")
            .style("font-size", "14px");

        // Bars
        svg2.selectAll("mybar2")
            .data(sortedAndLimitedData)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x2(d.Occupation); })
            .attr("y", function(d) { return y2(d.Views); })
            .attr("width", x2.bandwidth())
            .attr("height", function(d) {
                return height - y2(d.Views); }
            )
            .attr("fill", "yellow")
    })
}

// navigate left and right
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        window.location.href = 'birthplaces.html';
    }
});