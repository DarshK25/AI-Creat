import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { generation } from '../../services/generation';
import type { GeneratedAsset } from '../../types';

interface CropBox {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

interface LogoOverlay {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

interface ImageAdjustments {
  cropArea: number;
  colorSaturation: number;
  brightness: number;
  contrast: number;
  cropBox: CropBox;
  textOverlays: TextOverlay[];
  logoOverlays: LogoOverlay[];
}

const AdjustImagePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, setTheme } = useAppContext();
  const { logout } = useAuth();

  // URL parameters
  const assetId = searchParams.get('assetId');
  const jobId = searchParams.get('jobId');

  // Local state
  const [currentAsset, setCurrentAsset] = useState<GeneratedAsset | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Image adjustments state
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    cropArea: 100,
    colorSaturation: 0,
    brightness: 0,
    contrast: 0,
    cropBox: {
      width: 300,
      height: 300,
      x: 50,
      y: 50,
    },
    textOverlays: [],
    logoOverlays: [],
  });

  // UI state for adding text/logo
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showLogoDialog, setShowLogoDialog] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#ffffff');

  // API hooks (only for apply edits)
  const applyEditsApi = useApi(generation.applyManualEdits);

  // Load data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    let isMounted = true; // Prevent state updates if component unmounts

    const loadAssetData = async () => {
      if (!assetId && !jobId) {
        if (isMounted) setError('No asset or job ID provided');
        return;
      }

      try {
        if (isMounted) setError('');

        if (assetId) {
          // Load specific asset directly using the service
          console.log('Loading asset with ID:', assetId);
          const asset = await generation.getGeneratedAsset(assetId);
          if (isMounted && asset) {
            setCurrentAsset(asset);
            setCurrentIndex(0);
            setTotalAssets(1);
            
            // Initialize crop box based on asset dimensions
            const cropSize = Math.min(asset.dimensions.width, asset.dimensions.height) * 0.8;
            const cropX = (asset.dimensions.width - cropSize) / 2;
            const cropY = (asset.dimensions.height - cropSize) / 2;
            
            setAdjustments(prev => ({
              ...prev,
              cropBox: {
                width: cropSize,
                height: cropSize,
                x: cropX,
                y: cropY,
              }
            }));
            
            console.log('Asset loaded successfully:', asset);
          } else if (isMounted) {
            setError('Asset not found');
          }
        } else if (jobId) {
          // Load job results directly using the service
          const results = await generation.getJobResults(jobId);
          if (isMounted && results) {
            const allAssets = Object.values(results).flat();

            if (allAssets.length > 0) {
              const asset = allAssets[0];
              setCurrentAsset(asset);
              setCurrentIndex(0);
              setTotalAssets(allAssets.length);
              
              // Initialize crop box based on asset dimensions
              const cropSize = Math.min(asset.dimensions.width, asset.dimensions.height) * 0.8;
              const cropX = (asset.dimensions.width - cropSize) / 2;
              const cropY = (asset.dimensions.height - cropSize) / 2;
              
              setAdjustments(prev => ({
                ...prev,
                cropBox: {
                  width: cropSize,
                  height: cropSize,
                  x: cropX,
                  y: cropY,
                }
              }));
            } else {
              setError('No assets found for this job');
            }
          }
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error.message || 'Failed to load asset data');
        }
      }
    };

    loadAssetData();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [navigate, assetId, jobId]); // Only depend on URL params

  // Handle adjustment changes
  const handleAdjustmentChange = useCallback((key: keyof ImageAdjustments, value: any) => {
    setAdjustments(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle crop box changes
  const handleCropBoxChange = useCallback((newCropBox: Partial<CropBox>) => {
    setAdjustments(prev => ({
      ...prev,
      cropBox: { ...prev.cropBox, ...newCropBox },
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add text overlay
  const handleAddText = () => {
    if (!newText.trim() || !currentAsset) return;

    const textOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: newText,
      x: currentAsset.dimensions.width * 0.5, // Center horizontally
      y: currentAsset.dimensions.height * 0.5, // Center vertically
      fontSize: Math.max(24, currentAsset.dimensions.width * 0.05), // Scale font size
      color: selectedTextColor,
      fontFamily: 'Arial, sans-serif',
    };

    setAdjustments(prev => ({
      ...prev,
      textOverlays: [...prev.textOverlays, textOverlay],
    }));

    setNewText('');
    setShowTextDialog(false);
    setHasUnsavedChanges(true);
  };

  // Add logo overlay
  const handleAddLogo = (logoFile: File) => {
    if (!currentAsset) return;
    
    const logoUrl = URL.createObjectURL(logoFile);

    const logoOverlay: LogoOverlay = {
      id: `logo-${Date.now()}`,
      imageUrl: logoUrl,
      x: currentAsset.dimensions.width * 0.1, // 10% from left
      y: currentAsset.dimensions.height * 0.1, // 10% from top
      width: Math.min(100, currentAsset.dimensions.width * 0.2), // 20% of image width or 100px max
      height: Math.min(100, currentAsset.dimensions.width * 0.2), // Keep square
      opacity: 1,
    };

    setAdjustments(prev => ({
      ...prev,
      logoOverlays: [...prev.logoOverlays, logoOverlay],
    }));

    setShowLogoDialog(false);
    setHasUnsavedChanges(true);
  };

  // Remove text overlay
  const handleRemoveText = (textId: string) => {
    setAdjustments(prev => ({
      ...prev,
      textOverlays: prev.textOverlays.filter(t => t.id !== textId),
    }));
    setHasUnsavedChanges(true);
  };

  // Remove logo overlay
  const handleRemoveLogo = (logoId: string) => {
    setAdjustments(prev => ({
      ...prev,
      logoOverlays: prev.logoOverlays.filter(l => l.id !== logoId),
    }));
    setHasUnsavedChanges(true);
  };

  // Apply changes to the asset
  const handleApplyChanges = async () => {
    if (!currentAsset) {
      setError('No asset selected');
      return;
    }

    try {
      setError('');

      // Get image dimensions for normalization
      const imageDimensions = currentAsset.dimensions;
      
      // Normalize crop coordinates to 0-1 range
      const normalizedCrop = {
        x: Math.max(0, Math.min(1, adjustments.cropBox.x / imageDimensions.width)),
        y: Math.max(0, Math.min(1, adjustments.cropBox.y / imageDimensions.height)),
        width: Math.max(0.1, Math.min(1, adjustments.cropBox.width / imageDimensions.width)),
        height: Math.max(0.1, Math.min(1, adjustments.cropBox.height / imageDimensions.height)),
      };

      // Ensure crop area doesn't extend beyond image boundaries
      if (normalizedCrop.x + normalizedCrop.width > 1) {
        normalizedCrop.width = 1 - normalizedCrop.x;
      }
      if (normalizedCrop.y + normalizedCrop.height > 1) {
        normalizedCrop.height = 1 - normalizedCrop.y;
      }

      // Normalize text overlay positions
      const normalizedTextOverlays = adjustments.textOverlays.map(overlay => ({
        text: overlay.text,
        x: overlay.x / imageDimensions.width,
        y: overlay.y / imageDimensions.height,
        style_set_id: "00000000-0000-0000-0000-000000000000", // Default style set
        style_type: "default"
      }));

      // Normalize logo overlay positions
      // Note: For now, we'll skip logo overlays as they require file upload to server
      // This would need to be implemented with proper file upload functionality
      const normalizedLogoOverlays: any[] = [];
      
      // TODO: Implement logo file upload to server before applying edits
      if (adjustments.logoOverlays.length > 0) {
        console.warn('Logo overlays are not yet supported in the backend. Skipping logo overlays.');
      }

      // Normalize saturation to -1 to 1 range
      const normalizedSaturation = adjustments.colorSaturation / 100;

      const edits = {
        crop: normalizedCrop,
        saturation: normalizedSaturation,
        text_overlays: normalizedTextOverlays,
        logo_overlays: normalizedLogoOverlays,
      };

      console.log('Applying edits:', edits);
      await applyEditsApi.execute(currentAsset.id, edits);
      setHasUnsavedChanges(false);

      // Show success message
      alert('Changes applied successfully!');
      
      // Refresh the asset to show updated version
      try {
        const updatedAsset = await generation.getGeneratedAsset(currentAsset.id);
        setCurrentAsset(updatedAsset);
      } catch (refreshError) {
        console.warn('Could not refresh asset after edit:', refreshError);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to apply changes';
      setError(errorMessage);
    }
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // Load previous asset logic here
    }
  };

  const handleNext = () => {
    if (currentIndex < totalAssets - 1) {
      setCurrentIndex(prev => prev + 1);
      // Load next asset logic here
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate(-1);
  };

  const handleThemeToggle = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    await logout();
  };



  // Loading state
  if (!currentAsset && !error) {
    return (
      <div className="adjust-image-page-container">
        <div className="loading-message">Loading asset...</div>
      </div>
    );
  }

  return (
    <div className="adjust-image-page-container">
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
            <i className={state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
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

      <main className="adjust-image-main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="back-button" onClick={handleBack}>
              <i className="fas fa-chevron-left"></i> Adjust Image
            </button>
            <p className="description">Manually cropping and adjusting option for the images</p>
          </div>
          <div className="top-bar-actions">
            <button
              className="download-button"
              onClick={async () => {
                if (currentAsset) {
                  try {
                    await generation.downloadSingleAsset(currentAsset.id);
                  } catch (error: any) {
                    console.error('Download failed:', error);
                    setError('Download failed. Please try again.');
                  }
                }
              }}
              disabled={!currentAsset}
            >
              <i className="fas fa-download"></i> Download
            </button>
            <button
              className="apply-changes-button"
              onClick={handleApplyChanges}
              disabled={!hasUnsavedChanges || applyEditsApi.loading}
            >
              {applyEditsApi.loading ? 'Applying...' : 'Apply Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ color: 'red', margin: '1rem 2rem' }}>
            {error}
          </div>
        )}

        <div className="content-area">
          <div className="image-canvas-wrapper">
            <div className="image-info-bar">
              <span className="image-title">
                {currentAsset ?
                  `${currentAsset.filename} for ${currentAsset.formatName} (${currentAsset.dimensions.width}x${currentAsset.dimensions.height})` :
                  'Loading...'
                }
              </span>
              <div className="canvas-controls">
                <span>{currentIndex + 1} of {totalAssets}</span>
                <button
                  className="canvas-nav-button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className="canvas-nav-button"
                  onClick={handleNext}
                  disabled={currentIndex >= totalAssets - 1}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            <div className="image-canvas">
              {currentAsset && (
                <div
                  className="editable-image"
                  style={{
                    backgroundImage: `url('${currentAsset.assetUrl}')`,
                    filter: `saturate(${100 + adjustments.colorSaturation}%) brightness(${100 + adjustments.brightness}%) contrast(${100 + adjustments.contrast}%)`,
                    width: '600px',
                    height: `${(600 * currentAsset.dimensions.height) / currentAsset.dimensions.width}px`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <Rnd
                    size={{ 
                      width: (adjustments.cropBox.width * 600) / currentAsset.dimensions.width, 
                      height: (adjustments.cropBox.height * 600) / currentAsset.dimensions.width 
                    }}
                    position={{ 
                      x: (adjustments.cropBox.x * 600) / currentAsset.dimensions.width, 
                      y: (adjustments.cropBox.y * 600) / currentAsset.dimensions.width 
                    }}
                    onDragStop={(_, d) => {
                      const actualX = (d.x * currentAsset.dimensions.width) / 600;
                      const actualY = (d.y * currentAsset.dimensions.width) / 600;
                      handleCropBoxChange({ x: actualX, y: actualY });
                    }}
                    onResizeStop={(_, __, ref, ___, position) => {
                      const actualWidth = (parseInt(ref.style.width, 10) * currentAsset.dimensions.width) / 600;
                      const actualHeight = (parseInt(ref.style.height, 10) * currentAsset.dimensions.width) / 600;
                      const actualX = (position.x * currentAsset.dimensions.width) / 600;
                      const actualY = (position.y * currentAsset.dimensions.width) / 600;
                      handleCropBoxChange({
                        width: actualWidth,
                        height: actualHeight,
                        x: actualX,
                        y: actualY,
                      });
                    }}
                    bounds="parent"
                    className="crop-selection-area"
                    minWidth={20}
                    minHeight={20}
                  />

                  {/* Text Overlays */}
                  {adjustments.textOverlays.map((textOverlay) => (
                    <Rnd
                      key={textOverlay.id}
                      size={{ width: 'auto', height: 'auto' }}
                      position={{ 
                        x: (textOverlay.x * 600) / currentAsset.dimensions.width, 
                        y: (textOverlay.y * 600) / currentAsset.dimensions.width 
                      }}
                      onDragStop={(_, d) => {
                        const actualX = (d.x * currentAsset.dimensions.width) / 600;
                        const actualY = (d.y * currentAsset.dimensions.width) / 600;
                        setAdjustments(prev => ({
                          ...prev,
                          textOverlays: prev.textOverlays.map(t =>
                            t.id === textOverlay.id ? { ...t, x: actualX, y: actualY } : t
                          ),
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      bounds="parent"
                      className="text-overlay"
                      enableResizing={false}
                    >
                      <div
                        style={{
                          fontSize: `${(textOverlay.fontSize * 600) / currentAsset.dimensions.width}px`,
                          color: textOverlay.color,
                          fontFamily: textOverlay.fontFamily,
                          cursor: 'move',
                          userSelect: 'none',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {textOverlay.text}
                        <button
                          className="overlay-remove-btn"
                          onClick={() => handleRemoveText(textOverlay.id)}
                        >
                          ×
                        </button>
                      </div>
                    </Rnd>
                  ))}

                  {/* Logo Overlays */}
                  {adjustments.logoOverlays.map((logoOverlay) => (
                    <Rnd
                      key={logoOverlay.id}
                      size={{ 
                        width: (logoOverlay.width * 600) / currentAsset.dimensions.width, 
                        height: (logoOverlay.height * 600) / currentAsset.dimensions.width 
                      }}
                      position={{ 
                        x: (logoOverlay.x * 600) / currentAsset.dimensions.width, 
                        y: (logoOverlay.y * 600) / currentAsset.dimensions.width 
                      }}
                      onDragStop={(_, d) => {
                        const actualX = (d.x * currentAsset.dimensions.width) / 600;
                        const actualY = (d.y * currentAsset.dimensions.width) / 600;
                        setAdjustments(prev => ({
                          ...prev,
                          logoOverlays: prev.logoOverlays.map(l =>
                            l.id === logoOverlay.id ? { ...l, x: actualX, y: actualY } : l
                          ),
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      onResizeStop={(_, __, ref, ___, position) => {
                        const actualWidth = (parseInt(ref.style.width, 10) * currentAsset.dimensions.width) / 600;
                        const actualHeight = (parseInt(ref.style.height, 10) * currentAsset.dimensions.width) / 600;
                        const actualX = (position.x * currentAsset.dimensions.width) / 600;
                        const actualY = (position.y * currentAsset.dimensions.width) / 600;
                        setAdjustments(prev => ({
                          ...prev,
                          logoOverlays: prev.logoOverlays.map(l =>
                            l.id === logoOverlay.id ? {
                              ...l,
                              width: actualWidth,
                              height: actualHeight,
                              x: actualX,
                              y: actualY,
                            } : l
                          ),
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      bounds="parent"
                      className="logo-overlay"
                      minWidth={20}
                      minHeight={20}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img
                          src={logoOverlay.imageUrl}
                          alt="Logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            opacity: logoOverlay.opacity,
                          }}
                        />
                        <button
                          className="overlay-remove-btn"
                          onClick={() => handleRemoveLogo(logoOverlay.id)}
                        >
                          ×
                        </button>
                      </div>
                    </Rnd>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="adjustments-sidebar">
            <h3>Adjust</h3>
            <p className="sidebar-description">Click & drag to crop image & reposition elements.</p>

            <div className="add-content-buttons">
              <button
                className="add-text-logo-button"
                onClick={() => setShowTextDialog(true)}
              >
                <i className="fas fa-font"></i> Add Text
              </button>
              <button
                className="add-text-logo-button"
                onClick={() => setShowLogoDialog(true)}
              >
                <i className="fas fa-image"></i> Add Logo
              </button>
            </div>

            <div className="adjustment-section">
              <h4>Manual Cropping</h4>
              <div className="slider-control">
                <label>Crop Area</label>
                <div className="slider-wrapper">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={adjustments.cropArea}
                    onChange={(e) => handleAdjustmentChange('cropArea', Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <span className="slider-value">{adjustments.cropArea}%</span>
                </div>
              </div>
            </div>

            <div className="adjustment-section">
              <h4>Color Saturation Adjustments</h4>
              <div className="slider-control">
                <label>Color Saturation</label>
                <div className="slider-wrapper">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.colorSaturation}
                    onChange={(e) => handleAdjustmentChange('colorSaturation', Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <span className="slider-value">{adjustments.colorSaturation}</span>
                </div>
              </div>
            </div>

            <div className="adjustment-section">
              <h4>Logo Adjustments</h4>
              <div className="slider-control">
                <label>Logo Size</label>
                <div className="slider-wrapper">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={50}
                    onChange={(e) => {/* Handle logo size */ }}
                    className="custom-range-slider"
                  />
                  <span className="slider-value">50</span>
                </div>
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className="unsaved-changes-notice">
                <i className="fas fa-exclamation-triangle"></i>
                You have unsaved changes
              </div>
            )}
          </aside>
        </div>

        {/* Add Text Dialog */}
        {showTextDialog && (
          <div className="overlay-dialog">
            <div className="dialog-backdrop" onClick={() => setShowTextDialog(false)}></div>
            <div className="dialog-content">
              <h3>Add Text</h3>
              <input
                type="text"
                placeholder="Enter your text..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="text-input"
                autoFocus
              />
              <div className="color-picker-section">
                <label>Text Color:</label>
                <input
                  type="color"
                  value={selectedTextColor}
                  onChange={(e) => setSelectedTextColor(e.target.value)}
                  className="color-picker"
                />
              </div>
              <div className="dialog-actions">
                <button onClick={() => setShowTextDialog(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleAddText} className="add-btn" disabled={!newText.trim()}>
                  Add Text
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Logo Dialog */}
        {showLogoDialog && (
          <div className="overlay-dialog">
            <div className="dialog-backdrop" onClick={() => setShowLogoDialog(false)}></div>
            <div className="dialog-content">
              <h3>Add Logo</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAddLogo(file);
                  }
                }}
                className="file-input"
              />
              <div className="dialog-actions">
                <button onClick={() => setShowLogoDialog(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdjustImagePage;