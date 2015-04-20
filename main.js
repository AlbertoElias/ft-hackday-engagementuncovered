'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

var header = require('o-header');

var apiHandler = require('./src/js/api');

function loadResults(results) {
	var container = document.querySelector('.results-container');
	container.innerHTML = '';
	
	Object.keys(results).forEach(function(taxonomy) {
		var resultBox = document.createElement('div');
		resultBox.classList.add('result-box');

		var listTitle = document.createElement('h2');
		listTitle.classList.add('result-box__list__title');
		listTitle.textContent = taxonomy;

		resultBox.appendChild(listTitle);

		var resultList = document.createElement('ul');
		resultList.classList.add('result-box__list');

		var taxonomyResults = results[taxonomy];

		for (var i = 0; i < taxonomyResults.length; i++) {
			var listElement = document.createElement('li');
			listElement.classList.add('result-box__element');

			var nameElement = document.createElement('span');
			nameElement.classList.add('result-box__element__name');
			nameElement.textContent = taxonomyResults[i].name;

			var valueElement = document.createElement('span');
			valueElement.classList.add('result-box__element__value');
			valueElement.textContent = taxonomyResults[i].reads;

			listElement.appendChild(nameElement);
			listElement.appendChild(valueElement);

			resultList.appendChild(listElement);
		}

		resultBox.appendChild(resultList);

		container.appendChild(resultBox);
	});
}

function init() {
	var industriesSelect = document.querySelector('.search-box__industries');

	apiHandler.getIndustries()
		.then(function(industries) {
			for (var i = 0; i < industries.length; i++) {
				var option = document.createElement('option');
				option.value = industries[i].name;
				option.text = industries[i].name;
				industriesSelect.add(option);
			}
		}, function(error) {
			throw error;
		});

	var searchSubmitHandler = function(ev) {
		var queryParams = {
			industry: industriesSelect.value
		};

		apiHandler.search(queryParams)
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