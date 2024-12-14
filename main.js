let mapLeft = 100, mapTop = 0;
let mapMargin = {top: 10, right: 30, bottom: 30, left: 100},
    mapWidth = 1000 - mapMargin.left - mapMargin.right,
    mapHeight = 800 - mapMargin.top - mapMargin.bottom;

let barLeft = 1050, barTop = 0;
let barMargin = {top: 10, right: 30, bottom: 30, left: 60},
    barWidth = 600 - barMargin.left - barMargin.right,
    barHeight = 400 - barMargin.top - barMargin.bottom;

let radarLeft = 1050, radarTop = 400;
let radarMargin = {top: 10, right: 30, bottom: 30, left: 60},
    radarWidth = 600 - radarMargin.left - radarMargin.right,
    radarHeight = 400 - radarMargin.top - radarMargin.bottom;

let timeLeft = 300, timeTop = 760;
let timeMargin = {top: 10, right: 30, bottom: 30, left: 60},
    timeWidth = 600 - timeMargin.left - timeMargin.right,
    timeHeight = 100 - timeMargin.top - timeMargin.bottom;

var svg = d3.select('svg');

let mapSvg = svg.append('g')
    .attr('transform', `translate(${mapLeft}, ${mapTop})`);
    
let barSvg = svg.append('g')
    .attr('transform', `translate(${barLeft}, ${barTop})`);

let radarSvg = svg.append('g')
    .attr('transform', `translate(${radarLeft}, ${radarTop})`);

let timeSvg = svg.append('g')
    .attr('transform', `translate(${timeLeft}, ${timeTop})`);

mapSvg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', mapWidth + mapMargin.left + mapMargin.right)
    .attr('height', mapHeight + mapMargin.top + mapMargin.bottom)
    .attr('stroke', 'black')
    .attr('fill', 'none');

barSvg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', barWidth + barMargin.left + barMargin.right)
    .attr('height', barHeight + barMargin.top + barMargin.bottom)
    .attr('stroke', 'black')
    .attr('fill', 'none');

radarSvg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', radarWidth + radarMargin.left + radarMargin.right)
    .attr('height', radarHeight + radarMargin.top + radarMargin.bottom)
    .attr('stroke', 'black')
    .attr('fill', 'none');

var testData = [
    { county: "臺北市", month: "1", rainfall: 120 },
    { county: "臺北市", month: "2", rainfall: 80 },
    { county: "新北市", month: "1", rainfall: 10 },
    { county: "新北市", month: "2", rainfall: 280 },
    { county: "臺南市", month: "1", rainfall: 200 },
    { county: "臺南市", month: "2", rainfall: 150 },
    { county: "臺中市", month: "1", rainfall: 320 },
    { county: "臺中市", month: "2", rainfall: 50 },
];
    
Promise.all([
    d3.json('taiwan.json'),
    d3.csv('dataset/2023/rainfall.csv')
]).then(function([taiwanData, rainfallData]) {
    //draw taiwan map
    var projection = d3.geoMercator()
                       .scale(10000)
                       .center([120.5,23.7])
                       .translate([mapWidth / 2, mapHeight / 2]);

    var geoGenerator = d3.geoPath()
                         .projection(projection);

    //select county 
    var selectedCounty = null;

    var county = mapSvg.selectAll('path')
        .data(taiwanData.features)
        .enter()
        .append('path')
        .attr('stroke', "black")
        .attr('d', geoGenerator)
        .attr('class', 'county')
        .on('mouseover', function () {
            if(selectedCounty == this) return;
            d3.select(this).classed('hovered', true);
        })
        .on('mouseout', function () {
            d3.select(this).classed('hovered', false);
        })
        .on('click', function () {
            if(selectedCounty == this) {
                d3.select(selectedCounty).classed('selected', false);
                d3.select(this).classed('hovered', true);
                selectedCounty = null;
                return;
            }
            d3.select(selectedCounty).classed('selected', false);
            selectedCounty = this;
            d3.select(this).classed('hovered', false).classed('selected', true);
        });
    
    //select month
    var selectedMonth = 1;

    var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var timeXScale = d3.scalePoint()
        .domain(months)
        .range([0, timeMargin.left + timeWidth + timeMargin.right]);
    var timeXAxis = d3.axisBottom(timeXScale).tickSize(10);
    timeSvg.call(timeXAxis);

    var dragCircle = timeSvg.append("circle")
        .attr("cx", timeXScale(selectedMonth))
        .attr("cy", 0)
        .attr("r", 10)
        .attr("fill", "steelblue")
        .call(
            d3.drag()
                .on("drag", function() {
                    var x = Math.max(0, Math.min((d3.mouse(this))[0], timeWidth + timeMargin.left + timeMargin.right));
                    dragCircle.attr("cx", x);

                    var closestMonth = months.reduce((prev, curr) => {
                        return Math.abs(timeXScale(curr) - x) < Math.abs(timeXScale(prev) - x) ? curr : prev;
                    }, months[0]);

                    selectedMonth = closestMonth;
                })
                .on("end", function () {
                    var targetX = timeXScale(selectedMonth);
                    dragCircle.attr("cx", targetX);
                    updateMap(selectedMonth);
                })
        );

    //change map color
    var colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(testData, d => d.rainfall)])

    function updateMap(selectedMonth) {
        var selectedData = testData.filter(d => d.month == selectedMonth);
 
        var rainfallMap = {};
        selectedData.forEach(d => {
            rainfallMap[d.county] = d.rainfall;
        });
    
        county.attr("fill", function (d) {
            var rainfall = rainfallMap[d.properties.NAME_2014] || 0;
            return colorScale(rainfall);
        });
    }

    updateMap(selectedMonth);
    
    // var texts = mapSvg.selectAll('text')
    //     .data(taiwan.features)
    //     .enter()
    //     .append('text')
    //     .attr('text-anchor', 'middle')
    //     .attr('alignment-baseline', 'middle')
    //     .attr('opacity', 0.5)
    //     .text(function(d) {
    //         return d.properties.NAME_2014;
    //     })
    //     .attr('transform', function(d) {
    //         var center = geoGenerator.centroid(d);
    //         return 'translate(' + center + ')';
    //     });
});