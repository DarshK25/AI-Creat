import React from 'react'; 

const AIPreviewSection: React.FC = () => {
  // Dummy data for the file cards
  const files = [
    {
      name: 'Campaign Cover.PSD',
      detected: ['Product', 'Tagline'],
      layers: '5 Layer',
      dimensions: '1000x1000px',
      dpi: '300DPI',
    },
    {
      name: 'Campaign Banner.JPG',
      detected: ['Product', 'Text'],
      layers: '1 Layer',
      dimensions: '2048x1338px',
      dpi: '300DPI',
    },
    {
      name: 'Campaign Banner.JPG',
      detected: ['Product', 'Text'],
      layers: '1 Layer',
      dimensions: '2048x1336px',
      dpi: '300DPI',
    },
    {
      name: 'Products 1.PNG',
      detected: ['Product', 'Text'],
      layers: '1 Layer',
      dimensions: '2048x1338px',
      dpi: '300DPI',
    },
  ];

  return (
    <div className="ai-preview-section">
      <div className="ai-preview-header">
        <div>
          <h2 className="ai-preview-title">AI Preview</h2>
          <p className="ai-preview-description">
            AI analysis preview showing {files.length} file detected elements to resized and repurposed.
          </p>
        </div>
        <button className="resize-repurpose-button"><a href="/multi-select" style={{textDecoration: "none" , color: "white"}}>Resize & Repurposing</a></button>
      </div>

      <div className="preview-content-area">
        <h3 className="preview-label">Preview <span className="file-count">({files.length} file detected)</span></h3>
        
        <div className="file-preview-grid">
          {files.map((file, index) => (
            <div className="file-card" key={index}>
              <p className="file-name">{file.name}</p>
              <div className="file-thumbnail">
                {/* Placeholder for actual image/thumbnail */}
              </div>
              <div className="file-details">
                {file.detected.map((item, i) => (
                  <p key={i} className="detected-item">
                    <i className="fas fa-check-circle check-icon"></i> {item}
                  </p>
                ))}
                <p className="file-info">{file.layers} &bull; {file.dimensions} &bull; {file.dpi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIPreviewSection;