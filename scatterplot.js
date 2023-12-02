/* Margins */
/***********/
const container = d3.select("#viz3").node();
const containerWidth = container.getBoundingClientRect().width;
const containerHeight = container.getBoundingClientRect().height;
const margin = {top: 50, right: 90, bottom: 50, left: 90}
const width = containerWidth - margin.left*3 - margin.right*3;
const height = containerHeight - margin.top*3 - margin.bottom*3;

/*   Dropdown Button   */
/**********************/

var selectedAttribute = 'Funny'
const attributes_rating = ['Funny', 'Courageous', 'Confusing', 'Beautiful', 'Unconvincing', 'Longwinded', 'Informative', 'Inspiring', 'Fascinating', 'Ingenious', 'Persuasive', 'Jaw-dropping', 'Obnoxious', 'OK'];
const select_rating = d3.select("#attribute-selector-rating");
select_rating.selectAll("option")
    .data(attributes_rating)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);


var selectedLocation = 'Americas'
const attributes_location = ['Americas', "Europe"]
const select_location = d3.select("#attribute-selector-location");
select_location.selectAll("option")
    .data(attributes_location)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

var svg = d3.select("#viz3-svg")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

/* Dropdown Selection */
/**********************/
select_rating.on('change', function() {
    selectedAttribute = d3.select(this).property('value');
    console.log(selectedAttribute);
    updatePlot(selectedAttribute, selectedLocation);
});

select_location.on('change', function() {
    selectedLocation = d3.select(this).property('value');
    console.log(selectedLocation);
    updatePlot(selectedAttribute, selectedLocation);
});

updatePlot(selectedAttribute, selectedLocation);

/*     Create SVG       */
/**********************/

function updatePlot(selectedAttribute, selectedLocation) {

    var location_data;
    if (selectedLocation === 'Americas') {
        location_data = 'data/americas.csv';
    }
    else {
        location_data = 'data/europe.csv';
    }

    d3.csv(location_data).then(function (data) {
        data.forEach(function (d) {
            attributes_rating.forEach(attr => {
                d[attr] = +d[attr];
            });
            d.views = +d.views;
        });

        var xAxis = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return d[selectedAttribute];
            })])
            .range([0, width]);

        svg.select(".axes.x").remove();
        svg.append("g")
            .attr("class", "axes x")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xAxis));

        var yAxis = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return d.views;
            })])
            .range([height, 0]);

        svg.select(".axes.y").remove();
        svg.append("g")
            .attr("class", "axes y")
            .call(d3.axisLeft(yAxis));

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width )
            .attr("height", height )
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        var brush = d3.brushX()
            .extent( [ [0,0], [width,height] ] )
            .on("end", updateChart)

        // Create the scatter variable: where both the circles and the brush take place
        var scatter = svg.append('g')
            .attr("clip-path", "url(#clip)")

        var circles = scatter.selectAll("circle")
            .data(data);
        // Add the brushing
        scatter
            .append("g")
            .attr("class", "brush")
            .call(brush);

        var idleTimeout;
        function idled() { idleTimeout = null; }

        // A function that updates the chart for given boundaries
        function updateChart(event) {
            var extent = event.selection;


            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
                xAxis.domain(d3.extent(data, function(d) { return d[selectedAttribute]; }));
            } else {
                xAxis.domain([xAxis.invert(extent[0]), xAxis.invert(extent[1])]);
                svg.select(".brush").call(brush.move, null); // Remove brush area
            }

            svg.select(".axes.x")
                .transition()
                .duration(1000)
                .call(d3.axisBottom(xAxis));

            svg
                .selectAll("circle")
                .transition()
                .duration(1000)
                .attr("cx", function (d) { return xAxis(d[selectedAttribute]); })
                .attr("cy", function (d) { return yAxis(d.views); });
        }

        circles.exit().remove();

        circles
            .enter()
            .append("circle")
            .merge(circles)
            .attr("cx", function (d) {
                return xAxis(d[selectedAttribute]);
            })
            .attr("cy", function (d) {
                return yAxis(d.views);
            })
            .attr("r", 4)
            .style("fill", "rgba(143,38,38,0.64)")
            .on('mouseover', function (event, d) {
                d3.select(this).attr('stroke', 'white').attr('stroke-width', 2);
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke', null)
            })
            .append('title')
            .attr('class', 'tooltip')
            .text(function (d) {
                return d.main_speaker + ", "+ d.city;
            });

        svg.select(".label-x").remove();
        svg.append("text")
            .attr("class", "label-x")
            .attr("text-anchor", "end")
            .attr("x", width / 2 + margin.left)
            .attr("y", height + margin.top -5)
            .attr("font-size", "25px")
            .text(selectedAttribute)
            .style("fill", "white");

        svg.select(".label-y").remove();
        svg.append("text")
            .attr("class", "label-y")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", -margin.top - height / 2 + 80)
            .attr("y", -margin.left + 18)
            .attr("font-size", "25px")
            .text("Views")
            .style("fill", "white");
    });
}
