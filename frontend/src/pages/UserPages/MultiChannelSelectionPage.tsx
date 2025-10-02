import React, { useState } from 'react';
import '../../App.css';
import RepurposingGrid from './RepurposingGrid';

// You might want to move this data to a separate file in a real app
const templateData = [
  {
    category: 'Mobile',
    items: [
      { id: 'mobile-phone', name: 'Phone', dimensions: '1179x2556', ratio: '2:1', iconRatio: 'tall' },
      { id: 'mobile-ipad', name: 'iPad - Portrait', dimensions: '1668x2388', ratio: '2:1', iconRatio: 'tall' },
    ],
  },
  {
    category: 'Web',
    items: [
      { id: 'web-common', name: 'Web - Common', dimensions: '1366x768', ratio: '16:9', iconRatio: 'wide' },
      { id: 'web-large', name: 'Web - Large', dimensions: '1920x1080', ratio: '16:9', iconRatio: 'wide' },
      { id: 'web-min', name: 'Web - Minimum', dimensions: '1024x768', ratio: '4:3', iconRatio: 'medium' },
    ],
  },
  {
    category: 'Print',
    items: [
      { id: 'print-half', name: 'Ads Half Page', dimensions: '300x600', ratio: '1:2', iconRatio: 'skyscraper' },
      { id: 'print-sky', name: 'Ads Wide Skyscraper', dimensions: '160x600', ratio: '1:3', iconRatio: 'skyscraper' },
    ],
  },
  {
    category: 'Social',
    items: [
      { id: 'social-insta', name: 'Instagram Reel/Story', dimensions: '1080x1920', ratio: '16:9', iconRatio: 'wide' },
      { id: 'social-yt', name: 'Youtube Thumbnail', dimensions: '1280x720', ratio: '16:9', iconRatio: 'wide' },
      { id: 'social-linkedin', name: 'Linkedin Square', dimensions: '1080x1080', ratio: '1:1', iconRatio: 'square' },
    ],
  },
];

const allTemplateIds = templateData.flatMap(cat => cat.items.map(item => item.id));

const MultiChannelSelectionPage: React.FC = () => {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['web-min']); // 'web-min' is checked by default

  const [activeTab, setActiveTab] = useState('resizing');

  const handleCheckboxChange = (id: string) => {
    setSelectedTemplates(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTemplates.length === allTemplateIds.length) {
      setSelectedTemplates([]); // Deselect all
    } else {
      setSelectedTemplates(allTemplateIds); // Select all
    }
  };

  const [theme, setTheme] = useState('dark'); // 'dark' is the initial state
  
    const handleThemeToggle = () => {
      setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
    };

  return (
    <div className="selection-page-container">
      {/* Re-using the same header structure */}
      <header className="navbar">
        <div className="navbar-left">
          <div className="navbar-logo">
            <svg className="logo-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 20 L80 80 M80 20 L20 80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
            </svg>
            <span className="logo-text">AI CREAT</span>
          </div>
          <nav className="navbar-nav">
            <a href="#" className="nav-item active">Recreate</a>
            <a href="#" className="nav-item">Project History</a>
          </nav>
        </div>
        <div className="navbar-right">
  {/* Light/Dark Mode Toggle */}
  <button 
            className="icon-button" 
            onClick={handleThemeToggle} 
            aria-label="Toggle theme"
          >
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
  </button>
  
  {/* Notifications Button */}
  <button className="icon-button">
    <i className="fas fa-bell"></i>
  </button>
  
  {/* Settings Button */}
  <button className="icon-button">
    <i className="fas fa-cog"></i>
  </button>
  
  {/* User Profile Avatar */}
  <div className="user-profile">
    <img 
      src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80" 
      alt="User" 
      className="profile-avatar" 
    />
  </div>
</div>
      </header> 
      <main className="selection-main-content">
        {/* Top Header */}
        <div className="selection-header">
          <h1>Multi-channel Selection</h1>
          <a href="/real-time-prev" style={{textDecoration: "none"}}><button className="generate-ai-button">
            <i className="fas fa-plus"></i> Generate With AI
          </button></a>
          
        </div>

        {/* 3. Update Tabs for State Control */}
        <div className="selection-tabs">
          <button 
            className={`tab-item ${activeTab === 'resizing' ? 'active' : ''}`}
            onClick={() => setActiveTab('resizing')}
          >
            Resizing
          </button>
          <button 
            className={`tab-item ${activeTab === 'repurposing' ? 'active' : ''}`}
            onClick={() => setActiveTab('repurposing')}
          >
            Repurposing
          </button>
        </div>

        {/* Main Columns */}
        

        {activeTab === 'resizing' ? (
          <div className="selection-columns">
          {/* Left Column: Templates */}
          <div className="template-column">
            <div className="column-header">
              <h3>Template</h3>
              <button onClick={handleSelectAll} className="select-all-button">Select All</button>
            </div>
            <div className="template-list">
              {templateData.map(category => (
                <div key={category.category} className="template-category">
                  <h4>{category.category}</h4>
                  {category.items.map(item => (
                    <label key={item.id} className="template-item">
                      <input 
                        type="checkbox"
                        checked={selectedTemplates.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                      <span className="custom-checkbox"></span>
                      <div className="template-details">
                        <span className="template-name">{item.name}</span>
                        <span className="template-dims">{item.dimensions}</span>
                      </div>
                      <div className="aspect-ratio">
                        <div className={`aspect-ratio-icon ratio-${item.iconRatio}`}></div>
                        <span>{item.ratio}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column: Custom */}
          <div className="custom-column">
            <div className="column-header">
              <h3>Custom</h3>
            </div>
            <div className="custom-form">
              <div className="form-group">
                <label>Sizes</label>
                <div className="dimension-inputs">
                  <div className="input-wrapper">
                    <span>W</span>
                    <input type="number" defaultValue="1080" />
                  </div>
                  <div className="input-wrapper">
                    <span>H</span>
                    <input type="number" defaultValue="1920" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="unit-select">Unit</label>
                <div className="select-wrapper">
                  <select id="unit-select" defaultValue="pixels">
                    <option value="pixels">Pixels</option>
                    <option value="inches">Inches</option>
                    <option value="cm">Centimeters</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <RepurposingGrid />
        )}
      </main>
    </div>
  );
};

export default MultiChannelSelectionPage;