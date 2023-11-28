/*   Dropdown Button   */
/**********************/

var selectedAttribute = 'Funny'
const attributes = ['Funny', 'Courageous', 'Confusing', 'Beautiful', 'Unconvincing', 'Longwinded', 'Informative', 'Inspiring', 'Fascinating', 'Ingenious', 'Persuasive', 'Jaw-dropping', 'Obnoxious', 'OK'];
const select = d3.select("#attribute-selector");
select.selectAll("option")
    .data(attributes)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);


const margin = {top: 50, right: 90, bottom: 50, left: 90}, width = 960 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    var svg = d3.select("#viz3-svg")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

/* Dropdown Selection */
/**********************/
select.on('change', function() {
    const selectedAttribute = d3.select(this).property('value');
    console.log(selectedAttribute);
    updatePlot(selectedAttribute);
});

updatePlot(selectedAttribute);


/*     Create SVG       */
/**********************/

function updatePlot(selectedAttribute) {


    d3.csv("data/americas.csv").then(function (data) {
        data.forEach(function (d) {
            attributes.forEach(attr => {
                d[attr] = +d[attr];
            });
            d.views = +d.views;
        });

        var x = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return d[selectedAttribute];
            })])
            .range([0, width]);

        svg.select(".axes.x").remove();
        svg.append("g")
            .attr("class", "axes x")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return d.views;
            })])
            .range([height, 0]);
        
        svg.append("g")
            .attr("class", "axes")
            .call(d3.axisLeft(y));

        var circles = svg.selectAll("circle")
                .data(data);
        
        circles.exit().remove();

        circles
            .enter()
            .append("circle")
            .merge(circles)
            .attr("cx", function (d) {
                return x(d[selectedAttribute]);
            })
            .attr("cy", function (d) {
                return y(d.views);
            })
            .attr("r", 5)
            .style("fill", "#69b3a2")
            .style("opacity", 0.7)
            .on('mouseover', function (event, d) {
                d3.select(this).attr('stroke', 'black').attr('stroke-width', 2);
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
            
        svg.append("text")
            .attr("class", "label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", -margin.top - height / 2 + 80)
            .attr("y", -margin.left + 18)
            .attr("font-size", "25px")
            .text("Views")
            .style("fill", "white");
    });
}
