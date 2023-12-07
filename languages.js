var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


    const svg = d3
    .select("#viz1-svg")
    .append("svg")
      .attr("id", "viz1-svg-main")
      .attr("width", '100vw')
      .attr("height", '100vh')
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const svg2 = d3
    .select("#viz2-svg")
    .append("svg")
      .attr("id", "viz2-svg-main")
      .attr("width", '100vw')
      .attr("height", '100vh')
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
d3.csv("data/occupation_views_averaged.csv").then(function (data) {

    var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(function(d) { return d.Occupation_cluster; }))
  .padding(0.2);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("fill", "#fcdcbf");

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, 5613145])
  .range([ height, 0]);
svg.append("g")
  .call(d3.axisLeft(y))
  .selectAll("text")
    .style("fill", "#fcdcbf");

// Bars
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
 });
})

function showClusterDetails(clusterName) {
  svg2.selectAll("*").remove();
  d3.csv(clusterName).then(function (data2) {

  var x2 = d3.scaleBand()
  .range([ 0, width ])
  .domain(data2.map(function(d) { return d.Occupation; }))
  .padding(0.2);
svg2.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x2))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("fill", "#fcdcbf");

// Add Y axis
var y2 = d3.scaleLinear()
  .domain([0, 5613145])
  .range([ height, 0]);
svg2.append("g")
  .call(d3.axisLeft(y2))
  .selectAll("text")
    .style("fill", "#fcdcbf");

// Bars
svg2.selectAll("mybar2")
  .data(data2)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x2(d.Occupation); })
    .attr("y", function(d) { return y2(d.Views); })
    .attr("width", x2.bandwidth())
    .attr("height", function(d) { return height - y2(d.Views); })
    .attr("fill", "yellow")
})
}

// navigate left and right
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        window.location.href = 'birthplaces.html';
    }
});