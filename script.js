const url = "http://suggestqueries.google.com/complete/search?client=chrome&q=";
const iconurl = "https://www.google.com/s2/favicons?domain=";
const search = "http://www.google.com/search?q=";
const dFavicon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVR4AWL4//8/RRjO8Iucx+noO0O2qmlbUEnt5r3Juas+hsQD6KaG7dqCKPgx72Pe9GIY27btZBrbtm3btm0nO12D7tVXe63jqtqqU/iDw9K58sEruKkngH0DBljOE+T/qqx/Ln718RZOFasxyd3XRbWzlFMxRbgOTx9QWFzHtZlD+aqLb108sOAIAai6+NbHW7lUHaZkDFJt+wp1DG7R1d0b7Z88EOL08oXwjokcOvvUxYMjBFCamWP5KjKBjKOpZx2HEPj+Ieod26U+dpg6lK2CIwTQH0oECGT5eHj+IgSueJ5fPaPg6PZrz6DGHiGAISE7QPrIvIKVrSvCe2DNHSsehIDatOBna/+OEOgTQE6WAy1AAFiVcf6PhgCGxEvlA9QngLlAQCkLsNWhBZIDz/zg4ggmjHfYxoPGEMPZECW+zjwmFk6Ih194y7VHYGOPvEYlTAJlQwI4MEhgTOzZGiNalRpGgsOYFw5lEfTKybgfBtmuTNdI3MrOTAQmYf/DNcAwDeycVjROgZFt18gMso6V5Z8JpcEk2LPKpOAH0/4bKMCAYnuqm7cHOGHJTBRhAEJN9d/t5zCxAAAAAElFTkSuQmCC"

let byId = function (i) { return document.getElementById(i); };
let byClass = function (c) { return document.getElementsByClassName(c)[0]; };

async function getFavicon(url, callback) {
    let f = new FileReader()
    f.readAsDataURL(await fetch(url).then(r => r.blob()))
    f.onloadend = function () { callback(f.result) }
}

function configureTiles(sites) {
    for (let i = 0; i < 8; i += 1) {
        let data = jLocal("site-" + i)
        if ((!data || data.url != sites[i].url) && !jLocal("enable-custom")) {
            setLocalStorage(sites[i], i)
        }
        else {
            displaySiteData(i)
        }
    }
}

function displaySiteData(i) {
    let data = jLocal("site-" + i)
    let div = byId("item" + i);
    let link = document.createElement("link");

    div.setAttribute("url", data.url)
    div.getElementsByClassName("tile-title")[0].innerHTML = data.title;
    div.addEventListener("click", function () { location.assign(this.getAttribute("url")) });
    div.title = data.url;

    if (data.favicon)
        div.querySelectorAll("img")[0].src = data.favicon;

    link.rel = "prerender";
    link.href = data.url;
    document.head.appendChild(link);
}

function setLocalStorage(site, i) {
    getFavicon(iconurl + site.url, function (dataUrl) {
        let icon = (dataUrl != dFavicon) ? dataUrl : "";
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
    let name = "result-item-active"
    let r_class = (e.children[0].className.includes("last")) ? name + "-last" : name;
    e.setAttribute("class", r_class)
}

function setInactive(e) {
    e.setAttribute("class", "")
}

function jLocal(key) {
    return JSON.parse(localStorage.getItem(key))
}

function updateStorage(i) {
    let title = byId("edit-title-" + i)
    let url = byId("edit-link-" + i)
    let site = jLocal("site-" + i)
    site.title = title.value
    site.url = url.value
    setLocalStorage(site, i)
}

function settingsGUI() {
    //Modal
    let modal = byId("myModal")
    let openbtn = byId("settings-menu")
    let closebtn = byClass("close")

    openbtn.onclick = function () { modal.style.display = "block"; }
    closebtn.onclick = function () { modal.style.display = "none"; }
    window.onclick = function (e) {
        if (e.target === modal)
            modal.style.display = "none";
    }

    //Title & URL GUI
    for (let i = 0; i < 8; i += 1) {
        let j = jLocal("site-" + i)
        let title = byId("edit-title-" + i)
        let url = byId("edit-link-" + i)

        title.value = j.title
        url.value = j.url

        title.addEventListener("input", function () { updateStorage(i) })
        url.addEventListener("input", function () { updateStorage(i) })
    }

    //Custom URLs and Titles
    byId("enable-custom").checked = jLocal("enable-custom");
    byId("enable-custom").onclick = function () {
        localStorage.setItem("enable-custom", byId("enable-custom").checked);
    }

    byId("clear-storage").onclick = function () {
        localStorage.clear()
        window.location.reload()
    }
}

function submitSearch(query) {
    if (query.substring(0, 8).includes("https://") || query.substring(0, 7).includes("http://")) {
        location.assign(query);
    }
    else {
        location.assign(search + query);
    }
}

function clearResults() {
    byId("results").innerHTML = ""
}

document.addEventListener("DOMContentLoaded", function () {
    let lastsearch = ""
    let arrows = false

    let arrowNav = function(active,move){
        if (!active)
            setActive(document.getElementById("result-0").parentElement);
        if (active){
            arrows = true
            let id = active.children[0].id
            let i = parseInt(id[id.length - 1]);
            setInactive(active)
            setActive(byId("result-" + (i + move)).parentElement)
        }
    } 

    //Keyboard Events for Suggestions
    byId("ginput").onkeydown = function (e) {
        let ginput = byId("ginput").value
        let active = byClass("result-item-active")
        if (!active)
            active = byClass("result-item-active-last")

        if (ginput.length < 2) {
            clearResults();
            arrows = false
            byClass("grid-container").style.visibility = "visible";
        }
        else if (e.key === "ArrowDown") {
            arrowNav(active,1)
        }
        else if (e.key === "ArrowUp") {
            arrowNav(active,-1)
        }
        else if (e.key === "Enter") {
            if (active && arrows) {
                submitSearch(active.innerText)
            }
            else if (ginput) {
                submitSearch(ginput)
            }
        }
        else if (lastsearch != ginput
            && !ginput.substring(0, 8).includes("https://")
            && !ginput.substring(0, 7).includes("http://")) {
            lastsearch = ginput
            fetch(url + ginput)
                .then(r => r.json())
                .then(data => function () {
                    clearResults();
                    for (let i = 0; i < data[1].length; i += 1) {
                        let d = document.createElement("div");
                        let d2 = document.createElement("div");
                        let t = document.createElement("span");
                        d2.className = (i != data[1].length - 1) ? "result-item" : "result-item-last";
                        t.innerText = data[1][i]
                        d2.id = "result-" + i
                        d2.appendChild(t)
                        d.appendChild(d2)
                        d.addEventListener("mouseenter", function () { setActive(this) })
                        d.addEventListener("mouseout", function () { setInactive(this) })
                        byId("results").appendChild(d);
                    }
                }())
            byClass("grid-container").style.visibility = "hidden";
            console.log("Last search: " + lastsearch);
        }
    }

    //Mouse events for results
    byId("wrapper").addEventListener("mousedown", function (e) {
        if (e.button === 0) {
            if (e.target.parentElement.className.includes("result-item")) {
                submitSearch(e.target.innerText)
            }
            else {
                byClass("grid-container").style.visibility = "visible";
                clearResults();
            }
        }
    })

    chrome.topSites.get(function (sites) {
        configureTiles(sites)
    })

    function initSettings() {
        if (jLocal("site-" + 7)) {
            settingsGUI()
        }
    }
    setTimeout(initSettings, 100);
})