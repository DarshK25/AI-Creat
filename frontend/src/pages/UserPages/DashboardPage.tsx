import React, { useState, useEffect } from 'react';
import '../../App.css'; 
import AIPreviewSection from './AIPreviewSection';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/auth';
import { dashboard } from '../../services/dashboard';

const DashboardPage: React.FC = () => {

  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [userProfile, projectsData] = await Promise.all([
        dashboard.getUserProfile(),
        dashboard.getProjects()
      ]);
      
      setUser({
        name: userProfile.username,
        email: userProfile.email,
        role: userProfile.role
      });
      setProjects(projectsData);
      
      if (userProfile.preferences?.theme) {
        setTheme(userProfile.preferences.theme);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  //check authentication first 
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  const handleThemeToggle = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    try {
      await dashboard.updatePreferences({ theme: newTheme });
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to update theme:', error);
      setTheme(newTheme);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const projectName = `Project ${new Date().toLocaleDateString()}`;
      await dashboard.uploadProject(projectName, files);
      loadDashboardData();
      e.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatProjects = (apiProjects) => {
    return apiProjects.map(project => ({
      id: project.id,
      name: project.name,
      psdCount: project.fileCounts?.psd || 0,
      jpgCount: project.fileCounts?.jpg || 0,
      pngCount: project.fileCounts?.png || 0,
      submitDate: new Date(project.submitDate).toLocaleString(),
      status: project.status
    }));
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message ">Loading ...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
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
          <button className="icon-button" onClick={handleThemeToggle} aria-label="Toggle theme">
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
          </button>
          <button className="icon-button">
            <i className="fas fa-bell"></i>
          </button>
          <button className="icon-button">
            <i className="fas fa-cog"></i>
          </button>
          <button className="icon-button" onClick={handleLogout} title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
          <div className="user-profile">
            <img 
              src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80" 
              alt="User" 
              className="profile-avatar" 
            />
          </div>
        </div>
      </header>

      <main className="main-content">
        <h1 className="greeting-title">Hello {user?.name || 'User'}!</h1>
        <p className="greeting-subtitle">Upload your master creative here ...</p>
        {error && (
          <div className="error-message" style={{color: 'red', marginBottom: '20px'}}>
            {error}
          </div>
        )}

        <div className="upload-section">
          <div className="upload-box">
            <i className="fas fa-cloud-upload-alt upload-icon"></i>
            <p className="upload-text">
              Upload one or multiple files (JPG, PNG or PSD) or 
              <label className="upload-browse-link" style={{cursor: 'pointer', marginLeft: '5px'}}>
                Browse
                <input 
                  type="file" 
                  multiple 
                  accept=".jpg,.jpeg,.png,.psd"
                  onChange={handleFileUpload}
                  style={{display: 'none'}}
                  disabled={uploading}
                />
              </label>
            </p>
            {uploading && <p style={{color: '#007bff'}}>Uploading files...</p>}
          </div>
        </div>

        <div className="recent-projects-section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <a href="#" className="view-more-link">View more</a>
          </div>

          <div className="projects-list">
            {projects.length === 0 ? (
              <div className="no-projects">No projects found. Upload some files to get started!</div>
            ) : (
              formatProjects(projects).map((project) => (
                <div key={project.id} className="project-item">
                  <div className="project-col project-id">
                    <i className="fas fa-folder project-icon"></i>
                    <span>Project ID</span>
                    <span className="project-value">{project.id.slice(-4)}</span>
                  </div>
                  <div className="project-col">
                    <span>PSD File</span>
                    <span className="project-value">{project.psdCount}</span>
                  </div>
                  <div className="project-col">
                    <span>JPG File</span>
                    <span className="project-value">{project.jpgCount}</span>
                  </div>
                  <div className="project-col">
                    <span>PNG File</span>
                    <span className="project-value">{project.pngCount}</span>
                  </div>
                  <div className="project-col">
                    <span>Submit Date</span>
                    <span className="project-value">{project.submitDate}</span>
                  </div>
                  <div className="project-col status-col">
                    <span>Status</span>
                    <span className={`project-status status-${project.status.toLowerCase()}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <AIPreviewSection onRefresh={ loadDashboardData} projects={projects }/>
        
      </main>
    </div>
  );
};

export default DashboardPage;
