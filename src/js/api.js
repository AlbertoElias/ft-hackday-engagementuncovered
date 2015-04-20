'use strict';

var baseUrl = 'http://ft-development-int.apigee.net/';

var apiHandler = {};

apiHandler.getIndustries = function() {
	var industriesApi = 'standard-data/industry-sectors/legacy';
	return new Promise(function(resolve, reject) {
		fetch(baseUrl + industriesApi)
			.then(function(res) {
				if (res.status !== 200) {
					throw new Error('fetch failed with status ' + res.status);
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
}

apiHandler.search = function(queryParams) {
	var searchApi = 'ft-reading-stats/search';
	var query = '?';
	Object.keys(queryParams).forEach(function(queryKey) {
		query +=
			encodeURIComponent(queryKey) +
			'=' +
			encodeURIComponent(queryParams[queryKey]) +
			'&';
	});

	return new Promise(function(resolve, reject) {
		fetch(baseUrl + searchApi + query)
			.then(function(res) {
				if (res.status !== 200) {
					throw new Error('fetch failed with status ' + res.status);
				}
				return res.json();
			})
			.then(function(results) {
				console.log(results);
				resolve(results);
			})
			.catch(function(e) {
				reject(e);
			});
	});

}

module.exports = apiHandler;