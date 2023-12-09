var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = window.innerWidth - margin.left*12 - margin.right*10,
    height = window.innerHeight - margin.top - margin.bottom*5;


const svg = d3
    .select("#viz1-svg")
    .append("svg")
    .attr("id", "viz1-svg-main")
    .attr("width", '50vw')
    .attr("height", '100vh')
    .style("margin-left", "10vw")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

const svg2 = d3
    .select("#viz2-svg")
    .append("svg")
    .attr("id", "viz2-svg-main")
    .attr("width", '50vw')
    .attr("height", '100vh')
    // .style("margin-right", "40px")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/occupation_views_averaged.csv").then(function (data) {

    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.Occupation_cluster; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + (height - 10) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,15)rotate(-45)")
        .style("text-anchor", "end")
        .style("fill", "#fcdcbf")
        .style("font-size", "16px");

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
        .style("font-size", "16px");

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
        }).slice(0, 20);
        var x2 = d3.scaleBand()
            .range([ 0, width ])
            .domain(sortedAndLimitedData.map(function(d) { return d.Occupation; }))
            .padding(0.2);

        svg2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x2))
            .selectAll("text")
            .attr("transform", "translate(-10,10)rotate(-45)")
            .style("text-anchor", "end")
            .style("fill", "#fcdcbf")
            .style("font-size", "16px");

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
            .style("font-size", "16px");

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