import React, { useState, useEffect } from 'react';
import { dashboard } from '../../services/dashboard';

interface AIPreviewSectionProps {
  projects?: any[];
  onRefresh?: () => void;
}

const AIPreviewSection: React.FC<AIPreviewSectionProps> = ({ projects = [], onRefresh }) => {
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //AIreview for recent proj
  const loadPreviewData = async () => {
    if (projects.length === 0) return;

    try {
      //get and format
      setLoading(true);
      const latestProject = projects[0];
      const previewAssets = await dashboard.getProjectPreview(latestProject.id);
      
      const formattedData = previewAssets.map(asset => ({
        id: asset.id,
        name: asset.filename,
        detected: extractDetectedElements(asset.metadata),
        layers: asset.metadata?.layers || '1 Layer',
        dimensions: asset.metadata?.dimensions || 'Unknown',
        dpi: asset.metadata?.dpi || '300DPI',
        previewUrl: asset.previewUrl
      }));
      
      setPreviewData(formattedData);
    } catch (error) {
      console.error('Failed to load preview data:', error);
      setError('Failed to load AI preview data');
    } finally {
      setLoading(false);
    }
  };

  const extractDetectedElements = (metadata) => {
    if (!metadata) return ['Processing...'];
    const detected = [];
    if (metadata.hasProduct) detected.push('Product');
    if (metadata.hasText) detected.push('Text');
    if (metadata.hasTagline) detected.push('Tagline');
    if (metadata.hasLogo) detected.push('Logo');
    
    return detected.length > 0 ? detected : ['Analysis Complete'];
  };

  useEffect(() => {
    loadPreviewData();
  }, [projects]);

  //fallback if no proj exist:
  const files = previewData.length > 0 ? previewData : [];

  if (loading) {
    return (
      <div className="ai-preview-section">
        <div className="ai-preview-header">
          <h2 className="ai-preview-title">AI Preview</h2>
          <p>Loading AI analysis...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="ai-preview-section">
        <div className="ai-preview-header">
          <h2 className="ai-preview-title">AI Preview</h2>
          <p className="ai-preview-description">
            Upload files to see AI analysis and preview detected elements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-preview-section">
      <div className="ai-preview-header">
        <div>
          <h2 className="ai-preview-title">AI Preview</h2>
          <p className="ai-preview-description">
            AI analysis preview showing {files.length} file{files.length !== 1 ? 's' : ''} with detected elements ready to be resized and repurposed.
          </p>
        </div>
        <button 
          className="resize-repurpose-button"
          onClick={() => {
            const projectId = projects.length > 0 ? projects[0].id : '';
            window.location.href = `/multi-select${projectId ? `?projectId=${projectId}` : ''}`;
          }}
          disabled={files.length === 0}
        >
          Resize & Repurposing
        </button>
      </div>

      {error && (
        <div className="error-message" style={{color: 'red', marginBottom: '20px'}}>
          {error}
        </div>
      )}

      <div className="preview-content-area">
        <h3 className="preview-label">
          Preview <span className="file-count">({files.length} file{files.length !== 1 ? 's' : ''} detected)</span>
        </h3>
        
        <div className="file-preview-grid">
          {files.length === 0 ? (
            <div className="no-preview-data">
              <p>No preview data available. Files may still be processing.</p>
              <button onClick={loadPreviewData} className="refresh-button">
                <i className="fas fa-refresh"></i> Refresh
              </button>
            </div>
          ) : (
            files.map((file, index) => (
              <div className="file-card" key={file.id || index}>
                <p className="file-name">{file.name}</p>
                <div className="file-thumbnail">
                  {file.previewUrl ? (
                    <img 
                      src={`http://localhost:8000${file.previewUrl}`} 
                      alt={file.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <i className="fas fa-image"></i>
                    </div>
                  )}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPreviewSection;