// Configuration and Setup
const container = d3.select("#viz3").node();
const margin = { top: 50, right: 90, bottom: 50, left: 90 };
const width = container.getBoundingClientRect().width - margin.left * 3 - margin.right * 3;
const height = container.getBoundingClientRect().height - margin.top * 3 - margin.bottom * 3;
const svg = d3.select("#viz3-svg").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xAxis = d3.scaleLinear().range([0, width]);
const yAxis = d3.scaleLinear().range([height, 0]);
const xAxisGroup = svg.append("g").attr("class", "axes x").attr("transform", `translate(0, ${height})`);
const yAxisGroup = svg.append("g").attr("class", "axes y");
const scatter = svg.append('g').attr("clip-path", "url(#clip)");

// Dropdown Selection Handling
var selectedAttribute = 'Funny', selectedLocation = 'Americas';
const attributes_rating = ['Funny', 'Courageous', 'Confusing', 'Beautiful', 'Unconvincing', 'Longwinded', 'Informative', 'Inspiring', 'Fascinating', 'Ingenious', 'Persuasive', 'Jaw-dropping', 'Obnoxious', 'OK'];
const attributes_location = ['Americas', "Europe"];
var tooltip = d3.select("#tooltip");

d3.select("#attribute-selector-rating").selectAll("option").data(attributes_rating).enter()
  .append("option").text(d => d).attr("value", d => d);
d3.select("#attribute-selector-location").selectAll("option").data(attributes_location).enter()
  .append("option").text(d => d).attr("value", d => d);

d3.selectAll("#attribute-selector-rating, #attribute-selector-location")
  .on('change', function() {
    selectedAttribute = d3.select("#attribute-selector-rating").property('value');
    selectedLocation = d3.select("#attribute-selector-location").property('value');
    updatePlot();
  });

updatePlot();

/*     Create SVG       */
/**********************/
// Update Plot Function
function updatePlot() {
    const location_data = selectedLocation === 'Americas' ? 'data/americas.csv' : 'data/europe.csv';

    d3.csv(location_data).then(data => {
        data.forEach(d => {
            attributes_rating.forEach(attr => d[attr] = +d[attr]);
            d.views = +d.views;
        });

        xAxis.domain([0, d3.max(data, d => d[selectedAttribute])]);
        yAxis.domain([0, d3.max(data, d => d.views)]);
        xAxisGroup.call(d3.axisBottom(xAxis));
        yAxisGroup.call(d3.axisLeft(yAxis));

        updateCircles(data);
    });
}

// Create a tooltip

// Update Circles
function updateCircles(data) {
    var circles = scatter.selectAll("circle").data(data);

    var enterCircles = circles.enter().append("circle")
        .merge(circles)
        .attr("r", 4)
        .style("fill", "rgb(255,0,0)")
        .on('mouseover', function(event, d) {
            //add tooltip
            // console.log(d,"inside mouseover");
            d3.select(this).attr('stroke', 'white').attr('stroke-width', 2);
        })
        .on('mouseout', function() {
            //remove tooltip
            d3.select(this).attr('stroke', null);
        })

        circles.merge(enterCircles)
        .transition()
        .duration(1000)
        .attr("cx", d => xAxis(d[selectedAttribute]))
        .attr("cy", d => yAxis(d.views));


    // Add title to both entered and updated circles
    enterCircles.append('title')
        .text(d => `${d.main_speaker}: ${d.city}`);

    circles.select('title')
        .text(d => `${d.main_speaker}: ${d.city}`);

    circles.exit().remove();
}

// Brushing Functionality (Assuming it's similar to your original setup)
// Add this section only if brushing is needed
var brush = d3.brushX().extent([[0, 0], [width, height]]).on("end", updateChart);
scatter.append("g").attr("class", "brush").call(brush);
// Update Chart Function for Brushing
function updateChart(event) {
    var selection = event.selection;

    if (!selection) {
        // If there's no selection, reset to the original domain
        xAxis.domain(d3.extent(data, d => d[selectedAttribute]));
    } else {
        // Update the x-axis domain based on the brush selection
        xAxis.domain([xAxis.invert(selection[0]), xAxis.invert(selection[1])]);
        scatter.select(".brush").call(brush.move, null); // Remove brush area
    }

    // Redraw the x-axis
    xAxisGroup.transition().duration(1000).call(d3.axisBottom(xAxis));

    // Update the positions of the circles
    scatter.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", d => xAxis(d[selectedAttribute]))
        .attr("cy", d => yAxis(d.views));
}