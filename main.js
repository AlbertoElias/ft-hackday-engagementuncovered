'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

var header = require('o-header');

var apiHandler = require('./src/js/api');
var chart = require('./src/js/charts');
var map = require('./src/js/maps');

function loadResults(results) {
	var container = document.querySelector('.results-container');
	container.innerHTML = '';

	Object.keys(results).forEach(function(facet) {
		var resultBox = document.createElement('div');
		resultBox.classList.add('result-box');

		var listTitle = document.createElement('h2');
		listTitle.classList.add('result-box__title');
		listTitle.textContent = facet;

		resultBox.appendChild(listTitle);

		var facetResults = results[facet].buckets;

		var data = {
			facet: facet,
			names: [],
			reads: []
		}

		for (var i = 0; i < facetResults.length; i++) {
			data.names[i] = facetResults[i].value;
			data.reads[i] = facetResults[i].count;
		}

		var resultElement;

		if (facet === 'country') {
			resultElement = document.createElement('div');
			resultElement.classList.add('result-box__chart', 'result-box__chart--' + facet);
		} else {
			resultElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			resultElement.classList.add('result-box__chart', 'result-box__chart--' + facet);
		}

		resultBox.appendChild(resultElement);

		container.appendChild(resultBox);

		if (facet === 'country') {
			map(data);
		} else {
			chart(data);
		}
	});
}

function init() {
	var industriesSelect = document.querySelector('.search-box__select--industries');
	var countriesSelect = document.querySelector('.search-box__select--countries');
	var positionsSelect = document.querySelector('.search-box__select--positions');
	var responsibilitiesSelect = document.querySelector('.search-box__select--responsibilities');
	var contentInput = document.querySelector('.search-box__input--content');
	var contentFacetList = document.querySelector('.search-box__facet--list');

	apiHandler.getIndustries()
		.then(function(industries) {
			var option = document.createElement('option');
			option.value = undefined;
			option.text = '--------';
			industriesSelect.add(option);

			for (var i = 0; i < industries.length; i++) {
				var option = document.createElement('option');
				option.value = industries[i].name;
				option.text = industries[i].name;
				industriesSelect.add(option);
			}
		}, function(error) {
			throw error;
		});

	apiHandler.getCountries()
		.then(function(countries) {
			var option = document.createElement('option');
			option.value = undefined;
			option.text = '--------';
			countriesSelect.add(option);

			for (var i = 0; i < countries.length; i++) {
				var option = document.createElement('option');
				option.value = countries[i]['iso3'];
				option.text = countries[i]['country'];
				countriesSelect.add(option);
			}
		}, function(error) {
			throw error;
		});

	apiHandler.getPositions()
		.then(function(positions) {
			var option = document.createElement('option');
			option.value = undefined;
			option.text = '--------';
			positionsSelect.add(option);

			for (var i = 0; i < positions.length; i++) {
				var option = document.createElement('option');
				option.value = positions[i].name;
				option.text = positions[i].name;
				positionsSelect.add(option);
			}
		}, function(error) {
			throw error;
		});

	apiHandler.getResponsibilities()
		.then(function(responsibilities) {
			var option = document.createElement('option');
			option.value = undefined;
			option.text = '--------';
			responsibilitiesSelect.add(option);

			for (var i = 0; i < responsibilities.length; i++) {
				var option = document.createElement('option');
				option.value = responsibilities[i].name;
				option.text = responsibilities[i].name;
				responsibilitiesSelect.add(option);
			}
		}, function(error) {
			throw error;
		});

	apiHandler.getContentFacets()
		.then(function(facets) {
			facets.forEach(function(facet) {
				var checkboxWrapper = document.createElement('div');

				var checkboxElement = document.createElement('input');
				checkboxElement.type = 'checkbox';
				checkboxElement.id = 'checkbox-' + facet;
				checkboxElement.name = facet;
				checkboxElement.value = facet;
				checkboxElement.classList.add('o-forms-checkbox');

				var checkboxLabel = document.createElement('label');
				checkboxLabel.htmlFor = 'checkbox-' + facet;
				checkboxLabel.textContent = facet;
				checkboxLabel.classList.add('o-forms-label');

				checkboxWrapper.appendChild(checkboxElement);
				checkboxWrapper.appendChild(checkboxLabel);

				contentFacetList.appendChild(checkboxWrapper);
			});
		});

	var searchSubmitHandler = function(ev) {
		var queryParams = {};

		if (industriesSelect.value !== 'undefined') {
			queryParams.industry = industriesSelect.value;
		}

		if (countriesSelect.value !== 'undefined') {
			queryParams.country = countriesSelect.value;
		}

		if (positionsSelect.value !== 'undefined') {
			queryParams.position = positionsSelect.value;
		}

		if (responsibilitiesSelect.value !== 'undefined') {
			queryParams.responsibility = responsibilitiesSelect.value;
		}

		if (contentInput.value !== '') {
			queryParams.content = contentInput.value;
		}

		var facets = [];

		var facetCheckboxes = contentFacetList.querySelectorAll('.o-forms-checkbox');

		for (var i = 0; i < facetCheckboxes.length; i++) {
			if (facetCheckboxes[i].checked) {
				facets.push(facetCheckboxes[i].value);
			}
		}

		apiHandler.search(queryParams, facets)
			.then(function(results) {
				loadResults(results);
			}, function(error) {
				throw error;
			});
	};

	var submitButton = document.querySelector('.search-box__submit');
	submitButton.addEventListener('click', searchSubmitHandler);
}


init();

document.addEventListener('DOMContentLoaded', function() {
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});