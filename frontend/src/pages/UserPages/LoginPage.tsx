import React from 'react';
import '../../App.css'; // Don't forget to create this CSS file if using component-specific CSS

const LoginPage: React.FC = () => {
  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Logo Section */}
        <div className="login-logo-section">
          <svg className="login-logo-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4ZM10 7L14 12L10 17H7L11 12L7 7H10Z" />
          </svg>
          <span className="login-logo-text">AI CREAT</span>
        </div>

        <h2 className="login-title">Login</h2>

        {/* Username Input */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-input"
            placeholder="Enter your username"
          />
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="Enter your password"
          />
          <a href="#" className="forgot-password-link">
            Forgot your password?
          </a>
        </div>

        {/* Login Button */}
        <button className="login-button"><a href="/user-dashboard" style={{textDecoration: "none" , color: "white"}}>Login</a></button>
      </div>

      {/* Top Left Logo (replicated from the image) */}
      <div className="top-left-logo">
          <svg className="top-left-logo-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4ZM10 7L14 12L10 17H7L11 12L7 7H10Z" />
          </svg>
          <span className="top-left-logo-text">AI CREAT</span>
      </div>
    </div>
  );
};

export default LoginPage;