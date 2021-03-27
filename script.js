const url = "http://suggestqueries.google.com/complete/search?client=chrome&q=";
const iconurl = "https://www.google.com/s2/favicons?domain=";
const search = "http://www.google.com/search?q=";
var links = [];

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

googleDefault = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVR4AWL4//8/RRjO8Iucx+noO0O2qmlbUEnt5r3Juas+hsQD6KaG7dqCKPgx72Pe9GIY27btZBrbtm3btm0nO12D7tVXe63jqtqqU/iDw9K58sEruKkngH0DBljOE+T/qqx/Ln718RZOFasxyd3XRbWzlFMxRbgOTx9QWFzHtZlD+aqLb108sOAIAai6+NbHW7lUHaZkDFJt+wp1DG7R1d0b7Z88EOL08oXwjokcOvvUxYMjBFCamWP5KjKBjKOpZx2HEPj+Ieod26U+dpg6lK2CIwTQH0oECGT5eHj+IgSueJ5fPaPg6PZrz6DGHiGAISE7QPrIvIKVrSvCe2DNHSsehIDatOBna/+OEOgTQE6WAy1AAFiVcf6PhgCGxEvlA9QngLlAQCkLsNWhBZIDz/zg4ggmjHfYxoPGEMPZECW+zjwmFk6Ih194y7VHYGOPvEYlTAJlQwI4MEhgTOzZGiNalRpGgsOYFw5lEfTKybgfBtmuTNdI3MrOTAQmYf/DNcAwDeycVjROgZFt18gMso6V5Z8JpcEk2LPKpOAH0/4bKMCAYnuqm7cHOGHJTBRhAEJN9d/t5zCxAAAAAElFTkSuQmCC"

function getFavicons(sites, i) {
    if (localStorage.getItem(i) === null) {
        toDataURL(iconurl + sites[i - 1].url, function (dataUrl) {
            v = dataUrl;
            if (v != googleDefault){
                localStorage.setItem(i - 1, v)
            }
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
    let arrows = false


    function setGUI(){
        document.getElementById("enable-custom").addEventListener("click",function(){
            console.log(document.getElementById("enable-custom").checked)
        })
        //document.getElementById("custom-entries").value = 
        chrome.topSites.get(function (sites){
            for (let i = 0; i < document.getElementsByClassName("menu-entry").length; i += 1){
                console.log("edit-title-"+i)
                document.getElementById("edit-title-"+i).value = sites[i].title
                document.getElementById("edit-link-"+i).value = sites[i].url
            }
        })
    }
 
    setGUI()

    ginput.onkeydown = function (e) {
        let active = document.getElementsByClassName("result-item-active")[0]
        if (ginput.value.length <= 1) {
            results.innerHTML = "";
            document.getElementsByClassName('grid-container')[0].style.visibility = "visible";
        }
        else if (e.key == "ArrowDown") {
            arrows = true
            if (active){
                let activeId = active.children[0].id
                let activeInt = parseInt(activeId[activeId.length - 1]);
                setInactive(active)
                setActive(document.getElementById("result-"+(activeInt+1)).parentElement)
            }
            else if(results.innerHTML != ""){
                setActive(document.getElementById("result-0").parentElement)
            }
        }
        else if (e.key == "ArrowUp") {
            arrows = true
            if (active){
                let activeId = active.children[0].id
                let activeInt = parseInt(activeId[activeId.length - 1]);
                setInactive(active)
                setActive(document.getElementById("result-"+(activeInt-1)).parentElement)
            }
        }
        else if (e.key == "Enter") {
            if (active && arrows){
                submitSearch(active.innerText)
            }
            else if (ginput.value != ""){
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
                        e.addEventListener("mouseenter", function(){
                            setActive(this)
                        })
                        e.addEventListener("mouseout", function(){
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

    function setActive(e){
        e.setAttribute("class","result-item-active")
    }

    function setInactive(e){
        e.setAttribute("class","")
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
        if(e.button === 0){
            if (e.target.parentElement.className === "result-item" || e.target.parentElement.className === "result-item-last") {
                location.assign(search + e.target.innerText);
                if (e.target.innerText.substring(0, 8) == "https://" ||
                    e.target.innerText.substring(0, 7) == "http://") {
                    location.assign(e.target.innerText);
                }
                else {
                    location.assign(search + e.target.innerText);
                }
            }
            else {
                document.getElementsByClassName('grid-container')[0].style.visibility = "visible";
                results.innerHTML = "";
            }
    }
    });

    function submitSearch(query) {
            location.assign(search + query);
    }

    document.getElementById("clear-storage").addEventListener("click", function () {
        localStorage.clear()
        window.location.reload()
    });

    //settings modal
    var modal = document.getElementById("myModal");
    var btn = document.getElementById("settings-menu");
    var span = document.getElementsByClassName("close")[0];

    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

})