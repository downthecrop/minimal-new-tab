const url = "http://suggestqueries.google.com/complete/search?client=chrome&q=";
const iconurl = "https://www.google.com/s2/favicons?domain=";
const search = "http://www.google.com/search?q=";
var links = [];
var hovered = "";


function openlink(caller) {
	location.assign(links[caller.id.charAt(caller.id.length - 1)])
}


function toDataURL(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var reader = new FileReader();
		reader.onloadend = function () {
			callback(reader.result);
		}
		reader.readAsDataURL(xhr.response);
	};
	xhr.open('GET', url);
	xhr.responseType = 'blob';
	xhr.send();
}


function getFavicons(sites, i) {
	if (localStorage.getItem(i) === null) {
		toDataURL(iconurl + sites[i - 1].url, function (dataUrl) {
			v = dataUrl;
			localStorage.setItem(i - 1, v)
		})
		if (i <= 8) {
			Promise.resolve(getFavicons(sites, i + 1))
		}
	}
}


document.addEventListener('DOMContentLoaded', function () {

	var lastsearch = ""
	var ginput = document.getElementById('ginput');
	var results = document.getElementById('results');

	ginput.onkeydown = function (e) {
		if (ginput.value.length <= 1) {
			results.innerHTML = "";
			document.getElementsByClassName('grid-container')[0].style.visibility = "visible";
		}
		else if (e.key == "ArrowDown") {
			console.log(e.key)
		}
		else if (e.key == "ArrowUp") {
			console.log(e.key)
		}
		else if (e.key == "Enter") {
			console.log(e.key)
		}
		else if (ginput.value != lastsearch
			&& ginput.value.substring(0, 8) != "https://"
			&& ginput.value.substring(0, 7) != "http://") {
			lastsearch = ginput.value
			fetch(url + ginput.value)
				.then(res => res.json())
				.then(data => function () {
					var i = 0;
					results.innerHTML = "";
					while (i < data[1].length) {
						var e = document.createElement('div');
						e.innerHTML = "<div class='result-item' id='result-" + i + "'>\
						<span>" + data[1][i] + "</span>\
						</div>";
						results.appendChild(e);
						i += 1;
					}
				}())
			document.getElementsByClassName('grid-container')[0].style.visibility = "hidden";
			console.log("Last search: " + lastsearch);
		}
	}


	chrome.topSites.get(function (sites) {
		i = 1;

		getFavicons(sites, i)

		while (i <= 8) {
			var div = document.getElementById("item" + i);
			links[i] = sites[i - 1].url;
			div.addEventListener("click", function () { openlink(this) });
			if (localStorage.getItem(i - 1) != null) {
				div.querySelectorAll("img")[0].src = localStorage.getItem(i - 1);
			}
			div.getElementsByClassName("tile-title")[0].innerHTML = sites[i - 1].title;
			div.title = sites[i - 1].url;
			var linkTag = document.createElement('link');
			linkTag.rel = "dns-prefetch preconnect prerender";
			linkTag.href = sites[i - 1].url;
			document.head.appendChild(linkTag);
			i += 1;
		}
	})

	document.getElementById("wrapper").addEventListener("mousedown", function (e) {
		if (e.target.parentElement.className === "result-item"){
			location.assign(search + e.target.innerText);
			if (e.target.innerText.substring(0, 8) == "https://" ||
				e.target.innerText.substring(0, 7) == "http://") {
				location.assign(e.target.innerText);
			}
			else {
				location.assign(search + e.target.innerText);
					/** Add value to search
					 * bar without searching
					 * ginput.value=this.textContent
					 * ginput.focus();
					*/
			}
		}
		else{
			document.getElementsByClassName('grid-container')[0].style.visibility = "visible";
			results.innerHTML = "";
		}
	});

})