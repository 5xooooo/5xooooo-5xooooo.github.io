let mapLeft = 0, mapTop = 0;
let mapMargin = {top: 30, right: 30, bottom: 30, left: 100},
    mapWidth = 1000 - mapMargin.left - mapMargin.right,
    mapHeight = 800 - mapMargin.top - mapMargin.bottom;

let barLeft = 1000, barTop = 400;
let barMargin = {top: 30, right: 30, bottom: 70, left: 50},
    barWidth = 1000 - barMargin.left - barMargin.right,
    barHeight = 500 - barMargin.top - barMargin.bottom;

let radarLeft = 1500, radarTop = 0;
let radarMargin = {top: 30, right: 30, bottom: 30, left: 30},
    radarWidth = 500 - radarMargin.left - radarMargin.right,
    radarHeight = 400 - radarMargin.top - radarMargin.bottom;

let timeLeft = 200, timeTop = 850;
let timeMargin = {top: 30, right: 30, bottom: 30, left: 30},
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
    { county: '臺北市', month: '1', rainfall: 120 },
    { county: '臺北市', month: '2', rainfall: 80 },
    { county: '新北市', month: '1', rainfall: 10 },
    { county: '新北市', month: '2', rainfall: 280 },
    { county: '臺南市', month: '1', rainfall: 200 },
    { county: '臺南市', month: '2', rainfall: 150 },
    { county: '臺中市', month: '1', rainfall: 320 },
    { county: '臺中市', month: '2', rainfall: 50 }
];

var testData2 = [
    { county: '臺北市', month: '1', wind_direction: 120 },
    { county: '臺北市', month: '2', wind_direction: 80 },
    { county: '新北市', month: '1', wind_direction: 110 },
    { county: '新北市', month: '2', wind_direction: 70 },
    { county: '臺南市', month: '1', wind_direction: 100 },
    { county: '臺南市', month: '2', wind_direction: 50 },
    { county: '臺中市', month: '1', wind_direction: 90 },
    { county: '臺中市', month: '2', wind_direction: 50 }
]
    
Promise.all([
    d3.json('taiwan.json'),
    d3.csv('dataset/2023/rainfall.csv'),
    d3.json('dataset/city_data.json')
]).then(function([taiwanData, rainfallData, cityData]) {
    //draw taiwan map
    var projection = d3.geoMercator()
                       .scale(10000)
                       .center([120.5,23.7])
                       .translate([mapWidth / 2, mapHeight / 2]);

    var geoGenerator = d3.geoPath()
                         .projection(projection);

    //select county 
    var selectedCounty = null;

    var country = mapSvg.selectAll('path')
        .data(taiwanData.features)
        .enter()
        .append('path')
        .attr('stroke', 'black')
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
                var monthlyData = processWindData(testData2, selectedMonth, selectedCounty);
                updateRadarChart(monthlyData);
                return;
            }
            d3.select(selectedCounty).classed('selected', false);
            selectedCounty = this;
            d3.select(this).classed('hovered', false).classed('selected', true);

            var monthlyData = processWindData(testData2, selectedMonth, selectedCounty);
            updateRadarChart(monthlyData);
        });
    
    //select month
    var selectedMonth = 1;

    var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var timeXScale = d3.scalePoint()
        .domain(months)
        .range([0, timeMargin.left + timeWidth + timeMargin.right]);
    var timeXAxis = d3.axisBottom(timeXScale).tickSize(10);
    timeSvg.call(timeXAxis);

    var dragCircle = timeSvg.append('circle')
        .attr('cx', timeXScale(selectedMonth))
        .attr('cy', 0)
        .attr('r', 10)
        .attr('fill', 'steelblue')
        .call(
            d3.drag()
                .on('drag', function() {
                    var x = Math.max(0, Math.min((d3.mouse(this))[0], timeWidth + timeMargin.left + timeMargin.right));
                    dragCircle.attr('cx', x);

                    var closestMonth = months.reduce((prev, curr) => {
                        return Math.abs(timeXScale(curr) - x) < Math.abs(timeXScale(prev) - x) ? curr : prev;
                    }, months[0]);

                    selectedMonth = closestMonth;
                })
                .on('end', function () {
                    var targetX = timeXScale(selectedMonth);
                    dragCircle.attr('cx', targetX);
                    
                    updateMap(selectedMonth);
                    
                    var monthlyData = processWindData(testData2, selectedMonth, selectedCounty);
                    updateRadarChart(monthlyData);
                })
        );

    //update taiwan map
    var colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(testData, d => d.rainfall)])

    function updateMap(selectedMonth) {
        var selectedData = testData.filter(d => d.month == selectedMonth);
 
        var rainfallMap = {};
        selectedData.forEach(d => {
            rainfallMap[d.county] = d.rainfall;
        });
    
        country.attr('fill', function (d) {
            var rainfall = rainfallMap[d.properties.NAME_2014] || 0;
            return colorScale(rainfall);
        });
    }

    updateMap(selectedMonth);
    
    //discretization
    function processWindData(testData2, selectedMonth, selectedCountry) {
        var filteredData = testData2.filter(d => d.month == selectedMonth);
        if(selectedCountry) {
            countyName = d3.select(selectedCountry).data()[0].properties.NAME_2014;
            filteredData = filteredData.filter(d => d.county == countyName);
        }

        var binSize = 15;
        var bins = d3.range(0, 360, binSize);

        var binCounts = bins.map(bin => ({ angle: bin, frequency: 0 }));

        filteredData.forEach(d => {
            var angle = d.wind_direction;
            var binIndex = Math.floor(angle / binSize);
            (binCounts[binIndex]).frequency += 1;
        });

        var total = d3.sum(binCounts, d => d.frequency);
        binCounts.forEach(d => {
            d.frequency = total > 0 ? d.frequency / total : 0;
        });

        return binCounts;
    }

    //draw radar chart
    var radarRadius = Math.min(radarWidth, radarHeight) / 2;
    var angleScale = d3.scaleLinear().domain([0, 360]).range([0, 2 * Math.PI]);
    var radiusScale = d3.scaleLinear().domain([0, 1]).range([0, radarRadius]);

    var gridLevels = d3.range(0.2, 1.2, 0.2);
    radarSvg.selectAll('.grid')
        .data(gridLevels)
        .enter()
        .append('circle')
        .attr('class', 'grid')
        .attr('cx', radarWidth/2 + radarMargin.left)
        .attr('cy', radarHeight/2 + radarMargin.top)
        .attr('r', d => radiusScale(d));

    var directions = d3.range(0, 360, 15);
    radarSvg.selectAll(".axis")
        .data(directions)
        .enter()
        .append("line")
        .attr("class", "axis")
        .attr('transform', `translate(${radarWidth/2 + radarMargin.left}, ${radarHeight/2 + radarMargin.top})`)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", d => radiusScale(1) * Math.cos(angleScale(d) - Math.PI / 2))
        .attr("y2", d => radiusScale(1) * Math.sin(angleScale(d) - Math.PI / 2))
        .style("stroke", "#aaa");

    var directions = d3.range(0, 360, 30);
    radarSvg.selectAll('.radar-label')
        .data(directions)
        .enter()
        .append('text')
        .attr('transform', `translate(${radarWidth/2 + radarMargin.left}, ${radarHeight/2 + radarMargin.top + 7})`)
        .attr('class', 'radar-label')
        .attr('x', d => radiusScale(1.1) * Math.cos(angleScale(d) - Math.PI / 2))
        .attr('y', d => radiusScale(1.1) * Math.sin(angleScale(d) - Math.PI / 2))
        .attr('text-anchor', 'middle')
        .text(d => `${d}°`);

    //update radar chart
    function updateRadarChart(data) {
        var areaGenerator = d3.lineRadial()
            .angle(d => angleScale(d.angle))
            .radius(d => radiusScale(d.frequency))
            .curve(d3.curveCardinalClosed);
    
        var radarPath = radarSvg.selectAll('.radar-area').data([data]);
    
        radarPath.enter()
            .append('path')
            .attr('transform', `translate(${radarWidth/2 + radarMargin.left}, ${radarHeight/2 + radarMargin.top})`)
            .attr('class', 'radar-area')
            .merge(radarPath)
            .transition()
            .duration(500)
            .attr('d', areaGenerator)
            .attr('fill', 'steelblue')
            .attr('fill-opacity', 0.5)
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2);
    
        radarPath.exit().remove();
    }
    
    var monthlyData = processWindData(testData2, selectedMonth);
    updateRadarChart(monthlyData);

    // draw bar chart
    var country_rainfall = [];
    for (var country_name in cityData.rainfall) {
        cityData.rainfall[country_name].forEach(entry => {
            var month = entry.month;
            if (!(month in country_rainfall)) {
                country_rainfall[month] = 0;
            }else{
                country_rainfall[month] += entry.sum;
            }
        });
    }
    // console.log(country_rainfall);

    var rainfall_list = [];
    for (var country_name in cityData.rainfall) {
        var totalRainfall = cityData.rainfall[country_name].reduce((sum, entry) => sum + entry.sum, 0);
        rainfall_list.push({ county: country_name, sum: totalRainfall });
    }

    var barXScale = d3.scaleBand()
        .domain(rainfall_list.map(d => d.county))
        .range([0, barWidth])
        .padding(0.1);

    var barYScale = d3.scaleLinear()
        .domain([0, d3.max(rainfall_list.map(d => d.sum))])
        .range([barHeight, 0]);

    console.log(d3.max(rainfall_list.map(d => d.sum)));

    var barXAxis = d3.axisBottom(barXScale);
    var barYAxis = d3.axisLeft(barYScale);

    function draw_barchart(){
        barSvg.append('g')
            .attr('transform', `translate(${barMargin.left}, ${barHeight + barMargin.top})`)
            .call(barXAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('y', 10)
            .attr('x', -5)
            .attr('text-anchor', 'end')
            .style('font-size', '18px');

        barSvg.append('g')
            .attr('transform', `translate(${barMargin.left}, ${barMargin.top})`)
            .call(barYAxis);
        
        var bar = barSvg.selectAll('.rect').data(rainfall_list, d => d.county);

        bar.enter()
            .append('rect')
            .attr('x', d => barXScale(d.county) + barMargin.left)
            .attr('y', barHeight + barMargin.top)
            .attr('width', barXScale.bandwidth())
            .attr('height', 0)
            .attr('fill', 'steelblue')
            .on('mouseover', function () {
            d3.select(this).attr('fill', 'orange');
            })
            .on('mouseout', function () {
            d3.select(this).attr('fill', 'steelblue');
            })
            .merge(bar)
            .transition()
            .duration(1000)
            .attr('x', d => barXScale(d.county) + barMargin.left)
            .attr('y', d => barYScale(d.sum) + barMargin.top)
            .attr('height', d => barHeight - barYScale(d.sum));

        bar.exit().remove();
    }

    // Sort the bars
    d3.select('#sortButton').on('click', function() {
        rainfall_list.sort((a, b) => d3.descending(a.sum, b.sum));
        barXScale.domain(rainfall_list.map(d => d.county));

        var transition = barSvg.transition().duration(1000);

        transition.selectAll('.rect')
        .delay((d, i) => i * 50)
        .attr('x', d => barXScale(d.county) + barMargin.left);

        transition.select('.x.axis')
        .call(barXAxis)
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .attr('y', 10)
        .attr('x', -5)
        .attr('text-anchor', 'end')
        .style('font-size', '18px');
        draw_barchart();
    });

    draw_barchart();

 

});