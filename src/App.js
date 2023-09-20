import Header from './components/Header'
import SearchArea from './components/SearchArea'
import GridContainer from './components/GridContainer'
import SettingsMenu from './components/SettingsMenu'
import Logo from './components/Logo'
import { useLocalStorage } from "./useLocalStorage";
import { useState } from 'react'



const App = () => {

  const [customEntries, setCustomEntries] = useLocalStorage('customEntries', Array.from({ length: 8 }, () => ({ title: '', url: '', favicon: '' })));
  const [customEntriesEnabled, setCustomEntriesEnabled] = useLocalStorage("customEntriesEnabled", false);
  const [showTopBarEnabled, setShowTopBarEnabled] = useLocalStorage("showTopBarEnabled", false);
  const [results, setResults] = useState([]);


  // Upgrade saved sites from v1.6 of the extension..
  const migrateData = () => {
    const isMigrated = localStorage.getItem('migrated');
    if (isMigrated) {
      return console.log("Data migration already completed. Skipping.");
    }
  
    console.log("Starting data migration...");
    const newData = customEntries;
  
    for (let i = 0; i <= 7; i++) {
      const oldData = localStorage.getItem(`site-${i}`);
      if (!oldData) {
        console.log(`No data found for site-${i}`);
        continue;
      }
  
      console.log(`Found data for site-${i}: ${oldData}`);
      const parsedOldData = JSON.parse(oldData);
      newData[i] = {
        title: parsedOldData.title || '',
        url: parsedOldData.url || '',
        favicon: parsedOldData.favicon || ''
      };
    }
  
    if (newData.length > 0) {
      localStorage.setItem("customEntries", JSON.stringify(newData));
      console.log(`Migration complete, new data saved to 'customEntries'. New data format: ${JSON.stringify(newData)}`);
    } else {
      console.log("No old data found for migration.");
    }
  
    // Remove old data
    for (let i = 0; i <= 7; i++) {
      localStorage.removeItem(`site-${i}`);
      console.log(`Removed old data for site-${i}`);
    }
  
    localStorage.setItem('migrated', 'true');
    console.log("Set migrated flag to true.");
  };
  
  // Run the migration
  migrateData();  


  return (
    <div id="wrapper">
      <Header showTopBarEnabled={showTopBarEnabled} />
      <Logo />
      <SearchArea
        results={results}
        setResults={setResults}
      />
      <GridContainer
        customEntriesEnabled={customEntriesEnabled}
        setCustomEntries={setCustomEntries}
        customEntries={customEntries}
        results={results}
      />
      <SettingsMenu
        customEntriesEnabled={customEntriesEnabled}
        setCustomEntriesEnabled={setCustomEntriesEnabled}
        customEntries={customEntries}
        setCustomEntries={setCustomEntries}
        showTopBarEnabled={showTopBarEnabled}
        setShowTopBarEnabled={setShowTopBarEnabled}
      />
    </div>
  );
}

export default App;