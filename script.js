const url = "http://suggestqueries.google.com/complete/search?client=chrome&q=";
const iconurl = "https://www.google.com/s2/favicons?domain=";
const search = "http://www.google.com/search?q=";
const dFavicon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8"

let arrows = false

async function getFavicon(url, callback) {
    if (url) {
        let f = new FileReader()
        f.readAsDataURL(await fetch(iconurl + url).then(r => r.blob()))
        f.onloadend = function () { callback(f.result) }
    }
    else {
        callback("")
    }
}

function byId(i) { return document.getElementById(i); };
function byClass(c) { return document.getElementsByClassName(c)[0]; };

function configureTiles(sites) {
    for (let i = 0; i < 8; i += 1) {
        let data = jLocal("site-" + i)
        if ((!data || data.url != sites[i].url) && !jLocal("enable-custom")) {
            setLocalStorage(sites[i], i)
        } else if (data.url) {
            displaySiteData(i)
        }
    }
}

function displaySiteData(i) {
    let data = jLocal("site-" + i)
    let div = byId("item" + i);
    let link = document.createElement("link");

    div.style.visibility = "visible"
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
    getFavicon(site.url, function (dataUrl) {
        let icon = (!dataUrl.includes(dFavicon)) ? dataUrl : "";
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
    e.removeAttribute("class")
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

    byId("show-topbar").checked = jLocal("show-topbar");
    byId("show-topbar").onclick = function () {
        localStorage.setItem("show-topbar", byId("show-topbar").checked);
        let header = document.getElementsByTagName("header")[0]
        if (byId("show-topbar").checked) {
            header.style.visibility = "hidden"
        } else {
            header.style.visibility = "visible"
        }
    }

    byId("clear-storage").onclick = function () {
        localStorage.clear()
        window.location.reload()
    }
}

function submitSearch(query) {
    if (/^(http|https)/.test(query)) {
        location.assign(query);
    } else {
        location.assign(search + query);
    }
}

function arrowNav(move) {
    let active = (byClass("result-item-active")) ? byClass("result-item-active") : byClass("result-item-active-last")
    if (!active) {
        //Default to result-0 if nothing is active
        setActive(byId("result-0").parentElement)
        active = byClass("result-item-active")
        move = 0
    }
    let id = active.children[0].id
    let i = parseInt(id[id.length - 1]);
    arrows = true
    setInactive(active)
    setActive(byId("result-" + (i + move)).parentElement)
}

function clearResults() {
    let clean = byId("results").cloneNode(false);
    byId("results").parentNode.replaceChild(clean, byId("results"));
}

document.addEventListener("DOMContentLoaded", function () {
    let lastsearch = ""

    //Keyboard Events for Suggestions
    byId("ginput").onkeydown = function (e) {
        let ginput = byId("ginput").value
        if (ginput.length < 2) {
            clearResults();
            arrows = false
            byClass("grid-container").style.display = "";
        } else if (e.key === "ArrowDown") {
            arrowNav(1)
        } else if (e.key === "ArrowUp") {
            arrowNav(-1)
        } else if (e.key === "Enter") {
            let active = (byClass("result-item-active")) ? byClass("result-item-active") : byClass("result-item-active-last")
            if (active && arrows) {
                submitSearch(active.innerText)
            } else if (ginput) {
                submitSearch(ginput)
            }
        } else if (lastsearch != ginput
            && !/^(http|https)/.test(ginput)) {
            lastsearch = ginput
            fetch(url + ginput)
                .then(r => r.json())
                .then(j => function () {
                    j = j[1]
                    clearResults();
                    for (let i = 0; i < j.length; i += 1) {
                        let a = document.createElement("div")
                        let b = document.createElement("div")
                        let c = document.createElement("span")
                        c.innerText = j[i]
                        b.id = "result-" + i
                        b.className = (i != j.length - 1) ? "result-item" : "result-item-last"
                        b.appendChild(c)
                        a.appendChild(b)
                        a.addEventListener("mouseenter", function () { setActive(this) })
                        a.addEventListener("mouseout", function () { setInactive(this) })
                        byId("results").appendChild(a)
                    }
                }())
            byClass("grid-container").style.display = "none";
            console.log("Last search: " + lastsearch);
        }
    }

    byId("wrapper").addEventListener("mousedown", function (e) {
        if (e.button === 0) {
            if (e.target.parentElement.className.includes("result-item")) {
                submitSearch(e.target.innerText)
            } else {
                byClass("grid-container").style.display = "";
                clearResults();
            }
        }
    })

    chrome.topSites.get(function (sites) {
        configureTiles(sites)
    })

    if (JSON.parse(localStorage.getItem("show-topbar")))
        document.getElementsByTagName("header")[0].style.visibility = "hidden"

    function initSettings() {
        if (jLocal("site-" + 7)) {
            settingsGUI()
        }
    }
    setTimeout(initSettings, 100);
})