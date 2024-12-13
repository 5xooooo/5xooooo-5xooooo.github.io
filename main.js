let mapLeft = 200, mapTop = 0;
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

var svg = d3.select('svg');

let mapSvg = svg.append('g')
    .attr('transform', `translate(${mapLeft}, ${mapTop})`);
let barSvg = svg.append('g')
    .attr('transform', `translate(${barLeft}, ${barTop})`);
let radarSvg = svg.append('g')
    .attr('transform', `translate(${radarLeft}, ${radarTop})`);

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

d3.json("taiwan.json").then(drawTaiwan);

function drawTaiwan(taiwan) {
    var projection = d3.geoMercator()
        .fitExtent([[0, 0], [mapWidth + mapMargin.left + mapMargin.right, mapHeight + mapMargin.top + mapMargin.bottom]], taiwan);

    var geoGenerator = d3.geoPath()
        .projection(projection);

    var paths = mapSvg.selectAll('path')
        .data(taiwan.features)
        .enter()
        .append('path')
        .attr('stroke', "white")
        .attr('fill', 'steelblue')
        .attr('d', geoGenerator);

    paths.on('click', function(event, d) {
        mapSvg.selectAll('path')
            .attr('fill', 'steelblue');
        d3.select(this)
            .attr('fill', 'red');
    });
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
}
