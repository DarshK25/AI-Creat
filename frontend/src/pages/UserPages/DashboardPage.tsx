import React, { useState } from 'react';
import '../../App.css'; 
import AIPreviewSection from './AIPreviewSection';

const DashboardPage: React.FC = () => {
  const [theme, setTheme] = useState('dark'); // 'dark' is the initial state

  const handleThemeToggle = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };
  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
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

      {/* Main Content Area */}
      <main className="main-content">
        <h1 className="greeting-title">Hello Naomi!</h1>
        <p className="greeting-subtitle">Upload your master creative here...</p>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-box">
            <i className="fas fa-cloud-upload-alt upload-icon"></i>
            <p className="upload-text">Upload one or multiple files (JPG, PNG or PSD) or <a href="#" className="upload-browse-link">Browse</a></p>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="recent-projects-section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <a href="#" className="view-more-link">View more</a>
          </div>

          <div className="projects-list">
            {/* Project Item 1 */}
            <div className="project-item">
              <div className="project-col project-id">
                <i className="fas fa-folder project-icon"></i>
                <span>Batch ID</span>
                <span className="project-value">1122</span>
              </div>
              <div className="project-col">
                <span>PSD File</span>
                <span className="project-value">1</span>
              </div>
              <div className="project-col">
                <span>JPG File</span>
                <span className="project-value">1</span>
              </div>
              <div className="project-col">
                <span>PNG File</span>
                <span className="project-value">22</span>
              </div>
              <div className="project-col">
                <span>Submit Date</span>
                <span className="project-value">A min ago</span>
              </div>
              <div className="project-col status-col">
                <span>Status</span>
                <span className="project-status status-uploaded">Uploaded</span>
              </div>
            </div>

            {/* Project Item 2 */}
            <div className="project-item">
              <div className="project-col project-id">
                <i className="fas fa-folder project-icon"></i>
                <span>Batch ID</span>
                <span className="project-value">1121</span>
              </div>
              <div className="project-col">
                <span>PSD File</span>
                <span className="project-value">8</span>
              </div>
              <div className="project-col">
                <span>JPG File</span>
                <span className="project-value">0</span>
              </div>
              <div className="project-col">
                <span>PNG File</span>
                <span className="project-value">16</span>
              </div>
              <div className="project-col">
                <span>Submit Date</span>
                <span className="project-value">3 min ago</span>
              </div>
              <div className="project-col status-col">
                <span>Status</span>
                <span className="project-status status-processing">AI Processing</span>
              </div>
            </div>

            {/* Project Item 3 */}
            <div className="project-item">
              <div className="project-col project-id">
                <i className="fas fa-folder project-icon"></i>
                <span>Batch ID</span>
                <span className="project-value">1120</span>
              </div>
              <div className="project-col">
                <span>PSD File</span>
                <span className="project-value">1</span>
              </div>
              <div className="project-col">
                <span>JPG File</span>
                <span className="project-value">11</span>
              </div>
              <div className="project-col">
                <span>PNG File</span>
                <span className="project-value">20</span>
              </div>
              <div className="project-col">
                <span>Submit Date</span>
                <span className="project-value">8 min ago</span>
              </div>
              <div className="project-col status-col">
                <span>Status</span>
                <span className="project-status status-downloaded">Downloaded</span>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: AI Preview Section */}
        <AIPreviewSection />
      </main>
    </div>
  );
};

export default DashboardPage;