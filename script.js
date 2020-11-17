const url = "http://suggestqueries.google.com/complete/search?client=chrome&q=";

chrome.topSites.get(function (sites) {
	console.log(sites)
})

document.addEventListener('DOMContentLoaded', function () {
	var lastsearch = ""
	document.getElementById('ginput').onkeyup = function () {
		if (document.getElementById('ginput').value != lastsearch && document.getElementById('ginput').value != "") {
			lastsearch = document.getElementById('ginput').value
			fetch(url + document.getElementById('ginput').value)
				.then(res => res.json())
				.then(data => console.log(data));
			console.log("Last search: " + lastsearch)
		}
	}
})