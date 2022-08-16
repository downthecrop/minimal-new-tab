const suggestions = "http://suggestqueries.google.com/complete/search?client=chrome&q=";
const iconurl = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=";
const search = "http://www.google.com/search?q=";
const dFavicon = "4bKMCAYnuqm7cHOGHJTBRhAEJN9d/t5zCxAAAAAElFTkSuQmCC";

let arrows;
let nSites;

async function getFavicon(url, callback) {
    if (url) {
        let f = new FileReader();
        f.readAsDataURL(await fetch(iconurl + url)
        .then((r) => r.blob()));
        f.onloadend = function () { callback(f.result); };
    }
    else { callback(""); }
}

function byId(i) { return document.getElementById(i); }
function byClass(c) { return document.getElementsByClassName(c)[0]; }

function configureTiles(sites) {
    for (let i = 0; i <= nSites; i += 1) {
        let data = jLocal("site-" + i);
        if ((!data || data.url != sites[i].url) && !jLocal("enable-custom")) {
            setLocalStorage(sites[i], i);
        } else if (data.url) {
            displaySiteData(i);
        }
    }
}

function displaySiteData(i) {
    let data = jLocal("site-" + i);
    let div = byId("item" + i);
    let link = document.createElement("link");

    div.style.visibility = "visible";
    div.setAttribute("url", data.url);
    div.getElementsByClassName("tile-title")[0].innerHTML = data.title;
    div.addEventListener("click",
        function () { location.assign(this.getAttribute("url")); });
    div.title = data.url;

    if (data.favicon)
        div.querySelectorAll("img")[0].src = data.favicon;

    link.rel = "prerender";
    link.href = data.url;
    document.head.appendChild(link);
}

function setLocalStorage(site, i) {
    getFavicon(site.url, function (b64) {
        let j = {
            "title": site.title,
            "url": site.url,
            "favicon": b64.includes(dFavicon) ? "" : b64
        };
        localStorage.setItem("site-" + i, JSON.stringify(j));
        displaySiteData(i);
    });
}

function setActive(e) {
    let name = "result-item-active";
    let rClass;
    if (e.children[0].className.includes("last"))
        rClass = name + "-last";
    else
        rClass = name;
    e.setAttribute("class", rClass);
}

function setInactive(e) {
    e.removeAttribute("class");
}

function jLocal(key) {
    return JSON.parse(localStorage.getItem(key));
}

function updateStorage(i) {
    let title = byId("edit-title-" + i);
    let url = byId("edit-link-" + i);
    let site = jLocal("site-" + i);
    site.title = title.value;
    site.url = url.value;
    setLocalStorage(site, i);
}

function settingsGUI() {
    let modal = byId("myModal");
    let openbtn = byId("settings-menu");
    let closebtn = byClass("close");

    openbtn.onclick = function () { modal.style.display = "block"; };
    closebtn.onclick = function () { modal.style.display = "none"; };
    window.onclick = function (e) {
        if (e.target === modal)
            modal.style.display = "none";
    };

    // Title & URL GUI
    for (let i = 0; i <= nSites; i += 1) {
        let j = jLocal("site-" + i);
        let title = byId("edit-title-" + i);
        let url = byId("edit-link-" + i);

        title.value = j.title;
        url.value = j.url;

        title.addEventListener("input", function () { updateStorage(i); });
        url.addEventListener("input", function () { updateStorage(i); });
    }

    // Custom URLs and Titles
    byId("enable-custom").checked = jLocal("enable-custom");
    byId("enable-custom").onclick = function () {
        localStorage.setItem("enable-custom", byId("enable-custom").checked);
    };

    // Custom colors
    byId("background-color").addEventListener("input", function () {
        localStorage.setItem("background-color",
            byId("background-color").value);
    });
    byId("active-color").addEventListener("input", function () {
        localStorage.setItem("active-color",
            byId("active-color").value);
    });
    byId("text-color").addEventListener("input", function () {
        localStorage.setItem("text-color",
            byId("text-color").value);
    });

    byId("enable-color").onclick = function () {
        byId("background-color").value = localStorage.getItem("background-color");
        byId("active-color").value = localStorage.getItem("active-color");
        byId("text-color").value = localStorage.getItem("text-color");

        if (byId("enable-color").checked)
            byId("color-edit").style.display = "block";
        else
            byId("color-edit").style.display = "none";
    };

    byId("show-topbar").checked = jLocal("show-topbar");
    byId("show-topbar").onclick = function () {
        localStorage.setItem("show-topbar", byId("show-topbar").checked);
        let header = document.getElementsByTagName("header")[0];
        if (byId("show-topbar").checked) {
            header.style.visibility = "hidden";
        } else {
            header.style.visibility = "visible";
        }
    };

    byId("clear-storage").onclick = function () {
        localStorage.clear();
        window.location.reload();
    };
}

function submitSearch(query) {
    if (/^(http|https)/.test(query)) {
        location.assign(query);
    } else {
        location.assign(search + query);
    }
}

function arrowNav(move) {
    let active;

    if (byClass("result-item-active"))
        active = byClass("result-item-active");
    else
        active = byClass("result-item-active-last");

    if (!active) {
        // Default to result-0 if nothing is active
        setActive(byId("result-0").parentElement);
        active = byClass("result-item-active");
        move = 0;
    }

    let id = active.children[0].id;
    let i = parseInt(id[id.length - 1]);

    arrows = true;
    setInactive(active);
    setActive(byId("result-" + (i + move)).parentElement);
}

function clearResults() {
    let clean = byId("results").cloneNode(false);
    byId("results").parentNode.replaceChild(clean, byId("results"));
}

document.addEventListener("DOMContentLoaded", function () {
    let lastSearch = "";

    // Keyboard Events for Suggestions
    byId("ginput").onkeydown = function (e) {
        let ginput = byId("ginput").value;
        let active;
        if (ginput.length < 2) {
            clearResults();
            arrows = false;
            byClass("grid-container").style.display = "";
        } else if (e.key === "ArrowDown") {
            arrowNav(1);
        } else if (e.key === "ArrowUp") {
            arrowNav(-1);
        } else if (e.key === "Enter") {
            if (byClass("result-item-active"))
                active = byClass("result-item-active");
            else
                active = byClass("result-item-active-last");

            if (active && arrows) {
                submitSearch(active.innerText);
            } else if (ginput) {
                submitSearch(ginput);
            }
        } else if (lastSearch != ginput
            && !/^(http|https)/.test(ginput)) {
            lastSearch = ginput;
            fetch(suggestions + ginput)
                .then(r => r.json())
                .then(j => function () {
                    j = j[1];
                    clearResults();
                    for (let i = 0; i < j.length; i += 1) {
                        let a = document.createElement("div");
                        let b = document.createElement("div");
                        let c = document.createElement("span");
                        c.innerText = j[i];
                        b.id = "result-" + i;
                        if (i != j.length - 1)
                            b.className = "result-item";
                        else
                            b.className = "result-item-last";
                        b.appendChild(c);
                        a.appendChild(b);
                        a.addEventListener("mouseenter",
                            function () { setActive(this); });
                        a.addEventListener("mouseout",
                            function () { setInactive(this); });
                        byId("results").appendChild(a);
                    }
                }());
            byClass("grid-container").style.display = "none";
        }
    };

    byId("wrapper").addEventListener("mousedown", function (e) {
        if (e.button === 0) {
            if (e.target.parentElement.className.includes("result-item")) {
                submitSearch(e.target.innerText);
            } else {
                byClass("grid-container").style.display = "";
                clearResults();
            }
        }
    });

    chrome.topSites.get(function (sites) {
        // Max topsites at 8 (0-7)
        if (sites.length - 1 > 7)
            nSites = 7;
        else nSites;
        sites.length - 1;

        configureTiles(sites);
    });

    // Load custom Colors
    if (localStorage.getItem("active-color")) {
        document.documentElement.style.setProperty("--custom-result-active",
            localStorage.getItem("active-color"));
    }
    if (localStorage.getItem("background-color")) {
        document.documentElement.style.setProperty("--custom-bg",
            localStorage.getItem("background-color"));
    }
    if (localStorage.getItem("text-color")) {
        document.documentElement.style.setProperty("--custom-text",
            localStorage.getItem("text-color"));
    }

    if (jLocal("show-topbar"))
        document.getElementsByTagName("header")[0].style.visibility = "hidden";

    function initSettings() {
        if (nSites) {
            if (jLocal("site-" + nSites)) {
                settingsGUI();
            }
        }
    }
    setTimeout(initSettings, 100);
});