import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

const AdjustImagePage: React.FC = () => {
  const [cropArea, setCropArea] = useState(100); // 100% crop area initially
  const [colorSaturation, setColorSaturation] = useState(0); // 0 saturation initially

  // State for theme toggle from the header (assuming it's part of the global state or passed down)
  const [theme, setTheme] = useState('dark');
  const handleThemeToggle = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const [cropBox, setCropBox] = useState({
    width: 420,  // Initial width in pixels
    height: 420, // Initial height in pixels
    x: 90,       // Initial x position (from top-left)
    y: 90,       // Initial y position (from top-left)
  });

  return (
    <div className="adjust-image-page-container">
      {/* Re-using the same header structure from previous screens */}
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

      <main className="adjust-image-main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="back-button">
              <i className="fas fa-chevron-left"></i> Adjust Image
            </button>
            <p className="description">Manually cropping and adjusting option for the images</p>
          </div>
          <button className="apply-changes-button">Apply Changes</button>
        </div>

        {/* Main Content Area: Image Canvas + Sidebar */}
        <div className="content-area">
          {/* Left: Image Canvas */}
          <div className="image-canvas-wrapper">
            <div className="image-info-bar">
              <span className="image-title">Lemon Tea.JPG for Instagram Post (1080x1080)</span>
              <div className="canvas-controls">
                <span>3 of 18</span>
                <button className="canvas-nav-button"><i className="fas fa-minus"></i></button>
                <button className="canvas-nav-button"><i className="fas fa-plus"></i></button>
              </div>
            </div>
            <div className="image-canvas">
              {/* This div represents the actual image being adjusted */}
              <div
                className="editable-image"
                style={{ backgroundImage: `url('https://i.imgur.com/kS5nL4K.jpg')` }} // Placeholder image
              >
                <Rnd
                  size={{ width: cropBox.width, height: cropBox.height }}
                  position={{ x: cropBox.x, y: cropBox.y }}
                  onDragStop={(e, d) => {
                    setCropBox({ ...cropBox, x: d.x, y: d.y });
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    setCropBox({
                      width: parseInt(ref.style.width, 10),
                      height: parseInt(ref.style.height, 10),
                      ...position,
                    });
                  }}
                  bounds="parent" // This keeps the box inside the "editable-image" div
                  className="crop-selection-area" // We can reuse our old class for styling
                >
                  {/* The library creates its own handles, so we don't need our old divs */}
                </Rnd>

              </div>
            </div>
          </div>

          {/* Right: Adjustments Sidebar */}
          <aside className="adjustments-sidebar">
            <h3>Adjust</h3>
            <p className="sidebar-description">Click & drag to crop image & reposition elements.</p>

            <button className="add-text-logo-button">
              <i className="fas fa-plus"></i> Add Text or Logo
            </button>

            {/* Manual Cropping */}
            <div className="adjustment-section">
              <h4>Manual Cropping</h4>
              <div className="slider-control">
                <label>Crop Area</label>
                <div className="slider-wrapper">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropArea}
                    onChange={(e) => setCropArea(Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <span className="slider-value">{cropArea}</span>
                </div>
              </div>
            </div>

            {/* Color Saturation Adjustments */}
            <div className="adjustment-section">
              <h4>Color Saturation Adjustments</h4>
              <div className="slider-control">
                <label>Color Saturation</label>
                <div className="slider-wrapper">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={colorSaturation}
                    onChange={(e) => setColorSaturation(Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <span className="slider-value">{colorSaturation}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AdjustImagePage;