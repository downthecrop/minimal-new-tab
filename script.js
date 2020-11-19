const url = "http://suggestqueries.google.com/complete/search?client=chrome&q=";
var links = []

function openlink(caller){
	link = links[caller.id.charAt(caller.id.length-1)]
	location.assign(link);
}

document.addEventListener('DOMContentLoaded', function () {
	var lastsearch = ""
	document.getElementById('ginput').onkeyup = function () {
		if (document.getElementById('ginput').value != lastsearch 
			&& document.getElementById('ginput').value != ""
			&& document.getElementById('ginput').value.substring(0, 8) != "https://"
			&& document.getElementById('ginput').value.substring(0, 7) != "http://") {
			lastsearch = document.getElementById('ginput').value
			fetch(url + document.getElementById('ginput').value)
				.then(res => res.json())
				.then(data => console.log(data))
			console.log("Last search: " + lastsearch);
		}
	}

	chrome.topSites.get(function (sites) {
		i = 1
		while (i <= 6){
			var div = document.getElementById("item"+i);
			links[i] = sites[i-1].url;
			div.addEventListener("click", function(){openlink(this)});
			div.getElementsByClassName("tile-title")[0].innerHTML = sites[i-1].title;
			var linkTag = document.createElement('link');
			linkTag.rel = "dns-prefetch preconnect";
			linkTag.href = sites[i-1].url;
			document.head.appendChild(linkTag);
			i += 1;
		}
	})
})