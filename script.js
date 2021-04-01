const url = "http://suggestqueries.google.com/complete/search?client=chrome&q=";
const iconurl = "https://www.google.com/s2/favicons?domain=";
const search = "http://www.google.com/search?q=";
const defaultFavicon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVR4AWL4//8/RRjO8Iucx+noO0O2qmlbUEnt5r3Juas+hsQD6KaG7dqCKPgx72Pe9GIY27btZBrbtm3btm0nO12D7tVXe63jqtqqU/iDw9K58sEruKkngH0DBljOE+T/qqx/Ln718RZOFasxyd3XRbWzlFMxRbgOTx9QWFzHtZlD+aqLb108sOAIAai6+NbHW7lUHaZkDFJt+wp1DG7R1d0b7Z88EOL08oXwjokcOvvUxYMjBFCamWP5KjKBjKOpZx2HEPj+Ieod26U+dpg6lK2CIwTQH0oECGT5eHj+IgSueJ5fPaPg6PZrz6DGHiGAISE7QPrIvIKVrSvCe2DNHSsehIDatOBna/+OEOgTQE6WAy1AAFiVcf6PhgCGxEvlA9QngLlAQCkLsNWhBZIDz/zg4ggmjHfYxoPGEMPZECW+zjwmFk6Ih194y7VHYGOPvEYlTAJlQwI4MEhgTOzZGiNalRpGgsOYFw5lEfTKybgfBtmuTNdI3MrOTAQmYf/DNcAwDeycVjROgZFt18gMso6V5Z8JpcEk2LPKpOAH0/4bKMCAYnuqm7cHOGHJTBRhAEJN9d/t5zCxAAAAAElFTkSuQmCC"

function openlink(caller) {
    location.assign(caller.getAttribute("url"))
}

async function getFavicon(url, callback) {
    let f = new FileReader()
    f.readAsDataURL(await fetch(url).then(r => r.blob()))
    f.onloadend = function () { callback(f.result) }
}

function configureTiles(sites) {
    for (let i = 0; i < 8; i += 1) {
        let data = JSON.parse(localStorage.getItem("site-" + i))
        if ((data == null || data.url != sites[i].url) && !JSON.parse(localStorage.getItem("enable-custom"))) {
            setLocalStorage(sites[i], i)
        }
        else {
            displaySiteData(i)
        }
    }
}

function displaySiteData(i) {
    let data = JSON.parse(localStorage.getItem("site-" + i))
    let div = document.getElementById("item" + i);
    let link = document.createElement('link');

    div.setAttribute("url", data.url)
    div.getElementsByClassName("tile-title")[0].innerHTML = data.title;
    div.addEventListener("click", function () { openlink(this) });
    div.title = data.url;

    if (data.favicon != "")
        div.querySelectorAll("img")[0].src = data.favicon;

    link.rel = "prerender";
    link.href = data.url;
    document.head.appendChild(link);
}

function setLocalStorage(site, i) {
    getFavicon(iconurl + site.url, function (dataUrl) {
        let icon = (dataUrl != defaultFavicon) ? dataUrl : "";
        let j = {
            "title": site.title,
            "url": site.url,
            "favicon": icon
        }
        localStorage.setItem("site-" + i, JSON.stringify(j))
        displaySiteData(i)
    })
}

function setActive(e) {
    e.setAttribute("class", "result-item-active")
}

function setInactive(e) {
    e.setAttribute("class", "")
}

function updateStorage(i) {
    let title = document.getElementById("edit-title-" + i)
    let url = document.getElementById("edit-link-" + i)
    let site = JSON.parse(localStorage.getItem("site-" + i))
    site.title = title.value
    site.url = url.value
    setLocalStorage(site, i)
}

function settingsGUI() {
    //Modal
    let modal = document.getElementById("myModal")
    let openbtn = document.getElementById("settings-menu")
    let closebtn = document.getElementsByClassName("close")[0]

    openbtn.onclick = function () {
        modal.style.display = "block";
    }
    closebtn.onclick = function () {
        modal.style.display = "none";
    }
    window.onclick = function (event) {
        if (event.target == modal)
            modal.style.display = "none";
    }

    //Title & URL GUI
    for (let i = 0; i < 8; i += 1) {
        let j = JSON.parse(localStorage.getItem("site-" + i))
        let title = document.getElementById("edit-title-" + i)
        let url = document.getElementById("edit-link-" + i)

        title.value = j.title
        url.value = j.url

        title.addEventListener('input', function () { updateStorage(i) })
        url.addEventListener('input', function () { updateStorage(i) })
    }

    //Custom URLs and Titles
    document.getElementById("enable-custom").checked = JSON.parse(localStorage.getItem("enable-custom"));
    document.getElementById("enable-custom").onclick = function () {
        localStorage.setItem("enable-custom", document.getElementById("enable-custom").checked);
    }

    document.getElementById("clear-storage").onclick = function () {
        localStorage.clear()
        window.location.reload()
    };
}

function submitSearch(query) {
    if (query.substring(0, 8) == "https://" || query.substring(0, 7) == "http://") {
        location.assign(query);
    }
    else {
        location.assign(search + query);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    let lastsearch = ""
    let ginput = document.getElementById('ginput')
    let results = document.getElementById('results')
    let arrows = false

    //Keyboard Events for Suggestions
    ginput.onkeydown = function (e) {
        let active = document.getElementsByClassName("result-item-active")[0]
        if (ginput.value.length <= 1) {
            results.innerHTML = "";
            document.getElementsByClassName('grid-container')[0].style.visibility = "visible";
        }
        else if (e.key == "ArrowDown") {
            arrows = true
            if (active) {
                let activeId = active.children[0].id
                let activeInt = parseInt(activeId[activeId.length - 1]);
                setInactive(active)
                setActive(document.getElementById("result-" + (activeInt + 1)).parentElement)
            }
            else if (results.innerHTML != "") {
                setActive(document.getElementById("result-0").parentElement)
            }
        }
        else if (e.key == "ArrowUp") {
            arrows = true
            if (active) {
                let activeId = active.children[0].id
                let activeInt = parseInt(activeId[activeId.length - 1]);
                setInactive(active)
                setActive(document.getElementById("result-" + (activeInt - 1)).parentElement)
            }
        }
        else if (e.key == "Enter") {
            if (active && arrows) {
                submitSearch(active.innerText)
            }
            else if (ginput.value != "") {
                submitSearch(ginput.value)
            }
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
                    while (i < data[1].length - 1) {
                        var e = document.createElement('div');
                        e.innerHTML = "<div class='result-item' id='result-" + i + "'>\
						<span>" + data[1][i] + "</span>\
						</div>";
                        e.addEventListener("mouseenter", function () {
                            setActive(this)
                        })
                        e.addEventListener("mouseout", function () {
                            setInactive(this)
                        })
                        results.appendChild(e);
                        i += 1;
                    }
                    //final element rounding css
                    var e = document.createElement('div');
                    e.innerHTML = "<div class='result-item-last' id='result-" + i + "'>\
					<span>" + data[1][i] + "</span>\
					</div>";
                    results.appendChild(e);
                }())
            document.getElementsByClassName('grid-container')[0].style.visibility = "hidden";
            console.log("Last search: " + lastsearch);
        }
    }

    //Mouse events for results
    document.getElementById("wrapper").addEventListener("mousedown", function (e) {
        if (e.button === 0) {
            if (e.target.parentElement.className.includes("result-item")) {
                submitSearch(e.target.innerText)
            }
            else {
                document.getElementsByClassName('grid-container')[0].style.visibility = "visible";
                results.innerHTML = "";
            }
        }
    })

    chrome.topSites.get(function (sites) {
        configureTiles(sites)
    })

    function initSettings() {
        if (JSON.parse(localStorage.getItem("site-" + 7))) {
            settingsGUI()
        }
    }
    setTimeout(initSettings, 100);
})