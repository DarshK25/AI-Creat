import React, { useState, useEffect } from 'react';
import '../../App.css';
import { generation } from '../../services/generation';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface GeneratedAsset {
  id: string;
  originalAssetId: string;
  filename: string;
  assetUrl: string;
  platformName?: string;
  formatName: string;
  dimensions: {
    width: number;
    height: number;
  };
  isNsfw: boolean;
}

interface JobResults {
  [platformName: string]: GeneratedAsset[];
}

const RealTimePreviewPage: React.FC = () => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [resolution, setResolution] = useState(72);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId') || '';

  // Job status and results
  const [jobStatus, setJobStatus] = useState<string>('running');
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobResults, setJobResults] = useState<JobResults>({});
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // UI state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [groupBy, setGroupBy] = useState<'platform' | 'type'>('platform');
  const [openPlatforms, setOpenPlatforms] = useState<string[]>([]);

  // Batch download state
  const [showBatchDownload, setShowBatchDownload] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'JPEG' | 'PNG' | 'PSD'>('JPEG');
  const [imageQuality, setImageQuality] = useState<'High' | 'Medium' | 'Low'>('High');
  const [downloadOption, setDownloadOption] = useState<'Batch' | 'Individual'>('Batch');

  const handleThemeToggle = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  // Flatten results for easier handling
  const allAssets: GeneratedAsset[] = Object.values(jobResults).flat();

  // Poll for job status and results
  useEffect(() => {
    if (!jobId) {
      setError('No job ID provided');
      setLoading(false);
      return;
    }

    let cancelled = false;
    let pollTimeout: number;

    const pollJobStatus = async () => {
      try {
        const statusResponse = await generation.getJobStatus(jobId);

        if (cancelled) return;

        const status = statusResponse?.status || 'running';
        const progress = statusResponse?.progress || 0;

        setJobStatus(status);
        setJobProgress(progress);

        if (status === 'completed') {
          // Job completed, get results
          try {
            const results = await generation.getJobResults(jobId);
            if (!cancelled) {
              setJobResults(results || {});
              setLoading(false);
              // Auto-expand first platform
              const firstPlatform = Object.keys(results || {})[0];
              if (firstPlatform) {
                setOpenPlatforms([firstPlatform]);
              }
            }
          } catch (resultsError) {
            console.error('Failed to get job results:', resultsError);
            setError('Failed to load generated assets');
            setLoading(false);
          }
        } else if (status === 'failed') {
          setError('Generation job failed');
          setLoading(false);
        } else {
          // Still running, continue polling
          pollTimeout = setTimeout(pollJobStatus, 2000);
        }
      } catch (statusError) {
        console.error('Failed to get job status:', statusError);
        if (!cancelled) {
          // Retry after longer delay on error
          pollTimeout = setTimeout(pollJobStatus, 5000);
        }
      }
    };

    setLoading(true);
    pollJobStatus();

    return () => {
      cancelled = true;
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  }, [jobId]);

  const handleAssetSelect = (id: string) => {
    setSelectedAssets(prev =>
      prev.includes(id) ? prev.filter(assetId => assetId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === allAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(allAssets.map(asset => asset.id));
    }
  };

  const togglePlatform = (platform: string) => {
    setOpenPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const formatDimensions = (dimensions: { width: number; height: number }) => {
    return `${dimensions.width} × ${dimensions.height}`;
  };

  const handleBatchDownload = async () => {
    if (selectedAssets.length === 0) {
      alert('Please select assets to download');
      return;
    }

    try {
      // Map UI values to backend expected values
      const formatMap: { [key: string]: 'jpeg' | 'png' } = {
        'JPEG': 'jpeg',
        'PNG': 'png',
        'PSD': 'jpeg' // PSD not supported, fallback to JPEG
      };

      const qualityMap: { [key: string]: 'high' | 'medium' | 'low' } = {
        'High': 'high',
        'Medium': 'medium',
        'Low': 'low'
      };

      const groupingMap: { [key: string]: 'individual' | 'batch' | 'category' } = {
        'Individual': 'individual',
        'Batch': 'batch'
      };

      // Create download request with correct format
      const downloadData = {
        assetIds: selectedAssets,
        format: formatMap[downloadFormat] || 'jpeg',
        quality: qualityMap[imageQuality] || 'high',
        grouping: groupingMap[downloadOption] || 'batch'
      };

      // Call download API
      const response = await generation.downloadAssets(downloadData);

      // Handle download response
      if (response.downloadUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = `assets_${downloadOption.toLowerCase()}_${Date.now()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setShowBatchDownload(false);
    } catch (error: any) {
      console.error('Download failed:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Download failed. Please try again.';
      alert(errorMessage);
    }
  };

  // Loading state
  if (loading) {
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
          </div>
          <div className="navbar-right">
            <button onClick={() => navigate('/user-dashboard')} className="icon-button">
              <i className="fas fa-home"></i>
            </button>
          </div>
        </header>
        <main className="preview-main-content">
          <div className="generation-status">
            <h2>Generating Your Assets...</h2>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${jobProgress}%` }}
              ></div>
            </div>
            <p>Status: {jobStatus} ({jobProgress}%)</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
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
          </div>
          <div className="navbar-right">
            <button onClick={() => navigate('/user-dashboard')} className="icon-button">
              <i className="fas fa-home"></i>
            </button>
          </div>
        </header>
        <main className="preview-main-content">
          <div className="error-state">
            <h2>Generation Failed</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/user-dashboard')} className="action-button primary">
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

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
            <a href="/user-dashboard" className="nav-item">Dashboard</a>
            <a href="#" className="nav-item active">Recreate</a>
            <a href="#" className="nav-item">Project History</a>
          </nav>
        </div>
        <div className="navbar-right">
          <button
            className="icon-button"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
          </button>
          <button className="icon-button">
            <i className="fas fa-bell"></i>
          </button>
          <button className="icon-button">
            <i className="fas fa-cog"></i>
          </button>
          <div className="user-profile">
            <img
              src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80"
              alt="User"
              className="profile-avatar"
            />
          </div>
        </div>
      </header>

      <main className="preview-main-content">
        <div className="preview-header">
          <h1>Generated Assets ({allAssets.length} items)</h1>
          <div className="preview-actions">
            <button className="action-button secondary">Preview</button>
            <button
              className="action-button primary"
              disabled={selectedAssets.length === 0}
              onClick={() => setShowBatchDownload(true)}
            >
              Download Selected ({selectedAssets.length})
            </button>
          </div>
        </div>

        <div className="preview-body">
          <div className="generated-assets-section">
            <div className="assets-toolbar">
              <label className="custom-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAssets.length === allAssets.length && allAssets.length > 0}
                  onChange={handleSelectAll}
                />
                <span className="custom-checkbox"></span>
                Select All ({selectedAssets.length} of {allAssets.length})
              </label>
              <div className="group-by-wrapper">
                <span>Group By</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'platform' | 'type')}
                >
                  <option value="platform">Platform</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>

            {Object.keys(jobResults).length === 0 ? (
              <div className="empty-state">
                <p>No assets generated yet.</p>
              </div>
            ) : (
              <div className="platforms-container">
                {Object.entries(jobResults).map(([platformName, assets]) => (
                  <div key={platformName} className="platform-section">
                    <div
                      className="platform-header"
                      onClick={() => togglePlatform(platformName)}
                    >
                      <h3>{platformName} ({assets.length} items)</h3>
                      <i className={`fas fa-chevron-${openPlatforms.includes(platformName) ? 'up' : 'down'}`}></i>
                    </div>

                    {openPlatforms.includes(platformName) && (
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
                                  <span className="asset-name">{asset.formatName}</span>
                                </div>
                                <div className="asset-thumbnail">
                                  <img
                                    src={asset.assetUrl}
                                    alt={asset.formatName}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="asset-actions">
                                    <button
                                      className="edit-more-button"
                                      onClick={() => navigate(`/adjust-img?assetId=${asset.id}`)}
                                    >
                                      Edit More
                                    </button>
                                    <button
                                      className="download-single-button"
                                      onClick={async () => {
                                        try {
                                          await generation.downloadSingleAsset(asset.id);
                                        } catch (error: any) {
                                          console.error('Download failed:', error);
                                          alert('Download failed. Please try again.');
                                        }
                                      }}
                                      title="Download this asset"
                                    >
                                      <i className="fas fa-download"></i>
                                    </button>
                                  </div>
                                </div>
                                <div className="asset-footer">
                                  <span className="asset-type">{asset.formatName}</span>
                                  <span className="asset-dims">{formatDimensions(asset.dimensions)}</span>
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
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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

        {/* Batch Download Modal */}
        {showBatchDownload && (
          <div className="batch-download-modal">
            <div className="batch-download-overlay" onClick={() => setShowBatchDownload(false)}></div>
            <div className="batch-download-sidebar">
              <div className="batch-download-header">
                <h3>Batch Download</h3>
                <button
                  className="close-button"
                  onClick={() => setShowBatchDownload(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="batch-download-content">
                <div className="download-section">
                  <h4>File Formats</h4>
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value as 'JPEG' | 'PNG' | 'PSD')}
                    className="format-select"
                  >
                    <option value="JPEG">JPEG</option>
                    <option value="PNG">PNG</option>
                    <option value="PSD">PSD</option>
                  </select>
                </div>

                <div className="download-section">
                  <h4>Image Quality (PPI)</h4>
                  <select
                    value={imageQuality}
                    onChange={(e) => setImageQuality(e.target.value as 'High' | 'Medium' | 'Low')}
                    className="quality-select"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="download-section">
                  <h4>Download Options</h4>
                  <select
                    value={downloadOption}
                    onChange={(e) => setDownloadOption(e.target.value as 'Batch' | 'Individual')}
                    className="option-select"
                  >
                    <option value="Batch">Batch</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>

                <div className="download-summary">
                  <p>Download All generated Versions ({selectedAssets.length})</p>
                </div>

                <button
                  className="download-button"
                  onClick={handleBatchDownload}
                  disabled={selectedAssets.length === 0}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RealTimePreviewPage;