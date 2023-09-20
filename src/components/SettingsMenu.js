import React, { useState, useEffect } from 'react';
import { useLocalStorage } from "../useLocalStorage";
import cogIcon from "../img/cog.png";

const SettingsMenu = ({ customEntriesEnabled, setCustomEntriesEnabled, customEntries, setCustomEntries, showTopBarEnabled, setShowTopBarEnabled }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [customColorsEnabled, setCustomColorsEnabled] = useLocalStorage("customColorsEnabled", false);

  const [bgColor, setBgColor] = useLocalStorage("background-color", "");
  const [activeColor, setActiveColor] = useLocalStorage("active-color", "");
  const [textColor, setTextColor] = useLocalStorage("text-color", "");

  useEffect(() => {
    if (customColorsEnabled) {
      document.documentElement.style.setProperty('--custom-bg', bgColor);
      document.documentElement.style.setProperty('--custom-result-active', activeColor);
      document.documentElement.style.setProperty('--custom-text', textColor);
    }
  }, [bgColor, activeColor, textColor, customColorsEnabled]);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const updateEntry = (index, field, value) => {
    const newEntries = [...customEntries];
    newEntries[index][field] = value;
    setCustomEntries(newEntries);
  };

  const ColorSettings = ({ isEnabled }) => {
    const [tempBgColor, setTempBgColor] = useState(bgColor);
    const [tempActiveColor, setTempActiveColor] = useState(activeColor);
    const [tempTextColor, setTempTextColor] = useState(textColor);
  
    const handleSetBgColor = () => setBgColor(tempBgColor);
    const handleSetActiveColor = () => setActiveColor(tempActiveColor);
    const handleSetTextColor = () => setTextColor(tempTextColor);
  
    if (isEnabled) {
      return (
        <div id="color-edit">
          BG: <input id="background-color" value={tempBgColor} onChange={(e) => setTempBgColor(e.target.value)} />
          <button onClick={handleSetBgColor}>Set</button><br />
          Alt: <input id="active-color" value={tempActiveColor} onChange={(e) => setTempActiveColor(e.target.value)} />
          <button onClick={handleSetActiveColor}>Set</button><br />
          Txt: <input id="text-color" value={tempTextColor} onChange={(e) => setTempTextColor(e.target.value)} />
          <button onClick={handleSetTextColor}>Set</button><br />
        </div>
      );
    }
    return null;
  };
  

  return (
    <div>
      <div id="ext-menu">
        <img onClick={toggleModal} src={cogIcon} style={{ height: "20px", width: "20px", opacity: 0.1 }} id="settings-menu" />
      </div>

      <div id="myModal" className={`modal ${isModalOpen ? 'modal-open' : 'modal-closed'}`}>
        <div className="modal-content">
          <span className="close" onClick={toggleModal}>&times;</span>
          Custom Entries:
          <input
            type="checkbox"
            id="enable-custom"
            checked={customEntriesEnabled}
            onChange={() => setCustomEntriesEnabled(!customEntriesEnabled)}
          />
          Google Top Bar:
          <input
            type="checkbox"
            id="show-topbar"
            checked={showTopBarEnabled}
            onChange={() => setShowTopBarEnabled(!showTopBarEnabled)}
          />
          Edit Colors:
          <input
            type="checkbox"
            id="enable-color"
            checked={customColorsEnabled}
            onChange={() => setCustomColorsEnabled(!customColorsEnabled)}
          />
          <ColorSettings isEnabled={customColorsEnabled} />
          <div id="edit-entries">
            {customEntries.map((entry, index) => (
              <div key={index}>
                <input
                  className="menu-entry"
                  id={`edit-title-${index}`}
                  value={entry.title}
                  placeholder={`Site-Title-${index+1}`}
                  onChange={(e) => updateEntry(index, 'title', e.target.value)}
                />
                <input
                  id={`edit-link-${index}`}
                  value={entry.url}
                  placeholder={`Link-${index+1}`}
                  onChange={(e) => updateEntry(index, 'url', e.target.value)}
                />
              </div>
            ))}
          </div>

          <button id="clear-storage" onClick={() => localStorage.clear()}>Clear Local Storage</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
