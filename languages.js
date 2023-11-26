

d3.csv("years-clean.csv").then(function (data) {
  const svg = d3
    .select("#viz1-svg")
    .append("svg")
    .attr("width", 1500)
    .attr("height", 800);

  var myColor = d3.scaleLinear().domain([1, 66]).range(["#B6F4E6", "#1A3931"]);

  function ticked(val) {
    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", (d) => {
        if (d.views > 250000) {
          return d.views / 250000;
        } else {
          return 1;
        }
      })
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) => myColor(d.languages))
      .append("title")
      .text(
        (d) =>
          `Speaker & Title: ${d.name} \n
           Views: ${d.views} \n
           Comments: ${d.comments} \n
           Languages: ${d.languages} \n
           Event: ${d.event} 
          `
      );
  }

  var simulation = d3
    .forceSimulation(data)
    .force("charge", d3.forceManyBody().strength(0))
    .force("center", d3.forceCenter(750, 400))
    .force(
      "collision",
      d3.forceCollide().radius((d) => d.views / 210000)
    )
    .on("tick", function () {
      val = undefined;
      ticked(val);
    });
});
