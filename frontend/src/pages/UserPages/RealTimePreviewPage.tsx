import React, { useState} from 'react';
import '../../App.css';

// Mock data to represent the assets. In a real application, this would come from state or an API.
const assetData = [
  {
    platform: 'Instagram',
    fileCount: 8,
    nsfwCount: 2,
    assets: [
      { id: 'insta-1', name: 'Tea Coffe_2025.PSD', type: 'Instagram Post', dimensions: '1080x1080', isNsfw: false },
      { id: 'insta-2', name: 'Tea Coffe_2025.PSD', type: 'Instagram Story', dimensions: '1080x1920', isNsfw: false },
      { id: 'insta-3', name: 'Lemon Tea.JPG', type: 'Instagram Post', dimensions: '1080x1080', isNsfw: false },
      { id: 'insta-4', name: 'Lemon Tea.JPG', type: 'Instagram Story', dimensions: '1080x1920', isNsfw: false },
      { id: 'insta-5', name: 'Ice Tea.PNG', type: 'Instagram Post', dimensions: '1080x1080', isNsfw: false },
      { id: 'insta-6', name: 'Ice Tea.PNG', type: 'Instagram Story', dimensions: '1080x1920', isNsfw: false },
      { id: 'insta-7', name: 'NSFW Content 1', type: 'Instagram Story', dimensions: '1080x1920', isNsfw: true },
      { id: 'insta-8', name: 'NSFW Content 2', type: 'Instagram Story', dimensions: '1080x1920', isNsfw: true },
    ],
  },
  { platform: 'Facebook', fileCount: 5, nsfwCount: 0, assets: [ /* ... more asset data ... */ ] },
  { platform: 'Youtube', fileCount: 5, nsfwCount: 0, assets: [ /* ... more asset data ... */ ] },
];

const RealTimePreviewPage: React.FC = () => {
  // State for managing UI elements
  const [openAccordions, setOpenAccordions] = useState<string[]>(['Instagram']); // Instagram is open by default
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['insta-1']); // First asset is selected by default
  const [resolution, setResolution] = useState(72);

  const toggleAccordion = (platform: string) => {
    setOpenAccordions(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleAssetSelect = (id: string) => {
    setSelectedAssets(prev =>
      prev.includes(id) ? prev.filter(assetId => assetId !== id) : [...prev, id]
    );
  };

  const [theme, setTheme] = useState('dark'); // 'dark' is the initial state
  
    const handleThemeToggle = () => {
      setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
    };

    
  return (
    <div className="preview-page-container">
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

      <main className="preview-main-content">
        {/* Top Header and Actions */}
        <div className="preview-header">
          <h1>Real-Time AI Preview</h1>
          <div className="preview-actions">
            <button className="action-button secondary">Preview</button>
            <button className="action-button primary">Batch Download</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="preview-tabs">
          <button className="tab-item active">Resizing</button>
          <button className="tab-item">Repurposing</button>
        </div>
        
        <div className="preview-body">
          {/* Left Side: Generated Assets */}
          <div className="generated-assets-section">
            <div className="assets-toolbar">
              <label className="custom-checkbox-label">
                <input type="checkbox" />
                <span className="custom-checkbox"></span>
                Select All
              </label>
              <div className="group-by-wrapper">
                <span>Group By</span>
                <select defaultValue="platform">
                  <option value="platform">Platform</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>

            {assetData.map(({ platform, fileCount, nsfwCount, assets }) => (
              <div key={platform} className={`accordion-item ${openAccordions.includes(platform) ? 'is-open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion(platform)}>
                  <div className="accordion-header-left">
                    <label className="custom-checkbox-label" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" />
                      <span className="custom-checkbox"></span>
                    </label>
                    <span className="platform-name">{platform}</span>
                    <span className="file-count-badge">({fileCount} generated file)</span>
                    {nsfwCount > 0 && (
                      <div className="nsfw-warning-badge">
                        <i className="fas fa-exclamation-triangle"></i> {nsfwCount} NSFW content detected!
                      </div>
                    )}
                  </div>
                  <i className="fas fa-chevron-down chevron-icon"></i>
                </button>
                <div className="accordion-content">
                  <div className="asset-grid">
                    {assets.map(asset => (
                      <div
                        key={asset.id}
                        className={`asset-card ${selectedAssets.includes(asset.id) ? 'is-selected' : ''} ${asset.isNsfw ? 'is-nsfw' : ''}`}
                      >
                        {!asset.isNsfw ? (
                          <>
                            <div className="card-header">
                              <label className="custom-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={selectedAssets.includes(asset.id)}
                                  onChange={() => handleAssetSelect(asset.id)}
                                />
                                <span className="custom-checkbox"></span>
                              </label>
                              <span className="asset-name">{asset.name}</span>
                            </div>
                            <div className="asset-thumbnail">
                              <button className="edit-more-button">Edit More</button>
                            </div>
                            <div className="asset-footer">
                              <span className="asset-type">{asset.type}</span>
                              <span className="asset-dims">{asset.dimensions}</span>
                            </div>
                          </>
                        ) : (
                          <div className="nsfw-content">
                            <i className="fas fa-eye-slash nsfw-icon"></i>
                            <p className="nsfw-title">NSFW Content!</p>
                            <p className="nsfw-subtitle">Flagged Content Alerts</p>
                            <button className="show-button">Show</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Adjust Resolution Sidebar */}
          <aside className="adjust-resolution-sidebar">
            <h3>Adjust Resolution</h3>
            <div className="resolution-previews">
              <div className="preview-box">
                <label>New</label>
                <div className="preview-thumbnail"></div>
              </div>
              <div className="preview-box">
                <label>Original</label>
                <div className="preview-thumbnail"></div>
              </div>
            </div>
            <div className="slider-section">
              <h4>Scroll to Adjust</h4>
              <div className="slider-control">
                <label>Resolution</label>
                <div className="slider-wrapper">
                  <input
                    type="range"
                    min="30"
                    max="600"
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="resolution-slider"
                  />
                  <span className="slider-value">{resolution} DPI</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default RealTimePreviewPage;