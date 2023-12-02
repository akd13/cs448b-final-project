// Configuration and Setup
const container = d3.select("#viz3").node();
const margin = { top: 50, right: 120, bottom: 50, left: 120 };
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
// Append X Axis label
svg.append("text")
    .attr("class", "x-axis-label")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom-20) + ")")
    .attr("dy", "0.75em")
    .style("text-anchor", "middle")
    .style("fill", "#fcdcbf")
    .style("font-size", "20px")
    .style("font-family", "Karla; sans-serif")
    .text(selectedAttribute);
const yAxisGroup = svg.append("g").attr("class", "axes y");
// Append Y Axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 - (height / 2))
    .attr("dy", "0.5em")
    .style("text-anchor", "middle")
    .style("fill", "#fcdcbf")
    .style("font-size", "20px")
    .style("font-family", "Karla; sans-serif")
    .text("Views");

// Define clip-path
svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);
const scatter = svg.append('g').attr("clip-path", "url(#clip)");
const instructionText = scatter.append("text")
    .attr("class", "instruction-text")
    .attr("x", width / 6)
    .attr("y", height / 6)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "16px")
    .style("font-family", "Karla; sans-serif")

instructionText.append("tspan")
    .attr("x", width / 2)
    .attr("dy", "-0.6em")
    .text("select area to zoom in");

instructionText.append("tspan")
    .attr("x", width / 2)
    .attr("dy", "1.2em")
    .text("double click to zoom out");

// Dropdown Selection Handling
var selectedAttribute = 'Funny', selectedLocation = 'Americas';
const attributes_rating = ['Funny', 'Courageous', 'Confusing', 'Beautiful', 'Unconvincing', 'Longwinded', 'Informative', 'Inspiring', 'Fascinating', 'Ingenious', 'Persuasive', 'Jaw-dropping', 'Obnoxious', 'OK'];
const attributes_location = ['Americas', "Europe"];
var currentData = [];
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

    // Update or append title
    var title = svg.selectAll(".chart-title").data([selectedLocation]);
    title.enter()
        .append("text")
        .attr("class", "chart-title")
        .merge(title)
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "#fcdcbf")
        .style("font-family", "Karla; sans-serif")
        .text(d => d);

    d3.csv(location_data).then(data => {
        data.forEach(d => {
            attributes_rating.forEach(attr => d[attr] = +d[attr]);
            d.views = +d.views;
        });
        currentData = data;
        xAxis.domain([0, d3.max(data, d => d[selectedAttribute])]);
        yAxis.domain([0, d3.max(data, d => d.views)]);
        xAxisGroup
            .call(d3.axisBottom(xAxis)
                .tickSize(5)
            )
            .selectAll("text")
            .style("font-size", "18px");
        yAxisGroup
            .call(d3.axisLeft(yAxis)
                .tickSize(5)
                .tickFormat(function(d) {
                    return d3.formatPrefix(".0", 1e6)(d);
                }))
            .selectAll("text")
            .style("font-size", "18px");
        updateCircles(data);
        // Update the text of the x-axis label
        svg.select(".x-axis-label")
            .text(selectedAttribute);
    });

    if (d3.select("#lineOfBestFitCheckbox").property("checked")) {
    drawLineOfBestFit(currentData);
    }
}

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
    if (d3.select("#lineOfBestFitCheckbox").property("checked")) {
        drawLineOfBestFit(data);
    }
}

// Brushing Functionality
var brush = d3.brushX().extent([[0, 0], [width, height]]).on("end", event => updateChart(event, currentData)); // Pass data here
scatter.append("g").attr("class", "brush").call(brush);
var idleTimeout;
function idled() { idleTimeout = null; }
// Update Chart Function for Brushing
function updateChart(event, data) {
    var extent = event.selection;
    if (!extent) {
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
        xAxis.domain(d3.extent(data, d => d[selectedAttribute]));
        d3.select("#lineOfBestFitContainer").style("display", "block");
        if (d3.select("#lineOfBestFitCheckbox").property("checked")) {
            drawLineOfBestFit(data.filter(d => xAxis.domain().includes(d[selectedAttribute])));
        }
    } else {
        var newDomain = [xAxis.invert(extent[0]), xAxis.invert(extent[1])];
        xAxis.domain(newDomain);
        scatter.select(".brush").call(brush.move, null);
    }
    svg.select(".instruction-text").remove();
    xAxisGroup.transition().duration(1000)
        .call(d3.axisBottom(xAxis)
            .tickSize(5)
        )
        .selectAll("text")
        .style("font-size", "18px");

    scatter.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", d => xAxis(d[selectedAttribute]))
        .attr("cy", d => yAxis(d.views));
}

function drawLineOfBestFit(data) {
    const checkbox = d3.select("#lineOfBestFitCheckbox");
    svg.selectAll(".line-of-best-fit").remove();

    // Check if the checkbox is checked
    if (checkbox.node() && checkbox.property("checked")) {
        // Calculate coefficients for line of best fit (y = mx + b)
        const xMean = d3.mean(data, d => d[selectedAttribute]);
        const yMean = d3.mean(data, d => d.views);
        const m = d3.sum(data, d => (d[selectedAttribute] - xMean) * (d.views - yMean)) / d3.sum(data, d => Math.pow(d[selectedAttribute] - xMean, 2));
        const b = yMean - m * xMean;

        // Create the line function
        const line = d3.line()
            .x(d => xAxis(d[selectedAttribute]))
            .y(d => yAxis(m * d[selectedAttribute] + b));

        // Draw the line
        svg.append("path")
            .datum(data)
            .attr("class", "line-of-best-fit")
            .attr("d", line)
            .style("stroke", "white")
            .style("stroke-width", 2)
            .style("fill", "none");
    }
}
d3.select("#lineOfBestFitCheckbox").on("change", function() {
    drawLineOfBestFit(currentData);
});
