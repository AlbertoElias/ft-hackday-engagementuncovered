var margin = {top: 40, right: 10, bottom: 10, left: 10};
var width = 560 - margin.left - margin.right;
var height = 540 - margin.top - margin.bottom;

function generateChart(data) {
	var y = d3.scale.ordinal()
		.domain(data.names)
		.rangeRoundBands([height, 0], .1);

	var x = d3.scale.linear()
		.domain([0, d3.max(data.reads)])
		.range([0, width]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient('top');

	var chart = d3.select('.result-box__chart--' + data.facet)
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	chart.append('g')
		.attr('class', 'result-box__chart__axis result-box__chart__axis--x')
		.call(xAxis);

	var bar = chart.selectAll('.result-box__chart__bar-wrapper')
			.data(data.reads)
		.enter().append('g')
			.attr('class', 'result-box__chart__bar-wrapper')
			.attr('transform', function(d, i) { return 'translate(0,' + i * y.rangeBand() + ')'; });

	bar.append('rect')
		.attr('class', 'result-box__chart__bar')
		.attr('width', x)
		.attr('height', y.rangeBand() - 1)
		.style('cursor', 'pointer')
		.on('click', function(d) {
			document.location.href = 'http://www.google.com/';
		});

	bar.append('text')
		.attr('x', margin.left)
		.attr('y', y.rangeBand() / 2)
		.attr('dy', '.35em')
		.text(function(d, i) { return data.names[i]; });
}

module.exports = generateChart;