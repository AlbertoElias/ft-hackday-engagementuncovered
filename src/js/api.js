'use strict';

var baseUrl = 'http://ft-development-int.apigee.net/';
var contentFacets = ['brand', 'genre', 'people', 'primary_section', 'primary_theme', 'regions', 'sections', 'subjects', 'topics']
var userFacets = ['country', 'industry', 'position', 'responsibility'];

var apiHandler = {};

apiHandler.getIndustries = function() {
	var industriesApi = 'standard-data/industry-sectors/legacy';
	return new Promise(function(resolve, reject) {
		fetch(baseUrl + industriesApi)
			.then(function(res) {
				if (res.status !== 200) {
					reject('fetch failed with status ' + res.status);
				}

				return res.json();
			})
			.then(function(industries) {
				resolve(industries.industries);
			})
			.catch(function(e) {
				reject(e);
			});
	});
};

apiHandler.getCountries = function() {
	var countriesApi = 'standard-data/countries/v1.2';
	return new Promise(function(resolve, reject) {
		fetch(baseUrl + countriesApi)
			.then(function(res) {
				if (res.status !== 200) {
					reject('fetch failed with status ' + res.status);
				}

				return res.json();
			})
			.then(function(countries) {
				resolve(countries.countries);
			})
			.catch(function(e) {
				reject(e);
			});
	});
};

apiHandler.getPositions = function() {
	var positionsApi = 'standard-data/job-titles/legacy';
	return new Promise(function(resolve, reject) {
		fetch(baseUrl + positionsApi)
			.then(function(res) {
				if (res.status !== 200) {
					reject('fetch failed with status ' + res.status);
				}

				return res.json();
			})
			.then(function(positions) {
				resolve(positions.jobTitles);
			})
			.catch(function(e) {
				reject(e);
			});
	});
};

apiHandler.getResponsibilities = function() {
	var responsibilitiesApi = 'standard-data/job-responsibilities/legacy';
	return new Promise(function(resolve, reject) {
		fetch(baseUrl + responsibilitiesApi)
			.then(function(res) {
				if (res.status !== 200) {
					reject('fetch failed with status ' + res.status);
				}

				return res.json();
			})
			.then(function(responsibilities) {
				resolve(responsibilities.jobResponsibilities);
			})
			.catch(function(e) {
				reject(e);
			});
	});
};

apiHandler.getContentFacets = function() {
	return new Promise(function(resolve, reject) {
		resolve(contentFacets.concat(userFacets));
	});
};

apiHandler.search = function(queryParams, facets) {
	var searchApi = 'ft-reading-stats-cloud';
	var query = '?q.parser=structured&size=0';
	var facetConfig = encodeURIComponent('{sort:"count",size:10}');

	return new Promise(function(resolve, reject) {
		var params = Object.keys(queryParams);
		if (params.length === 0) {
			reject('At least one parameter needs to be selected to make a search.');
		} else {
			query +='&q=' + encodeURIComponent('(and ');

			params.forEach(function(queryKey) {
				if (queryKey === 'content') {
					query += encodeURIComponent(queryParams[queryKey]);
				} else {
					query += 
						encodeURIComponent(queryKey) +
						':' +
						encodeURIComponent("'" + queryParams[queryKey] + "' ");
				}
			});

			query += ')';
		}

		if (facets.length === 0) {
			reject('At least one facet needs to be selected.');
		} else {
			facets.forEach(function(facet) {
				query += 
					'&facet.' +
					facet +
					'=' +
					((facet === 'country') ? facetConfig.replace('10', '300') : facetConfig);
			});
		}

		fetch(baseUrl + searchApi + query)
			.then(function(res) {
				if (res.status !== 200) {
					reject('fetch failed with status ' + res.status);
				}
				return res.json();
			})
			.then(function(results) {
				resolve(results.facets);
			})
			.catch(function(e) {
				reject(e);
			});
	});
};

module.exports = apiHandler;