/* global chrome */
import React, { useState, useEffect } from "react";
import favIcon from "../img/fav.png";
import { useLocalStorage } from "../useLocalStorage";

const GridContainer = ({ customEntriesEnabled, customEntries, setCustomEntries, results }) => {
  const [topSites, setTopSites] = useState([]);
  const [shouldRender, setShouldRender] = useState(true);
  const [faviconCache, setFaviconCache] = useLocalStorage('faviconCache', {});

  useEffect(() => {
    const fetchSites = async () => {
      if (customEntriesEnabled) {
        const promises = customEntries.map(async (entry) => {
          const favicon = await getFavicon(entry.url);
          return {
            ...entry,
            favicon,
          };
        });
        const updatedCustomEntries = await Promise.all(promises);
        setCustomEntries(updatedCustomEntries);
      } else {
        chrome.topSites.get(async (sites) => {
          const promises = sites.slice(0, 8).map(async (site) => {
            const favicon = await getFavicon(site.url);
            return {
              title: site.title,
              url: site.url,
              favicon,
            };
          });
          const newTopSites = await Promise.all(promises);
          setTopSites(newTopSites);
        });
      }
    };
    fetchSites();
  }, [customEntriesEnabled]);

  const openSite = (url) => {
    window.location.assign(url);
  };

  const getFavicon = async (url) => {
    if (!url) return "";

    // Check if the favicon is in local storage
    if (faviconCache[url]) {
      return faviconCache[url];
    }

    const iconurl = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=";
    const res = await fetch(iconurl + url).catch((error) => {
      console.error("Error fetching favicon:", error);
    });
    const blob = await res.blob();

    const faviconDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Save the favicon in local storage
    setFaviconCache({
      ...faviconCache,
      [url]: faviconDataUrl
    });

    return faviconDataUrl;
  };

  useEffect(() => {
    setShouldRender(results.length === 0);
  }, [results]);

  const sitesToDisplay = customEntriesEnabled ? customEntries : topSites;

  return (
    <div className="grid-container" style={{ display: shouldRender ? "grid" : "none" }}>
      {sitesToDisplay.map((site, index) => (
        <div
          id={`item${index}`}
          style={{ visibility: site.title || site.url ? "visible" : "hidden" }}
          onClick={() => openSite(site.url)}
        >
          <link rel="prerender" href={site.url} as="document" />
          <div className="dot">
            <img src={site.favicon || favIcon} alt={site.title} />
          </div>
          <div className="tile-title">{site.title}</div>
        </div>
      ))}
    </div>
  );
};

export default GridContainer;
