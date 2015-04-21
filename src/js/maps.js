var margin = {top: 40, right: 10, bottom: 10, left: 10};
var width = 560 - margin.left - margin.right;
var height = 400;

function generateMap(data) {
	var scale = d3.scale.linear()
		.domain([0, d3.max(data.reads)])
		.range(['yellow', 'red']);

		var map = new Datamap({
			element: document.querySelector('.result-box__chart--' + data.facet),
			projection: 'mercator',
			width: width,
			height: height,
			fills: {
				defaultFill: '#a1dbb2',
			}
		});

		var mapInfo = {};

		data.names.forEach(function(country, index) {
			mapInfo[country] = scale(data.reads[index]);
		});

		map.updateChoropleth(mapInfo);
}

module.exports = generateMap;