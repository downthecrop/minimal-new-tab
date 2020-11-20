const url = "http://suggestqueries.google.com/complete/search?client=chrome&q=";
var links = [];

function openlink(caller){
	link = links[caller.id.charAt(caller.id.length-1)]
	location.assign(link);
}

function toDataURL(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var reader = new FileReader();
		reader.onloadend = function() {
			callback(reader.result);
		}
		reader.readAsDataURL(xhr.response);
	};
	xhr.open('GET', url);
	xhr.responseType = 'blob';
	xhr.send();
}

function test(i){
	if(i === 8){
		location.reload();
	}
}

function getFavicons(sites,i){
	if(localStorage.getItem(i) === null){
		toDataURL('https://www.google.com/s2/favicons?domain='+sites[i-1].url, function(dataUrl) {
			v = dataUrl;
			localStorage.setItem(i-1,v)
		})
		if (i <= 8){
			Promise.resolve(getFavicons(sites,i+1))
			.then(function(){if(i===8){location.reload();}})
		}
	}
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
		i = 1;
		
		getFavicons(sites,i)

		while (i <= 8){
			var div = document.getElementById("item"+i);
			links[i] = sites[i-1].url;
			div.addEventListener("click", function(){openlink(this)});
			div.querySelectorAll("img")[0].src = localStorage.getItem(i-1);
			div.getElementsByClassName("tile-title")[0].innerHTML = sites[i-1].title;
			div.title = sites[i-1].url;
			var linkTag = document.createElement('link');
			linkTag.rel = "dns-prefetch preconnect prerender";
			linkTag.href = sites[i-1].url;
			document.head.appendChild(linkTag);
			i += 1;
		}
	})

})