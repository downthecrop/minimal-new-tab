import React, { useState } from 'react';
import micIcon from '../img/mic.png';

const suggestions = 'http://suggestqueries.google.com/complete/search?client=chrome&q=';
const googleSearch = 'https://www.google.com/search?q=';

const SearchArea = ({ results, setResults }) => {
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const [lastSearch, setLastSearch] = useState('');
  const [tempResultStore, setTempResultStore] = useState(null);


  const submitSearch = (query) => {
    if (/^(http|https)/.test(query)) {
      window.location.assign(query);
    } else {
      window.location.assign(`${googleSearch}${query}`);
    }
  };

  const handleKeyDown = (e) => {

    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => Math.min(results.length - 1, (prev ?? -1) + 1));
      return;
    }
    
    if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => Math.max(0, (prev ?? results.length) - 1));
      return;
    }
    
    if (e.key === 'Enter') {
      submitSearch(activeIndex !== null ? results[activeIndex] : inputValue);
      return;
    }

    // Fetch suggestions if needed
    if (lastSearch !== inputValue && !/^(http|https)/.test(inputValue)) {
      setLastSearch(inputValue);
      fetch(`${suggestions}${encodeURIComponent(inputValue)}`)
        .then((r) => r.ok ? r.json() : Promise.reject(`Failed to fetch with status: ${r.status}`))
        .then((data) => setResults(data[1].slice(0,8)))
        .catch((error) => console.error('Failed to fetch suggestions:', error));
    }
  };

  const handleFocusLost = () => {
    setTempResultStore(results)
    setResults([])
  };

  const handleFocusGained = () => {
    if(tempResultStore != null){
      setResults(tempResultStore)
      setTempResultStore(null);
    }
  };
  

  return (
    <div id="searcharea" className="bar">
      <input
        id="ginput"
        className="searchbar"
        type="text"
        title="Search"
        placeholder="Search Google or type URL"
        value={inputValue}
        onBlur={() => handleFocusLost()}
        onFocus={() => handleFocusGained()}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <a href="#">
        <img className="voice" title="Search by Voice" />
      </a>
      <div id="results">
        {results.map((result, index) => (
          <div
            key={index}
            className={index === activeIndex ? 'result-item-active' : ''}
          >
            <div
              id={`result-${index}`}
              className="result-item"
              onClick={() => submitSearch(encodeURIComponent(result))}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span>{result}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchArea;
